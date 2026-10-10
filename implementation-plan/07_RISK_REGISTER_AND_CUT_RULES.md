# 07 — Risk Register and Cut Rules

## 1. Risk Register

| Risk | Impact | Probability | Mitigation | Trigger / Action |
|---|---|---|---|---|
| **LLM API Latency/Outage** | High | High | Build a robust deterministic mode first. | If API calls take >10s consistently, force deterministic mode for the demo. |
| **Oracle Logic Too Complex** | Critical | Medium | Start with a simple database row check (e.g., did an unauthorized recipient appear in `mock_outbox`). | If oracle takes >1 hour to build, simplify the invariant to a simple boolean check. |
| **UI Integration Nightmares** | High | Medium | Define strict JSON schemas for API endpoints early. | If UI is blocking, use a bare-bones HTML/JS dashboard or CLI. |
| **Scope Creep (Adaptive Mutation)** | High | High | Keep mutation bounded (e.g., predefined string substitutions). | If T04 mutator takes >2 hours, hardcode 3 static attack seeds and move on. |
| **Teammate Merge Conflicts** | Medium | Medium | Separate Backend (A) and Frontend (B) tasks. | Resolve quickly; pair program through integration points. |

## 2. Hard Feature Cuts (Scope Shedding)

If we are behind schedule (missing Gates G3 or G4), drop features in this exact order:

**First Cuts (Non-essential polish):**
1.  LLM-driven mutation (rely solely on deterministic seeds).
2.  Advanced React Recharts (use simple HTML tables).
3.  Live Event Streaming / SSE (use basic HTTP polling or refresh).
4.  JSON trace export button.

**Second Cuts (Features that don't block the core demo):**
5.  Multiple attack families (stick to the one canonical `support-ticket-injection`).
6.  Complex regression testing deltas (just show side-by-side run results).

**NEVER CUT (The Core MVP):**
*   Mock state checking (The Oracle).
*   Tool boundary policy enforcement (The Defense).
*   Trace recording (Event sequence).
*   At least one Benign Utility case.

## 3. The "2 Hours Left" Rule

At T+22:00, **NO NEW CODE IS WRITTEN**.
*   If a feature is 90% done, comment it out or hide the UI button.
*   Only fix critical bugs that break the main demo script.
*   Ensure the `.env.example` and `README.md` are accurate for judges.
