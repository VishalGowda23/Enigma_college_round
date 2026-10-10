import React, { useMemo } from 'react'
import type { TraceEvent } from '../../types'
import { PixelAgent, type AgentPose } from '../pixel/PixelAgent'

interface SpatialWorldProps {
  currentEvent: TraceEvent | null
  events?: TraceEvent[]
  onSelectEvent: (eventId: string) => void
  defenseEnabled?: boolean
}

export const SpatialWorld: React.FC<SpatialWorldProps> = ({
  currentEvent,
  onSelectEvent,
  defenseEnabled = false,
}) => {
  // Determine active state and agent positions based on currentEvent
  const {
    activeNode,
    hunterPose,
    operatorPose,
    sentinelPose,
    analystPose,
    activePath,
    toolBlocked,
    exploitConfirmed,
    defenseVerified,
  } = useMemo(() => {
    if (!currentEvent) {
      return {
        activeNode: null,
        hunterPose: 'idle' as AgentPose,
        operatorPose: 'idle' as AgentPose,
        sentinelPose: 'idle' as AgentPose,
        analystPose: 'idle' as AgentPose,
        activePath: null,
        toolBlocked: false,
        exploitConfirmed: false,
        defenseVerified: false,
      }
    }

    const type = currentEvent.event_type
    let node: 'source' | 'agent' | 'policy' | 'tool_lookup' | 'tool_email' | 'oracle' | null = null
    let hPose: AgentPose = 'idle'
    let oPose: AgentPose = 'idle'
    let sPose: AgentPose = 'idle'
    let aPose: AgentPose = 'idle'
    let path: string | null = null
    let blocked = false
    let exploit = false
    let defVer = false

    if (type === 'ATTEMPT_STARTED' || type === 'RUN_STARTED') {
      node = 'source'
      hPose = 'action'
      path = 'source-to-agent'
    } else if (type === 'UNTRUSTED_CONTENT_READ') {
      node = 'source'
      oPose = 'walking'
      path = 'source-to-agent'
    } else if (type === 'MODEL_INVOCATION_STARTED' || type === 'MODEL_INVOCATION_COMPLETED') {
      node = 'agent'
      oPose = 'action'
    } else if (type === 'TOOL_CALL_ATTEMPTED') {
      node = 'policy'
      oPose = 'walking'
      sPose = 'inspecting'
      path = 'agent-to-policy'
    } else if (type === 'POLICY_EVALUATED') {
      node = 'policy'
      sPose = 'inspecting'
      path = 'agent-to-policy'
    } else if (type === 'TOOL_CALL_BLOCKED') {
      node = 'policy'
      sPose = 'blocked'
      blocked = true
      path = 'blocked-at-policy'
    } else if (type === 'TOOL_CALL_EXECUTED') {
      if (currentEvent.tool_name === 'lookup_customer') {
        node = 'tool_lookup'
        oPose = 'action'
        path = 'policy-to-lookup'
      } else {
        node = 'tool_email'
        oPose = 'action'
        path = 'policy-to-email'
      }
    } else if (type === 'ORACLE_VERDICT' || type === 'STATE_VERIFIED') {
      node = 'oracle'
      aPose = 'verified'
      path = 'tool-to-oracle'
      const evidence = currentEvent.evidence_json || {}
      if (evidence.verdict === 'CONFIRMED_EXPLOIT' || currentEvent.reason_code === 'EXPLOIT_CONFIRMED_SIDE_EFFECT_PRESENT') {
        exploit = true
      } else {
        defVer = true
      }
    }

    return {
      activeNode: node,
      hunterPose: hPose,
      operatorPose: oPose,
      sentinelPose: sPose,
      analystPose: aPose,
      activePath: path,
      toolBlocked: blocked,
      exploitConfirmed: exploit,
      defenseVerified: defVer,
    }
  }, [currentEvent])

  return (
    <div className="relative w-full h-[360px] bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-6 shadow-card overflow-hidden select-none">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.25] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#76A889 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Trajectory Connecting Lines (SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Source -> Agent Sandbox */}
        <line
          x1="18%"
          y1="50%"
          x2="35%"
          y2="50%"
          stroke="#C5D5C0"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Agent -> Policy Boundary */}
        <line
          x1="35%"
          y1="50%"
          x2="52%"
          y2="50%"
          stroke="#C5D5C0"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Policy Boundary -> Lookup Customer Tool (Upper Branch) */}
        <path
          d="M 52% 50% Q 61% 32% 70% 32%"
          fill="none"
          stroke="#C5D5C0"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Policy Boundary -> Send Email Tool (Lower Branch) */}
        <path
          d="M 52% 50% Q 61% 68% 70% 68%"
          fill="none"
          stroke="#C5D5C0"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Send Email Tool -> Exploit Oracle Inspection */}
        <line
          x1="70%"
          y1="68%"
          x2="88%"
          y2="50%"
          stroke="#C5D5C0"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Dynamic Highlight Paths */}
        {activePath === 'source-to-agent' && (
          <line
            x1="18%"
            y1="50%"
            x2="35%"
            y2="50%"
            stroke="#D65C4B"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-dash"
          />
        )}
        {activePath === 'agent-to-policy' && (
          <line
            x1="35%"
            y1="50%"
            x2="52%"
            y2="50%"
            stroke="#4E8CCB"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-dash"
          />
        )}
        {activePath === 'policy-to-email' && (
          <path
            d="M 52% 50% Q 61% 68% 70% 68%"
            fill="none"
            stroke="#C94D3B"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-dash"
          />
        )}
        {activePath === 'policy-to-lookup' && (
          <path
            d="M 52% 50% Q 61% 32% 70% 32%"
            fill="none"
            stroke="#4E8CCB"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-dash"
          />
        )}
        {activePath === 'tool-to-oracle' && (
          <line
            x1="70%"
            y1="68%"
            x2="88%"
            y2="50%"
            stroke="#9270C1"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="animate-dash"
          />
        )}
      </svg>

      {/* Station Nodes Layout */}
      <div className="relative w-full h-full flex items-center justify-between px-6 z-10">
        {/* Node 1: Untrusted Content (Inbox) */}
        <div
          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
            activeNode === 'source'
              ? 'bg-[#FCE8E2] border-[#D65C4B] shadow-md scale-105'
              : 'bg-[#FFFEFA] border-[#DCE7D8]'
          }`}
          style={{ width: '130px' }}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#D65C4B] mb-1">
            Untrusted Input
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] flex items-center justify-center text-lg shadow-2xs">
            ✉
          </div>
          <span className="text-xs font-semibold text-[#202A25] mt-1 text-center truncate w-full">
            Support Inbox
          </span>
          <div className="mt-2">
            <PixelAgent role="hunter" size={32} pose={hunterPose} />
          </div>
        </div>

        {/* Node 2: Target Agent Sandbox */}
        <div
          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
            activeNode === 'agent'
              ? 'bg-[#E5F0FC] border-[#4E8CCB] shadow-md scale-105'
              : 'bg-[#FFFEFA] border-[#DCE7D8]'
          }`}
          style={{ width: '130px' }}
        >
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#4E8CCB] mb-1">
            Target Sandbox
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] flex items-center justify-center text-lg shadow-2xs">
            💻
          </div>
          <span className="text-xs font-semibold text-[#202A25] mt-1 text-center truncate w-full">
            Operator Agent
          </span>
          <div className="mt-2">
            <PixelAgent role="operator" size={32} pose={operatorPose} />
          </div>
        </div>

        {/* Node 3: Policy Boundary Gateway */}
        <div
          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
            toolBlocked
              ? 'bg-[#FCE8E2] border-[#C94D3B] shadow-md scale-105 animate-soft-pulse'
              : activeNode === 'policy'
              ? 'bg-[#E3F3E8] border-[#438A68] shadow-md scale-105'
              : 'bg-[#FFFEFA] border-[#DCE7D8]'
          }`}
          style={{ width: '140px' }}
        >
          <div
            className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
              toolBlocked ? 'text-[#C94D3B]' : 'text-[#438A68]'
            }`}
          >
            {toolBlocked ? 'Blocked Gate' : 'Policy Boundary'}
          </div>
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg shadow-2xs ${
              toolBlocked
                ? 'bg-[#C94D3B] text-white border-[#C94D3B]'
                : defenseEnabled
                ? 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]'
                : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
            }`}
          >
            {toolBlocked ? '⛔' : defenseEnabled ? '🛡' : '🔓'}
          </div>
          <span className="text-xs font-semibold text-[#202A25] mt-1 text-center truncate w-full">
            {defenseEnabled ? 'Sentinel Guard' : 'No Defense'}
          </span>
          <div className="mt-2">
            <PixelAgent role="sentinel" size={32} pose={sentinelPose} />
          </div>
        </div>

        {/* Node 4: Tools Cluster (Lookup + Email) */}
        <div className="flex flex-col gap-3" style={{ width: '140px' }}>
          {/* Tool A: Lookup Customer */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              activeNode === 'tool_lookup'
                ? 'bg-[#E5F0FC] border-[#4E8CCB] shadow-xs'
                : 'bg-[#FFFEFA] border-[#DCE7D8]'
            }`}
          >
            <span className="text-sm">🗄</span>
            <div className="text-left leading-tight truncate">
              <div className="text-[10px] text-[#66736A] font-semibold uppercase">Internal Read</div>
              <div className="text-xs font-bold text-[#202A25]">lookup_customer</div>
            </div>
          </div>

          {/* Tool B: Send Email */}
          <div
            className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${
              toolBlocked
                ? 'bg-[#FCE8E2] border-[#C94D3B] opacity-80'
                : activeNode === 'tool_email'
                ? 'bg-[#FCE8E2] border-[#C94D3B] shadow-md scale-105'
                : 'bg-[#FFFEFA] border-[#DCE7D8]'
            }`}
          >
            <span className="text-sm">📤</span>
            <div className="text-left leading-tight truncate">
              <div className="text-[10px] text-[#C94D3B] font-semibold uppercase">External Write</div>
              <div className="text-xs font-bold text-[#202A25]">send_email</div>
            </div>
          </div>
        </div>

        {/* Node 5: Independent Exploit Oracle */}
        <div
          className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
            exploitConfirmed
              ? 'bg-[#FCE8E2] border-[#C94D3B] shadow-md animate-soft-pulse'
              : defenseVerified
              ? 'bg-[#BDEBD6]/50 border-[#438A68] shadow-md'
              : activeNode === 'oracle'
              ? 'bg-[#F0E8FA] border-[#9270C1] shadow-md'
              : 'bg-[#FFFEFA] border-[#DCE7D8]'
          }`}
          style={{ width: '130px' }}
        >
          <div
            className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
              exploitConfirmed
                ? 'text-[#C94D3B]'
                : defenseVerified
                ? 'text-[#1E4D36]'
                : 'text-[#9270C1]'
            }`}
          >
            {exploitConfirmed ? 'Exploit Verified' : defenseVerified ? 'Protected' : 'Exploit Oracle'}
          </div>
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg shadow-2xs ${
              exploitConfirmed
                ? 'bg-[#C94D3B] text-white border-[#C94D3B]'
                : defenseVerified
                ? 'bg-[#438A68] text-white border-[#438A68]'
                : 'bg-[#FFFEFA] text-[#9270C1] border-[#DCE7D8]'
            }`}
          >
            {exploitConfirmed ? '🚨' : defenseVerified ? '✓' : '🔍'}
          </div>
          <span className="text-xs font-semibold text-[#202A25] mt-1 text-center truncate w-full">
            State Inspector
          </span>
          <div className="mt-2">
            <PixelAgent role="analyst" size={32} pose={analystPose} />
          </div>
        </div>
      </div>

      {/* Floating Status Bar at bottom of world */}
      <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-[#FFFEFA]/90 backdrop-blur-xs border border-[#DCE7D8] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#76A889] animate-ping" />
          <span className="text-[#66736A] font-medium">
            Active Event:{' '}
            <strong className="text-[#202A25]">
              {currentEvent ? currentEvent.event_type : 'Ready'}
            </strong>
          </span>
        </div>

        {currentEvent && (
          <button
            onClick={() => onSelectEvent(currentEvent.id)}
            className="text-[11px] font-semibold text-[#4E8CCB] hover:underline"
          >
            Inspect current event details →
          </button>
        )}
      </div>
    </div>
  )
}
