# 16 — Acceptance Criteria and Traceability

## 1. Release acceptance checklist

### Core exploit and evidence
- [ ] Canonical scenario runs from the application interface.
- [ ] Baseline case produces a prohibited side effect in mock state.
- [ ] Oracle returns `CONFIRMED_EXPLOIT` only when evidence supports it.
- [ ] Finding references the relevant events and side-effect record.
- [ ] Event timeline identifies the untrusted source, attempted tool call, decision, and outcome.

### Defense and utility
- [ ] Tool-boundary policy runs before side-effect commit.
- [ ] Defended configuration blocks the canonical policy violation.
- [ ] The blocked call has a policy reason code.
- [ ] Denied action does not mutate protected mock state.
- [ ] At least one legitimate task passes with defense enabled.

### Traces, replay, and regression
- [ ] Run and events are persisted.
- [ ] Replay creates a new run and re-executes a case.
- [ ] Configuration/scenario information needed to understand replay is stored.
- [ ] Regression compares attack and benign results.
- [ ] Errors/inconclusive outcomes are not counted as blocks.

### Dashboard and UX
- [ ] User can start a run and open it later.
- [ ] Dashboard shows raw counts and denominators.
- [ ] Baseline and defended outcomes are directly comparable.
- [ ] Confirmed, blocked, error, and inconclusive states are visually/textually distinct.
- [ ] All values originate from backend result records.

### Safety and reliability
- [ ] No real external side effect exists in the scenario.
- [ ] Attack engine has bounded attempts.
- [ ] API key is not stored in traces or committed to Git.
- [ ] Deterministic mode can run without model provider access.
- [ ] Demo can be repeated twice consecutively.

## 2. Requirement-to-evidence traceability

| Official requirement | Minimum evidence | Verification method |
|---|---|---|
| A. Autonomous Attack Discovery | Bounded candidate process and feedback-informed mutation, or honest disclosure of seed-only testing if mutation is not completed | Inspect attempt lineage and run config; unit test budget cap |
| B. Multi-Stage Attack Analysis | Ordered, provenance-aware source-to-tool-to-effect timeline | Trace inspection and required-event test |
| C. Tool and Permission Auditing | Declared policy plus attempted/executed/denied tool records and a seeded violation | Policy integration test |
| D. Reproducible Attack Traces | Stored input/config/events/evidence and re-execution creates a new run | Replay integration test |
| E. Defense Validation | Baseline-confirmed exploit blocked by tool-boundary defense plus benign utility result | A/B scenario test |
| F. Security Evaluation Dashboard | Findings, trace, metrics, side-by-side defense comparison | End-to-end UI test |
| G. Regression Testing | Saved attack and benign cases rerun and deltas shown | Regression integration test |

## 3. Definition of done

The MVP is complete when a new user can execute the following sequence from the UI without editing the database or hardcoding result values:

1. Start baseline run.
2. Observe a confirmed unauthorized mock side effect.
3. Open the finding and inspect its trace.
4. Replay the same case with defense enabled.
5. Observe the tool-boundary block and no prohibited state mutation.
6. Run a benign case successfully.
7. View metrics and trace-linked results.
8. Re-open the saved results after refreshing the page.

## 4. Acceptance evidence to keep

- Test output for policy and oracle checks.
- One JSON trace export for baseline and defended cases, if export is implemented.
- Screenshot(s) of the evidence timeline and comparison view as backup.
- Short recording of a successful rehearsal if permitted by the event.
- README with startup steps and test command.
- Known limitations section.
