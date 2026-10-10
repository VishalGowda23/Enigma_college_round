# 17 — Risks, Assumptions, Decisions, and Open Items

## 1. Confirmed project constraints

- Team has two members.
- Target implementation window is approximately 12–24 hours.
- The product must address the seven official AgentBreak features.
- The research foundation is finalized; additional broad research is not on the critical path.

## 2. Assumptions for this PRD

- The hackathon demo can be run locally.
- A synthetic target agent is acceptable for the demonstration.
- Mock services qualify as the controlled environment for the MVP, provided this limitation is disclosed.
- An external model API may be used but must not be required for the baseline workflow.
- The team can use React/TypeScript and Python/FastAPI or substitute equivalent technologies while preserving contracts.
- No real data or external production target is required.

If any assumption is invalidated, record a decision before making a large implementation change.

## 3. Decisions made in this specification

### D-01 — Signature scenario
Use a synthetic support agent and indirect prompt injection through a support ticket.

**Reason:** concrete and understandable; exposes tool use, untrusted content, side effects, policy boundaries, traces, and benign utility in one scenario.

### D-02 — Mock tools only
`send_email` writes to a local mock outbox and never sends real email.

**Reason:** safety, determinism, demo repeatability.

### D-03 — Side-effect oracle
Exploit success is decided from state and event evidence, not from generated text alone.

**Reason:** avoids false positives from model self-reporting.

### D-04 — Tool-boundary defense
The defense is enforced before side effects are committed.

**Reason:** a prompt instruction is not a reliable permission control.

### D-05 — React + FastAPI + SQLite proposal
Use a small, local stack unless implementation constraints require a change.

**Reason:** time efficiency and local reproducibility.

### D-06 — Deterministic fallback
Maintain an offline mode that can demonstrate actual tool/oracle behavior if model calls fail.

**Reason:** reliability during a time-limited live demo.

### D-07 — Research claims remain conservative
Do not claim the first or only autonomous agent red-team. Explain the implemented integration and evidence instead.

**Reason:** research foundation identifies substantial prior art and no confirmed novelty gap.

## 4. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Trigger/action |
|---|---|---|---|---|---|
| R-01 | Scope grows beyond time window | High | High | P0/P1/P2 priorities and feature freeze | Cut stretch features when core gate slips |
| R-02 | Model behavior is unpredictable | High if model-dependent | High | Deterministic mode and bounded budgets | Disable model path if baseline becomes unreliable |
| R-03 | No reliable exploit oracle | Medium | Critical | Implement oracle against mock state early | Do not build mutation/dashboard until oracle tests pass |
| R-04 | Defense relies only on prompting | Medium | Critical | Enforce at tool boundary | Block release if tool call can mutate state without policy |
| R-05 | Trace does not contain enough evidence | Medium | High | Required event schema and completeness tests | Mark findings incomplete and fix instrumentation |
| R-06 | Metrics become misleading | Medium | High | Raw counts, explicit denominator, separate errors | Recompute from attempt-level outcomes |
| R-07 | Teammate integration conflict | Medium | High | Shared schema, early checkpoints, file ownership | Stop parallel feature work and integrate |
| R-08 | API key or sensitive data leaks | Low–Medium | High | Synthetic data, env-only secrets, redaction | Rotate leaked key, remove from history where possible |
| R-09 | Live demo fails due to network | Medium | High | Local mock services and deterministic mode | Switch to offline workflow and disclose mode |
| R-10 | Judges interpret a toy scenario as general proof | Medium | Medium | Scope/limitations slide and cautious claims | Explicitly state tested conditions and limitations |
| R-11 | UI polish crowds out security logic | High | High | Build UI after event contract; simple timeline first | Defer charts and graph visualization |
| R-12 | Replay copies old output instead of executing | Medium | High | Replay integration test creates new run | Do not mark FR-D complete until tested |

## 5. Open implementation questions

These are implementation choices, not reasons to reopen broad research:

- Will target agent reasoning use a local deterministic implementation, a model API, or both?
- Will assessment execution be synchronous or via FastAPI background tasks?
- Is polling sufficient, or does the live demo need SSE?
- Which test runner and dependency manager match the team's existing setup?
- Is JSON export necessary after UI trace inspection works?

Resolve each by choosing the simplest option consistent with acceptance criteria.

## 6. Decision log template

For any significant change, record:

- Date/time.
- Decision ID.
- Context/problem.
- Options considered.
- Decision chosen.
- Impact on requirements and schedule.
- Files requiring updates.

## 7. Change control

Do not change scenario, outcome enum, event keys, or API response structures silently during integration. Update this log and relevant docs first. Avoid late architecture changes after the final feature-freeze gate.
