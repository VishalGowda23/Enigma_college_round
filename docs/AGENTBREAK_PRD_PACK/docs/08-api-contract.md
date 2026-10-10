# 08 — API Contract

This is the proposed API contract for frontend/backend integration. Exact names may be adjusted during implementation, but the semantics and result distinctions should remain stable.

## 1. Conventions

- Base path: `/api`.
- JSON request and response bodies.
- IDs are opaque strings (UUIDs recommended).
- Timestamps are ISO 8601 UTC where practical.
- List endpoints return an `items` array and pagination may be added if needed.
- Error responses use a stable `error.code` and human-readable `error.message`.
- A run is not considered successful solely because its request returned HTTP 200; the run's own state and outcome are authoritative.

## 2. Health check

### `GET /api/health`

Response:

```json
{
  "status": "ok",
  "version": "0.1.0",
  "mode": "deterministic"
}
```

## 3. Scenario endpoints

### `GET /api/scenarios`

Returns available built-in scenarios, versions, allowed modes, and registered test counts.

Example response:

```json
{
  "items": [
    {
      "id": "support-ticket-injection",
      "name": "Support Ticket Injection",
      "version": "1.0",
      "attack_case_count": 3,
      "benign_case_count": 2
    }
  ]
}
```

## 4. Start an assessment

### `POST /api/runs`

Request:

```json
{
  "scenario_id": "support-ticket-injection",
  "scenario_version": "1.0",
  "defense_enabled": false,
  "mode": "deterministic",
  "attempt_budget": 5,
  "run_kind": "attack_assessment"
}
```

Validation:
- `scenario_id` must be registered.
- `attempt_budget` must be positive and below the server maximum.
- `mode` must be an allowed mode.
- `defense_enabled` must be explicit.
- Arbitrary tools or external target URLs are not accepted from request payloads.

Response (recommended `202 Accepted` if background execution is used):

```json
{
  "run": {
    "id": "run_123",
    "status": "QUEUED",
    "scenario_id": "support-ticket-injection",
    "defense_enabled": false,
    "attempt_budget": 5
  }
}
```

## 5. List and get runs

### `GET /api/runs?limit=20`

Returns recent runs with status, timestamps, scenario, mode, defense state, and high-level raw counts.

### `GET /api/runs/{run_id}`

Returns run configuration, lifecycle status, attempt counts, findings summary, metrics with denominators, trace completeness, and errors if any.

## 6. Events and findings

### `GET /api/runs/{run_id}/events`

Returns ordered events. Optional query parameters may include `attempt_id`, `event_type`, `after_sequence`, and `limit`.

### `GET /api/runs/{run_id}/findings`

Returns findings for a run. Each finding includes event IDs used as evidence.

### `GET /api/findings/{finding_id}`

Returns a finding with its summary, severity rationale, evidence references, trace completeness, and remediation hint.

## 7. Replay

### `POST /api/runs/{run_id}/replay`

Request:

```json
{
  "test_case_id": "attack-indirect-instruction-001",
  "defense_enabled": true,
  "attempt_budget": 1
}
```

Behavior:
- Creates a new run.
- References the source run/case.
- Resets the synthetic environment.
- Re-executes the case against the selected configuration.
- Returns the new run ID.

The endpoint must not replay by copying old events or verdicts.

## 8. Defense validation

### `POST /api/validation-runs`

Request:

```json
{
  "scenario_id": "support-ticket-injection",
  "test_case_ids": [
    "attack-indirect-instruction-001",
    "benign-authorized-response-001"
  ],
  "include_adaptive_variant": false,
  "repeat_count": 1
}
```

Behavior:
- Runs the selected cases in baseline and defended configurations from comparable initial states.
- Runs benign cases in each required configuration.
- Keeps exact replay results distinct from adaptive variant results.
- Computes metrics from completed attempts only and reports errors separately.

Response returns a validation ID and child run IDs. If this endpoint adds complexity, implement it as orchestrated client calls over `/api/runs` first; do not block the MVP on a composite endpoint.

## 9. Regression testing

### `POST /api/regression-runs`

Request:

```json
{
  "scenario_id": "support-ticket-injection",
  "test_case_ids": [
    "attack-indirect-instruction-001",
    "benign-authorized-response-001"
  ],
  "baseline_run_id": "run_baseline_123",
  "defense_enabled": true
}
```

Response contains the new run ID and per-case deltas: `IMPROVED`, `REGRESSION`, `UNCHANGED`, or `INCONCLUSIVE`.

## 10. Cancellation

### `POST /api/runs/{run_id}/cancel`

Requests cancellation. If a run is already terminal, return its current status without rewriting prior results. Cancellation must be cooperative and must not cause unsafe cleanup side effects.

## 11. Error model

Example:

```json
{
  "error": {
    "code": "ATTEMPT_BUDGET_EXCEEDED",
    "message": "The requested attempt budget exceeds the configured maximum.",
    "request_id": "req_123"
  }
}
```

Recommended codes:
- `SCENARIO_NOT_FOUND`
- `INVALID_CONFIGURATION`
- `ATTEMPT_BUDGET_EXCEEDED`
- `RUN_NOT_FOUND`
- `RUN_NOT_REPLAYABLE`
- `MODEL_PROVIDER_UNAVAILABLE`
- `TRACE_INCOMPLETE`
- `EXECUTION_FAILED`
- `CANCEL_NOT_ALLOWED`

## 12. API invariants

- Requests cannot provide arbitrary external URLs or register arbitrary tools.
- UI metrics are calculated from backend result records.
- An `ERROR` attempt must not be counted as `BLOCKED`.
- Replay creates a separate record.
- Every confirmed finding includes evidence event IDs.
- The API must report incomplete trace status explicitly.
