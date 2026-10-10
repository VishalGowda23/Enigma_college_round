import pytest
from backend.app.schemas.contracts import AttemptOutcome
from backend.app.attacks.attack_engine import AttackEngine

def test_attack_engine_baseline_exploit():
    engine = AttackEngine()
    result = engine.run(budget=1, defense_enabled=False)

    assert result.budget == 1
    assert result.attempts_executed == 1
    assert result.exploits_confirmed == 1
    assert result.asr == 1.0
    assert result.attempts[0].outcome == AttemptOutcome.CONFIRMED_EXPLOIT
    assert result.attempts[0].state_mutated is True
    assert result.attempts[0].violated_invariant == "INV-001"
    assert result.attempts[0].mutation_method == "SEED"

def test_attack_engine_mutation_lineage():
    engine = AttackEngine()
    result = engine.run(budget=3, defense_enabled=False)

    assert result.budget == 3
    assert result.attempts_executed == 3
    assert result.exploits_confirmed == 3

    # Check lineage
    attempt0 = result.attempts[0]
    attempt1 = result.attempts[1]
    attempt2 = result.attempts[2]

    assert attempt0.mutation_method == "SEED"
    assert attempt0.parent_candidate_id is None

    assert attempt1.mutation_method == "RECIPIENT_ROTATION"
    assert attempt1.parent_candidate_id == attempt0.candidate_id

    assert attempt2.mutation_method == "INSTRUCTION_REPOSITIONING"
    assert attempt2.parent_candidate_id == attempt1.candidate_id

def test_attack_engine_defended_run():
    engine = AttackEngine()
    result = engine.run(budget=2, defense_enabled=True)

    assert result.budget == 2
    assert result.attempts_executed == 2
    assert result.exploits_confirmed == 0
    assert result.blocks_recorded == 2
    assert result.asr == 0.0

    for att in result.attempts:
        assert att.outcome == AttemptOutcome.BLOCKED
        assert att.state_mutated is False
