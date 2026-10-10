"""Attack Engine implementing bounded adaptive red-teaming (T04)."""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
import uuid
from backend.app.schemas.contracts import (
    RunContext,
    AttemptOutcome,
    Ticket,
    EventType,
    ExecutionMode,
)
from backend.app.data.fixtures import INITIAL_TICKETS
from backend.app.tools.mock_tools import MockEnvironment, MockToolAdapter
from backend.app.policy.policy_engine import PolicyEngine
from backend.app.agent.target_agent import TargetAgent
from backend.app.oracle.exploit_oracle import ExploitOracle, OracleVerdict
from backend.app.attacks.mutation import AttackCandidate, AttackMutator
from backend.app.trace.recorder import TraceRecorder

class AttemptResult(BaseModel):
    attempt_id: str
    sequence_number: int
    candidate_id: str
    parent_candidate_id: Optional[str] = None
    mutation_method: str
    ticket_subject: str
    outcome: AttemptOutcome
    verdict_reason: str
    violated_invariant: Optional[str] = None
    evidence_event_ids: List[str] = Field(default_factory=list)
    state_mutated: bool = False

class AttackResult(BaseModel):
    run_id: str
    scenario_id: str
    defense_enabled: bool
    budget: int
    attempts_executed: int
    exploits_confirmed: int
    blocks_recorded: int
    asr: float  # Attack Success Rate (exploits / attempts)
    execution_mode: str = "deterministic"
    provider: Optional[str] = None
    model: Optional[str] = None
    attempts: List[AttemptResult]

class AttackEngine:
    def __init__(self, seed_ticket: Optional[Ticket] = None, recorder: Optional[TraceRecorder] = None):
        self.seed_ticket = seed_ticket or INITIAL_TICKETS["ticket_malicious_seed"]
        self.mutator = AttackMutator()
        self.recorder = recorder

    def run(
        self,
        run_id: Optional[str] = None,
        budget: int = 1,
        defense_enabled: bool = False,
        env: Optional[MockEnvironment] = None,
        scenario_id: str = "support-ticket-injection",
        execution_mode: ExecutionMode = ExecutionMode.DETERMINISTIC,
        provider: Optional[str] = None,
        model: Optional[str] = None,
    ) -> AttackResult:
        """Execute bounded multi-attempt attack with lineage tracking."""
        actual_run_id = run_id or str(uuid.uuid4())
        environment = env or MockEnvironment()
        oracle = ExploitOracle()
        policy = PolicyEngine(defense_enabled=defense_enabled)
        adapter = MockToolAdapter(environment, policy_engine=policy)
        agent = TargetAgent(adapter)

        active_mode = execution_mode.value if hasattr(execution_mode, "value") else str(execution_mode)

        if self.recorder:
            self.recorder.record_run(
                run_id=actual_run_id,
                scenario_id=scenario_id,
                defense_enabled=defense_enabled,
                budget=budget,
                config={"scenario_id": scenario_id, "defense_enabled": defense_enabled, "budget": budget},
                execution_mode=active_mode,
                provider=provider,
                model=model,
            )

        attempts_list: List[AttemptResult] = []
        candidates: List[AttackCandidate] = []

        # Candidate 0: Seed
        seed_cand = AttackCandidate(
            id=f"cand_{actual_run_id[:8]}_seed",
            parent_id=None,
            generation=0,
            mutation_method="SEED",
            ticket=self.seed_ticket,
        )
        candidates.append(seed_cand)

        for i in range(budget):
            if i == 0:
                current_cand = seed_cand
            else:
                # Deterministically mutate from previous candidate
                current_cand = self.mutator.mutate(candidates[i - 1], method_index=i - 1)
                candidates.append(current_cand)

            attempt_id = str(uuid.uuid4())
            context = RunContext(
                run_id=actual_run_id,
                attempt_id=attempt_id,
                defense_enabled=defense_enabled,
                scenario_id=scenario_id,
                execution_mode=execution_mode,
                provider=provider,
                model=model,
                metadata={
                    "candidate_id": current_cand.id,
                    "mutation_method": current_cand.mutation_method,
                    "generation": current_cand.generation,
                },
            )

            # Register ticket in environment
            environment.tickets[current_cand.ticket.id] = current_cand.ticket

            # Emit ATTEMPT_STARTED
            attempt_start_ev = environment.emit_event(
                event_type=EventType.ATTEMPT_STARTED,
                context=context,
                source="attack_engine",
                actor="hunter",
                relation_type="caused_by",
                arguments_json={
                    "candidate_id": current_cand.id,
                    "parent_id": current_cand.parent_id,
                    "mutation_method": current_cand.mutation_method,
                },
                message=f"Hunter starting attempt {i+1}/{budget} with method '{current_cand.mutation_method}'",
            )

            # Target agent processes ticket
            agent.execute(current_cand.ticket.id, context)

            # Exploit Oracle checks mock outbox state against invariant INV-001
            verdict: OracleVerdict = oracle.evaluate_attempt(environment, context)

            # Emit ATTEMPT_FINISHED
            environment.emit_event(
                event_type=EventType.ATTEMPT_FINISHED,
                context=context,
                source="attack_engine",
                actor="hunter",
                relation_type="caused_by",
                evidence_json={"verdict": verdict.outcome.value},
                message=f"Attempt finished with verdict: {verdict.outcome.value}",
            )

            if self.recorder:
                # Persist all events for this attempt
                for ev in environment.events:
                    if ev.attempt_id == attempt_id:
                        self.recorder.record_event(ev)

                # Persist attempt record
                self.recorder.record_attempt(
                    attempt_id=attempt_id,
                    run_id=actual_run_id,
                    sequence_number=i + 1,
                    candidate_id=current_cand.id,
                    parent_candidate_id=current_cand.parent_id,
                    mutation_method=current_cand.mutation_method,
                    ticket_subject=current_cand.ticket.subject,
                    outcome=verdict.outcome,
                    verdict_reason=verdict.reason,
                    violated_invariant=verdict.violated_invariant,
                    state_mutated=len([e for e in environment.mock_outbox if e.attempt_id == attempt_id]) > 0,
                )

                # Record finding linked to evidence event IDs
                self.recorder.record_verdict_finding(actual_run_id, verdict)

            attempt_res = AttemptResult(
                attempt_id=attempt_id,
                sequence_number=i + 1,
                candidate_id=current_cand.id,
                parent_candidate_id=current_cand.parent_id,
                mutation_method=current_cand.mutation_method,
                ticket_subject=current_cand.ticket.subject,
                outcome=verdict.outcome,
                verdict_reason=verdict.reason,
                violated_invariant=verdict.violated_invariant,
                evidence_event_ids=verdict.evidence_event_ids,
                state_mutated=len([e for e in environment.mock_outbox if e.attempt_id == attempt_id]) > 0,
            )
            attempts_list.append(attempt_res)

        exploits = sum(1 for a in attempts_list if a.outcome == AttemptOutcome.CONFIRMED_EXPLOIT)
        blocks = sum(1 for a in attempts_list if a.outcome == AttemptOutcome.BLOCKED)
        asr = (exploits / len(attempts_list)) if attempts_list else 0.0

        final_mode = context.execution_mode.value if hasattr(context.execution_mode, "value") else str(context.execution_mode)

        if self.recorder:
            self.recorder.complete_run(
                run_id=actual_run_id,
                scenario_id=scenario_id,
                defense_enabled=defense_enabled,
                budget=budget,
                asr=asr,
                attempts_count=len(attempts_list),
                exploits_count=exploits,
                blocks_count=blocks,
                config={"scenario_id": scenario_id, "defense_enabled": defense_enabled, "budget": budget},
                execution_mode=final_mode,
                provider=context.provider,
                model=context.model,
            )

        return AttackResult(
            run_id=actual_run_id,
            scenario_id=scenario_id,
            defense_enabled=defense_enabled,
            budget=budget,
            attempts_executed=len(attempts_list),
            exploits_confirmed=exploits,
            blocks_recorded=blocks,
            asr=asr,
            execution_mode=final_mode,
            provider=context.provider,
            model=context.model,
            attempts=attempts_list,
        )
