# T08 — Dashboard and Trace UI

## 1. Objective
Build the React frontend to display runs, traces, and metrics.

## 2. Requirements
- Dashboard View: List of recent runs, high-level metrics (ASR).
- Run Detail View: Configuration details, attempt list, Findings list.
- Trace Timeline View: Chronological list of events for an attempt, highlighting policy decisions and oracle verdicts.

## 3. Implementation Steps
1.  Create Axios client to call `/api/runs`.
2.  Build `Dashboard.tsx`.
3.  Build `RunDetail.tsx`.
4.  Build `EventTimeline.tsx` (Use simple Tailwind cards/lists, color-coded: Red for Exploit, Green for Blocked/Success, Gray for Info).
5.  Add a "Run Assessment" modal/form in the UI.

## 4. Acceptance Criteria
- [ ] UI successfully displays data fetched from the Backend.
- [ ] A user can click a finding and see the event trace that caused it.

## 5. Contingency
Skip complex charts/graphs entirely. Raw numbers in HTML tables are 100% acceptable for the MVP.
