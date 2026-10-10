import React, { useState } from 'react'
import {
  X,
  Copy,
  Check,
  SearchCode,
  CornerDownRight,
} from 'lucide-react'
import type { TraceEvent } from '../types'
import { PixelAgent } from './pixel/PixelAgent'

interface EventDetailsDrawerProps {
  isOpen?: boolean
  event: TraceEvent | null
  onClose: () => void
  allEvents?: TraceEvent[]
  onSelectEvent?: (eventId: string) => void
}

export const EventDetailsDrawer: React.FC<EventDetailsDrawerProps> = ({
  isOpen = false,
  event,
  onClose,
  allEvents = [],
  onSelectEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'raw'>('details')
  const [copied, setCopied] = useState(false)

  if (!isOpen || !event) return null

  // Find parent event if present
  const parentEvent = event.parent_event_id
    ? allEvents.find((e) => e.id === event.parent_event_id)
    : null

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
    hunter: { label: 'Hunter · Red Team', color: '#D65C4B', bg: '#FCE8E2' },
    operator: { label: 'Operator · Target', color: '#4E8CCB', bg: '#E5F0FC' },
    sentinel: { label: 'Sentinel · Defense', color: '#438A68', bg: '#E3F3E8' },
    analyst: { label: 'Analyst · Evidence', color: '#9270C1', bg: '#F0E8FA' },
    system: { label: 'System · Sandbox', color: '#66736A', bg: '#EEF5E9' },
  }

  const actorRole = event.actor || 'system'
  const actorMeta = roleLabels[actorRole] || roleLabels.system

  return (
    <div className="fixed inset-y-0 right-0 w-[440px] bg-[#FFFEFA] border-l border-[#DCE7D8] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#DCE7D8] bg-[#F4FAF1] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1 rounded bg-[#FFFEFA] border border-[#DCE7D8]">
            <PixelAgent role={actorRole} size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#66736A]">
                #{event.sequence_number}
              </span>
              <span className="font-semibold text-xs text-[#202A25]">{event.event_type}</span>
            </div>
            <div className="text-[11px] text-[#66736A] mt-0.5">{event.timestamp}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#66736A] hover:bg-[#DCE7D8] transition-colors cursor-pointer"
          title="Close drawer"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#DCE7D8] bg-[#FFFEFA] px-4 pt-2">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'details'
              ? 'border-[#202A25] text-[#202A25]'
              : 'border-transparent text-[#859087] hover:text-[#202A25]'
          }`}
        >
          Forensic Inspection
        </button>
        <button
          onClick={() => setActiveTab('raw')}
          className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === 'raw'
              ? 'border-[#202A25] text-[#202A25]'
              : 'border-transparent text-[#859087] hover:text-[#202A25]'
          }`}
        >
          Raw JSON Trace
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'details' ? (
          <>
            {/* Metadata Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">Actor Role</div>
                <span
                  className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border"
                  style={{
                    color: actorMeta.color,
                    backgroundColor: actorMeta.bg,
                    borderColor: `${actorMeta.color}33`,
                  }}
                >
                  {actorMeta.label}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">Causal Relation</div>
                <span className="font-mono text-[11px] font-semibold text-[#202A25]">
                  {event.relation_type || 'none'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">Execution Mode</div>
                <span className="font-semibold text-[11px] text-[#4E8CCB] uppercase">
                  {event.execution_mode || 'deterministic'}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">Source Component</div>
                <span className="font-mono text-[11px] text-[#202A25]">{event.source}</span>
              </div>
            </div>

            {/* Causal Parent Link */}
            {parentEvent && (
              <div className="p-3 rounded-lg bg-[#E5F0FC]/50 border border-[#78A2D2]/30 text-xs">
                <div className="text-[10px] uppercase font-bold text-[#4E8CCB] mb-1">
                  Causal Parent Event
                </div>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs text-[#202A25]">
                    #{parentEvent.sequence_number} · {parentEvent.event_type}
                  </div>
                  {onSelectEvent && (
                    <button
                      onClick={() => onSelectEvent(parentEvent.id)}
                      className="text-[11px] font-semibold text-[#4E8CCB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Jump to parent</span>
                      <CornerDownRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Description / Summary Message */}
            {event.message && (
              <div className="p-3 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">Event Note</div>
                <p className="text-xs text-[#202A25] leading-relaxed">{event.message}</p>
              </div>
            )}

            {/* Tool Arguments / Action Data */}
            {event.arguments_json && Object.keys(event.arguments_json).length > 0 && (
              <div className="p-3 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087] mb-1.5 flex items-center justify-between">
                  <span>Action / Tool Arguments</span>
                  {event.tool_name && (
                    <span className="font-mono px-1.5 py-0.5 rounded bg-[#EEF5E9] text-[#202A25] font-semibold text-[10px]">
                      {event.tool_name}
                    </span>
                  )}
                </div>
                <pre className="font-mono text-xs bg-[#F4FAF1] p-2.5 rounded border border-[#DCE7D8] text-[#202A25] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.arguments_json, null, 2)}
                </pre>
              </div>
            )}

            {/* Policy Enforcement Decision */}
            {event.policy_decision && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  event.policy_decision === 'ALLOWED'
                    ? 'bg-[#E3F3E8] border-[#76A889]/40 text-[#1E4D36]'
                    : 'bg-[#FCE8E2] border-[#C94D3B]/40 text-[#8F2A1E]'
                }`}
              >
                <div className="text-[10px] uppercase font-bold mb-1">
                  Policy Boundary Evaluation
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>Decision: {event.policy_decision}</span>
                  {event.reason_code && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 bg-white/70 rounded">
                      {event.reason_code}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Independent Exploit Oracle Proof */}
            {event.evidence_json && Object.keys(event.evidence_json).length > 0 && (
              <div className="p-3 rounded-lg bg-[#F0E8FA] border border-[#B99BDD]/40 text-xs">
                <div className="text-[10px] uppercase font-bold text-[#9270C1] mb-1.5 flex items-center gap-1.5">
                  <SearchCode className="w-3.5 h-3.5 text-[#9270C1]" />
                  <span>Independent State Verification Proof</span>
                </div>
                <pre className="font-mono text-xs bg-white/90 p-2.5 rounded border border-[#B99BDD]/30 text-[#202A25] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.evidence_json, null, 2)}
                </pre>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-end">
              <button
                onClick={handleCopyRaw}
                className="px-2.5 py-1 rounded bg-[#EEF5E9] hover:bg-[#DCE7D8] text-xs font-medium text-[#202A25] border border-[#DCE7D8] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#438A68]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-[#66736A]" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="font-mono text-[11px] bg-[#F4FAF1] p-3 rounded-lg border border-[#DCE7D8] text-[#202A25] overflow-x-auto leading-relaxed">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="p-3 border-t border-[#DCE7D8] bg-[#F4FAF1] flex justify-between items-center text-xs text-[#66736A]">
        <span className="font-mono text-[11px]">Event ID: {event.id.slice(0, 12)}…</span>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded bg-[#FFFEFA] border border-[#DCE7D8] text-[#202A25] hover:bg-[#EEF5E9] font-medium cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  )
}
