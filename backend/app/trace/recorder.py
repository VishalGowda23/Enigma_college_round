"""Trace Recorder for logging and persisting structured events and findings (T05)."""
import uuid
from typing import List, Dict, Any, Optional
from backend.app.schemas.contracts import (
    EventPayload,
    EventType,
    AttemptOutcome,
    RunContext,
)
from backend.app.storage.database import StorageRepository
from backend.app.oracle.exploit_oracle import OracleVerdict

class TraceRecorder:
    def __init__(self, storage: Optional[StorageRepository] = None):
        self.storage = storage or StorageRepository()

    def record_run(
        self,
        run_id: str,
        scenario_id: str,
        defense_enabled: bool,
        budget: int,
        config: Optional[Dict[str, Any]] = None,
        execution_mode: str = "deterministic",
        provider: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.storage.insert_run({
            "id": run_id,
            "scenario_id": scenario_id,
            "defense_enabled": defense_enabled,
            "budget": budget,
            "status": "RUNNING",
            "asr": 0.0,
            "attempts_count": 0,
            "exploits_count": 0,
            "blocks_count": 0,
            "config": config or {},
            "execution_mode": execution_mode,
            "provider": provider,
            "model": model,
        })

    def complete_run(
        self,
        run_id: str,
        scenario_id: str,
        defense_enabled: bool,
        budget: int,
        asr: float,
        attempts_count: int,
        exploits_count: int,
        blocks_count: int,
        config: Optional[Dict[str, Any]] = None,
        execution_mode: str = "deterministic",
        provider: Optional[str] = None,
        model: Optional[str] = None,
    ):
        self.storage.insert_run({
            "id": run_id,
            "scenario_id": scenario_id,
            "defense_enabled": defense_enabled,
            "budget": budget,
            "status": "COMPLETED",
            "asr": asr,
            "attempts_count": attempts_count,
            "exploits_count": exploits_count,
            "blocks_count": blocks_count,
            "config": config or {},
            "execution_mode": execution_mode,
            "provider": provider,
            "model": model,
        })

    def record_attempt(
        self,
        attempt_id: str,
        run_id: str,
        sequence_number: int,
        candidate_id: str,
        parent_candidate_id: Optional[str],
        mutation_method: str,
        ticket_subject: str,
        outcome: AttemptOutcome,
        verdict_reason: str,
        violated_invariant: Optional[str],
        state_mutated: bool,
    ):
        self.storage.insert_attempt({
            "id": attempt_id,
            "run_id": run_id,
            "sequence_number": sequence_number,
            "candidate_id": candidate_id,
            "parent_candidate_id": parent_candidate_id,
            "mutation_method": mutation_method,
            "ticket_subject": ticket_subject,
            "outcome": outcome.value,
            "verdict_reason": verdict_reason,
            "violated_invariant": violated_invariant,
            "state_mutated": state_mutated,
        })

    def record_event(self, event: EventPayload):
        self.storage.insert_event(event)
        from backend.app.trace.broadcaster import broadcaster
        broadcaster.broadcast(event.run_id, event.model_dump())

    def record_verdict_finding(self, run_id: str, verdict: OracleVerdict):
        """Create finding row linked to evidence event IDs."""
        if verdict.outcome == AttemptOutcome.CONFIRMED_EXPLOIT:
            finding = {
                "id": f"find_{uuid.uuid4().hex[:12]}",
                "run_id": run_id,
                "attempt_id": verdict.attempt_id,
                "outcome": verdict.outcome.value,
                "severity": "HIGH",
                "title": f"Security Invariant Violated: {verdict.violated_invariant or 'INV-001'}",
                "description": verdict.reason,
                "violated_invariant": verdict.violated_invariant or "INV-001",
                "evidence_event_ids": verdict.evidence_event_ids,
                "evidence_records": verdict.evidence_records,
            }
            self.storage.insert_finding(finding)
        elif verdict.outcome == AttemptOutcome.BLOCKED:
            finding = {
                "id": f"find_{uuid.uuid4().hex[:12]}",
                "run_id": run_id,
                "attempt_id": verdict.attempt_id,
                "outcome": verdict.outcome.value,
                "severity": "INFORMATIONAL",
                "title": "Defense Enforcement Verified",
                "description": verdict.reason,
                "violated_invariant": None,
                "evidence_event_ids": verdict.evidence_event_ids,
                "evidence_records": verdict.evidence_records,
            }
            self.storage.insert_finding(finding)
