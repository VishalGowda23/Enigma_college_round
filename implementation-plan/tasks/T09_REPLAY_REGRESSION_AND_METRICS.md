# T09 — Replay, Regression, and Metrics

## 1. Objective
Implement the ability to re-execute a specific test case (Replay) and compare baseline vs. defended runs (Regression).

## 2. Requirements
- `POST /api/runs/{id}/replay`: Creates a new run based on the configuration of an old run.
- Metric Calculation: Ensure denominators are correct (exclude `ERROR` runs).
- A/B Comparison UI: Side-by-side view of Baseline vs Defended metrics.

## 3. Implementation Steps
1.  Implement `replay` endpoint. It must fetch the old run config, instantiate a new Orchestrator, reset the environment, and execute.
2.  Update `Dashboard.tsx` or create `Comparison.tsx` to fetch two run IDs and display them side-by-side.
3.  Calculate Delta: e.g., ASR went from 100% (Baseline) to 0% (Defended).

## 4. Acceptance Criteria
- [ ] Clicking "Replay" in the UI generates a new Run ID.
- [ ] The Comparison view correctly shows Baseline (Exploited) vs Defended (Blocked).

## 5. Contingency
If a dedicated replay endpoint is too complex to wire up, just instruct the user (or demo script) to click "Run New" with the exact same settings but toggle the Defense flag.
