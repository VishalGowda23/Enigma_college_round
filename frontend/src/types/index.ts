export type ExecutionMode = 'live_model' | 'deterministic' | 'replay' | 'fixture'

export type ActorRole = 'hunter' | 'operator' | 'sentinel' | 'analyst' | 'system'

export type RelationType =
  | 'caused_by'
  | 'read_from'
  | 'requested_tool'
  | 'evaluated_by'
  | 'blocked_by'
  | 'executed_as'
  | 'verified_by'
  | 'fallback_to'
  | 'inferred'

export type AttemptOutcome =
  | 'CONFIRMED_EXPLOIT'
  | 'BLOCKED'
  | 'NO_EXPLOIT_OBSERVED'
  | 'ERROR'
  | 'INCONCLUSIVE'

export type EventType =
  | 'RUN_STARTED'
  | 'ENVIRONMENT_RESET'
  | 'RUN_COMPLETED'
  | 'ATTEMPT_STARTED'
  | 'ATTEMPT_FINISHED'
  | 'UNTRUSTED_CONTENT_READ'
  | 'MODEL_INVOCATION_STARTED'
  | 'MODEL_INVOCATION_COMPLETED'
  | 'MODEL_FALLBACK'
  | 'TOOL_CALL_ATTEMPTED'
  | 'POLICY_EVALUATED'
  | 'TOOL_CALL_EXECUTED'
  | 'TOOL_CALL_BLOCKED'
  | 'STATE_VERIFIED'
  | 'ORACLE_VERDICT'

export type NavigationTab =
  | 'home'
  | 'live-lab'
  | 'assessments'
  | 'scenarios'
  | 'agents'
  | 'evidence'
  | 'defense-lab'
  | 'reports'

export interface Scenario {
  id: string
  name: string
  type: 'attack' | 'benign'
  description: string
  default_budget: number
  invariant: string
}

export interface RunRecord {
  id: string
  scenario_id: string
  defense_enabled: boolean
  budget: number
  status: string
  asr: number
  attempts_count: number
  exploits_count: number
  blocks_count: number
  config_json?: string
  config?: Record<string, unknown>
  execution_mode?: ExecutionMode
  provider?: string | null
  model?: string | null
  created_at: string
}

export interface TraceEvent {
  id: string
  run_id: string
  attempt_id: string
  parent_event_id?: string | null
  sequence_number: number
  timestamp: string
  event_type: EventType
  actor?: ActorRole | null
  source: string
  relation_type?: RelationType | null
  execution_mode?: ExecutionMode
  tool_name?: string | null
  arguments_json?: Record<string, unknown> | null
  policy_decision?: string | null
  reason_code?: string | null
  evidence_json?: Record<string, unknown> | null
  message?: string | null
}

export interface Finding {
  id: string
  run_id: string
  attempt_id: string
  outcome: AttemptOutcome
  severity: string
  title: string
  description: string
  violated_invariant?: string | null
  evidence_event_ids: string[]
  evidence_records: Record<string, unknown>[]
  created_at: string
}
