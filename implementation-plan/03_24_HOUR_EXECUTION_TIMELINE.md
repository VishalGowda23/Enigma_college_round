# 03 — 24-Hour Execution Timeline

## 1. Timeline Principles

*   **Dependency-Driven:** Do not build the dashboard until the API works. Do not build the API until the core engine works. Do not build the attack mutator until the baseline exploit works.
*   **Timeboxed:** If a gate is missed, trigger the fallback plan immediately. Do not extend the timebox.
*   **Buffer:** The last 4 hours are strictly for rehearsal and bug fixing, not feature development.

## 2. The 24-Hour Schedule

**T+00:00 (Start)**
*   **T00:** Agree on schemas, enums, and project setup.
*   *Gate G0 (T+00:30):* Schemas documented, repository initialized.

**T+00:30**
*   **T01:** Backend FastAPI shell + SQLite init; Frontend Vite shell.
*   *Gate G1 (T+01:30):* Frontend successfully fetches `/api/health`.

**T+01:30**
*   **T02:** Build the deterministic Target Agent and Mock Tools (`read_ticket`, `lookup_customer`, `send_email`).
*   **T03:** Implement Tool Policy Engine (allowlist) and Exploit Oracle (mock outbox check).
*   **T04:** Implement the seeded Baseline Attack (`support-ticket-injection`).
*   *Gate G2 (T+05:00):* A Python script runs the baseline attack and the Oracle returns `CONFIRMED_EXPLOIT` based on outbox state.

**T+05:00**
*   **T05:** Implement Trace Persistence (saving events, attempts, findings to SQLite).
*   *Gate G3 (T+07:00):* Findings include evidence event IDs and trace completeness checks.

**T+07:00**
*   **T06:** Enable Defense (policy enforcement) and implement Benign Utility cases.
*   *Gate G4 (T+09:00):* The same script runs the attack with defense ON -> `BLOCKED`. A benign task runs -> `NO_EXPLOIT_OBSERVED`.

**T+09:00**
*   **T07:** Build the API Orchestration endpoints (`/runs`, `/events`, `/findings`).
*   **T08:** Build the React Dashboard (Run list, Overview, Trace detail).
*   *Gate G5 (T+12:00):* Full attack workflow can be launched and viewed from the UI.

**T+12:00**
*   **T09:** Implement Replay (`/runs/{id}/replay`) and Regression Metrics (A/B comparison).
*   *Gate G6 (T+15:00):* Replay creates a distinct new run ID in the UI.

**T+15:00**
*   **T09 (cont.):** Polish bounded mutation (adaptivity) and metric calculations.
*   **T10 (Optional/Stretch):** Add live LLM provider adapter if deterministic mode is rock solid.
*   *Gate G7 (T+18:00):* All P0 criteria passing. No new features started.

**T+18:00**
*   **T11:** Hardening, bug fixing, removing hardcoded test data, cleanup.
*   *Gate G8 (T+20:00):* Feature Freeze. Code is locked.

**T+20:00**
*   **T11:** Demo rehearsal. Team practices the script.
*   *Gate G9 (T+22:00):* Two consecutive, flawless end-to-end rehearsals complete.

**T+22:00 to T+24:00 (Buffer)**
*   Address minor UI quirks, prepare final README, prepare presentation.
*   *Gate G10 (T+24:00):* Submission.

## 3. Parallelization Strategy (Team of 2)

*   **Phase 1 (Setup):** Pair programming. (T00, T01)
*   **Phase 2 (Core Engine):**
    *   Teammate A: Target Agent, Mock Tools, Oracle, Policy. (T02, T03)
    *   Teammate B: SQLite schemas, Trace persistence logic. (T05 parallel to T03)
*   **Phase 3 (Integration):**
    *   Teammate A: API route handlers and Orchestration logic. (T07)
    *   Teammate B: React UI, Axios client, Dashboard views. (T08)
*   **Phase 4 (Advanced):**
    *   Teammate A: Mutation engine, Live Model adapter. (T10, T09)
    *   Teammate B: Replay endpoints, Regression metrics UI. (T09)
*   **Phase 5 (Wrap-up):** Pair programming / QA testing each other. (T11)
