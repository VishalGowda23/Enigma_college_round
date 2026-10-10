import React, { useState } from 'react'
import {
  ShieldCheck,
  ArrowRight,
  Clock,
  Layers,
  Lock,
} from 'lucide-react'
import type { RunRecord, TraceEvent, NavigationTab } from '../types'
import { PixelAgent, type AgentPose } from '../components/pixel/PixelAgent'

interface AgentsScreenProps {
  activeRun?: RunRecord | null
  events?: TraceEvent[]
  onNavigate?: (tab: NavigationTab) => void
  onSelectEvent?: (eventId: string) => void
}

interface AgentProfile {
  role: 'hunter' | 'operator' | 'sentinel' | 'analyst'
  name: string
  title: string
  accentColor: string
  softBg: string
  badgeText: string
  mission: string
  tools: string[]
  boundaries: string[]
  stages: { id: number; label: string; activeOn: string[] }[]
}

const AGENT_PROFILES: Record<string, AgentProfile> = {
  hunter: {
    role: 'hunter',
    name: 'Hunter',
    title: 'Red Team Attacker',
    accentColor: '#D65C4B',
    softBg: '#FCE8E2',
    badgeText: 'Red Team Mutator',
    mission: 'Synthesizes adversarial prompt injections and emergency bypasses to test agent alignment boundaries.',
    tools: ['ticket_mutator', 'injection_crafter', 'obfuscator'],
    boundaries: ['Confined to customer input queue', 'Targeting INV-001 exfiltration invariants'],
    stages: [
      { id: 1, label: 'Patrol', activeOn: ['ATTEMPT_STARTED'] },
      { id: 2, label: 'Craft Payload', activeOn: ['UNTRUSTED_CONTENT_READ'] },
      { id: 3, label: 'Evaluate Breach', activeOn: ['ATTEMPT_FINISHED', 'ORACLE_VERDICT'] },
    ],
  },
  operator: {
    role: 'operator',
    name: 'Operator',
    title: 'Target AI Agent',
    accentColor: '#4E8CCB',
    softBg: '#E5F0FC',
    badgeText: 'Target Under Test',
    mission: 'Processes customer support tickets and interacts with sandbox database and email dispatch tools.',
    tools: ['lookup_customer(id)', 'send_email(to, body)'],
    boundaries: ['Tool calls strictly routed via Sentinel gate', 'Subject to INV-001 boundary inspection'],
    stages: [
      { id: 1, label: 'Awaiting Ticket', activeOn: ['ATTEMPT_STARTED'] },
      { id: 2, label: 'Reading Input', activeOn: ['UNTRUSTED_CONTENT_READ'] },
      { id: 3, label: 'LLM Inference', activeOn: ['MODEL_INVOCATION_STARTED', 'MODEL_INVOCATION_COMPLETED'] },
      { id: 4, label: 'Tool Dispatch', activeOn: ['TOOL_CALL_ATTEMPTED', 'TOOL_CALL_EXECUTED', 'TOOL_CALL_BLOCKED'] },
    ],
  },
  sentinel: {
    role: 'sentinel',
    name: 'Sentinel',
    title: 'Policy Defense Gate',
    accentColor: '#438A68',
    softBg: '#E3F3E8',
    badgeText: 'Defense Guardrail',
    mission: 'Inspects tool parameters at the sandbox boundary to intercept unauthorized recipient exfiltration.',
    tools: ['policy_interceptor', 'domain_verifier', 'schema_validator'],
    boundaries: ['Zero false-positive on legitimate tasks', 'Deterministic zero-latency gate'],
    stages: [
      { id: 1, label: 'Monitoring Gate', activeOn: ['ATTEMPT_STARTED', 'MODEL_INVOCATION_STARTED'] },
      { id: 2, label: 'Intercepting Call', activeOn: ['TOOL_CALL_ATTEMPTED'] },
      { id: 3, label: 'Policy Decision', activeOn: ['POLICY_EVALUATED', 'TOOL_CALL_BLOCKED', 'TOOL_CALL_EXECUTED'] },
    ],
  },
  analyst: {
    role: 'analyst',
    name: 'Analyst',
    title: 'Exploit Oracle & Verifier',
    accentColor: '#9270C1',
    softBg: '#F0E8FA',
    badgeText: 'Independent Oracle',
    mission: 'Audits persistent SQLite environment records to verify whether harmful side-effects occurred.',
    tools: ['outbox_inspector', 'sqlite_state_auditor', 'dag_builder'],
    boundaries: ['Read-only observer authority', 'Issues binding ground-truth security proofs'],
    stages: [
      { id: 1, label: 'Awaiting Action', activeOn: ['ATTEMPT_STARTED', 'MODEL_INVOCATION_STARTED'] },
      { id: 2, label: 'State Audit', activeOn: ['TOOL_CALL_EXECUTED', 'TOOL_CALL_BLOCKED'] },
      { id: 3, label: 'Ground-Truth Proof', activeOn: ['ORACLE_VERDICT', 'STATE_VERIFIED'] },
    ],
  },
}

export const AgentsScreen: React.FC<AgentsScreenProps> = ({
  activeRun,
  events = [],
  onNavigate,
  onSelectEvent,
}) => {
  const [selectedAgentKey, setSelectedAgentKey] = useState<'hunter' | 'operator' | 'sentinel' | 'analyst'>('operator')
  const profile = AGENT_PROFILES[selectedAgentKey]

  // Filter events belonging to selected agent
  const agentEvents = events.filter((e) => e.actor === selectedAgentKey)
  const latestEvent = agentEvents[agentEvents.length - 1] || null

  // Determine active visual pose
  const getAgentPose = (): AgentPose => {
    if (!latestEvent) return 'idle'
    const type = latestEvent.event_type
    if (type.includes('BLOCKED')) return 'blocked'
    if (type.includes('VERDICT') || type.includes('EXECUTED')) return 'verified'
    if (type.includes('STARTED') || type.includes('READ')) return 'walking'
    if (type.includes('ATTEMPTED') || type.includes('INVOCATION')) return 'action'
    return 'idle'
  }

  // Determine current active progression stage
  const currentStageId = (() => {
    if (!latestEvent) return 1
    const match = profile.stages.find((st) => st.activeOn.includes(latestEvent.event_type))
    return match ? match.id : profile.stages.length
  })()

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Structured Header Banner */}
      <div className="bg-[#FFFEFA] px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base sm:text-lg font-bold text-[#202A25]">
            Multi-Agent Security Operations
          </h2>
          <p className="text-xs text-[#66736A]">
            Runtime roles, capabilities, and invariant boundaries across all 4 system actors
          </p>
        </div>

        {activeRun && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#859087]">Run:</span>
            <span className="font-mono font-bold text-[#202A25] bg-[#EEF5E9] px-2 py-0.5 rounded border border-[#DCE7D8]">
              {activeRun.id.slice(0, 8)}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                activeRun.defense_enabled
                  ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                  : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
              }`}
            >
              {activeRun.defense_enabled ? 'Sentinel Active' : 'Baseline'}
            </span>
          </div>
        )}
      </div>

      {/* 4 Agent Navigation Tabs (Structured & Clean) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {(Object.keys(AGENT_PROFILES) as Array<'hunter' | 'operator' | 'sentinel' | 'analyst'>).map((key) => {
          const item = AGENT_PROFILES[key]
          const isSelected = selectedAgentKey === key
          const count = events.filter((e) => e.actor === key).length
          return (
            <button
              key={key}
              onClick={() => setSelectedAgentKey(key)}
              className={`p-3 rounded-xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-[#FFFEFA] shadow-card border-[#76A889] ring-2 ring-[#76A889]/25 scale-[1.01]'
                  : 'bg-[#FFFEFA] border-[#DCE7D8] hover:bg-[#F4FAF1]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="p-1 rounded-lg border shrink-0"
                  style={{ backgroundColor: item.softBg, borderColor: `${item.accentColor}30` }}
                >
                  <PixelAgent role={key} size={32} pose={isSelected ? 'action' : 'idle'} />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-[#202A25] truncate">{item.name}</div>
                  <div className="text-[10px] text-[#66736A] truncate">{item.title}</div>
                </div>
              </div>

              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ml-1"
                style={{ backgroundColor: item.softBg, color: item.accentColor }}
              >
                {count} {count === 1 ? 'evt' : 'evts'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Structured Agent Inspector Deck (Clean 2-Column Split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column (6 cols): Identity, Role Contract & Boundaries */}
        <div className="lg:col-span-6 bg-[#FFFEFA] p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header Identity */}
            <div className="flex items-center gap-3 pb-3 border-b border-[#DCE7D8]">
              <div
                className="p-2.5 rounded-xl border shrink-0 shadow-2xs"
                style={{ backgroundColor: profile.softBg, borderColor: `${profile.accentColor}33` }}
              >
                <PixelAgent role={profile.role} size={48} pose={getAgentPose()} showActivityDot />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#202A25]">
                    {profile.name}
                  </h3>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: profile.softBg, color: profile.accentColor }}
                  >
                    {profile.badgeText}
                  </span>
                </div>
                <div className="text-xs text-[#66736A] mt-0.5 font-medium">{profile.title}</div>
              </div>
            </div>

            {/* Mission Statement */}
            <p className="text-xs text-[#66736A] leading-relaxed">
              {profile.mission}
            </p>

            {/* Structured Capabilities & Boundaries */}
            <div className="space-y-2.5 pt-1">
              <div>
                <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Sandbox Tool Permissions</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.tools.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-lg bg-[#EEF5E9] text-[#202A25] font-mono text-[11px] border border-[#DCE7D8]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider mb-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#438A68]" />
                  <span>Security Invariant Boundaries</span>
                </div>
                <div className="space-y-1">
                  {profile.boundaries.map((b) => (
                    <div
                      key={b}
                      className="flex items-center gap-1.5 text-xs text-[#202A25] bg-[#F4FAF1] px-2.5 py-1 rounded-lg border border-[#DCE7D8]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#438A68] shrink-0" />
                      <span className="truncate">{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA to Live Lab */}
          {onNavigate && (
            <div className="pt-3 border-t border-[#DCE7D8] flex items-center justify-between">
              <span className="text-[11px] text-[#859087]">Live execution sandbox ready</span>
              <button
                onClick={() => onNavigate('live-lab')}
                className="px-3 py-1.5 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>Watch in Live Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right Column (6 cols): Active State Progression & Clean Event Log */}
        <div className="lg:col-span-6 bg-[#FFFEFA] p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Header: Stage Stepper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#202A25] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#76A889]" />
                  <span>Lifecycle Progression</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3F3E8] text-[#1E4D36] font-semibold border border-[#76A889]/30">
                  Stage {currentStageId} of {profile.stages.length}
                </span>
              </div>

              {/* Linear Stepper */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {profile.stages.map((st) => {
                  const isActive = st.id === currentStageId
                  const isDone = st.id < currentStageId
                  return (
                    <div
                      key={st.id}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isActive
                          ? 'bg-[#E3F3E8] border-[#438A68] text-[#1E4D36] font-bold shadow-2xs'
                          : isDone
                          ? 'bg-[#EEF5E9] border-[#DCE7D8] text-[#66736A]'
                          : 'bg-[#FFFEFA] border-[#DCE7D8] text-[#859087]'
                      }`}
                    >
                      <div className="text-[9px] font-mono uppercase">{st.id}. Step</div>
                      <div className="text-[10px] font-semibold truncate mt-0.5">{st.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Observed Action Log */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#202A25]">Recent Trace Actions</span>
                <span className="text-[10px] text-[#859087] font-mono">{agentEvents.length} Recorded</span>
              </div>

              {agentEvents.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-center text-xs text-[#859087]">
                  No events recorded for {profile.name} in this run yet.
                </div>
              ) : (
                <div className="divide-y divide-[#DCE7D8]/60 text-xs">
                  {agentEvents.slice(-3).reverse().map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent && onSelectEvent(ev.id)}
                      className="py-2 flex items-center justify-between hover:bg-[#F4FAF1] px-1.5 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#EEF5E9] text-[#202A25] border border-[#DCE7D8]">
                            {ev.event_type}
                          </span>
                          <span className="font-mono text-[10px] text-[#859087]">
                            {ev.timestamp ? ev.timestamp.split('T')[1]?.slice(0, 8) : '00:00:00'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#66736A] truncate mt-0.5">
                          {ev.message || ev.reason_code || `${profile.name} performed ${ev.event_type}`}
                        </div>
                      </div>

                      <span className="text-[10px] font-semibold text-[#4E8CCB] shrink-0 hover:underline">
                        Inspect →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[#DCE7D8] text-[11px] text-[#859087] flex items-center justify-between">
            <span>State synchronized with SQLite Exploit Oracle</span>
            <span className="font-mono text-[#1E4D36] font-semibold">Active</span>
          </div>
        </div>
      </div>
    </div>
  )
}
