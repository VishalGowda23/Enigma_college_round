# T07 — API and Orchestration

## 1. Objective
Expose the core engine through FastAPI so the React UI can drive the application.

## 2. Requirements
- Create FastAPI routes for initiating runs and fetching results.
- Wire the routes to the core Orchestrator and SQLite DB.

## 3. Implementation Steps
1.  `POST /api/runs`:
    - Accepts `scenario_id`, `defense_enabled`, `budget`.
    - Creates a Run in DB.
    - Calls Orchestrator (synchronously for MVP is fine, or background task).
    - Returns `run_id`.
2.  `GET /api/runs`: Returns list of all runs.
3.  `GET /api/runs/{id}`: Returns run details, metrics (ASR), status.
4.  `GET /api/runs/{id}/events`: Returns chronological event trace.
5.  `GET /api/runs/{id}/findings`: Returns verdicts and evidence.

## 4. Acceptance Criteria
- [ ] Can start an attack run via `curl POST /api/runs`.
- [ ] Can fetch the resulting trace via `curl GET /api/runs/{id}/events`.

## 5. Contingency
If background tasks cause issues (e.g., DB session thread conflicts), run the orchestration synchronously and let the HTTP request hang until it finishes (acceptable for a fast local demo).
