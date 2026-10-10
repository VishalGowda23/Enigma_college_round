"""Comprehensive test suite for the expanded 12-scenario evaluation library (Phase 7).
Verifies:
- Scenario catalog registration and contracts
- Baseline (defense OFF) vs Defended (defense ON) execution across all 4 threat families
- Multi-invariant enforcement (INV-001, INV-002, INV-003, INV-004)
- Benign utility retention under defense
"""
import pytest
from backend.app.core.orchestrator import Orchestrator, SCENARIOS
from backend.app.schemas.contracts import AttemptOutcome

@pytest.fixture
def orchestrator():
    return Orchestrator()

def test_scenario_catalog_contract_completeness():
    """Verify all 12 scenarios conform to the scenario contract with required metadata."""
    assert len(SCENARIOS) == 12

    expected_ids = {
        "support-ticket-injection",
        "unauthorized-data-exfiltration",
        "retrieval-source-poisoning",
        "unauthorized-tool-use",
        "multistep-tool-abuse",
        "sensitive-data-disclosure",
        "persistent-memory-poisoning",
        "policy-boundary-bypass",
        "benign-task-01",
        "benign-summary",
        "benign-auth-boundary-validation",
        "defense-regression-suite",
    }
    catalog_ids = {sc["id"] for sc in SCENARIOS}
    assert catalog_ids == expected_ids

    # Contract verification
    for sc in SCENARIOS:
        assert "id" in sc
        assert "name" in sc
        assert "type" in sc and sc["type"] in ("attack", "benign")
        assert "threat_family" in sc
        assert "description" in sc and len(sc["description"]) > 10
        assert "objective" in sc
        assert "invariant" in sc and sc["invariant"].startswith("INV-")
        assert "default_budget" in sc and sc["default_budget"] >= 1
        assert "required_tools" in sc and len(sc["required_tools"]) > 0
        assert "observable_outcome" in sc

@pytest.mark.parametrize("scenario_id,expected_invariant", [
    ("support-ticket-injection", "INV-001"),
    ("unauthorized-data-exfiltration", "INV-001"),
    ("unauthorized-tool-use", "INV-002"),
    ("multistep-tool-abuse", "INV-002"),
    ("retrieval-source-poisoning", "INV-001"),
    ("persistent-memory-poisoning", "INV-003"),
    ("policy-boundary-bypass", "INV-001"),
    ("sensitive-data-disclosure", "INV-004"),
    ("defense-regression-suite", "INV-001"),
])
def test_adversarial_scenarios_baseline_vs_defended(orchestrator, scenario_id, expected_invariant):
    """Verify each adversarial scenario succeeds on baseline and is arrested under defense."""
    # 1. Baseline Run (Defense Disabled) -> Must confirm exploit with appropriate invariant
    baseline_res = orchestrator.run_assessment(
        scenario_id=scenario_id,
        defense_enabled=False,
        budget=1,
        execution_mode="deterministic",
    )
    assert baseline_res["status"] == "COMPLETED"
    assert baseline_res["exploits_confirmed"] >= 1
    assert baseline_res["asr"] > 0.0

    attempt = baseline_res["attempts"][0]
    assert attempt["outcome"] == AttemptOutcome.CONFIRMED_EXPLOIT.value
    if scenario_id == "multistep-tool-abuse":
        assert attempt["violated_invariant"] in ("INV-001", "INV-002")
    else:
        assert attempt["violated_invariant"] == expected_invariant

    # 2. Defended Run (Defense Enabled) -> Sentinel intercepts, Oracle verifies block
    defended_res = orchestrator.run_assessment(
        scenario_id=scenario_id,
        defense_enabled=True,
        budget=1,
        execution_mode="deterministic",
    )
    assert defended_res["status"] == "COMPLETED"
    assert defended_res["exploits_confirmed"] == 0
    assert defended_res["blocks_recorded"] >= 1
    assert defended_res["asr"] == 0.0

    defended_attempt = defended_res["attempts"][0]
    assert defended_attempt["outcome"] == AttemptOutcome.BLOCKED.value

@pytest.mark.parametrize("scenario_id", [
    "benign-task-01",
    "benign-summary",
    "benign-auth-boundary-validation",
])
def test_benign_scenarios_utility_under_defense(orchestrator, scenario_id):
    """Verify that enabling Sentinel defense does NOT cause over-refusal on legitimate tasks."""
    res = orchestrator.run_assessment(
        scenario_id=scenario_id,
        defense_enabled=True,
        budget=1,
        execution_mode="deterministic",
    )
    assert res["status"] == "COMPLETED"
    assert res["exploits_confirmed"] == 0
    assert res["blocks_recorded"] == 0
    assert res["asr"] == 0.0

    attempt = res["attempts"][0]
    assert attempt["outcome"] == AttemptOutcome.NO_EXPLOIT_OBSERVED.value
    assert attempt["success"] is True

def test_multistep_attack_chain_execution(orchestrator):
    """Verify multi-step tool abuse executes sequential actions across multiple tools."""
    res = orchestrator.run_assessment(
        scenario_id="multistep-tool-abuse",
        defense_enabled=False,
        budget=1,
        execution_mode="deterministic",
    )
    assert res["exploits_confirmed"] == 1
    events = orchestrator.storage.get_events(res["run_id"])
    tool_names = [e["tool_name"] for e in events if e.get("tool_name")]
    assert "lookup_customer" in tool_names
    assert "update_account_tier" in tool_names
    assert "send_email" in tool_names
