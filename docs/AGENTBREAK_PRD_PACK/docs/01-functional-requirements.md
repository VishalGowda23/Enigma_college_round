# 01 — Functional Requirements

This document defines functional requirements, priorities, dependencies, observable outputs, and acceptance tests. **MUST** means required for the MVP's end-to-end demonstration. **SHOULD** means strongly preferred if the core flow remains stable. **COULD** indicates stretch scope.

## 1. Requirement ID scheme

- `FR-Axx`: Autonomous Attack Discovery
- `FR-Bxx`: Multi-Stage Attack Analysis
- `FR-Cxx`: Tool and Permission Auditing
- `FR-Dxx`: Reproducible Attack Traces
- `FR-Exx`: Defense Validation
- `FR-Fxx`: Security Evaluation Dashboard
- `FR-Gxx`: Regression Testing
- `NFR-xx`: Non-functional requirements

## 2. FR-A — Autonomous Attack Discovery

### FR-A01 — Bounded attack candidates [MUST]
The system must run attack candidates against the built-in synthetic target within a configurable attempt budget. Every attempt must have a unique identifier and recorded input.

**Acceptance:** The run contains an ordered set of attempts and terminates at the configured budget or a confirmed stop condition.

### FR-A02 — Attack outcome feedback [MUST]
After each attempt, the attack loop must receive a structured outcome from the exploit oracle: `CONFIRMED_EXPLOIT`, `BLOCKED`, `NO_EXPLOIT_OBSERVED`, or `ERROR`.

**Acceptance:** The next action in the loop is informed by the recorded outcome; errors are not counted as successful blocks.

### FR-A03 — Candidate mutation [MUST, minimal]
Implement at least one bounded mutation strategy, for example modifying wording, attack placement, or target recipient in a test fixture. Keep mutation lineage from parent attempt to child attempt.

**Acceptance:** A child attempt references its parent and mutation method.

### FR-A04 — Model-assisted variation [COULD]
An optional model adapter may propose candidate variations. It must not decide whether the exploit succeeded; the independent oracle remains authoritative.

**Acceptance:** If model configuration is missing or fails, deterministic mode remains runnable.

### FR-A05 — Budget and stop conditions [MUST]
Support limits for attempts and, when applicable, duration. Display configured and consumed budget.

**Acceptance:** The loop cannot exceed the configured attempt cap; cancellation leaves a valid run record.

### FR-A06 — Baseline comparison [SHOULD]
When feasible, compare bounded mutation against a small fixed set to show what adaptivity contributes. The UI must not call a generated candidate novel unless its lineage and seed comparison support that claim.

## 3. FR-B — Multi-Stage Attack Analysis

### FR-B01 — Ordered event chain [MUST]
Record the chain from initial task and untrusted source through agent decision, tool invocation, policy outcome, and observed side effect.

### FR-B02 — Source provenance [MUST]
The trace must distinguish trusted task instructions from untrusted ticket/document content.

### FR-B03 — Evidence-based causality [MUST]
The UI may describe the observed sequence but must not claim causal proof beyond the instrumentation. Unknown links must be shown as unknown.

### FR-B04 — Finding timeline [MUST]
Clicking a finding opens its ordered events and highlights the event that confirms or blocks the prohibited side effect.

### FR-B05 — Graph presentation [COULD]
A graph visualization may be added after the event timeline works. It is not required to establish the core chain.

## 4. FR-C — Tool and Permission Auditing

### FR-C01 — Declared policy [MUST]
The scenario must define allowed recipients, data categories, tools, and any approval constraints before testing begins.

### FR-C02 — Tool-boundary enforcement [MUST]
Every mock tool call must pass through a controlled adapter that evaluates the active policy before executing a side effect.

### FR-C03 — Attempted versus executed calls [MUST]
Persist calls that were attempted, rejected, or executed. The UI must not mark a rejected action as an exploit that succeeded.

### FR-C04 — Policy reason [MUST]
A rejected call must include a machine-readable policy reason, such as `RECIPIENT_NOT_ALLOWED` or `DATA_CLASS_NOT_ALLOWED`.

### FR-C05 — Permission audit [SHOULD]
Compare observed tool calls against the declared policy and flag seeded unauthorized attempts. This is an audit of the configured test surface, not proof of universal least-privilege compliance.

## 5. FR-D — Reproducible Attack Traces

### FR-D01 — Trace record [MUST]
Every run must store ordered events, test inputs, defense state, scenario version, target configuration identifier, initial-state/reset reference, and verdict.

### FR-D02 — Replay [MUST]
A user must be able to re-run a saved test case against the current selected configuration. Replay means re-executing the test, not displaying the old transcript as if it were a new run.

### FR-D03 — Version and configuration fingerprint [SHOULD]
Store app version or Git commit (if available), target configuration, policy version, and scenario version.

### FR-D04 — Repeatability statistics [SHOULD]
Allow repeated trials for a selected test and report exact outcomes with numerator and denominator. For the initial demo, 3–5 runs may be sufficient to show mechanics; this does not establish statistical generalization.

### FR-D05 — Trace completeness [MUST]
A trace completeness check must identify missing required event categories rather than silently treating an incomplete trace as complete.

## 6. FR-E — Defense Validation

### FR-E01 — Comparable A/B test [MUST]
Execute baseline and defended configurations against comparable reset state and the same known test case.

### FR-E02 — Defense enforcement [MUST]
The defense must enforce access and recipient rules at the tool boundary. A prompt saying “do not send unauthorized data” alone is insufficient.

### FR-E03 — Side-effect comparison [MUST]
Compare actual sandbox outcomes before and after defense, including whether the protected data crossed the policy boundary.

### FR-E04 — Adaptive re-attack [SHOULD]
After known-case replay, run at least one bounded attack variant against the defended configuration where time allows. Label this separately from exact replay.

### FR-E05 — Benign utility [MUST]
Run one or more legitimate tasks in both configurations and report pass/fail. A refusal-everything defense must fail utility acceptance.

### FR-E06 — Defense conclusion [MUST]
Use scoped statements, e.g., “blocked 3/3 seeded attempts under the tested scenario and budget,” not “the system is secure.”

## 7. FR-F — Security Evaluation Dashboard

### FR-F01 — Run summary [MUST]
Display run status, attempts, confirmed exploits, blocked attempts, errors, and configured budget.

### FR-F02 — Finding list [MUST]
Show title, category, severity label, status, and evidence reference for each finding.

### FR-F03 — Trace detail [MUST]
Show ordered events, tool names, relevant arguments/results, policy decisions, and side-effect evidence.

### FR-F04 — Baseline/defended comparison [MUST]
Show raw counts and percentages for attack and benign outcomes side by side.

### FR-F05 — Filters and charts [COULD]
Advanced filtering and elaborate charts are optional; do not implement them at the expense of correct evidence.

### FR-F06 — Honest state [MUST]
Display loading, completed, failed, cancelled, and partially recorded states distinctly. Never display a hardcoded successful outcome as a real run.

## 8. FR-G — Regression Testing

### FR-G01 — Saved test suite [MUST]
Maintain a small named suite containing at least one attack case and one benign case.

### FR-G02 — Rerun after change [MUST]
Run the suite after a policy/defense configuration change and compare with a baseline result.

### FR-G03 — Regression classification [MUST]
Flag at least: a previously exploitable attack that now succeeds unexpectedly; a previously passing benign task that now fails; and an execution error that makes comparison inconclusive.

### FR-G04 — New-attack search [COULD]
Searching for new vulnerabilities after a change is stronger than replaying old cases. If not implemented, state that regression coverage is replay-based and limited.

## 9. Non-functional requirements

### NFR-01 Safety [MUST]
All side effects are confined to mock services and synthetic data. The attack engine must not invoke arbitrary network requests or shell commands.

### NFR-02 Evidence integrity [MUST]
Verdicts must reference trace event IDs and side-effect evidence. UI summaries must derive from persisted backend results.

### NFR-03 Local operability [MUST]
The complete demo must run locally with documented setup. Optional LLM functionality must degrade gracefully.

### NFR-04 Performance [SHOULD]
A small deterministic assessment should complete quickly enough to perform several rehearsals. A suggested target is under 30 seconds for the canned scenario, excluding optional external model latency.

### NFR-05 Usability [MUST]
A first-time viewer should be able to identify which action was unauthorized and whether it was actually executed.

### NFR-06 Maintainability [SHOULD]
Core logic, route handlers, storage code, and UI components should be separated. Avoid a single oversized file.

### NFR-07 Privacy [MUST]
No real personal or customer data is required or permitted by the supplied demo data set.

## 10. Requirement dependency order

1. Mock tools and policy definitions.
2. Event model and exploit oracle.
3. Baseline scenario and deterministic test candidate.
4. Defense enforcement and benign task.
5. Persistence and replay.
6. API and UI integration.
7. Bounded mutation/adaptive extension.
8. Repeated trials, UI polish, presentation.

This ordering ensures the attack engine does not become a disconnected prompt generator before a ground-truth success signal exists.
