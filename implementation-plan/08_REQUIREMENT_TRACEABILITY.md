# 08 — Requirement Traceability

This document proves that the MVP implementation maps directly back to the seven core requirements (A–G) mandated by the official AgentBreak problem statement.

## A. Autonomous Attack Discovery
*   **Official Requirement:** The system must iteratively discover attacks.
*   **MVP Implementation:** A bounded mutation loop (Task T04). It runs a seed candidate, evaluates the Oracle feedback, and generates deterministic variations (or LLM-assisted variations if time permits).
*   **Verification:** Trace lineage shows Parent Candidate ID -> Child Candidate ID.

## B. Multi-Stage Attack Analysis
*   **Official Requirement:** Track attacks across multiple steps (e.g., read ticket -> make decision -> call tool).
*   **MVP Implementation:** The Trace Persistence module (Task T05). Every run generates ordered events in SQLite.
*   **Verification:** The UI Finding Detail view displays the chronological event sequence proving causality.

## C. Tool and Permission Auditing
*   **Official Requirement:** Audit access controls and tools.
*   **MVP Implementation:** The Tool Boundary Adapter (Task T03). It enforces explicit recipient/data policies and emits `TOOL_CALL_BLOCKED` or `TOOL_CALL_EXECUTED` events.
*   **Verification:** The trace explicitly shows `policy_decision` and `reason_code` for every attempted mock tool execution.

## D. Reproducible Attack Traces
*   **Official Requirement:** Save and replay attack traces reliably.
*   **MVP Implementation:** Replay Endpoint (Task T09). SQLite stores all inputs, configs, and events.
*   **Verification:** Clicking "Replay" in the UI executes the exact same inputs against the current policy, creating a distinct new `run_id`.

## E. Defense Validation
*   **Official Requirement:** Test defenses and verify they block attacks while maintaining utility.
*   **MVP Implementation:** A/B Scenario comparison (Tasks T06, T07). The baseline run shows a `CONFIRMED_EXPLOIT`. The defended run shows `BLOCKED`. A Benign Support Task shows `NO_EXPLOIT_OBSERVED` (success).
*   **Verification:** Side-by-side metrics in the Dashboard Comparison view.

## F. Security Evaluation Dashboard
*   **Official Requirement:** A UI to view findings and metrics.
*   **MVP Implementation:** React/Vite Dashboard (Task T08).
*   **Verification:** Visual presentation of Run History, Findings, Attack Success Rate (ASR), and Defense Block Rate.

## G. Regression Testing
*   **Official Requirement:** Re-test after changes to catch regressions.
*   **MVP Implementation:** Regression Orchestration (Task T09).
*   **Verification:** Re-running saved cases after a policy update and displaying `SECURITY_IMPROVEMENT`, `SECURITY_REGRESSION`, or `UNCHANGED`.
