import React, { useMemo } from 'react'
import {
  Inbox,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Clock,
  ArrowRight,
  Lock,
  Unlock,
} from 'lucide-react'
import type { TraceEvent } from '../../types'
import { PixelAgent, type AgentPose } from '../pixel/PixelAgent'

interface SpatialWorldProps {
  currentEvent: TraceEvent | null
  events?: TraceEvent[]
  onSelectEvent: (eventId: string) => void
  defenseEnabled?: boolean
}

type SimulationNode =
  | 'source'
  | 'operator'
  | 'policy_gate'
  | 'tool_sandbox'
  | 'oracle'

export const SpatialWorld: React.FC<SpatialWorldProps> = ({
  currentEvent,
  events = [],
  onSelectEvent,
  defenseEnabled = false,
}) => {
  // Compute simulation state, active node, paths, agent poses and observable labels
  const simState = useMemo(() => {
    if (!currentEvent) {
      return {
        activeNode: null as SimulationNode | null,
        activeActor: 'system',
        hunterPose: 'idle' as AgentPose,
        operatorPose: 'idle' as AgentPose,
        sentinelPose: (defenseEnabled ? 'inspecting' : 'idle') as AgentPose,
        analystPose: 'idle' as AgentPose,
        hunterActivity: 'Patrolling attack surface',
        operatorActivity: 'Awaiting customer ticket',
        sentinelActivity: defenseEnabled ? 'Enforcing invariant INV-001' : 'Passive bypass mode',
        analystActivity: 'Monitoring environment state',
        activeStage: 0,
        toolBlocked: false,
        exploitConfirmed: false,
        defenseVerified: false,
        toolName: null as string | null,
        outboxState: '0 sent (clean)',
      }
    }

    const type = currentEvent.event_type
    const actor = currentEvent.actor || 'system'
    let node: SimulationNode | null = null
    let hPose: AgentPose = 'idle'
    let oPose: AgentPose = 'idle'
    let sPose: AgentPose = defenseEnabled ? 'inspecting' : 'idle'
    let aPose: AgentPose = 'idle'
    let stage = 0
    let blocked = false
    let exploit = false
    let defVer = false
    let hAct = 'Standing by'
    let oAct = 'Standing by'
    let sAct = defenseEnabled ? 'Invariant gate active' : 'Defense disabled'
    let aAct = 'Standing by'
    let outboxStr = '0 sent (clean)'

    if (type === 'RUN_STARTED' || type === 'ATTEMPT_STARTED') {
      node = 'source'
      stage = 1
      hPose = 'action'
      hAct = 'Injecting indirect prompt payload'
      oAct = 'Queue awaiting ticket'
    } else if (type === 'UNTRUSTED_CONTENT_READ') {
      node = 'source'
      stage = 1
      hAct = 'Payload delivered to inbox'
      oPose = 'walking'
      oAct = 'Reading ticket & parsing instructions'
    } else if (type === 'MODEL_INVOCATION_STARTED' || type === 'MODEL_INVOCATION_COMPLETED') {
      node = 'operator'
      stage = 2
      oPose = 'action'
      oAct = 'LLM reasoning & deciding tool dispatch'
      if (defenseEnabled) {
        sPose = 'inspecting'
        sAct = 'Awaiting tool call request'
      }
    } else if (type === 'TOOL_CALL_ATTEMPTED') {
      node = 'policy_gate'
      stage = 3
      oPose = 'walking'
      sPose = 'inspecting'
      oAct = `Requested: ${currentEvent.tool_name || 'tool'}`
      sAct = 'Intercepting & inspecting arguments'
    } else if (type === 'POLICY_EVALUATED') {
      node = 'policy_gate'
      stage = 3
      sPose = 'inspecting'
      sAct = `Evaluating policy: ${currentEvent.policy_decision || 'ALLOW'}`
    } else if (type === 'TOOL_CALL_BLOCKED') {
      node = 'policy_gate'
      stage = 3
      sPose = 'blocked'
      oPose = 'blocked'
      blocked = true
      sAct = `BLOCKED: ${currentEvent.reason_code || 'Policy violation'}`
      oAct = 'Tool request blocked at policy gate'
      hAct = 'Exploit payload arrested'
      outboxStr = '0 sent (clean)'
    } else if (type === 'TOOL_CALL_EXECUTED') {
      node = 'tool_sandbox'
      stage = 4
      oPose = 'action'
      if (currentEvent.tool_name === 'lookup_customer') {
        oAct = 'Reading customer database'
      } else {
        oAct = 'Exfiltrating external email'
        outboxStr = '1 email sent (exfiltrated)'
      }
      sAct = 'Tool execution permitted'
    } else if (type === 'ORACLE_VERDICT' || type === 'STATE_VERIFIED') {
      node = 'oracle'
      stage = 5
      aPose = 'verified'
      const evidence = currentEvent.evidence_json || {}
      if (
        evidence.verdict === 'CONFIRMED_EXPLOIT' ||
        currentEvent.reason_code === 'EXPLOIT_CONFIRMED_SIDE_EFFECT_PRESENT'
      ) {
        exploit = true
        aAct = 'Exploit verified: unauthorized email in outbox'
        hPose = 'verified'
        hAct = 'Exploit goal verified'
        outboxStr = '1 email sent (exfiltrated)'
      } else {
        defVer = true
        aAct = 'Defense verified: zero harmful side-effects'
        sPose = 'verified'
        sAct = 'Policy successfully protected sandbox'
        outboxStr = '0 sent (clean)'
      }
    }

    return {
      activeNode: node,
      activeActor: actor,
      hunterPose: hPose,
      operatorPose: oPose,
      sentinelPose: sPose,
      analystPose: aPose,
      hunterActivity: hAct,
      operatorActivity: oAct,
      sentinelActivity: sAct,
      analystActivity: aAct,
      activeStage: stage,
      toolBlocked: blocked,
      exploitConfirmed: exploit,
      defenseVerified: defVer,
      toolName: currentEvent.tool_name || null,
      outboxState: outboxStr,
    }
  }, [currentEvent, defenseEnabled])

  // Count metrics from trace events
  const stats = useMemo(() => {
    let blocks = 0
    let toolCalls = 0
    events.forEach((e) => {
      if (e.event_type === 'TOOL_CALL_BLOCKED') blocks++
      if (e.event_type === 'TOOL_CALL_ATTEMPTED' || e.event_type === 'TOOL_CALL_EXECUTED') toolCalls++
    })
    return { blocks, toolCalls }
  }, [events])

  return (
    <div
      className="relative w-full bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-4 sm:p-5 shadow-card select-none flex flex-col justify-between"
      role="region"
      aria-label="Spatial Security Execution Arena"
    >
      {/* Workbench Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none rounded-2xl"
        style={{
          backgroundImage: 'radial-gradient(#76A889 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Arena Top Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-[#DCE7D8]">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3F3E8] border border-[#76A889]/30 text-[11px] font-semibold text-[#1E4D36]">
            <Radio className="w-3 h-3 text-[#438A68] animate-pulse" />
            <span>Interactive Security Arena</span>
          </div>
          <span className="text-xs font-mono text-[#66736A]">
            Actor: <strong className="text-[#202A25] uppercase">{simState.activeActor}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#66736A]">Tool Attempts:</span>
            <span className="font-mono font-bold text-[#202A25]">{stats.toolCalls}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#66736A]">Intercepted:</span>
            <span className={`font-mono font-bold ${stats.blocks > 0 ? 'text-[#C94D3B]' : 'text-[#66736A]'}`}>
              {stats.blocks}
            </span>
          </div>
          <div>
            {defenseEnabled ? (
              <span className="inline-flex items-center gap-1 text-[#1E4D36] bg-[#BDEBD6]/50 px-2 py-0.5 rounded text-[11px] font-semibold border border-[#76A889]/40">
                <ShieldCheck className="w-3 h-3 text-[#438A68]" /> Sentinel Enforcing INV-001
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#859087] bg-[#EEF5E9] px-2 py-0.5 rounded text-[11px] font-semibold border border-[#DCE7D8]">
                <Shield className="w-3 h-3" /> Baseline (No Policy)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Connected Security Pipeline (Rock-Solid Horizontal Flow) */}
      <div className="relative z-10 w-full overflow-x-auto py-2">
        <div className="min-w-[840px] flex items-center justify-between gap-1.5 px-1">
          {/* STATION 1: Untrusted Input Source */}
          <div
            onClick={() => {
              const ev = events.find((e) => e.event_type === 'UNTRUSTED_CONTENT_READ' || e.event_type === 'ATTEMPT_STARTED')
              if (ev) onSelectEvent(ev.id)
            }}
            className={`w-[155px] shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
              simState.activeNode === 'source'
                ? 'bg-[#FCE8E2] border-[#D65C4B] shadow-md ring-2 ring-[#D65C4B]/20 scale-[1.02]'
                : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#B0C3AC]'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#D65C4B] mb-1">
              <span className="flex items-center gap-1"><Inbox className="w-3 h-3" /> Input</span>
              <span className="font-mono text-[9px] px-1 rounded bg-[#FFFEFA] border border-[#D65C4B]/30">01</span>
            </div>

            <div className="w-10 h-10 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] flex items-center justify-center text-[#D65C4B] shadow-2xs my-1">
              <FileText className="w-5 h-5 text-[#D65C4B]" />
            </div>

            <div className="text-xs font-bold text-[#202A25] text-center truncate w-full mt-0.5">
              Support Ticket Queue
            </div>
            <div className="text-[10px] text-[#859087] font-mono">ticket-id: #4092</div>

            {/* Hunter Sprite */}
            <div className="mt-2 flex flex-col items-center w-full">
              <PixelAgent
                role="hunter"
                size={34}
                pose={simState.hunterPose}
                showActivityDot={simState.activeNode === 'source'}
              />
              <span className="text-[9px] font-mono text-[#D65C4B] font-semibold mt-1 text-center truncate w-full">
                {simState.hunterActivity}
              </span>
            </div>
          </div>

          {/* CONNECTOR 1 -> 2 */}
          <div className="flex-1 flex flex-col items-center justify-center px-1">
            <span className="text-[9px] font-mono font-semibold text-[#859087] mb-1">Payload Ingested</span>
            <div className="w-full h-2 rounded-full bg-[#EEF5E9] border border-[#DCE7D8] overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  simState.activeStage >= 1 ? 'w-full bg-[#D65C4B]' : 'w-0'
                }`}
              />
            </div>
            <ArrowRight className={`w-3.5 h-3.5 mt-1 transition-colors ${simState.activeStage >= 1 ? 'text-[#D65C4B]' : 'text-[#C5D5C0]'}`} />
          </div>

          {/* STATION 2: Target AI Sandbox (Operator) */}
          <div
            onClick={() => {
              const ev = events.find((e) => e.event_type === 'MODEL_INVOCATION_STARTED' || e.event_type === 'MODEL_INVOCATION_COMPLETED')
              if (ev) onSelectEvent(ev.id)
            }}
            className={`w-[155px] shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
              simState.activeNode === 'operator'
                ? 'bg-[#E5F0FC] border-[#4E8CCB] shadow-md ring-2 ring-[#4E8CCB]/20 scale-[1.02]'
                : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#B0C3AC]'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#4E8CCB] mb-1">
              <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> Target</span>
              <span className="font-mono text-[9px] px-1 rounded bg-[#FFFEFA] border border-[#4E8CCB]/30">02</span>
            </div>

            <div className="w-10 h-10 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] flex items-center justify-center text-[#4E8CCB] shadow-2xs my-1">
              <Clock className="w-5 h-5 text-[#4E8CCB]" />
            </div>

            <div className="text-xs font-bold text-[#202A25] text-center truncate w-full mt-0.5">
              Autonomous Operator
            </div>
            <div className="text-[10px] text-[#66736A] font-mono">Agent Reasoning Loop</div>

            {/* Operator Sprite */}
            <div className="mt-2 flex flex-col items-center w-full">
              <PixelAgent
                role="operator"
                size={34}
                pose={simState.operatorPose}
                showActivityDot={simState.activeNode === 'operator'}
              />
              <span className="text-[9px] font-mono text-[#4E8CCB] font-semibold mt-1 text-center truncate w-full">
                {simState.operatorActivity}
              </span>
            </div>
          </div>

          {/* CONNECTOR 2 -> 3 */}
          <div className="flex-1 flex flex-col items-center justify-center px-1">
            <span className="text-[9px] font-mono font-semibold text-[#859087] mb-1">Tool Request</span>
            <div className="w-full h-2 rounded-full bg-[#EEF5E9] border border-[#DCE7D8] overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  simState.activeStage >= 2 ? 'w-full bg-[#4E8CCB]' : 'w-0'
                }`}
              />
            </div>
            <ArrowRight className={`w-3.5 h-3.5 mt-1 transition-colors ${simState.activeStage >= 2 ? 'text-[#4E8CCB]' : 'text-[#C5D5C0]'}`} />
          </div>

          {/* STATION 3: Sentinel Policy Gate */}
          <div
            onClick={() => {
              const ev = events.find((e) => e.event_type === 'POLICY_EVALUATED' || e.event_type === 'TOOL_CALL_BLOCKED')
              if (ev) onSelectEvent(ev.id)
            }}
            className={`w-[160px] shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
              simState.toolBlocked
                ? 'bg-[#FCE8E2] border-[#C94D3B] shadow-md ring-2 ring-[#C94D3B]/25 scale-[1.02]'
                : simState.activeNode === 'policy_gate'
                ? 'bg-[#E3F3E8] border-[#438A68] shadow-md ring-2 ring-[#438A68]/20 scale-[1.02]'
                : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#B0C3AC]'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider mb-1">
              <span className={`flex items-center gap-1 ${simState.toolBlocked ? 'text-[#C94D3B]' : 'text-[#1E4D36]'}`}>
                {simState.toolBlocked ? <ShieldAlert className="w-3 h-3 text-[#C94D3B]" /> : <ShieldCheck className="w-3 h-3 text-[#438A68]" />}
                <span>Gate</span>
              </span>
              <span className="font-mono text-[9px] px-1 rounded bg-[#FFFEFA] border border-[#DCE7D8]">03</span>
            </div>

            <div className={`w-10 h-10 rounded-lg bg-[#FFFEFA] border flex items-center justify-center shadow-2xs my-1 ${
              simState.toolBlocked ? 'border-[#C94D3B] text-[#C94D3B]' : 'border-[#DCE7D8] text-[#438A68]'
            }`}>
              {simState.toolBlocked ? <Lock className="w-5 h-5 text-[#C94D3B]" /> : <Unlock className="w-5 h-5 text-[#438A68]" />}
            </div>

            <div className="text-xs font-bold text-[#202A25] text-center truncate w-full mt-0.5">
              Sentinel Policy Gate
            </div>
            <div className="text-[10px] text-[#66736A] font-mono">
              {defenseEnabled ? 'INV-001 Enforced' : 'Bypass / Inactive'}
            </div>

            {/* Sentinel Sprite */}
            <div className="mt-2 flex flex-col items-center w-full">
              <PixelAgent
                role="sentinel"
                size={34}
                pose={simState.sentinelPose}
                showActivityDot={simState.activeNode === 'policy_gate'}
              />
              <span className={`text-[9px] font-mono font-semibold mt-1 text-center truncate w-full ${
                simState.toolBlocked ? 'text-[#C94D3B]' : 'text-[#1E4D36]'
              }`}>
                {simState.sentinelActivity}
              </span>
            </div>
          </div>

          {/* CONNECTOR 3 -> 4 */}
          <div className="flex-1 flex flex-col items-center justify-center px-1">
            <span className={`text-[9px] font-mono font-semibold mb-1 ${simState.toolBlocked ? 'text-[#C94D3B]' : 'text-[#859087]'}`}>
              {simState.toolBlocked ? 'Execution Blocked' : 'Authorized Tool'}
            </span>
            <div className="w-full h-2 rounded-full bg-[#EEF5E9] border border-[#DCE7D8] overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  simState.toolBlocked
                    ? 'w-1/2 bg-[#C94D3B]'
                    : simState.activeStage >= 4
                    ? 'w-full bg-[#438A68]'
                    : 'w-0'
                }`}
              />
            </div>
            <ArrowRight className={`w-3.5 h-3.5 mt-1 transition-colors ${
              simState.toolBlocked ? 'text-[#C94D3B]' : simState.activeStage >= 4 ? 'text-[#438A68]' : 'text-[#C5D5C0]'
            }`} />
          </div>

          {/* STATION 4: Tool Execution Sandbox */}
          <div
            onClick={() => {
              const ev = events.find((e) => e.event_type === 'TOOL_CALL_EXECUTED')
              if (ev) onSelectEvent(ev.id)
            }}
            className={`w-[160px] shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
              simState.activeNode === 'tool_sandbox'
                ? 'bg-[#FFFEFA] border-[#4E8CCB] shadow-md ring-2 ring-[#4E8CCB]/20 scale-[1.02]'
                : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#B0C3AC]'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#66736A] mb-1">
              <span className="flex items-center gap-1"><Database className="w-3 h-3 text-[#76A889]" /> Sandbox</span>
              <span className="font-mono text-[9px] px-1 rounded bg-[#FFFEFA] border border-[#DCE7D8]">04</span>
            </div>

            <div className="w-full space-y-1.5 my-1">
              {/* Tool 1: lookup_customer */}
              <div className="p-1.5 rounded-lg bg-[#EEF5E9] border border-[#DCE7D8] flex items-center justify-between text-[10px]">
                <span className="font-mono font-medium text-[#202A25] truncate">lookup_cust</span>
                <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-[#E3F3E8] text-[#1E4D36]">READ</span>
              </div>
              {/* Tool 2: send_email */}
              <div className={`p-1.5 rounded-lg border flex items-center justify-between text-[10px] ${
                simState.toolBlocked ? 'bg-[#FCE8E2] border-[#C94D3B]/30' : 'bg-[#FFFEFA] border-[#DCE7D8]'
              }`}>
                <span className="font-mono font-medium text-[#202A25] truncate">send_email</span>
                <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                  simState.toolBlocked ? 'bg-[#FCE8E2] text-[#C94D3B]' : 'bg-[#EEF5E9] text-[#66736A]'
                }`}>
                  OUTBOX
                </span>
              </div>
            </div>

            <div className="mt-1 text-[10px] font-mono text-[#66736A] flex items-center gap-1">
              <span>Outbox:</span>
              <strong className={simState.outboxState.includes('clean') ? 'text-[#438A68]' : 'text-[#C94D3B]'}>
                {simState.outboxState}
              </strong>
            </div>
          </div>

          {/* CONNECTOR 4 -> 5 */}
          <div className="flex-1 flex flex-col items-center justify-center px-1">
            <span className="text-[9px] font-mono font-semibold text-[#859087] mb-1">State Proof</span>
            <div className="w-full h-2 rounded-full bg-[#EEF5E9] border border-[#DCE7D8] overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  simState.activeStage >= 5 ? 'w-full bg-[#9270C1]' : 'w-0'
                }`}
              />
            </div>
            <ArrowRight className={`w-3.5 h-3.5 mt-1 transition-colors ${simState.activeStage >= 5 ? 'text-[#9270C1]' : 'text-[#C5D5C0]'}`} />
          </div>

          {/* STATION 5: Exploit Oracle & Verifier (Analyst) */}
          <div
            onClick={() => {
              const ev = events.find((e) => e.event_type === 'ORACLE_VERDICT' || e.event_type === 'STATE_VERIFIED')
              if (ev) onSelectEvent(ev.id)
            }}
            className={`w-[160px] shrink-0 p-3 rounded-xl border transition-all cursor-pointer flex flex-col items-center ${
              simState.activeNode === 'oracle'
                ? 'bg-[#F0E8FA] border-[#9270C1] shadow-md ring-2 ring-[#9270C1]/25 scale-[1.02]'
                : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#B0C3AC]'
            }`}
          >
            <div className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#9270C1] mb-1">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Oracle</span>
              <span className="font-mono text-[9px] px-1 rounded bg-[#FFFEFA] border border-[#9270C1]/30">05</span>
            </div>

            <div className="w-10 h-10 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] flex items-center justify-center text-[#9270C1] shadow-2xs my-1">
              {simState.exploitConfirmed ? (
                <AlertTriangle className="w-5 h-5 text-[#C94D3B]" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-[#9270C1]" />
              )}
            </div>

            <div className="text-xs font-bold text-[#202A25] text-center truncate w-full mt-0.5">
              Exploit Oracle
            </div>
            <div className="text-[10px] text-[#66736A] font-mono">SQLite State Proof</div>

            {/* Analyst Sprite */}
            <div className="mt-2 flex flex-col items-center w-full">
              <PixelAgent
                role="analyst"
                size={34}
                pose={simState.analystPose}
                showActivityDot={simState.activeNode === 'oracle'}
              />
              <span className={`text-[9px] font-mono font-semibold mt-1 text-center truncate w-full ${
                simState.exploitConfirmed ? 'text-[#C94D3B]' : 'text-[#9270C1]'
              }`}>
                {simState.analystActivity}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Live Causal Narrative Strip */}
      <div className="relative z-10 pt-3 mt-3 border-t border-[#DCE7D8] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#438A68]" />
          <span className="text-[#66736A]">Current Execution Event:</span>
          <strong className="font-mono text-[#202A25]">
            {currentEvent ? currentEvent.event_type : 'Awaiting Run Initiation'}
          </strong>
        </div>

        <div className="text-[11px] text-[#859087]">
          Click any station above to isolate causal provenance
        </div>
      </div>
    </div>
  )
}
