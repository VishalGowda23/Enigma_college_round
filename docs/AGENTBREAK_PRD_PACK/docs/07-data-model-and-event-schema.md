# 07 — Data Model and Event Schema

## 1. Data design objectives

- Store facts required to explain and replay a test.
- Make every event traceable to one run and attempt.
- Separate execution events from verdicts and derived metrics.
- Preserve blocked, successful, failed, and inconclusive states distinctly.
- Avoid storing unnecessary sensitive data or opaque chain-of-thought.

## 2. Main entities

### 2.1 `Scenario`

Fields:
- `id`: stable scenario identifier.
- `name`: display name.
- `version`: fixture and expected-outcome version.
- `description`: scenario summary.
- `initial_state_ref`: reference to seed fixture or reset procedure.
- `security_invariants`: named assertions to test.
- `benign_case_ids`: included utility tests.

### 2.2 `Run`

Fields:
- `id`: UUID or similarly unique identifier.
- `created_at`, `started_at`, `finished_at`.
- `status`: lifecycle state.
- `scenario_id`, `scenario_version`.
- `target_config_id` and optional configuration fingerprint.
- `policy_version`.
- `defense_enabled`.
- `mode`: deterministic or model-assisted.
- `attempt_budget`, `attempts_consumed`.
- `replay_of_run_id` or `replay_of_case_id` when relevant.
- `result_summary_json` containing derived metrics.
- `error_code` and `error_summary` when applicable.

### 2.3 `AttackAttempt`

Fields:
- `id`, `run_id`, `sequence_number`.
- `candidate_id`, `parent_candidate_id`.
- `mutation_method`.
- `input_payload` or sanitized fixture reference.
- `started_at`, `finished_at`.
- `outcome`.
- `oracle_verdict_id`.
- `error_code` if execution failed.

### 2.4 `Event`

Fields:
- `id`, `run_id`, `attempt_id`.
- `sequence_number` (monotonically increasing within run; attempt sequence may also be included).
- `timestamp`.
- `event_type`.
- `source_type` and `source_id`.
- `tool_name` where applicable.
- `arguments_json` after redaction and schema validation.
- `result_summary`.
- `policy_decision` (`ALLOWED`, `DENIED`, `NOT_APPLICABLE`).
- `reason_code`.
- `side_effect_ref` if a mock state mutation occurred.
- `evidence_json` for deterministic evidence fields.

### 2.5 `Finding`

Fields:
- `id`, `run_id`, `attempt_id`.
- `title`, `description`.
- `category`.
- `severity_label` and `severity_rationale`.
- `status`: confirmed, blocked, suspected, inconclusive, resolved-in-tested-config.
- `evidence_event_ids`.
- `security_invariant_id`.
- `remediation_hint`.
- `created_at`.

### 2.6 `TestCase`

Fields:
- `id`, `name`, `category`, `version`.
- `input_fixture_ref`.
- `expected_security_outcome`.
- `expected_benign_outcome` if applicable.
- `seed_parent_id` and tags.

### 2.7 `PolicyDecision`

May be stored as an event or a separate row. Include `policy_version`, `rule_id`, `allowed`, `reason_code`, `tool_name`, and timestamp. A separate table is not required if an event representation is sufficient.

## 3. Event vocabulary

Suggested `event_type` enum:

- `RUN_STARTED`
- `ENVIRONMENT_RESET`
- `ATTACK_CANDIDATE_SELECTED`
- `UNTRUSTED_CONTENT_READ`
- `AGENT_RESPONSE_RECEIVED`
- `TOOL_CALL_ATTEMPTED`
- `POLICY_EVALUATED`
- `TOOL_CALL_BLOCKED`
- `TOOL_CALL_EXECUTED`
- `SIDE_EFFECT_RECORDED`
- `ORACLE_VERDICT_CREATED`
- `BENIGN_TASK_STARTED`
- `BENIGN_TASK_COMPLETED`
- `ATTEMPT_FAILED`
- `RUN_COMPLETED`
- `RUN_CANCELLED`

The implementation may add events but must preserve the semantics of these core events.

## 4. Example event payload

```json
{
  "id": "evt_example_004",
  "run_id": "run_example_001",
  "attempt_id": "attempt_example_001",
  "sequence_number": 4,
  "event_type": "TOOL_CALL_BLOCKED",
  "timestamp": "2026-10-10T12:00:00Z",
  "source_type": "target_agent",
  "tool_name": "send_email",
  "arguments_json": {
    "recipient": "external@example.invalid",
    "contains_protected_data": true
  },
  "policy_decision": "DENIED",
  "reason_code": "RECIPIENT_NOT_ALLOWED",
  "side_effect_ref": null,
  "evidence_json": {
    "message_created": false
  }
}
```

Use reserved `.invalid` domains and synthetic fixture values in examples. Real email addresses are not necessary.

## 5. Exploit oracle result schema

```json
{
  "verdict_id": "verdict_example_001",
  "outcome": "CONFIRMED_EXPLOIT",
  "security_invariant_id": "INV_NO_UNAUTHORIZED_EXTERNAL_SEND",
  "evidence_event_ids": ["evt_example_007", "evt_example_008"],
  "reason_code": "UNAUTHORIZED_MESSAGE_RECORDED",
  "summary": "The mock outbox contains a message to a recipient outside the allowed list.",
  "confidence_type": "deterministic_state_check"
}
```

The `summary` must be grounded in event evidence. It must not be produced by asking the target agent whether it succeeded.

## 6. Outcome vocabulary

- `CONFIRMED_EXPLOIT`
- `BLOCKED`
- `NO_EXPLOIT_OBSERVED`
- `ERROR`
- `INCONCLUSIVE`

The run may have multiple attempts with different outcomes. A run-level status is not a replacement for attempt-level outcome records.

## 7. Trace completeness rules

A canonical attack attempt is considered trace-complete if it includes:
- initial candidate and source lineage;
- scenario and policy version;
- content-read event or explanation of why none was read;
- all tool calls attempted in the episode;
- policy decision for every mediated tool call;
- executed side effects and/or proof that no prohibited side effect occurred;
- oracle verdict and evidence IDs;
- terminal status.

If an event is missing due to instrumentation failure, mark trace incomplete. Do not infer a clean pass from the absence of a recorded event unless instrumentation coverage is known to be complete.

## 8. Storage and replay integrity

- Use foreign keys where supported.
- Keep event order stable and append-only during ordinary run execution.
- A replay creates a new run and references the original.
- Preserve the original run rather than overwriting it.
- Store fixture/version/policy identifiers and any deterministic seed that affects execution.
- Record when an exact replay cannot be guaranteed because an external model is nondeterministic or the provider/model changed.

## 9. Data minimization

- Synthetic customer records only.
- Do not persist API keys, auth headers, or raw environment variables.
- Do not require hidden chain-of-thought to reproduce an outcome.
- Redact tokens or secrets if they accidentally appear in output.
