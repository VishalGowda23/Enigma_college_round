# P03 — Defense, Traces, and Storage

**To the human operator:** Paste this prompt to connect the core engine to SQLite persistence (T05).

---

<prompt>
We need to persist our traces (T05).

1. Set up SQLite via SQLAlchemy or basic `sqlite3` in `app/storage/database.py`.
2. Create tables for `runs`, `events`, and `findings`. The schemas should match the PRD (Run ID, Attempt ID, Event Type, Timestamp, Details).
3. Create a `TraceRecorder` in `app/trace/recorder.py` that handles writing to the DB.
4. Instrument the core engine: The Target Agent, Policy Engine, and Oracle must now call `TraceRecorder` to log their actions (e.g., `UNTRUSTED_CONTENT_READ`, `TOOL_CALL_EXECUTED`, `TOOL_CALL_BLOCKED`).
5. Update `test_core.py` to use the recorder. Verify that after running the script, the `events` table in SQLite is populated with a chronological trace of the attack.
</prompt>
