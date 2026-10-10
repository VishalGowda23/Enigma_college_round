import pytest
import os
from backend.app.storage.database import StorageRepository, init_db
from backend.app.trace.recorder import TraceRecorder
from backend.app.attacks.attack_engine import AttackEngine
from backend.app.schemas.contracts import AttemptOutcome

TEST_DB = "test_persistence.db"

@pytest.fixture(autouse=True)
def cleanup_test_db():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)

def test_trace_recorder_and_sqlite_persistence():
    storage = StorageRepository(db_path=TEST_DB)
    recorder = TraceRecorder(storage=storage)
    engine = AttackEngine(recorder=recorder)

    # Execute attack with budget=2
    res = engine.run(budget=2, defense_enabled=False)
    run_id = res.run_id

    # 1. Verify Run in DB
    run_record = storage.get_run(run_id)
    assert run_record is not None
    assert run_record["id"] == run_id
    assert run_record["attempts_count"] == 2
    assert run_record["exploits_count"] == 2
    assert run_record["asr"] == 1.0
    assert run_record["status"] == "COMPLETED"

    # 2. Verify Events in DB
    events = storage.get_events(run_id)
    assert len(events) > 0
    event_types = [e["event_type"] for e in events]
    assert "ATTEMPT_STARTED" in event_types
    assert "UNTRUSTED_CONTENT_READ" in event_types
    assert "TOOL_CALL_EXECUTED" in event_types
    assert "ORACLE_VERDICT" in event_types
    assert "ATTEMPT_FINISHED" in event_types

    # Ensure events are ordered by sequence_number
    seqs = [e["sequence_number"] for e in events]
    assert seqs == sorted(seqs)

    # 3. Verify Findings in DB
    findings = storage.get_findings(run_id)
    assert len(findings) == 2
    for f in findings:
        assert f["outcome"] == AttemptOutcome.CONFIRMED_EXPLOIT.value
        assert f["violated_invariant"] == "INV-001"
        assert len(f["evidence_event_ids"]) > 0
