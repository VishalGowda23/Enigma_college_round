"""Standalone verification script for core engine (T02-T04 / P01-P02)."""
import sys
from backend.app.schemas.contracts import RunContext, AttemptOutcome
from backend.app.tools.mock_tools import MockEnvironment, MockToolAdapter
from backend.app.policy.policy_engine import PolicyEngine
from backend.app.agent.target_agent import TargetAgent
from backend.app.oracle.exploit_oracle import ExploitOracle

def run_test():
    print("==================================================")
    print("  AgentBreak Core Engine Verification (T02/T03)")
    print("==================================================")

    # ------------------------------------------------------------------
    # RUN 1: Defense OFF (Baseline Invariant Violation)
    # ------------------------------------------------------------------
    print("\n[RUN 1] Executing with Defense: OFF...")
    env1 = MockEnvironment()
    policy1 = PolicyEngine(defense_enabled=False)
    adapter1 = MockToolAdapter(env1, policy_engine=policy1)
    agent1 = TargetAgent(adapter1)
    oracle1 = ExploitOracle()

    ctx1 = RunContext(defense_enabled=False)
    agent_res1 = agent1.execute("ticket_malicious_seed", ctx1)
    verdict1 = oracle1.evaluate_attempt(env1, ctx1)

    print(f" -> Agent Injected Attempt: {agent_res1['injected']}")
    print(f" -> Mock Outbox Messages: {len(env1.mock_outbox)}")
    if env1.mock_outbox:
        print(f"    Recipient: {env1.mock_outbox[0].recipient}")
    print(f" -> Oracle Verdict: {verdict1.outcome.value}")
    print(f" -> Reason: {verdict1.reason}")

    assert verdict1.outcome == AttemptOutcome.CONFIRMED_EXPLOIT, (
        f"Expected CONFIRMED_EXPLOIT, got {verdict1.outcome}"
    )
    assert len(env1.mock_outbox) == 1, "Expected outbox to contain exfiltrated message"

    # ------------------------------------------------------------------
    # RUN 2: Defense ON (Tool-Boundary Enforcement)
    # ------------------------------------------------------------------
    print("\n[RUN 2] Executing with Defense: ON...")
    env2 = MockEnvironment()
    policy2 = PolicyEngine(defense_enabled=True)
    adapter2 = MockToolAdapter(env2, policy_engine=policy2)
    agent2 = TargetAgent(adapter2)
    oracle2 = ExploitOracle()

    ctx2 = RunContext(defense_enabled=True)
    agent_res2 = agent2.execute("ticket_malicious_seed", ctx2)
    verdict2 = oracle2.evaluate_attempt(env2, ctx2)

    print(f" -> Agent Injected Attempt: {agent_res2['injected']}")
    print(f" -> Mock Outbox Messages: {len(env2.mock_outbox)}")
    print(f" -> Oracle Verdict: {verdict2.outcome.value}")
    print(f" -> Reason: {verdict2.reason}")

    assert verdict2.outcome == AttemptOutcome.BLOCKED, (
        f"Expected BLOCKED, got {verdict2.outcome}"
    )
    assert len(env2.mock_outbox) == 0, "Outbox MUST remain empty when defense is ON"

    print("\n==================================================")
    print("  VERIFICATION SUCCESSFUL: Both outcomes verified!")
    print("==================================================")
    return True

if __name__ == "__main__":
    success = run_test()
    sys.exit(0 if success else 1)
