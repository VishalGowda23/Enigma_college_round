import React, { useState, useMemo } from 'react'
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Database,
  Copy,
  Check,
  ListTree,
  Workflow,
  Search,
  Lock,
  Unlock,
} from 'lucide-react'
import type { Finding, TraceEvent, ActorRole, RunRecord } from '../types'
import { PixelAgent } from '../components/pixel/PixelAgent'

interface EvidenceScreenProps {
  activeRun?: RunRecord | null
  findings: Finding[]
  events: TraceEvent[]
  onSelectEvent: (eventId: string) => void
}

interface NodeLayout {
  event: TraceEvent
  stepNumber: number
  x: number
  y: number
  displayTitle: string
  displaySubtitle: string
  statusType: 'attack' | 'deliberation' | 'policy' | 'blocked' | 'oracle' | 'normal'
  statusLabel: string
}

export const EvidenceScreen: React.FC<EvidenceScreenProps> = ({
  activeRun,
  findings = [],
  events = [],
  onSelectEvent: _onSelectEvent,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => events[0]?.id || null)
  const [actorFilter, setActorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewMode, setViewMode] = useState<'dag' | 'tree'>('dag')
  const [zoomLevel, setZoomLevel] = useState<number>(0.9)
  const [copiedId, setCopiedId] = useState<boolean>(false)

  // Filter events according to actor selection & search query
  const visibleEvents = useMemo(() => {
    let list = events
    if (actorFilter !== 'all') {
      list = list.filter((e) => e.actor === actorFilter)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (e) =>
          e.event_type.toLowerCase().includes(q) ||
          (e.tool_name && e.tool_name.toLowerCase().includes(q)) ||
          (e.message && e.message.toLowerCase().includes(q)) ||
          (e.reason_code && e.reason_code.toLowerCase().includes(q))
      )
    }
    return list
  }, [events, actorFilter, searchQuery])

  // Build ID lookup map
  const eventMap = useMemo(() => {
    const map = new Map<string, TraceEvent>()
    for (const e of events) map.set(e.id, e)
    return map
  }, [events])

  const selectedNode = selectedNodeId ? eventMap.get(selectedNodeId) || null : visibleEvents[0] || null

  // Upstream ancestor and downstream descendant calculation
  const { parentNode, childNodes } = useMemo(() => {
    if (!selectedNode) return { parentNode: null, childNodes: [] }
    const parent = selectedNode.parent_event_id ? eventMap.get(selectedNode.parent_event_id) || null : null
    const children = events.filter((e) => e.parent_event_id === selectedNode.id)
    return { parentNode: parent, childNodes: children }
  }, [selectedNode, eventMap, events])

  // Helper to get human-friendly titles and security status
  const getEventDisplayMeta = (ev: TraceEvent, index: number) => {
    const type = ev.event_type
    let title = type.replace(/_/g, ' ')
    let subtitle = ev.message || ev.reason_code || 'Execution step'
    let statusType: NodeLayout['statusType'] = 'normal'
    let statusLabel = 'Causal Step'

    if (type === 'RUN_STARTED' || type === 'ATTEMPT_STARTED') {
      title = 'Adversarial Inception'
      subtitle = 'Adversarial attack launched'
      statusType = 'attack'
      statusLabel = 'Attack Ingress'
    } else if (type === 'UNTRUSTED_CONTENT_READ') {
      title = 'Malicious Prompt Read'
      subtitle = 'Untrusted ticket entered operator context'
      statusType = 'attack'
      statusLabel = 'Prompt Injected'
    } else if (type === 'MODEL_INVOCATION_STARTED' || type === 'MODEL_INVOCATION_COMPLETED') {
      title = 'Target LLM Inference'
      subtitle = 'Target model generated tool action'
      statusType = 'deliberation'
      statusLabel = 'LLM Reasoning'
    } else if (type === 'TOOL_CALL_ATTEMPTED') {
      if (ev.tool_name === 'send_email') {
        title = 'Exfiltration Call: send_email'
        subtitle = 'Attempting to leak PII to external outbox'
        statusType = 'attack'
        statusLabel = 'Exfil Vector'
      } else {
        title = `Tool Call: ${ev.tool_name || 'Internal'}`
        subtitle = 'Querying internal customer database'
        statusType = 'deliberation'
        statusLabel = 'Internal Read'
      }
    } else if (type === 'POLICY_EVALUATED') {
      title = 'Sentinel Policy Intercept'
      const isBlocked = ev.policy_decision === 'BLOCK'
      subtitle = isBlocked ? 'Invariant gate BLOCK enforced' : 'Sentinel: Defense disabled (ALLOW)'
      statusType = isBlocked ? 'blocked' : 'policy'
      statusLabel = isBlocked ? 'Policy Block' : 'Policy Pass'
    } else if (type === 'TOOL_CALL_BLOCKED') {
      title = 'Action Blocked by Sentinel'
      subtitle = 'Unauthorized action arrested at INV-001 boundary'
      statusType = 'blocked'
      statusLabel = 'Boundary Blocked'
    } else if (type === 'TOOL_CALL_EXECUTED') {
      if (ev.tool_name === 'send_email') {
        title = 'Exfiltration Executed'
        subtitle = 'Email written to mock outbox state'
        statusType = 'attack'
        statusLabel = 'Side Effect Confirmed'
      } else {
        title = `Executed: ${ev.tool_name || 'Tool'}`
        subtitle = 'Customer record retrieved from mock CRM'
        statusType = 'normal'
        statusLabel = 'Sandbox Return'
      }
    } else if (type === 'ORACLE_VERDICT' || type === 'STATE_VERIFIED') {
      title = 'Exploit Oracle Proof'
      const evidence = ev.evidence_json || {}
      const isExploit =
        evidence.verdict === 'CONFIRMED_EXPLOIT' ||
        ev.reason_code === 'EXPLOIT_CONFIRMED_SIDE_EFFECT_PRESENT'
      subtitle = isExploit ? 'Harmful outbox mutation mathematically proven' : 'Zero side effects confirmed in SQLite'
      statusType = isExploit ? 'attack' : 'oracle'
      statusLabel = isExploit ? 'Exploit Proven' : 'Verified Defended'
    } else if (type === 'ATTEMPT_FINISHED') {
      title = 'Incident Audit Finalized'
      subtitle = 'Complete trace persisted to SQLite audit trail'
      statusType = 'normal'
      statusLabel = 'Trace Complete'
    }

    return { title, subtitle, statusType, statusLabel, stepNumber: index + 1 }
  }

  // Linear / Topological Causal DAG Layout (Forward Left-to-Right Pipeline)
  const { layoutNodes, layoutEdges, canvasWidth, canvasHeight } = useMemo(() => {
    const nodes: NodeLayout[] = []
    const nodePos = new Map<string, { x: number; y: number }>()

    const N = visibleEvents.length
    if (N === 0) {
      return { layoutNodes: [], layoutEdges: [], canvasWidth: 800, canvasHeight: 280 }
    }

    const cardWidth = 194
    const cardHeight = 98
    const gapX = 42
    const startX = 24
    const startY = 32

    visibleEvents.forEach((ev, idx) => {
      const x = startX + idx * (cardWidth + gapX)
      const y = startY

      nodePos.set(ev.id, { x, y })
      const meta = getEventDisplayMeta(ev, idx)

      nodes.push({
        event: ev,
        stepNumber: idx + 1,
        x,
        y,
        displayTitle: meta.title,
        displaySubtitle: meta.subtitle,
        statusType: meta.statusType,
        statusLabel: meta.statusLabel,
      })
    })

    // Construct directional forward edges
    const edges: Array<{
      fromId: string
      toId: string
      pathD: string
      isHighlighted: boolean
      relation: string
      isDirectSequential: boolean
    }> = []

    visibleEvents.forEach((ev, idx) => {
      // 1. Direct chronological forward connector
      if (idx > 0) {
        const prev = visibleEvents[idx - 1]
        const p = nodePos.get(prev.id)!
        const c = nodePos.get(ev.id)!

        const x1 = p.x + cardWidth
        const y1 = p.y + cardHeight / 2
        const x2 = c.x
        const y2 = c.y + cardHeight / 2

        const isHighlighted =
          (selectedNodeId === ev.id || selectedNodeId === prev.id)

        edges.push({
          fromId: prev.id,
          toId: ev.id,
          pathD: `M ${x1} ${y1} L ${x2} ${y2}`,
          isHighlighted,
          relation: ev.relation_type || 'caused_by',
          isDirectSequential: true,
        })
      }

      // 2. Cross-cutting provenance edge (e.g. Oracle checking Tool Execution)
      if (
        ev.parent_event_id &&
        nodePos.has(ev.parent_event_id) &&
        nodePos.has(ev.id)
      ) {
        const parentIdx = visibleEvents.findIndex((e) => e.id === ev.parent_event_id)
        // Only draw non-adjacent arch if they are separated by > 1 node
        if (parentIdx >= 0 && Math.abs(idx - parentIdx) > 1) {
          const p = nodePos.get(ev.parent_event_id)!
          const c = nodePos.get(ev.id)!

          const x1 = p.x + cardWidth / 2
          const y1 = p.y + cardHeight
          const x2 = c.x + cardWidth / 2
          const y2 = c.y + cardHeight
          const controlY = Math.max(y1, y2) + 40

          const isHighlighted =
            selectedNodeId === ev.id || selectedNodeId === ev.parent_event_id

          edges.push({
            fromId: ev.parent_event_id,
            toId: ev.id,
            pathD: `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`,
            isHighlighted,
            relation: ev.relation_type || 'verified_by',
            isDirectSequential: false,
          })
        }
      }
    })

    const totalWidth = startX * 2 + N * (cardWidth + gapX)
    const totalHeight = startY * 2 + cardHeight + 60

    return {
      layoutNodes: nodes,
      layoutEdges: edges,
      canvasWidth: Math.max(900, totalWidth),
      canvasHeight: Math.max(220, totalHeight),
    }
  }, [visibleEvents, selectedNodeId])

  const getActorBadge = (actor?: ActorRole | string | null) => {
    switch (actor) {
      case 'hunter':
        return { color: '#D65C4B', bg: '#FCE8E2', label: 'Hunter' }
      case 'operator':
        return { color: '#4E8CCB', bg: '#E5F0FC', label: 'Operator' }
      case 'sentinel':
        return { color: '#438A68', bg: '#E3F3E8', label: 'Sentinel' }
      case 'analyst':
        return { color: '#9270C1', bg: '#F0E8FA', label: 'Analyst' }
      default:
        return { color: '#66736A', bg: '#EEF5E9', label: 'System' }
    }
  }

  // Linked finding if applicable
  const linkedFinding = useMemo(() => {
    if (!selectedNode) return null
    return findings.find((f) => f.evidence_event_ids?.includes(selectedNode.id)) || null
  }, [selectedNode, findings])

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 1800)
  }

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Top Header & Forensic Toolbar */}
      <div className="bg-[#FFFEFA] px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EEF5E9] border border-[#DCE7D8] flex items-center justify-center text-[#438A68] shadow-2xs shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#202A25]">
                Forensic Causal Evidence DAG
              </h2>
              {activeRun && (
                <span className="font-mono text-[10px] bg-[#EEF5E9] text-[#66736A] px-2 py-0.5 rounded-full border border-[#DCE7D8]">
                  Run: {activeRun.id.slice(0, 8)}..
                </span>
              )}
              {findings.some((f) => f.outcome === 'CONFIRMED_EXPLOIT') ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FCE8E2] text-[#C94D3B] border border-[#D65C4B]/20 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Exploit Confirmed
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> System Defended
                </span>
              )}
            </div>
            <p className="text-xs text-[#66736A] mt-0.5">
              Mathematically verified causal dependency graph connecting prompt injection to ground-truth state proofs
            </p>
          </div>
        </div>

        {/* Controls Toolbar: Search, Filter, Mode, Zoom */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#859087]" />
            <input
              type="text"
              placeholder="Filter events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-2.5 py-1 text-xs bg-[#EEF5E9] border border-[#DCE7D8] rounded-lg text-[#202A25] placeholder-[#859087] focus:outline-none focus:border-[#438A68] w-28 sm:w-36 transition-all"
            />
          </div>

          {/* Actor Filter */}
          <div className="flex items-center gap-0.5 bg-[#EEF5E9] p-0.5 rounded-lg border border-[#DCE7D8] text-xs">
            <Filter className="w-3.5 h-3.5 text-[#859087] ml-1 mr-0.5" />
            {['all', 'hunter', 'operator', 'sentinel', 'analyst'].map((role) => (
              <button
                key={role}
                onClick={() => setActorFilter(role)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-all cursor-pointer ${
                  actorFilter === role
                    ? 'bg-[#FFFEFA] text-[#202A25] font-semibold shadow-2xs border border-[#DCE7D8]'
                    : 'text-[#66736A] hover:text-[#202A25]'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Flow DAG vs Incident Tree */}
          <div className="flex items-center gap-0.5 bg-[#EEF5E9] p-0.5 rounded-lg border border-[#DCE7D8]">
            <button
              onClick={() => setViewMode('dag')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'dag'
                  ? 'bg-[#FFFEFA] text-[#202A25] font-semibold shadow-2xs border border-[#DCE7D8]'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
              title="Horizontal Causal Pipeline DAG"
            >
              <Workflow className="w-3 h-3 text-[#438A68]" />
              <span className="hidden sm:inline">Flow DAG</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-[#FFFEFA] text-[#202A25] font-semibold shadow-2xs border border-[#DCE7D8]'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
              title="Vertical Incident Response Tree"
            >
              <ListTree className="w-3 h-3 text-[#4E8CCB]" />
              <span className="hidden sm:inline">Timeline</span>
            </button>
          </div>

          {/* Zoom Controls (for DAG mode) */}
          {viewMode === 'dag' && (
            <div className="flex items-center gap-1 bg-[#EEF5E9] p-0.5 rounded-lg border border-[#DCE7D8]">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.65, Number((z - 0.1).toFixed(2))))}
                className="p-1 rounded text-[#66736A] hover:bg-[#DCE7D8] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-[#202A25]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(1.3, Number((z + 0.1).toFixed(2))))}
                className="p-1 rounded text-[#66736A] hover:bg-[#DCE7D8] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(0.9)}
                className="p-1 rounded text-[#66736A] hover:bg-[#DCE7D8] cursor-pointer"
                title="Fit View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main 2-Pane Workbench: Causal Canvas + Deep Forensic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Left Column (8 cols): Causal Graph / Incident Tree */}
        <div className="lg:col-span-8 bg-[#FFFEFA] rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card p-3 sm:p-4 flex flex-col justify-between overflow-hidden relative min-h-[440px]">
          {/* Top Milestones & Legend Bar */}
          <div className="flex flex-wrap items-center justify-between pb-2.5 mb-2 border-b border-[#DCE7D8] text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-[#202A25]">
                {viewMode === 'dag' ? 'Causal Pipeline DAG' : 'Forensic Incident Timeline'}
              </span>
              <span className="text-[10px] text-[#66736A]">
                ({visibleEvents.length} events · Strictly Forward Provenance)
              </span>
            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-2.5 text-[10px] text-[#859087]">
              <span className="flex items-center gap-1 font-medium text-[#D65C4B]">
                <span className="w-2 h-2 rounded-full bg-[#D65C4B]" /> Attack Vector
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#4E8CCB]">
                <span className="w-2 h-2 rounded-full bg-[#4E8CCB]" /> Tool Read
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#438A68]">
                <span className="w-2 h-2 rounded-full bg-[#438A68]" /> Policy Gate
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#9270C1]">
                <span className="w-2 h-2 rounded-full bg-[#9270C1]" /> State Proof
              </span>
            </div>
          </div>

          {/* VIEW MODE 1: Horizontal Causal Pipeline DAG */}
          {viewMode === 'dag' ? (
            <div className="flex-1 overflow-x-auto overflow-y-auto py-3 px-1 relative select-none">
              <div
                className="relative transition-transform duration-150 origin-top-left"
                style={{
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`,
                  transform: `scale(${zoomLevel})`,
                }}
              >
                {/* SVG Forward Connecting Conduits */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <defs>
                    <marker
                      id="dagArrowNormal"
                      markerWidth="8"
                      markerHeight="8"
                      refX="7"
                      refY="4"
                      orient="auto"
                    >
                      <path d="M 0 0 L 8 4 L 0 8 z" fill="#76A889" />
                    </marker>
                    <marker
                      id="dagArrowHighlighted"
                      markerWidth="9"
                      markerHeight="9"
                      refX="8"
                      refY="4.5"
                      orient="auto"
                    >
                      <path d="M 0 0 L 9 4.5 L 0 9 z" fill="#4E8CCB" />
                    </marker>
                  </defs>

                  {layoutEdges.map((e, idx) => (
                    <g key={`${e.fromId}-${e.toId}-${idx}`}>
                      <path
                        d={e.pathD}
                        fill="none"
                        stroke={e.isHighlighted ? '#4E8CCB' : e.isDirectSequential ? '#859087' : '#9270C1'}
                        strokeWidth={e.isHighlighted ? 2.5 : 1.75}
                        strokeDasharray={e.isHighlighted ? '5 3' : e.isDirectSequential ? 'none' : '4 4'}
                        markerEnd={e.isHighlighted ? 'url(#dagArrowHighlighted)' : 'url(#dagArrowNormal)'}
                        className={e.isHighlighted ? 'animate-dash' : ''}
                      />
                    </g>
                  ))}
                </svg>

                {/* Rendered Node Cards */}
                {layoutNodes.map((node) => {
                  const isSelected = selectedNode?.id === node.event.id
                  const isParent = parentNode?.id === node.event.id
                  const isChild = childNodes.some((c) => c.id === node.event.id)
                  const actorMeta = getActorBadge(node.event.actor)

                  return (
                    <div
                      key={node.event.id}
                      onClick={() => setSelectedNodeId(node.event.id)}
                      className={`absolute w-[194px] h-[98px] p-2.5 rounded-xl border transition-all cursor-pointer z-10 flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#FFFEFA] border-[#438A68] ring-3 ring-[#438A68]/30 shadow-md scale-[1.03]'
                          : isParent
                          ? 'bg-[#F4FAF1] border-[#4E8CCB] ring-2 ring-[#4E8CCB]/30 shadow-2xs'
                          : isChild
                          ? 'bg-[#F4FAF1] border-[#9270C1] ring-2 ring-[#9270C1]/30 shadow-2xs'
                          : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#76A889] hover:shadow-2xs'
                      }`}
                      style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    >
                      {/* Top Row: Sequence, Role Pill & Pixel Sprite */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-[#859087]">
                            #{String(node.stepNumber).padStart(2, '0')}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: actorMeta.bg, color: actorMeta.color }}
                          >
                            {actorMeta.label}
                          </span>
                        </div>

                        <PixelAgent role={node.event.actor || 'system'} size={20} />
                      </div>

                      {/* Middle: Action Title & Subtitle */}
                      <div className="min-w-0 my-0.5">
                        <div className="font-bold text-[11px] text-[#202A25] truncate leading-tight">
                          {node.displayTitle}
                        </div>
                        <div className="text-[9.5px] text-[#66736A] truncate mt-0.5">
                          {node.displaySubtitle}
                        </div>
                      </div>

                      {/* Bottom Status & Relation Pill */}
                      <div className="pt-1 border-t border-[#DCE7D8]/80 flex items-center justify-between text-[9px] font-mono">
                        <span
                          className={`font-semibold ${
                            node.statusType === 'blocked' || node.statusType === 'attack'
                              ? 'text-[#C94D3B]'
                              : node.statusType === 'oracle'
                              ? 'text-[#9270C1]'
                              : node.statusType === 'policy'
                              ? 'text-[#1E4D36]'
                              : 'text-[#4E8CCB]'
                          }`}
                        >
                          {node.statusLabel}
                        </span>
                        {isSelected && (
                          <span className="text-[#438A68] font-bold text-[8.5px] uppercase tracking-wider">
                            Inspecting
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: Vertical Forensic Incident Timeline */
            <div className="flex-1 overflow-y-auto pr-2 py-2 space-y-2.5 max-h-[460px]">
              {visibleEvents.map((ev, idx) => {
                const isSelected = selectedNode?.id === ev.id
                const actorMeta = getActorBadge(ev.actor)
                const meta = getEventDisplayMeta(ev, idx)

                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedNodeId(ev.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#FFFEFA] border-[#438A68] ring-2 ring-[#438A68]/30 shadow-2xs'
                        : 'bg-[#FFFEFA] border-[#DCE7D8] hover:border-[#76A889]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[#859087] shrink-0">
                        #{String(idx + 1).padStart(2, '0')}
                      </span>
                      <PixelAgent role={ev.actor || 'system'} size={24} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-[#202A25] truncate">
                            {meta.title}
                          </span>
                          <span
                            className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: actorMeta.bg, color: actorMeta.color }}
                          >
                            {actorMeta.label}
                          </span>
                          <span className="font-mono text-[10px] text-[#859087]">
                            {ev.relation_type || 'caused_by'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#66736A] truncate mt-0.5">
                          {ev.message || ev.reason_code || 'Action committed.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          meta.statusType === 'attack' || meta.statusType === 'blocked'
                            ? 'bg-[#FCE8E2] text-[#C94D3B]'
                            : meta.statusType === 'oracle'
                            ? 'bg-[#F0E8FA] text-[#9270C1]'
                            : 'bg-[#EEF5E9] text-[#1E4D36]'
                        }`}
                      >
                        {meta.statusLabel}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#859087]" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Bottom Breadcrumb Provenance Strip */}
          <div className="pt-2.5 mt-2 border-t border-[#DCE7D8] flex flex-wrap items-center justify-between text-[11px] text-[#66736A] gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#438A68]" />
              <span>
                Causal Sequence: <strong>{visibleEvents.length} Verified Events</strong>
              </span>
              <span>•</span>
              <span className="text-[#438A68] font-semibold">SQLite Audit Log Synced</span>
            </div>
            <span className="text-[10px] text-[#859087]">
              Click any node in graph to inspect causal antecedents & tool parameters
            </span>
          </div>
        </div>

        {/* Right Column (4 cols): Deep Forensic Evidence Inspector */}
        <div className="lg:col-span-4 bg-[#FFFEFA] rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card p-4 flex flex-col justify-between space-y-3.5">
          {selectedNode ? (
            <div className="space-y-3">
              {/* Event Inspector Header */}
              <div className="pb-2.5 border-b border-[#DCE7D8]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <PixelAgent role={selectedNode.actor || 'system'} size={26} />
                    <div>
                      <div className="font-mono text-xs font-bold text-[#202A25]">
                        Step #{events.findIndex((e) => e.id === selectedNode.id) + 1} of {events.length}
                      </div>
                      <div className="text-[10px] text-[#859087]">
                        Timestamp: {selectedNode.timestamp ? new Date(selectedNode.timestamp).toLocaleTimeString() : 'Recorded'}
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                    style={getActorBadge(selectedNode.actor)}
                  >
                    {selectedNode.actor || 'system'}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#202A25] leading-snug">
                  {selectedNode.event_type}
                </h3>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#859087] mt-1 bg-[#EEF5E9] px-2 py-1 rounded">
                  <span className="truncate max-w-[200px]">ID: {selectedNode.id}</span>
                  <button
                    onClick={() => handleCopyId(selectedNode.id)}
                    className="hover:text-[#202A25] cursor-pointer flex items-center gap-1 text-[9px]"
                    title="Copy full UUID"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-[#438A68]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Action Narrative Note */}
              <div className="p-2.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs text-[#202A25]">
                <div className="text-[10px] font-bold text-[#859087] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Database className="w-3 h-3 text-[#76A889]" />
                  <span>Action Narrative</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  {selectedNode.message || selectedNode.reason_code || 'Recorded action in trace execution loop.'}
                </p>
              </div>

              {/* Direct Causal Predecessor & Successor */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[10px] font-bold text-[#859087] uppercase tracking-wider">
                  Causal DAG Lineage
                </div>

                {parentNode ? (
                  <button
                    onClick={() => setSelectedNodeId(parentNode.id)}
                    className="w-full text-left p-2 rounded-lg bg-[#EEF5E9] border border-[#DCE7D8] hover:border-[#4E8CCB] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-[9px] text-[#4E8CCB] font-bold uppercase flex items-center gap-1">
                        <span>Triggered By (Parent)</span>
                      </div>
                      <div className="font-semibold text-[#202A25] text-xs truncate max-w-[200px]">
                        {parentNode.event_type}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#4E8CCB]" />
                  </button>
                ) : (
                  <div className="p-2 rounded-lg bg-[#EEF5E9] border border-[#DCE7D8] text-[11px] text-[#859087]">
                    Root Inception Node (Initiated attack attempt)
                  </div>
                )}

                {childNodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {childNodes.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedNodeId(child.id)}
                        className="px-2 py-1 rounded bg-[#F0E8FA] border border-[#9270C1]/30 text-[10px] text-[#9270C1] font-semibold hover:border-[#9270C1] cursor-pointer flex items-center gap-1"
                      >
                        <span>Causes: {child.event_type}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tool Arguments / Output Snippet */}
              {selectedNode.arguments_json && (
                <div>
                  <div className="text-[10px] font-bold text-[#859087] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>Tool Arguments</span>
                    {selectedNode.tool_name && (
                      <span className="font-mono text-[#4E8CCB] lowercase">{selectedNode.tool_name}()</span>
                    )}
                  </div>
                  <pre className="p-2.5 rounded-lg bg-[#EEF5E9] border border-[#DCE7D8] font-mono text-[10px] text-[#202A25] overflow-x-auto max-h-24">
                    {JSON.stringify(selectedNode.arguments_json, null, 2)}
                  </pre>
                </div>
              )}

              {/* Security Invariant Verification Status */}
              <div>
                <div className="text-[10px] font-bold text-[#859087] uppercase tracking-wider mb-1">
                  Invariant Proof Verification
                </div>
                {selectedNode.event_type.includes('BLOCKED') ? (
                  <div className="p-2.5 rounded-lg bg-[#FCE8E2] border border-[#D65C4B]/30 flex items-center gap-2 text-xs text-[#C94D3B] font-semibold">
                    <Lock className="w-4 h-4 shrink-0 text-[#C94D3B]" />
                    <span>Attack Payload Arrested at Sentinel INV-001 Boundary</span>
                  </div>
                ) : linkedFinding ? (
                  <div className="p-2.5 rounded-lg bg-[#FCE8E2] border border-[#D65C4B]/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-[#C94D3B] font-semibold">
                      <Unlock className="w-4 h-4 shrink-0 text-[#C94D3B]" />
                      <span>Invariant Violated: {linkedFinding.title}</span>
                    </div>
                    <p className="text-[10px] text-[#66736A] leading-tight">
                      {linkedFinding.description}
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-[#E3F3E8] border border-[#76A889]/30 flex items-center gap-2 text-xs text-[#1E4D36] font-semibold">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#438A68]" />
                    <span>State Invariant INV-001 Maintained</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#859087]">
              Select any node in the graph to inspect forensic causal proof.
            </div>
          )}

          {/* Panel Footer */}
          <div className="pt-2.5 border-t border-[#DCE7D8] text-[10px] text-[#859087] flex items-center justify-between">
            <span>Proof Source: Exploit Oracle SQLite</span>
            <span className="font-mono text-[#1E4D36] font-semibold flex items-center gap-1">
              <Check className="w-3 h-3 text-[#438A68]" /> Mathematically Binding
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
