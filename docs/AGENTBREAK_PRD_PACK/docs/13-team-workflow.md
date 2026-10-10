# 13 — Team Workflow and Ownership

## 1. Ownership model

For a two-person team, use clear ownership but integrate continuously. Avoid independent implementation of overlapping schemas or parallel copies of the same component.

### Teammate A — Agent/security engine owner

Owns:
- synthetic support-agent execution;
- mock tool implementations;
- policy enforcement and defense toggle;
- attack candidate model and bounded mutation;
- exploit oracle;
- scenario fixtures and security unit tests.

Primary files expected: `backend/app/agent/`, `backend/app/tools/`, `backend/app/attacks/`, `backend/app/oracle/`, relevant tests.

### Teammate B — Platform/integration owner

Owns:
- FastAPI setup and endpoints;
- SQLite repository and Pydantic schemas;
- assessment orchestration integration;
- React dashboard and trace views;
- run history and baseline/defense comparison;
- setup instructions and presentation flow.

Primary files expected: `backend/app/api/`, `backend/app/storage/`, `backend/app/schemas/`, `frontend/src/`, README and integration tests.

### Shared ownership

- Agree on scenario ID and event/outcome schemas before code is written.
- Both review the canonical security invariant and policy semantics.
- Both run the end-to-end acceptance path.
- Both rehearse the demo and understand the architecture.

## 2. Integration contract

Implement these shared concepts before interface parallelization:

- run lifecycle states;
- attempt outcome enum;
- event shape and ordering field;
- finding shape and evidence references;
- scenario/test-case identifiers;
- API endpoint request and response fields.

If a schema changes, announce it before modifying implementation. Prefer backward-compatible additions over renaming fields late in the build.

## 3. Git workflow

- Create `main` with a working skeleton.
- Create short-lived branches with clear names, e.g. `feat/mock-tool-policy`, `feat/run-api`, `feat/trace-timeline`.
- Commit small increments at working checkpoints.
- Push early and frequently so neither contributor becomes the only holder of working code.
- Merge working components as soon as the contract is stable.
- Avoid risky late-night refactors after acceptance testing begins.

Do not fabricate a staged history; commits should represent actual work and meaningful checkpoints.

## 4. Suggested check-in cadence

- Start: agree on scope, types, API, and component ownership.
- Every 60–90 minutes: brief integration checkpoint—what works locally, what contract changed, what is blocked.
- At each milestone gate: demonstrate evidence, not just report “done.”
- Final phase: one person drives the full demo while the other observes, times, and notes failure points; then swap roles.

## 5. Definition of “done” for a contribution

A contribution is not done until:
- it runs in the shared repository;
- its interface is documented;
- a basic automated test or reproducible manual verification exists;
- errors have meaningful states;
- it does not silently violate the sandbox or evidence contract;
- the other teammate can integrate or operate it.

## 6. Managing blockers

A blocker should be stated in this format:
- What was attempted?
- What exact behavior failed?
- What evidence or error was observed?
- Which acceptance criterion is blocked?
- What is the simplest fallback that preserves the core demo?

Prefer simplifying the affected layer over introducing a new framework late in the build.
