# T05 — Trace and Persistence

## 1. Objective
Save the execution flow (events, attempts, verdicts) to SQLite so it can be viewed in the dashboard and replayed.

## 2. Requirements
- Define SQLAlchemy models (or raw SQLite schemas) for `Run`, `Attempt`, `Event`, and `Finding`.
- Update the Agent, Tool Adapter, and Oracle to emit structured events.
- Persist these events to the database.

## 3. Implementation Steps
1.  Create `database.py` with SQLAlchemy setup.
2.  Define models based on `02_ARCHITECTURE_AND_CONTRACTS.md`.
3.  Create a `TraceRecorder` class.
    - Inject this into the TargetAgent and Tool Adapter.
    - `recorder.log_event(event_type="TOOL_CALL_EXECUTED", ...)`
4.  At the end of an attempt, the Orchestrator saves the Oracle Verdict and creates a `Finding` row if an exploit is confirmed.
5.  Link the `Finding` to the exact event IDs (e.g., the `TOOL_CALL_EXECUTED` event).

## 4. Acceptance Criteria
- [ ] Running `test_attack.py` populates the SQLite `events` and `findings` tables.
- [ ] Finding rows contain JSON lists of evidence event IDs.

## 5. Contingency
If SQLAlchemy is too slow to set up, use raw `sqlite3` `INSERT` statements. Persistence is mandatory.
