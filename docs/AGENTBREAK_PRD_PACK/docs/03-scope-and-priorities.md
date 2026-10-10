# 03 — Scope and Priorities

## 1. Scope philosophy

The official problem statement names seven requirements. The MVP must provide a coherent implementation path for each, but not each one needs a fully generalized research implementation in the hackathon window. A single credible workflow with end-to-end evidence is more valuable than seven shallow modules.

## 2. Must-have (P0)

- Built-in synthetic support agent.
- Mock support tickets and synthetic customer data.
- Mock tool layer for ticket read, customer lookup, and email send.
- Explicit policy: allowed recipient(s), permitted data, and blocked conditions.
- Baseline configuration demonstrating a real unauthorized side effect inside the mock service.
- Tool-boundary defense that blocks the same class of prohibited side effect.
- Exploit oracle evaluating tool logs and state, independent of agent text.
- Structured event trace and finding record.
- Backend persistence and run summary.
- One benign task that passes with defense enabled.
- Basic dashboard, trace detail, and baseline/defended comparison.
- Basic replay of a saved case.
- Safe-by-default environment with no real network side effects.

## 3. Should-have (P1)

- Bounded mutation loop informed by observed outcomes.
- Small set of additional attack variants.
- One more benign task to expose overly restrictive defenses.
- Repeat-trial statistics.
- Regression suite with raw deltas.
- Explicit permission audit table.
- Run cancellation and clear error states.
- Exportable JSON trace or finding report.

## 4. Could-have (P2/stretch)

- Model-driven attack mutation with provider adapter.
- Live event streaming via SSE.
- Multi-stage attack-path graph.
- Additional memory/retrieval poisoning scenario.
- Multiple synthetic target-agent profiles.
- Benchmark import adapter.
- More extensive severity rubric.
- Run comparison filters and polished visualizations.

## 5. Won't-have in hackathon MVP

- Direct probing of production/third-party systems.
- Real email delivery, external data exfiltration, arbitrary URL fetching, arbitrary shell execution, or real credentials.
- Custom-trained attack or defense models.
- Full framework-agnostic agent adapter ecosystem.
- Production auth, billing, team spaces, and multi-tenant isolation.
- A claim of universal robustness or formal proof of security.
- An unrestricted autonomous agent allowed to take arbitrary actions.

## 6. Scope cut order under time pressure

If the project is behind schedule, cut in this order:

1. Advanced charts and graph visualization.
2. Live streaming.
3. Model-driven mutation; keep deterministic mutation.
4. Additional attack scenarios.
5. Repeated trials beyond a small demonstration set.
6. Extra finding export formats.

Do not cut:
- real side-effect evidence in mock state;
- tool-boundary enforcement;
- trace capture;
- one benign utility check;
- before-and-after comparison;
- safety isolation.

## 7. Definition of a successful feature implementation

A feature is not complete just because a menu item or data model exists. It must perform an observable operation, persist its result, and expose the result to the user. For example, “regression testing” requires re-executing saved cases and comparing outcomes; a static chart labelled “Regression” is not implementation.
