# 14 — Test and Quality Plan

## 1. Testing strategy

Testing is organized around the evidence chain, not just endpoint availability:

- Unit tests for policy, tool adapter, outcome oracle, metrics, and candidate mutation.
- Integration tests for a full attempt through target, tools, oracle, and SQLite.
- API tests for run lifecycle and result retrieval.
- Frontend checks for loading/error/results states.
- End-to-end acceptance of the baseline → defense → benign utility → replay flow.

## 2. Unit test catalogue

### Policy tests
- Allowed recipient and allowed data combination is accepted.
- Unauthorized recipient is denied.
- Protected data to unauthorized recipient is denied.
- Invalid tool arguments are rejected.
- Denied action does not mutate the outbox.
- A rejected tool call creates an auditable policy event.

### Oracle tests
- An unauthorized outbox message yields `CONFIRMED_EXPLOIT`.
- A denied call with no side effect yields `BLOCKED`.
- Completed execution with no violation yields `NO_EXPLOIT_OBSERVED`.
- Incomplete tool logs yield `INCONCLUSIVE` or `ERROR`, not `BLOCKED`.
- The target agent's textual claim does not override tool/state evidence.

### Trace tests
- Event sequence numbers increase.
- Every event belongs to a valid run/attempt.
- Finding evidence IDs resolve.
- Trace completeness is false when a required event is missing.
- Replay creates a new run ID and preserves a link to source run/case.

### Metric tests
- Denominator excludes errors/inconclusive outcomes but reports them separately.
- Defense block rate cannot count a non-exploitable baseline case as a successful block of a confirmed exploit.
- Benign pass/fail counts are correct.
- Rates handle zero denominator without division errors.

### Attack engine tests
- Candidate selection respects attempt budget.
- Mutation child points to parent candidate.
- Static seeds are not labelled adaptive.
- Optional model failure falls back or errors explicitly.

## 3. Integration tests

1. Run canonical baseline case; verify outbox side effect, trace events, finding, and run metrics.
2. Reset state, run the same case with defense; verify no forbidden outbox entry and block event.
3. Run a benign task with defense; verify expected successful task outcome.
4. Run replay endpoint; verify new run and new events exist.
5. Run regression suite; verify deltas are calculated from case results.
6. Simulate model timeout; verify the run does not become a false security success.
7. Simulate trace write failure if feasible; verify run is incomplete or failed rather than marked reproducible.

## 4. End-to-end manual test

Using the UI:
1. Start baseline assessment.
2. Open the result and identify confirmed side-effect evidence.
3. Open the trace timeline.
4. Run defense validation.
5. Confirm prohibited side effect is blocked.
6. Run benign case and confirm success.
7. Open comparison page and verify counts match trace records.
8. Replay a case and verify new run record.
9. Refresh the browser and confirm persisted history remains.

## 5. Failure-injection checks

At least test:
- unavailable model provider;
- invalid scenario ID;
- attempt budget over maximum;
- unknown run ID;
- cancelled run;
- duplicate request or double-click start;
- tool argument schema violation;
- incomplete trace.

The response must be explicit and safe; it must not silently substitute a successful outcome.

## 6. Test data hygiene

Use synthetic customer IDs and fictional records. Use `.invalid` sample domains. Do not use real customer tickets, personal details, credentials, or actual outbound destinations.

## 7. Quality gates

### Gate A — Security correctness
No prohibited state mutation occurs in defended mode for the canonical case.

### Gate B — Measurement correctness
Oracle verdict matches actual mock service state in all oracle unit tests.

### Gate C — Utility
At least one allowed task succeeds with defense enabled.

### Gate D — Evidence
Every confirmed finding has event IDs and side-effect evidence.

### Gate E — Demo reliability
End-to-end flow succeeds at least twice consecutively using the chosen demo mode.

## 8. What not to test/claim

This plan does not establish security against arbitrary real-world agents. It demonstrates correctness for the implemented synthetic scenario and test suite. Report the scope and known limitations explicitly.
