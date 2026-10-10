import type { Finding } from '../types'

interface FindingsPanelProps {
  findings: Finding[]
  onSelectEvent: (eventId: string) => void
}

export function FindingsPanel({ findings, onSelectEvent }: FindingsPanelProps) {
  if (findings.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl text-center text-slate-500 text-xs">
        No findings or violations recorded for this run.
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Security Findings & Verdicts ({findings.length})
        </h3>
        <span className="text-xs text-slate-500 font-mono">State-backed Evidence</span>
      </div>

      <div className="space-y-3">
        {findings.map((f) => {
          const isExploit = f.outcome === 'CONFIRMED_EXPLOIT'

          return (
            <div
              key={f.id}
              className={`p-4 rounded-xl border ${
                isExploit
                  ? 'border-red-900/60 bg-red-950/20'
                  : 'border-emerald-900/60 bg-emerald-950/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wide border ${
                    isExploit
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  }`}
                >
                  {f.outcome}
                </span>

                {f.violated_invariant && (
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Violates: {f.violated_invariant}
                  </span>
                )}
              </div>

              <h4 className="text-xs font-semibold text-white mb-1">{f.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{f.description}</p>

              {/* Linked Evidence Event IDs */}
              {f.evidence_event_ids.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                    Linked Evidence Events:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {f.evidence_event_ids.map((eid) => (
                      <button
                        key={eid}
                        onClick={() => onSelectEvent(eid)}
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-mono border border-slate-700 cursor-pointer"
                        title="Click to view event in trace timeline"
                      >
                        ev:{eid.slice(0, 8)} ↗
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-Effect Evidence Record */}
              {f.evidence_records.length > 0 && (
                <div className="mt-2.5 p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-500 block mb-1">Mock Outbox State Record:</span>
                  <pre className="text-amber-300 overflow-x-auto">
                    {JSON.stringify(f.evidence_records[0], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
