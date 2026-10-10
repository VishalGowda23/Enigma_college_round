# 09 — UI/UX Specification

## 1. UX objective

A judge or developer should understand the story of an assessment quickly: what AgentBreak tested, what action was attempted, whether it actually happened, what the defense changed, and whether legitimate work still succeeded.

The interface should prioritize the evidence timeline over decorative visualizations.

## 2. Navigation model

Primary sections:
- **Overview** — latest run and key metrics.
- **Assessments** — run history and start assessment control.
- **Findings** — confirmed findings and their evidence.
- **Regression** — attack and benign case deltas.
- **Scenario details** — what is simulated, policy, test cases, and scope limitations.

For a fast MVP, Overview, Assessment Detail, and Defense Comparison may be implemented as three pages with tabs instead of a full router-heavy application.

## 3. Screen A — Overview dashboard

### Header
- Product name and concise descriptor.
- Current mode indicator: deterministic/model-assisted.
- Backend connectivity state.

### Primary action
- `Run Assessment` button.
- Scenario selector.
- Defense state selector or explicit baseline/defended choice.
- Attempt budget selector with server maximum displayed.

### Metrics
Display counts and denominator:
- attempts completed / budget;
- confirmed exploits;
- blocked attempts;
- errors/inconclusive cases;
- benign task success.

Do not show `100% secure` or comparable global claim. Use a label such as “Results for selected test suite.”

### Recent runs
Columns: run ID, scenario, defense mode, status, confirmed exploits, created time. Clicking a row opens details.

## 4. Screen B — Assessment detail

Sections:
1. **Run metadata**: ID, scenario/version, target mode, policy version, attempt budget, state.
2. **Outcome summary**: raw counts plus derived rates.
3. **Attempt list**: candidate ID, mutation lineage, oracle outcome, time.
4. **Event timeline**: ordered event types and highlights.
5. **Findings**: title, severity rationale, evidence references.
6. **Actions**: replay, validate defense, export JSON (stretch).

The event timeline must clearly style:
- untrusted content read;
- tool call attempted;
- policy allowed/denied;
- tool call executed;
- side effect recorded;
- oracle verdict.

Visual meaning must not rely on color alone. Use icon plus text labels.

## 5. Screen C — Defense comparison

Use two comparable panels or a compact table:

| Measure | Baseline | Defended |
|---|---:|---:|
| Attack cases attempted | raw count | raw count |
| Confirmed unauthorized side effects | raw count | raw count |
| Blocked attempts | raw count | raw count |
| Execution errors | raw count | raw count |
| Benign tasks passed | raw count | raw count |
| Benign tasks failed | raw count | raw count |

Below the table, state the scope of the test: scenario name, test case IDs, repeat count, and whether adaptive variants were run.

## 6. Screen D — Finding detail

Required fields:
- Finding title and status.
- Severity label and local rationale.
- Security invariant violated.
- Untrusted source reference.
- Tool and arguments (sanitized).
- Policy decision.
- Side-effect evidence.
- Relevant event timeline.
- Tested configuration and run ID.
- Remediation suggestion.
- Replay control.

Do not show a “confirmed” badge without a direct evidence reference.

## 7. UI states

### Loading
Show operation and progress state, e.g. “Attempt 2 of 5.”

### Empty state
Explain how to run the first assessment and which built-in scenario is available.

### Completed, no exploit observed
Say “No exploit observed in this run under the selected test budget,” not “The agent is secure.”

### Confirmed exploit
Show the actual mock side-effect evidence and trace link.

### Blocked
Show the policy rule/reason and explicitly state that no prohibited side effect occurred.

### Error / inconclusive
Show the failure and make clear that it is not a successful defense outcome.

### Backend unavailable
Disable assessment controls and show backend connectivity error.

## 8. Visual direction

Recommended tone: developer tool / security operations interface. Use a neutral dark or light base, clear hierarchy, high-contrast status labels, and compact tables. Reserve strong warning styling for a confirmed policy violation; don't use warning colors for every heading or ordinary metric.

Prioritize:
- legible monospace event IDs and tool names;
- readable raw counts;
- expandable event details;
- clear baseline/defense distinction;
- consistent status vocabulary.

## 9. Accessibility and usability

- Inputs have visible labels.
- Keyboard interaction works for run controls and tabs.
- Color is never the only way to indicate state.
- Long payloads can wrap or expand without hiding evidence.
- Error messages explain what the user can do next.
- The primary action is discoverable without hunting through a menu.

## 10. UI acceptance checklist

- A user can start a run from the Overview.
- Run status updates and terminal status is visible.
- A confirmed exploit opens the evidence trace.
- Baseline and defended results are directly comparable.
- Errors are distinguishable from blocked attempts.
- All shown metrics originate from backend data.
- A saved run is re-openable after navigating away.
