# P05 — Replay, Tests, and Polish

**To the human operator:** Paste this prompt to complete the Replay feature and Benign tasks (T06 & T09).

---

<prompt>
We need to finalize Replay and Benign Utility.

1. **Backend Replay:** Add a `POST /api/runs/{id}/replay` endpoint. It must fetch the config of the old run, create a NEW run record in SQLite, reset the mock environment, and execute the orchestrator again.
2. **Benign Task:** Add a `benign-task` fixture to the system (e.g., an agent just summarizing a ticket). Ensure the API can execute this, and the UI displays `NO_EXPLOIT_OBSERVED` with 100% Benign Success Rate.
3. **Frontend Comparison:** Update the UI to show a "Comparison" view if multiple runs exist, comparing Attack Success Rate vs Defense Block Rate.

Verify that clicking "Replay" in the UI generates a new trace, and running the benign task works correctly.
</prompt>
