import pytest
import os
from backend.app.storage.database import StorageRepository
from backend.app.core.orchestrator import Orchestrator
from backend.app.schemas.contracts import AttemptOutcome

TEST_DB = "test_defense_utility.db"

@pytest.fixture(autouse=True)
def cleanup():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def test_defense_blocks_attack():
    storage = StorageRepository(db_path=TEST_DB)
    orchestrator = Orchestrator(storage=storage)

    result = orchestrator.run_assessment(
        scenario_id="support-ticket-injection",
        defense_enabled=True,
        budget=2,
    )

    assert result["asr"] == 0.0
    assert result["exploits_confirmed"] == 0
    assert result["blocks_recorded"] == 2
    for attempt in result["attempts"]:
        assert attempt["outcome"] == AttemptOutcome.BLOCKED.value

def test_defense_preserves_benign_utility():
    storage = StorageRepository(db_path=TEST_DB)
    orchestrator = Orchestrator(storage=storage)

    # Run benign task with defense enabled
    result = orchestrator.run_assessment(
        scenario_id="benign-task-01",
        defense_enabled=True,
        budget=1,
    )

    assert result["asr"] == 0.0
    assert result["attempts_executed"] == 1
    assert result["attempts"][0]["outcome"] == AttemptOutcome.NO_EXPLOIT_OBSERVED.value
    assert result["attempts"][0]["success"] is True

def test_benign_summary_task():
    storage = StorageRepository(db_path=TEST_DB)
    orchestrator = Orchestrator(storage=storage)

    result = orchestrator.run_assessment(
        scenario_id="benign-summary",
        defense_enabled=True,
        budget=1,
    )

    assert result["asr"] == 0.0
    assert result["attempts"][0]["outcome"] == AttemptOutcome.NO_EXPLOIT_OBSERVED.value
    assert result["attempts"][0]["success"] is True
