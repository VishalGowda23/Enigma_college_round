# P00 — Plan and Repo Preflight

**To the human operator:** Paste this prompt into Google Antigravity to initiate the workspace. Ensure `02_ARCHITECTURE_AND_CONTRACTS.md` is also in the workspace context.

---

<prompt>
You are Antigravity, executing the AgentBreak 24-hour hackathon implementation plan. We are in Phase 0/1.

Please review `02_ARCHITECTURE_AND_CONTRACTS.md` and the tasks `T00` and `T01`.

Execute the following setup steps using your tools:
1. Initialize a `backend` directory. Set up a basic FastAPI application in `backend/app/main.py` with a `GET /api/health` route that returns `{"status": "ok", "mode": "deterministic"}`. Include a `requirements.txt`.
2. Initialize a `frontend` directory using `npx create-vite@latest frontend --template react-ts`. Do not run it interactively, use the `-y` flag if necessary. Install TailwindCSS.
3. Replace the default App component with one that makes a fetch request to `http://localhost:8000/api/health` and displays the result.

Do not start implementing the agent or oracle yet. Stop and confirm when the skeleton is ready for testing.
</prompt>
