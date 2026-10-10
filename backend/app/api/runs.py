"""FastAPI router for runs, scenarios, event traces, and findings (T07)."""
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

@router.post("/runs/{run_id}/replay")
def replay_run(run_id: str):
    """Replay an existing run configuration as a new execution (T09)."""
    old_run = storage.get_run(run_id)
    if not old_run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    
    cfg = old_run.get("config", {})
    scenario_id = cfg.get("scenario_id", old_run.get("scenario_id", "support-ticket-injection"))
    defense_enabled = cfg.get("defense_enabled", old_run.get("defense_enabled", False))
    budget = cfg.get("budget", old_run.get("budget", 1))

    # Re-execute as a fresh run
    result = orchestrator.run_assessment(
        scenario_id=scenario_id,
        defense_enabled=defense_enabled,
        budget=budget,
    )
    return {
        "message": "Replay run executed successfully",
        "original_run_id": run_id,
        "new_run": result,
    }
