# AgentBreak PRD Pack

This repository contains the product requirements and execution specifications for **AgentBreak — The Autonomous AI Red Team**, scoped for the CRCE Bit N Build college-round hackathon.

## Start here

1. Read [`PRD.md`](PRD.md) for the product definition and master requirement index.
2. Read [`docs/01-functional-requirements.md`](docs/01-functional-requirements.md) and [`docs/02-user-journeys-and-workflows.md`](docs/02-user-journeys-and-workflows.md) to understand expected behavior.
3. Read [`docs/04-threat-model-and-safety.md`](docs/04-threat-model-and-safety.md) before implementing attack or sandbox functionality.
4. Read [`docs/05-system-architecture.md`](docs/05-system-architecture.md), [`docs/07-data-model-and-event-schema.md`](docs/07-data-model-and-event-schema.md), and [`docs/08-api-contract.md`](docs/08-api-contract.md) before integrating work across teammates.
5. Use [`docs/12-implementation-plan.md`](docs/12-implementation-plan.md) and [`docs/13-team-workflow.md`](docs/13-team-workflow.md) as the build plan.

## Document map

| File | Purpose |
|---|---|
| `PRD.md` | Master PRD, goals, scope, requirements index, acceptance overview |
| `docs/00-product-brief.md` | Vision, users, problem, value proposition, constraints |
| `docs/01-functional-requirements.md` | Functional requirements mapped to the seven official features |
| `docs/02-user-journeys-and-workflows.md` | User flows and system workflows |
| `docs/03-scope-and-priorities.md` | MVP, should-have, stretch, and explicitly excluded scope |
| `docs/04-threat-model-and-safety.md` | Trust boundaries, abuse cases, safety controls, security assumptions |
| `docs/05-system-architecture.md` | Component architecture and design principles |
| `docs/06-technology-stack.md` | Technology choices, alternatives, setup, dependency discipline |
| `docs/07-data-model-and-event-schema.md` | Entities, event model, trace structure, persistence rules |
| `docs/08-api-contract.md` | REST API endpoints, payloads, errors, lifecycle semantics |
| `docs/09-ui-ux-specification.md` | Screens, components, states, accessibility, visual behavior |
| `docs/10-attack-defense-and-demo-scenarios.md` | Canonical synthetic attack scenario, defense, variants |
| `docs/11-metrics-and-evaluation.md` | Metric definitions, denominators, interpretation, limitations |
| `docs/12-implementation-plan.md` | Phases, milestones, hour-by-hour plan, fallback criteria |
| `docs/13-team-workflow.md` | Two-person split, integration contract, Git workflow |
| `docs/14-test-and-quality-plan.md` | Unit, integration, end-to-end, regression, acceptance tests |
| `docs/15-demo-script-and-presentation.md` | Rehearsal sequence, narration, failure recovery |
| `docs/16-acceptance-criteria.md` | Definition of done and requirement-to-test mapping |
| `docs/17-risks-assumptions-and-decisions.md` | Risks, assumptions, decisions, open items |
| `docs/18-glossary-and-terms.md` | Shared vocabulary and terminology |

## Status and source of truth

- This is a **proposed implementation specification**, not evidence that features already exist.
- The finalized `AGENTBREAK_RESEARCH_FOUNDATION.md` remains the research reference for prior art and technical background. This PRD pack is the implementation-facing interpretation of that foundation and the official problem statement reproduced there.
- The official feature names are preserved: autonomous attack discovery; multi-stage attack analysis; tool and permission auditing; reproducible attack traces; defense validation; security evaluation dashboard; regression testing.
- The recommended MVP is grey-box by design: AgentBreak owns and instruments the synthetic target agent and tools so it can verify side effects. It is not represented as a universal black-box scanner.
- All demonstrations must use synthetic data and mock services. No real email, production system, or external target is contacted by the attack flow.

## How to change the documents

If implementation decisions change, update the relevant specification and record the decision in `docs/17-risks-assumptions-and-decisions.md`. Keep API and event schemas stable once both teammates integrate against them. If something cannot be implemented in the available time, mark it as deferred instead of pretending it is complete.
