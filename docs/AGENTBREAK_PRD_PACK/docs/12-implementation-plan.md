# 12 — Implementation Plan

## 1. Execution strategy

The plan is intentionally dependency-driven. First make a real tool action happen in a mock environment; then make its outcome measurable; then enforce a policy; then record and expose evidence. Do not start with a sophisticated attacker or dashboard.

## 2. Build phases

### Phase 0 — Align the contract (0–30 minutes)

Deliverables:
- repository created;
- owner per component agreed;
- event schema and core outcome enum shared;
- API contract accepted;
- demo scenario fixed.

Exit gate: both teammates can explain which layer decides exploit success and what constitutes a prohibited side effect.

### Phase 1 — Skeleton and integration seam (0.5–1.5 hours)

Backend:
- FastAPI health route;
- SQLite initialization;
- Pydantic request/response schemas;
- mock scenario configuration.

Frontend:
- Vite/React shell;
- API client wrapper;
- layout and empty dashboard.

Exit gate: UI can call backend health/scenario endpoints.

### Phase 2 — Mock agent and tools (1.5–3 hours)

Implement `read_ticket`, `lookup_customer`, `send_email` against synthetic fixture data. Record every attempted and executed action. Introduce a simple deterministic target mode if LLM orchestration is not stable.

Exit gate: a local script can invoke the target agent and produce a mock outbox result without network access.

### Phase 3 — Canonical baseline exploit (2.5–5 hours)

Implement the seeded indirect-instruction case and intentionally vulnerable baseline policy configuration. Verify that the oracle confirms the prohibited side effect by inspecting actual mock state.

Exit gate: one command or test demonstrates the baseline violation repeatably.

### Phase 4 — Oracle and trace persistence (4–7 hours)

Implement event sequence IDs, event storage, oracle outcomes, finding records, and trace completeness. Add unit tests for confirmed exploit versus blocked attempt versus error.

Exit gate: finding links to the exact tool and side-effect evidence.

### Phase 5 — Defense and benign utility (5–8 hours)

Implement allowlist/data-label policy at the tool boundary. Add at least one benign support task and verify that defense doesn't break it.

Exit gate: same malicious case is blocked in defended mode and benign task passes.

### Phase 6 — API and UI integration (7–11 hours)

Expose runs/events/findings, add run launcher, summary cards, attempt list, trace timeline, and baseline/defense comparison. Use actual stored results.

Exit gate: entire story can be performed from the UI.

### Phase 7 — Replay and regression (10–13 hours)

Re-execute a stored case against a reset state, create a new run, compare outcome. Add regression state for one attack and one benign case.

Exit gate: replay creates a distinct run and regression result is computed from records.

### Phase 8 — Adaptive variation (parallel stretch, 8–14 hours)

Add a deterministic mutation strategy and parent-child candidate lineage. Model-assisted variation only after deterministic mode is stable.

Exit gate: a changed candidate is generated in response to prior feedback and remains within budget.

### Phase 9 — Hardening and presentation (last 2–4 hours)

Run acceptance suite, check error handling, verify clean setup, remove fake data, rehearse demo, prepare screenshots only if needed as backup. Freeze features.

Exit gate: two consecutive successful end-to-end rehearsals or documented, disclosed fallback mode.

## 3. 12-hour fallback plan

If only 12 hours are available:
- keep one scenario and one baseline attack;
- keep one deterministic mutation or present the candidate suite honestly as predefined tests;
- keep one defense rule and one benign task;
- keep SQLite-backed run and event records;
- keep a minimal dashboard with trace and A/B results;
- defer LLM-driven mutation, SSE, graph visualization, extra attack families, and advanced analytics.

Do not drop side-effect verification or benign utility.

## 4. 24-hour extended plan

If 24 hours are truly available and all P0 criteria pass:
- add multiple attack variants;
- add repeat trials and replay consistency;
- show attack mutation lineage;
- add a second benign test to improve utility evaluation;
- show an explicit permission audit table;
- add a compact event graph or JSON trace export;
- optionally connect an LLM API through a bounded adapter.

## 5. Milestone gates

| Gate | Deadline target | Evidence required | Decision if failed |
|---|---:|---|---|
| G1: Local skeleton | Hour 1.5 | Frontend reaches API | Simplify setup; integrate immediately |
| G2: Side effect exists | Hour 5 | Mock outbox records baseline violation | Debug deterministic target/payload; freeze UI work |
| G3: Oracle and trace work | Hour 7 | Finding includes evidence IDs | Prioritize event schema and state checks |
| G4: Defense works | Hour 8 | Same policy violation blocked | Fix enforcement boundary before adaptive work |
| G5: Benign task passes | Hour 9 | Successful allowed task | Reduce policy scope; prevent blanket refusal |
| G6: UI end to end | Hour 11 | Full workflow visible | Use minimal detail view; defer charts |
| G7: Replay regression | Hour 13 | New run and delta stored | Keep replay, simplify comparison if necessary |
| G8: Feature freeze | Hour 14–16 | Acceptance checklist passes | No new features; rehearse |

## 6. Work sequence and dependencies

The correct dependency order is:

1. Types and event schema.
2. Synthetic fixtures and tool adapter.
3. Security policy toggle.
4. Exploit oracle.
5. Trace persistence.
6. Assessment orchestration.
7. API contract.
8. UI states and metrics.
9. Replay/regression.
10. Adaptive attack variation.
11. polish and presentation.

Attack generation is deliberately not first because it is useless without a reliable success oracle.

## 7. Feature freeze rule

At the final quarter of available time, feature development stops. Remaining work is limited to bug fixes, integration, acceptance testing, documentation, and demo rehearsal.
