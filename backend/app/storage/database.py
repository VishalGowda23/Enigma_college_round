"""SQLite Database persistence and repository layer for AgentBreak (T05)."""
import sqlite3
import json
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.app.schemas.contracts import EventPayload, AttemptOutcome

DEFAULT_DB_PATH = os.getenv("DATABASE_PATH", "agentbreak.db")

def get_connection(db_path: str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def _run_migrations(conn: sqlite3.Connection):
    """Safely apply schema migrations to existing databases without data loss."""
    cursor = conn.cursor()
    
    # Check runs table columns
    cursor.execute("PRAGMA table_info(runs);")
    existing_run_cols = {row["name"] for row in cursor.fetchall()}
    
    if "config_json" not in existing_run_cols:
        cursor.execute("ALTER TABLE runs ADD COLUMN config_json TEXT;")
    if "execution_mode" not in existing_run_cols:
        cursor.execute("ALTER TABLE runs ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'deterministic';")
    if "provider" not in existing_run_cols:
        cursor.execute("ALTER TABLE runs ADD COLUMN provider TEXT;")
    if "model" not in existing_run_cols:
        cursor.execute("ALTER TABLE runs ADD COLUMN model TEXT;")
        
    # Check events table columns
    cursor.execute("PRAGMA table_info(events);")
    existing_event_cols = {row["name"] for row in cursor.fetchall()}
    
    if "parent_event_id" not in existing_event_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN parent_event_id TEXT;")
    if "actor" not in existing_event_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN actor TEXT;")
    if "relation_type" not in existing_event_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN relation_type TEXT;")
    if "execution_mode" not in existing_event_cols:
        cursor.execute("ALTER TABLE events ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'deterministic';")

def init_db(db_path: str = DEFAULT_DB_PATH):
    """Initialize SQLite tables for runs, attempts, events, and findings with automatic migrations."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        
        # Runs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                scenario_id TEXT NOT NULL,
                defense_enabled INTEGER NOT NULL,
                budget INTEGER NOT NULL,
                status TEXT NOT NULL,
                asr REAL NOT NULL DEFAULT 0.0,
                attempts_count INTEGER NOT NULL DEFAULT 0,
                exploits_count INTEGER NOT NULL DEFAULT 0,
                blocks_count INTEGER NOT NULL DEFAULT 0,
                config_json TEXT,
                execution_mode TEXT NOT NULL DEFAULT 'deterministic',
                provider TEXT,
                model TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # Attempts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                sequence_number INTEGER NOT NULL,
                candidate_id TEXT,
                parent_candidate_id TEXT,
                mutation_method TEXT,
                ticket_subject TEXT,
                outcome TEXT NOT NULL,
                verdict_reason TEXT,
                violated_invariant TEXT,
                state_mutated INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs(id)
            );
        """)

        # Events table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                attempt_id TEXT NOT NULL,
                parent_event_id TEXT,
                sequence_number INTEGER NOT NULL,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                actor TEXT,
                source TEXT NOT NULL,
                relation_type TEXT,
                execution_mode TEXT NOT NULL DEFAULT 'deterministic',
                tool_name TEXT,
                arguments_json TEXT,
                policy_decision TEXT,
                reason_code TEXT,
                evidence_json TEXT,
                message TEXT,
                FOREIGN KEY (run_id) REFERENCES runs(id)
            );
        """)

        # Findings table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS findings (
                id TEXT PRIMARY KEY,
                run_id TEXT NOT NULL,
                attempt_id TEXT NOT NULL,
                outcome TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                violated_invariant TEXT,
                evidence_event_ids_json TEXT,
                evidence_records_json TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (run_id) REFERENCES runs(id)
            );
        """)

        conn.commit()
        _run_migrations(conn)
        conn.commit()

class StorageRepository:
    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        init_db(self.db_path)

    def insert_run(self, run_data: Dict[str, Any]):
        with get_connection(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO runs (
                    id, scenario_id, defense_enabled, budget, status,
                    asr, attempts_count, exploits_count, blocks_count,
                    config_json, execution_mode, provider, model, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                run_data["id"],
                run_data["scenario_id"],
                1 if run_data.get("defense_enabled") else 0,
                run_data["budget"],
                run_data.get("status", "COMPLETED"),
                run_data.get("asr", 0.0),
                run_data.get("attempts_count", 0),
                run_data.get("exploits_count", 0),
                run_data.get("blocks_count", 0),
                json.dumps(run_data.get("config", {})),
                run_data.get("execution_mode", "deterministic"),
                run_data.get("provider"),
                run_data.get("model"),
                run_data.get("created_at", datetime.now(timezone.utc).isoformat()),
            ))
            conn.commit()

    def insert_attempt(self, attempt_data: Dict[str, Any]):
        with get_connection(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO attempts (
                    id, run_id, sequence_number, candidate_id, parent_candidate_id,
                    mutation_method, ticket_subject, outcome, verdict_reason,
                    violated_invariant, state_mutated, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                attempt_data["id"],
                attempt_data["run_id"],
                attempt_data["sequence_number"],
                attempt_data.get("candidate_id"),
                attempt_data.get("parent_candidate_id"),
                attempt_data.get("mutation_method"),
                attempt_data.get("ticket_subject"),
                attempt_data["outcome"],
                attempt_data.get("verdict_reason"),
                attempt_data.get("violated_invariant"),
                1 if attempt_data.get("state_mutated") else 0,
                attempt_data.get("created_at", datetime.now(timezone.utc).isoformat()),
            ))
            conn.commit()

    def insert_event(self, event: EventPayload):
        with get_connection(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO events (
                    id, run_id, attempt_id, parent_event_id, sequence_number, timestamp,
                    event_type, actor, source, relation_type, execution_mode,
                    tool_name, arguments_json, policy_decision, reason_code, evidence_json, message
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                event.id,
                event.run_id,
                event.attempt_id,
                event.parent_event_id,
                event.sequence_number,
                event.timestamp,
                event.event_type.value if hasattr(event.event_type, "value") else str(event.event_type),
                event.actor,
                event.source,
                event.relation_type,
                event.execution_mode.value if hasattr(event.execution_mode, "value") else str(event.execution_mode),
                event.tool_name,
                json.dumps(event.arguments_json) if event.arguments_json else None,
                event.policy_decision,
                event.reason_code,
                json.dumps(event.evidence_json) if event.evidence_json else None,
                event.message,
            ))
            conn.commit()

    def insert_finding(self, finding: Dict[str, Any]):
        with get_connection(self.db_path) as conn:
            conn.execute("""
                INSERT OR REPLACE INTO findings (
                    id, run_id, attempt_id, outcome, severity, title,
                    description, violated_invariant, evidence_event_ids_json,
                    evidence_records_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                finding["id"],
                finding["run_id"],
                finding["attempt_id"],
                finding["outcome"],
                finding.get("severity", "HIGH"),
                finding["title"],
                finding["description"],
                finding.get("violated_invariant"),
                json.dumps(finding.get("evidence_event_ids", [])),
                json.dumps(finding.get("evidence_records", [])),
                finding.get("created_at", datetime.now(timezone.utc).isoformat()),
            ))
            conn.commit()

    def get_run(self, run_id: str) -> Optional[Dict[str, Any]]:
        with get_connection(self.db_path) as conn:
            row = conn.execute("SELECT * FROM runs WHERE id = ?", (run_id,)).fetchone()
            if not row:
                return None
            res = dict(row)
            res["defense_enabled"] = bool(res["defense_enabled"])
            res["config"] = json.loads(res["config_json"]) if res.get("config_json") else {}
            res["execution_mode"] = res.get("execution_mode") or "deterministic"
            res["provider"] = res.get("provider")
            res["model"] = res.get("model")
            return res

    def list_runs(self) -> List[Dict[str, Any]]:
        with get_connection(self.db_path) as conn:
            rows = conn.execute("SELECT * FROM runs ORDER BY created_at DESC").fetchall()
            result = []
            for r in rows:
                d = dict(r)
                d["defense_enabled"] = bool(d["defense_enabled"])
                d["config"] = json.loads(d["config_json"]) if d.get("config_json") else {}
                d["execution_mode"] = d.get("execution_mode") or "deterministic"
                d["provider"] = d.get("provider")
                d["model"] = d.get("model")
                result.append(d)
            return result

    def get_events(self, run_id: str) -> List[Dict[str, Any]]:
        with get_connection(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM events WHERE run_id = ? ORDER BY sequence_number ASC",
                (run_id,)
            ).fetchall()
            events = []
            for r in rows:
                d = dict(r)
                d["arguments_json"] = json.loads(d["arguments_json"]) if d.get("arguments_json") else {}
                d["evidence_json"] = json.loads(d["evidence_json"]) if d.get("evidence_json") else {}
                d["execution_mode"] = d.get("execution_mode") or "deterministic"
                events.append(d)
            return events

    def get_findings(self, run_id: str) -> List[Dict[str, Any]]:
        with get_connection(self.db_path) as conn:
            rows = conn.execute(
                "SELECT * FROM findings WHERE run_id = ? ORDER BY created_at ASC",
                (run_id,)
            ).fetchall()
            findings = []
            for r in rows:
                d = dict(r)
                d["evidence_event_ids"] = json.loads(d["evidence_event_ids_json"]) if d.get("evidence_event_ids_json") else []
                d["evidence_records"] = json.loads(d["evidence_records_json"]) if d.get("evidence_records_json") else []
                findings.append(d)
            return findings
