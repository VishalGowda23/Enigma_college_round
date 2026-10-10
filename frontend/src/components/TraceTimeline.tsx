import { useState } from 'react'
import type { TraceEvent } from '../types'

interface TraceTimelineProps {
  events: TraceEvent[]
  runId: string
  highlightedEventIds?: string[]
}

export function TraceTimeline({ events, runId, highlightedEventIds = [] }: TraceTimelineProps) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  if (events.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-xs">
        No trace events recorded for run {runId}.
      </div>
    )
  }

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'TOOL_CALL_EXECUTED':
        return 'bg-red-950/80 text-red-400 border-red-800/60'
      case 'TOOL_CALL_BLOCKED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
      case 'ORACLE_VERDICT':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/60'
      case 'POLICY_EVALUATED':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60'
      case 'UNTRUSTED_CONTENT_READ':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60'
      case 'TOOL_CALL_ATTEMPTED':
        return 'bg-yellow-950/80 text-yellow-400 border-yellow-800/60'
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Chronological Event Trace
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            Run: {runId.slice(0, 12)}... ({events.length} ordered events)
          </span>
        </div>
      </div>

      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {events.map((ev) => {
          const isHighlighted = highlightedEventIds.includes(ev.id)
          const isExpanded = selectedEventId === ev.id

          return (
            <div
              key={ev.id}
              onClick={() => setSelectedEventId(isExpanded ? null : ev.id)}
              className={`p-3 rounded-lg border transition cursor-pointer text-xs font-mono ${
                isHighlighted
                  ? 'border-red-500 bg-red-950/20'
                  : 'border-slate-800/80 bg-slate-950/60 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">#{ev.sequence_number}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getEventBadge(
                      ev.event_type
                    )}`}
                  >
                    {ev.event_type}
                  </span>
                  {ev.tool_name && (
                    <span className="text-cyan-400 text-[11px] font-semibold">
                      [{ev.tool_name}]
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-[10px]">
                  {ev.timestamp.split('T')[1]?.slice(0, 8)}
                </span>
              </div>

              <p className="text-slate-300 text-[11px] mb-1 font-sans">{ev.message || ev.source}</p>

              {ev.reason_code && (
                <div className="text-[10px] text-slate-400">
                  <span className="text-slate-500">Reason:</span> {ev.reason_code}
                </div>
              )}

              {/* Collapsible raw data */}
              {isExpanded && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] space-y-1.5 bg-slate-950 p-2.5 rounded">
                  <div className="text-slate-400">
                    <span className="text-slate-500">Source:</span> {ev.source}
                  </div>
                  {ev.policy_decision && (
                    <div className="text-slate-400">
                      <span className="text-slate-500">Policy Decision:</span>{' '}
                      <strong
                        className={
                          ev.policy_decision === 'ALLOWED'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }
                      >
                        {ev.policy_decision}
                      </strong>
                    </div>
                  )}
                  {ev.arguments_json && (
                    <div>
                      <span className="text-slate-500 block mb-0.5">Arguments:</span>
                      <pre className="text-slate-300 overflow-x-auto text-[10px]">
                        {JSON.stringify(ev.arguments_json, null, 2)}
                      </pre>
                    </div>
                  )}
                  {ev.evidence_json && (
                    <div>
                      <span className="text-slate-500 block mb-0.5">Evidence State:</span>
                      <pre className="text-emerald-400 overflow-x-auto text-[10px]">
                        {JSON.stringify(ev.evidence_json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
