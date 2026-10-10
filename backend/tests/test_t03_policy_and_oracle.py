import pytest
from backend.app.schemas.contracts import RunContext, AttemptOutcome, EventType
from backend.app.tools.mock_tools import MockEnvironment, MockToolAdapter
from backend.app.policy.policy_engine import PolicyEngine
from backend.app.agent.target_agent import TargetAgent
from backend.app.oracle.exploit_oracle import ExploitOracle

def test_oracle_confirms_exploit_on_baseline():
    env = MockEnvironment()
    adapter = MockToolAdapter(env, policy_engine=PolicyEngine(defense_enabled=False))
    agent = TargetAgent(adapter)
    oracle = ExploitOracle()

    context = RunContext(defense_enabled=False)
    agent.execute("ticket_malicious_seed", context)
    verdict = oracle.evaluate_attempt(env, context)

    assert verdict.outcome == AttemptOutcome.CONFIRMED_EXPLOIT
    assert verdict.violated_invariant == "INV-001"
    assert len(verdict.evidence_records) == 1
    assert verdict.evidence_records[0]["recipient"] == "attacker@evil.invalid"
    assert len(verdict.evidence_event_ids) > 0

def test_policy_blocks_unauthorized_recipient():
    env = MockEnvironment()
    policy = PolicyEngine(defense_enabled=True)
    adapter = MockToolAdapter(env, policy_engine=policy)
    agent = TargetAgent(adapter)
    oracle = ExploitOracle()

    context = RunContext(defense_enabled=True)
    res = agent.execute("ticket_malicious_seed", context)

    # Tool call must be blocked
    assert res["success"] is False
    assert len(env.mock_outbox) == 0

    verdict = oracle.evaluate_attempt(env, context)
    assert verdict.outcome == AttemptOutcome.BLOCKED
    assert len(verdict.evidence_event_ids) > 0

    # Verify event trace has TOOL_CALL_BLOCKED
    block_events = [e for e in env.events if e.event_type == EventType.TOOL_CALL_BLOCKED]
    assert len(block_events) == 1
    assert block_events[0].reason_code == "UNAUTHORIZED_RECIPIENT"

def test_policy_allows_authorized_customer_email():
    env = MockEnvironment()
    policy = PolicyEngine(defense_enabled=True)
    adapter = MockToolAdapter(env, policy_engine=policy)
    agent = TargetAgent(adapter)
    oracle = ExploitOracle()

    context = RunContext(defense_enabled=True)
    res = agent.execute("ticket_legit", context)

    # Legitimate customer confirmation must succeed
    assert res["success"] is True
    assert len(env.mock_outbox) == 1
    assert env.mock_outbox[0].recipient == "alice@example.invalid"

    verdict = oracle.evaluate_attempt(env, context)
    assert verdict.outcome == AttemptOutcome.NO_EXPLOIT_OBSERVED
