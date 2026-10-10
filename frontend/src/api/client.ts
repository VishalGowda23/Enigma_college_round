import type { Scenario, RunRecord, TraceEvent, Finding, ExecutionMode } from '../types'

const BASE_URL = '/api'

export async function fetchHealth(): Promise<{ status: string; mode: string }> {
  const res = await fetch(`${BASE_URL}/health`)
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`)
  return res.json()
}

export async function fetchScenarios(): Promise<Scenario[]> {
  const res = await fetch(`${BASE_URL}/scenarios`)
  if (!res.ok) throw new Error(`Failed to fetch scenarios: ${res.statusText}`)
  return res.json()
}

export async function fetchRuns(): Promise<RunRecord[]> {
  const res = await fetch(`${BASE_URL}/runs`)
  if (!res.ok) throw new Error(`Failed to fetch runs: ${res.statusText}`)
  return res.json()
}

export async function fetchRun(runId: string): Promise<RunRecord> {
  const res = await fetch(`${BASE_URL}/runs/${runId}`)
  if (!res.ok) throw new Error(`Failed to fetch run ${runId}: ${res.statusText}`)
  return res.json()
}

export async function fetchEvents(runId: string): Promise<TraceEvent[]> {
  const res = await fetch(`${BASE_URL}/runs/${runId}/events`)
  if (!res.ok) throw new Error(`Failed to fetch events for run ${runId}: ${res.statusText}`)
  return res.json()
}

export async function fetchFindings(runId: string): Promise<Finding[]> {
  const res = await fetch(`${BASE_URL}/runs/${runId}/findings`)
  if (!res.ok) throw new Error(`Failed to fetch findings for run ${runId}: ${res.statusText}`)
  return res.json()
}

export async function fetchReplayTrace(runId: string): Promise<{
  run: RunRecord
  events: TraceEvent[]
  findings: Finding[]
  replay_mode: string
}> {
  const res = await fetch(`${BASE_URL}/runs/${runId}/replay`)
  if (!res.ok) throw new Error(`Failed to fetch replay trace for ${runId}: ${res.statusText}`)
  return res.json()
}

export async function createRun(params: {
  scenario_id: string
  defense_enabled: boolean
  budget: number
  execution_mode?: ExecutionMode | string
  provider?: string | null
  model?: string | null
}): Promise<{
  run_id: string
  scenario_id: string
  defense_enabled: boolean
  budget: number
  attempts_executed: number
  exploits_confirmed: number
  blocks_recorded: number
  asr: number
  status: string
  execution_mode: string
  provider?: string | null
  model?: string | null
}> {
  const res = await fetch(`${BASE_URL}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(`Failed to start run: ${res.statusText}`)
  return res.json()
}

export async function replayRun(runId: string): Promise<{
  original_run_id: string
  new_run: { run_id: string }
}> {
  const res = await fetch(`${BASE_URL}/runs/${runId}/replay`, {
    method: 'POST',
  })
  if (!res.ok) throw new Error(`Failed to replay run ${runId}: ${res.statusText}`)
  return res.json()
}

/**
 * Connects to Server-Sent Events (SSE) to stream run execution events in real time.
 * Returns an unsubscribe / cleanup function.
 */
export function streamRunEvents(
  runId: string,
  onEvent: (event: TraceEvent) => void,
  onDone: () => void,
  onError?: (error: Event) => void,
  speedMs: number = 0,
): () => void {
  const eventSource = new EventSource(`${BASE_URL}/runs/${runId}/stream?speed_ms=${speedMs}`)

  eventSource.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data)
      onEvent(data)
    } catch (err) {
      console.warn('Failed to parse SSE payload', err)
    }
  }

  eventSource.addEventListener('done', () => {
    eventSource.close()
    onDone()
  })

  eventSource.onerror = (err) => {
    eventSource.close()
    if (onError) onError(err)
    else onDone()
  }

  return () => {
    eventSource.close()
  }
}
