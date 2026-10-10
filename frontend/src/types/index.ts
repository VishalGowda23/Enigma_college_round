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
  | 'TOOL_CALL_ATTEMPTED'
  | 'POLICY_EVALUATED'
  | 'TOOL_CALL_EXECUTED'
  | 'TOOL_CALL_BLOCKED'
  | 'ORACLE_VERDICT'

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
  config?: Record<string, unknown>
  created_at: string
}

export interface TraceEvent {
  id: string
  run_id: string
  attempt_id: string
  sequence_number: number
  timestamp: string
  event_type: EventType
  source: string
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
