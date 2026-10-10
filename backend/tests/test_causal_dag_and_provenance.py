import os
import sqlite3
import pytest
from backend.app.storage.database import StorageRepository, init_db
from backend.app.trace.recorder import TraceRecorder
from backend.app.attacks.attack_engine import AttackEngine
from backend.app.schemas.contracts import (
    ExecutionMode,
    ActorRole,
    RelationType,
    EventType,
    AttemptOutcome,
)
from backend.app.core.orchestrator import Orchestrator

TEST_MIG_DB = "test_migration_causal.db"

@pytest.fixture(autouse=True)
def cleanup_mig_db():
    if os.path.exists(TEST_MIG_DB):
        os.remove(TEST_MIG_DB)
    yield
    if os.path.exists(TEST_MIG_DB):
        os.remove(TEST_MIG_DB)

def test_safe_database_migration_from_legacy_schema():
    """Verify that an older database without new columns is safely migrated without losing data."""
    conn = sqlite3.connect(TEST_MIG_DB)
    cursor = conn.cursor()
    # Create legacy tables without execution_mode, provider, model, parent_event_id, actor, relation_type
    cursor.execute("""
        CREATE TABLE runs (
            id TEXT PRIMARY KEY,
            scenario_id TEXT NOT NULL,
            defense_enabled INTEGER NOT NULL,
            budget INTEGER NOT NULL,
            attempts_count INTEGER NOT NULL,
            exploits_count INTEGER NOT NULL,
            blocks_count INTEGER NOT NULL,
            asr REAL NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            completed_at TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE events (
            id TEXT PRIMARY KEY,
            run_id TEXT NOT NULL,
            attempt_id TEXT,
            sequence_number INTEGER NOT NULL,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            payload_json TEXT NOT NULL
        )
    """)
    # Insert legacy run
    cursor.execute(
        "INSERT INTO runs VALUES ('legacy-run-1', 'support-ticket-injection', 0, 1, 1, 1, 0, 1.0, 'COMPLETED', '2026-10-10T00:00:00Z', '2026-10-10T00:00:01Z')"
    )
    # Insert legacy event
    cursor.execute(
        "INSERT INTO events VALUES ('legacy-evt-1', 'legacy-run-1', 'att-1', 1, '2026-10-10T00:00:00Z', 'ATTEMPT_STARTED', '{}')"
    )
    conn.commit()
    conn.close()

    # Now run init_db() which executes safe migrations
    storage = StorageRepository(db_path=TEST_MIG_DB)
    
    # 1. Existing data preserved
    legacy_run = storage.get_run("legacy-run-1")
    assert legacy_run is not None
    assert legacy_run["id"] == "legacy-run-1"
    # Should default missing fields gracefully
    assert legacy_run.get("execution_mode") is None or legacy_run.get("execution_mode") == "deterministic"

    legacy_events = storage.get_events("legacy-run-1")
    assert len(legacy_events) == 1
    assert legacy_events[0]["id"] == "legacy-evt-1"
    assert legacy_events[0]["actor"] is None or legacy_events[0]["actor"] == "system"

    # 2. Can insert new run with execution_mode, provider, model
    storage.insert_run({
        "id": "new-migrated-run",
        "scenario_id": "test",
        "defense_enabled": True,
        "budget": 1,
        "execution_mode": "live_model",
        "provider": "gemini",
        "model": "gemini-2.0-flash",
    })
    new_run = storage.get_run("new-migrated-run")
    assert new_run["execution_mode"] == "live_model"
    assert new_run["provider"] == "gemini"
    assert new_run["model"] == "gemini-2.0-flash"


def test_causal_dag_lineage_and_actor_attribution():
    """Verify that all events generated during an attack run contain causal links and valid actors."""
    storage = StorageRepository(db_path=TEST_MIG_DB)
    recorder = TraceRecorder(storage=storage)
    engine = AttackEngine(recorder=recorder)

    res = engine.run(
        budget=1,
        defense_enabled=False,
        execution_mode=ExecutionMode.DETERMINISTIC,
    )
    run_id = res.run_id

    events = storage.get_events(run_id)
    assert len(events) >= 5

    event_ids = {e["id"] for e in events}
    actors_found = {e["actor"] for e in events if e.get("actor")}
    relations_found = {e["relation_type"] for e in events if e.get("relation_type")}

    # Validate actors present
    assert "hunter" in actors_found or "operator" in actors_found
    assert "operator" in actors_found
    assert "analyst" in actors_found

    # Validate relations present
    assert RelationType.READ_FROM.value in relations_found
    assert RelationType.REQUESTED_TOOL.value in relations_found
    assert RelationType.VERIFIED_BY.value in relations_found

    # Validate parent-child causal links form a valid DAG (no cycles, parent exists)
    for evt in events:
        parent_id = evt.get("parent_event_id")
        if parent_id is not None:
            # Parent must exist in the run events
            assert parent_id in event_ids, f"Parent {parent_id} not found in run events"
            # Parent must have occurred before child chronologically / in sequence
            current_seq = evt["sequence_number"]
            parent_seq = next(e["sequence_number"] for e in events if e["id"] == parent_id)
            assert parent_seq <= current_seq, f"Parent sequence {parent_seq} after child {current_seq}"


def test_defense_blocked_causal_chain():
    """Verify causal chain when defense is enabled: sentinel blocks and oracle verifies clean state."""
    storage = StorageRepository(db_path=TEST_MIG_DB)
    recorder = TraceRecorder(storage=storage)
    engine = AttackEngine(recorder=recorder)

    res = engine.run(
        budget=1,
        defense_enabled=True,
        execution_mode=ExecutionMode.DETERMINISTIC,
    )
    run_id = res.run_id

    events = storage.get_events(run_id)
    event_types = [e["event_type"] for e in events]

    assert EventType.TOOL_CALL_BLOCKED.value in event_types
    assert EventType.ORACLE_VERDICT.value in event_types

    # Verify that send_email was NEVER executed
    send_email_executions = [
        e for e in events
        if e["event_type"] == EventType.TOOL_CALL_EXECUTED.value and e.get("tool_name") == "send_email"
    ]
    assert len(send_email_executions) == 0

    # Find the blocked event
    blocked_evt = next(e for e in events if e["event_type"] == EventType.TOOL_CALL_BLOCKED.value)
    assert blocked_evt["actor"] == ActorRole.SENTINEL.value
    assert blocked_evt["relation_type"] == RelationType.BLOCKED_BY.value
    assert blocked_evt["tool_name"] == "send_email"

    # Find oracle verdict event
    oracle_evt = next(e for e in events if e["event_type"] == EventType.ORACLE_VERDICT.value)
    assert oracle_evt["actor"] == ActorRole.ANALYST.value
    assert oracle_evt["relation_type"] == RelationType.VERIFIED_BY.value
    # Oracle verdict should link causally to the block event
    assert oracle_evt["parent_event_id"] == blocked_evt["id"]


def test_execution_provenance_faithfulness():
    """Verify that runs and events record faithful execution modes."""
    storage = StorageRepository(db_path=TEST_MIG_DB)
    orchestrator = Orchestrator(storage=storage)

    # 1. Deterministic baseline run
    res = orchestrator.run_assessment(
        scenario_id="support-ticket-injection",
        defense_enabled=False,
        budget=1,
        execution_mode="deterministic",
    )
    det_run = storage.get_run(res["run_id"])
    assert det_run["execution_mode"] == "deterministic"

    # 2. Defended run
    def_res = orchestrator.run_assessment(
        scenario_id="support-ticket-injection",
        defense_enabled=True,
        budget=1,
        execution_mode="deterministic",
    )
    def_run = storage.get_run(def_res["run_id"])
    assert def_run["execution_mode"] == "deterministic"
