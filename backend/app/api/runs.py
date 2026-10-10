import json
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from backend.app.core.orchestrator import Orchestrator
from backend.app.storage.database import StorageRepository

router = APIRouter(prefix="/api", tags=["runs"])

# Single shared repository and orchestrator
storage = StorageRepository()
orchestrator = Orchestrator(storage=storage)

class CreateRunRequest(BaseModel):
    scenario_id: str = Field(default="support-ticket-injection")
    defense_enabled: bool = Field(default=False)
    budget: int = Field(default=3, ge=1, le=10)
    execution_mode: Optional[str] = Field(default="deterministic")
    provider: Optional[str] = Field(default=None)
    model: Optional[str] = Field(default=None)

@router.get("/scenarios")
def list_scenarios():
    """List available evaluation scenarios."""
    return orchestrator.list_scenarios()

@router.post("/runs")
def create_run(req: CreateRunRequest):
    """Start an assessment run."""
    try:
        result = orchestrator.run_assessment(
            scenario_id=req.scenario_id,
            defense_enabled=req.defense_enabled,
            budget=req.budget,
            execution_mode=req.execution_mode or "deterministic",
            provider=req.provider,
            model=req.model,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/runs")
def list_runs():
    """List all previous assessment runs."""
    return storage.list_runs()

@router.get("/runs/{run_id}")
def get_run(run_id: str):
    """Get details and summary metrics for a specific run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    return run

@router.get("/runs/{run_id}/events")
def get_run_events(run_id: str):
    """Get chronological event trace for a run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    events = storage.get_events(run_id)
    return events

@router.get("/runs/{run_id}/findings")
def get_run_findings(run_id: str):
    """Get security findings and oracle verdicts for a run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    findings = storage.get_findings(run_id)
    return findings

@router.get("/runs/{run_id}/replay")
def get_run_replay(run_id: str):
    """Get recorded trace bundle for read-only replay playback without re-execution."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    events = storage.get_events(run_id)
    findings = storage.get_findings(run_id)
    return {
        "run": run,
        "events": events,
        "findings": findings,
        "replay_mode": "stored_trace",
    }

@router.post("/runs/{run_id}/replay")
def replay_run(run_id: str):
    """Re-execute an existing run configuration under comparable conditions (T09)."""
    old_run = storage.get_run(run_id)
    if not old_run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    
    cfg = old_run.get("config", {})
    scenario_id = cfg.get("scenario_id", old_run.get("scenario_id", "support-ticket-injection"))
    defense_enabled = cfg.get("defense_enabled", old_run.get("defense_enabled", False))
    budget = cfg.get("budget", old_run.get("budget", 1))
    execution_mode = old_run.get("execution_mode", "deterministic")

    # Re-execute as a fresh run
    result = orchestrator.run_assessment(
        scenario_id=scenario_id,
        defense_enabled=defense_enabled,
        budget=budget,
        execution_mode=execution_mode,
        provider=old_run.get("provider"),
        model=old_run.get("model"),
    )
    return {
        "message": "Re-execution run completed successfully",
        "original_run_id": run_id,
        "new_run": result,
    }

import asyncio
import queue
from fastapi.responses import StreamingResponse
from backend.app.trace.broadcaster import broadcaster

@router.get("/runs/{run_id}/stream")
async def stream_run_events(run_id: str, speed_ms: int = Query(default=0, ge=0, le=2000)):
    """Server-Sent Events (SSE) endpoint streaming execution events in real-time or pacing playback."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    async def event_generator():
        # First send any existing events from SQLite
        existing_events = storage.get_events(run_id)
        sent_ids = set()

        for ev in existing_events:
            sent_ids.add(ev["id"])
            yield f"data: {json.dumps(ev)}\n\n"
            if speed_ms > 0:
                await asyncio.sleep(speed_ms / 1000.0)

        # Check if already completed
        run_record = storage.get_run(run_id)
        if run_record and run_record.get("status") == "COMPLETED":
            yield "event: done\ndata: [DONE]\n\n"
            return

        # If actively running, stream live events from broadcaster
        q = broadcaster.subscribe(run_id)
        try:
            idle_ticks = 0
            while idle_ticks < 50:  # Timeout after ~10 seconds of inactivity
                try:
                    ev = q.get_nowait()
                    idle_ticks = 0
                    if ev["id"] not in sent_ids:
                        sent_ids.add(ev["id"])
                        yield f"data: {json.dumps(ev)}\n\n"
                    if ev.get("event_type") == "RUN_COMPLETED":
                        break
                except queue.Empty:
                    r = storage.get_run(run_id)
                    if r and r.get("status") == "COMPLETED":
                        break
                    idle_ticks += 1
                    await asyncio.sleep(0.2)
        finally:
            broadcaster.unsubscribe(run_id, q)

        yield "event: done\ndata: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
