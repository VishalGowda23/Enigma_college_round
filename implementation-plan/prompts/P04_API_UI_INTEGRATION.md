# P04 — API and UI Integration

**To the human operator:** Paste this prompt to wire up the FastAPI endpoints and the React frontend (T07 & T08).

---

<prompt>
We have a working core engine. Now we integrate it with the API and UI.

1. **Backend:** In `app/api/runs.py`, create routes:
   - `POST /api/runs`: Accepts `{scenario_id, defense_enabled, budget}`. Creates a DB run, executes the orchestrator synchronously, and returns the run ID.
   - `GET /api/runs/{id}`: Returns run details and metrics.
   - `GET /api/runs/{id}/events`: Returns chronological events.
   - `GET /api/runs/{id}/findings`: Returns oracle verdicts.
2. **Frontend:** In `frontend/src/`, build a `Dashboard` component. It should have a button to "Run Assessment". When clicked, POST to the API and then navigate to a `RunDetail` view.
3. The `RunDetail` view must fetch and display the `events` timeline and the `findings`. Use Tailwind to style the timeline clearly (e.g., red for exploit, green for block).

Verify by clicking the button in the browser and observing the trace appear on screen.
</prompt>
