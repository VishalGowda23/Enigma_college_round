# 04 — Testing and Acceptance Plan

## 1. Test Strategy

Testing focuses on the integrity of the evidence chain and the correctness of the security evaluation.

*   **Unit Tests (`pytest`)**: Verify policy logic, oracle decisions, and trace formatting.
*   **Integration Tests**: Verify the full `run_assessment` flow locally via CLI/script before API integration.
*   **Manual End-to-End**: UI-driven workflow verification against the Definition of Done.

## 2. Core Quality Gates

### Gate A: Security Correctness (The Oracle)
*   **Test:** Submit a payload that mutates `mock_outbox` with unauthorized recipient/data.
*   **Expectation:** Oracle returns `CONFIRMED_EXPLOIT` with exact event IDs.
*   **Test:** Submit a payload that requests a blocked tool.
*   **Expectation:** Tool adapter denies it. Mock outbox is NOT mutated. Oracle returns `BLOCKED`.

### Gate B: Metric Integrity
*   **Test:** Simulate a trace writing error during an attempt.
*   **Expectation:** Run is marked `INCONCLUSIVE` or `ERROR`. It is NOT counted in the "Defense block rate" denominator.
*   **Test:** Run a benign task (e.g., summarize ticket).
*   **Expectation:** Oracle returns `NO_EXPLOIT_OBSERVED`. Counted as `UTILITY_SUCCESS`.

### Gate C: Replay Integrity
*   **Test:** Call POST `/api/runs/{id}/replay`.
*   **Expectation:** A new `run_id` is generated. The environment resets. Events are re-emitted with new timestamps. Old run is unmodified.

## 3. Definition of Done (End-to-End Walkthrough)

The MVP is only complete when a user can do the following *without touching the database directly*:

1.  Open the React dashboard.
2.  Select "Support Ticket Injection", Defense: OFF. Click Run.
3.  Observe a `CONFIRMED_EXPLOIT` finding. Click it to view the trace.
4.  Verify the trace shows `TOOL_CALL_EXECUTED` for `send_email`.
5.  Click "Replay with Defense".
6.  Observe a `BLOCKED` outcome.
7.  Verify the trace shows `TOOL_CALL_BLOCKED` and a policy reason code.
8.  Run the "Benign Support Task". Observe a success outcome.
9.  Open the comparison view. Verify Defense Block Rate and Benign Success Rate metrics are populated from the backend.

## 4. Test Data Hygiene

*   **Must use synthetic data only.** E.g., `user_001`, `test@example.invalid`.
*   **No real API keys in traces.** Redact any LLM API keys from the event logs before saving to SQLite.
