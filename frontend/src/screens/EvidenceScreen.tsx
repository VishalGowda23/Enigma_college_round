import React from 'react'
import type { Finding, TraceEvent } from '../types'

interface EvidenceScreenProps {
  findings: Finding[]
  events: TraceEvent[]
  onSelectEvent: (eventId: string) => void
}

export const EvidenceScreen: React.FC<EvidenceScreenProps> = ({
  findings,
  events,
  onSelectEvent,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-2xs">
        <h2 className="font-serif text-lg font-bold text-[#202A25]">Forensic Evidence Graph</h2>
        <p className="text-xs text-[#66736A]">
          Direct causal linkage between untrusted prompt injection inputs and verified side effects
        </p>
      </div>

      {findings.length === 0 ? (
        <div className="bg-[#FFFEFA] p-12 rounded-2xl border border-[#DCE7D8] text-center text-[#859087] text-xs">
          No security findings recorded for the current assessment. All invariant checks passed.
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((finding) => {
            const isExploit = finding.outcome === 'CONFIRMED_EXPLOIT'
            return (
              <div
                key={finding.id}
                className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isExploit
                          ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                          : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/30'
                      }`}
                    >
                      {finding.outcome}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#66736A]">
                      {finding.violated_invariant || 'INV-001'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#859087] font-mono">{finding.created_at}</span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202A25]">{finding.title}</h3>
                  <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
                    {finding.description}
                  </p>
                </div>

                {/* Evidence Chain Event IDs */}
                <div className="p-4 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] space-y-2">
                  <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider">
                    Causal Evidence Event Chain
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {finding.evidence_event_ids.map((id) => {
                      const matched = events.find((e) => e.id === id)
                      return (
                        <button
                          key={id}
                          onClick={() => onSelectEvent(id)}
                          className="px-2.5 py-1 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] hover:border-[#76A889] text-xs font-mono font-medium text-[#202A25] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <span className="text-[#76A889]">#</span>
                          <span>{matched ? `${matched.sequence_number} · ${matched.event_type}` : id.slice(0, 8)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Ground Truth State Proof */}
                {finding.evidence_records && finding.evidence_records.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider">
                      Ground Truth Side Effect Proof (Inspected by Oracle)
                    </div>
                    <pre className="p-3 rounded-xl bg-[#F0E8FA]/60 border border-[#B99BDD]/30 font-mono text-xs text-[#202A25] overflow-x-auto">
                      {JSON.stringify(finding.evidence_records, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
