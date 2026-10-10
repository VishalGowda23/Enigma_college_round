import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  RotateCcw,
  Plus,
  Radio,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  ArrowRight,
  Info,
} from 'lucide-react'
import type { RunRecord, TraceEvent, Finding } from '../types'
import { SpatialWorld } from '../components/world/SpatialWorld'
import { TraceTimeline } from '../components/TraceTimeline'
import { streamRunEvents } from '../api/client'
import { PixelAgent } from '../components/pixel/PixelAgent'

interface LiveLabScreenProps {
  activeRun: RunRecord | null
  events: TraceEvent[]
  findings?: Finding[]
  onSelectEvent: (eventId: string) => void
  selectedEventId: string | null
  onOpenNewAssessment: () => void
  onReplayCurrent?: () => void
  onNavigateToEvidence?: () => void
}

export const LiveLabScreen: React.FC<LiveLabScreenProps> = ({
  activeRun,
  events,
  findings: _findings,
  onSelectEvent,
  selectedEventId,
  onOpenNewAssessment,
  onReplayCurrent,
  onNavigateToEvidence,
}) => {
  const [playheadIndex, setPlayheadIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false)
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'complete' | 'error'>('idle')
  const streamCleanupRef = useRef<(() => void) | null>(null)

  // Keep playhead within bounds
  const safePlayheadIndex = events.length > 0 ? Math.min(playheadIndex, events.length - 1) : 0
  const currentEvent = events[safePlayheadIndex] || null
  const selectedEvent = events.find((e) => e.id === selectedEventId) || currentEvent

  // Auto-playhead playback interval
  useEffect(() => {
    if (!isPlaying || events.length === 0) return

    const intervalMs = Math.max(150, 900 / playbackSpeed)
    const timer = setInterval(() => {
      setPlayheadIndex((prev) => {
        if (prev < events.length - 1) {
          const next = prev + 1
          onSelectEvent(events[next].id)
          return next
        } else {
          setIsPlaying(false)
          return prev
        }
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isPlaying, events, playbackSpeed, onSelectEvent])

  // Sync playhead when selectedEventId changes from external click
  useEffect(() => {
    if (selectedEventId && events.length > 0) {
      const idx = events.findIndex((e) => e.id === selectedEventId)
      if (idx !== -1 && idx !== playheadIndex && !isPlaying) {
        setPlayheadIndex(idx)
      }
    }
  }, [selectedEventId, events, isPlaying, playheadIndex])

  const handleStepForward = () => {
    if (playheadIndex < events.length - 1) {
      const next = playheadIndex + 1
      setPlayheadIndex(next)
      onSelectEvent(events[next].id)
    }
  }

  const handleStepBackward = () => {
    if (playheadIndex > 0) {
      const prev = playheadIndex - 1
      setPlayheadIndex(prev)
      onSelectEvent(events[prev].id)
    }
  }

  const handleTogglePlay = () => {
    if (!isPlaying && playheadIndex >= events.length - 1) {
      setPlayheadIndex(0)
      if (events[0]) onSelectEvent(events[0].id)
    }
    setIsPlaying(!isPlaying)
  }

  // Live SSE streaming handler
  const handleToggleStream = useCallback(() => {
    if (isLiveStreaming) {
      if (streamCleanupRef.current) {
        streamCleanupRef.current()
        streamCleanupRef.current = null
      }
      setIsLiveStreaming(false)
      setStreamStatus('idle')
      return
    }

    if (!activeRun) return

    setIsLiveStreaming(true)
    setStreamStatus('streaming')
    setIsPlaying(false)
    setPlayheadIndex(0)

    try {
      const cleanup = streamRunEvents(
        activeRun.id,
        (incomingEvent) => {
          // Point playhead at the incoming event
          onSelectEvent(incomingEvent.id)
          const idx = events.findIndex((e) => e.id === incomingEvent.id)
          if (idx !== -1) setPlayheadIndex(idx)
        },
        () => {
          setStreamStatus('complete')
          setIsLiveStreaming(false)
        },
        () => {
          setStreamStatus('error')
          setIsLiveStreaming(false)
        },
        500,
      )
      streamCleanupRef.current = cleanup
    } catch {
      setStreamStatus('error')
      setIsLiveStreaming(false)
    }
  }, [activeRun, isLiveStreaming, events, onSelectEvent])

  useEffect(() => {
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current()
      }
    }
  }, [])

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Laboratory Status & Control Deck */}
      {activeRun ? (
        <div className="bg-[#FFFEFA] p-3.5 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-wrap items-center justify-between gap-3">
          {/* Left Metadata Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="text-[9px] uppercase font-bold text-[#859087] tracking-wider">
                Scenario Under Test
              </div>
              <div className="font-serif text-sm font-bold text-[#202A25]">
                {activeRun.scenario_id}
              </div>
            </div>

            <div className="h-6 w-px bg-[#DCE7D8]" />

            <div>
              <div className="text-[9px] uppercase font-bold text-[#859087] tracking-wider">
                Defense Policy
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border ${
                  activeRun.defense_enabled
                    ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                    : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                }`}
              >
                {activeRun.defense_enabled ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-[#438A68]" /> Sentinel Active
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-3 h-3 text-[#C94D3B]" /> Baseline (No Policy)
                  </>
                )}
              </span>
            </div>

            <div className="h-6 w-px bg-[#DCE7D8]" />

            <div>
              <div className="text-[9px] uppercase font-bold text-[#859087] tracking-wider">
                Execution Model
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[#4E8CCB]">
                <Cpu className="w-3.5 h-3.5" />
                <span>{activeRun.model || 'gemini-3.6-flash'}</span>
                <span className="text-[10px] text-[#859087] font-normal">
                  ({activeRun.provider || 'gemini'})
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-[#DCE7D8]" />

            <div>
              <div className="text-[9px] uppercase font-bold text-[#859087] tracking-wider">
                Attack Budget
              </div>
              <div className="font-mono text-xs font-bold text-[#202A25]">
                {activeRun.attempts_count || 1} / {activeRun.budget || 1} attempt
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Stream Mode Toggle */}
            <button
              onClick={handleToggleStream}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                isLiveStreaming
                  ? 'bg-[#C94D3B] text-white border-[#C94D3B]'
                  : streamStatus === 'streaming'
                  ? 'bg-[#E5F0FC] text-[#4E8CCB] border-[#4E8CCB]/30'
                  : 'bg-[#FFFEFA] text-[#202A25] border-[#DCE7D8] hover:bg-[#F4FAF1]'
              }`}
              title="Stream run events from live backend SSE"
            >
              <Radio
                className={`w-3.5 h-3.5 ${
                  isLiveStreaming ? 'animate-pulse text-white' : 'text-[#76A889]'
                }`}
              />
              <span>{isLiveStreaming ? 'Stop SSE Stream' : 'Live SSE Stream'}</span>
            </button>

            {onReplayCurrent && (
              <button
                onClick={onReplayCurrent}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FFFEFA] text-[#202A25] border border-[#DCE7D8] hover:bg-[#F4FAF1] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Re-execute this scenario"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#66736A]" />
                <span>Replay</span>
              </button>
            )}

            <button
              onClick={onOpenNewAssessment}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#202A25] text-white hover:bg-[#34443C] flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] text-center space-y-2">
          <p className="text-sm text-[#66736A]">No assessment loaded yet.</p>
          <button
            onClick={onOpenNewAssessment}
            className="px-4 py-2 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] cursor-pointer"
          >
            Start Your First Assessment →
          </button>
        </div>
      )}

      {/* Signature Experience: Spatial Execution Arena */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-sm font-bold text-[#202A25]">
              Spatial Security Arena
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E3F3E8] text-[#1E4D36] font-semibold">
              Live Path Tracing
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#859087]">
            <span className="font-mono">
              Step {playheadIndex + 1} of {events.length || 1}
            </span>
            {isLiveStreaming && (
              <span className="flex items-center gap-1 text-[11px] text-[#438A68] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#438A68] animate-ping" /> Live SSE
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto w-full pb-1">
          <div className="min-w-[680px] lg:min-w-0">
            <SpatialWorld
              currentEvent={currentEvent}
              events={events}
              onSelectEvent={onSelectEvent}
              defenseEnabled={activeRun?.defense_enabled}
            />
          </div>
        </div>
      </div>

      {/* Split-Pane Forensic Workbench: Timeline + Event Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 min-h-[360px] lg:h-[360px]">
        {/* Left Column (7 cols): Event Timeline with Controls */}
        <div className="lg:col-span-7 h-full flex flex-col">
          <TraceTimeline
            events={events}
            selectedEventId={selectedEventId}
            onSelectEvent={(id) => {
              onSelectEvent(id)
              const idx = events.findIndex((e) => e.id === id)
              if (idx !== -1) setPlayheadIndex(idx)
            }}
            currentIndex={safePlayheadIndex}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            speed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
          />
        </div>

        {/* Right Column (5 cols): Integrated Event & Evidence Inspector */}
        <div className="lg:col-span-5 h-full bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] shadow-card p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE7D8]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#76A889]" />
              <h3 className="font-serif text-sm font-bold text-[#202A25]">
                Step Inspector & Evidence
              </h3>
            </div>
            {selectedEvent && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F4FAF1] border border-[#DCE7D8] text-[#66736A]">
                #{selectedEvent.sequence_number}
              </span>
            )}
          </div>

          {selectedEvent ? (
            <div className="flex-1 overflow-y-auto py-2.5 space-y-3 pr-1 text-xs">
              {/* Event Header & Actor */}
              <div className="p-2.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PixelAgent role={selectedEvent.actor || 'system'} size={24} />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#859087]">
                      {selectedEvent.actor || 'system'}
                    </div>
                    <div className="font-bold text-[#202A25] font-mono text-[11px]">
                      {selectedEvent.event_type}
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    selectedEvent.policy_decision === 'BLOCK' || selectedEvent.event_type === 'TOOL_CALL_BLOCKED'
                      ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/40'
                      : selectedEvent.event_type === 'ORACLE_VERDICT'
                      ? selectedEvent.reason_code === 'EXPLOIT_CONFIRMED_SIDE_EFFECT_PRESENT'
                        ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/40'
                        : 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/40'
                      : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                  }`}
                >
                  {selectedEvent.policy_decision || selectedEvent.event_type}
                </span>
              </div>

              {/* Message / Description */}
              {selectedEvent.message && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">
                    Event Description
                  </div>
                  <p className="text-[11px] text-[#202A25] bg-[#FFFEFA] p-2 rounded-lg border border-[#DCE7D8]">
                    {selectedEvent.message}
                  </p>
                </div>
              )}

              {/* Tool Parameters if applicable */}
              {selectedEvent.tool_name && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#859087] mb-1 flex items-center justify-between">
                    <span>Tool Arguments</span>
                    <span className="font-mono text-[#4E8CCB] font-semibold">
                      {selectedEvent.tool_name}
                    </span>
                  </div>
                  <pre className="p-2 rounded-lg bg-[#202A25] text-[#DCE7D8] font-mono text-[10px] overflow-x-auto max-h-24">
                    {JSON.stringify(selectedEvent.arguments_json || {}, null, 2)}
                  </pre>
                </div>
              )}

              {/* Policy Evaluation Details */}
              {selectedEvent.reason_code && (
                <div className="p-2 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8]">
                  <div className="text-[10px] uppercase font-bold text-[#859087]">
                    Policy Reason Code
                  </div>
                  <div className="font-mono text-[11px] font-bold text-[#202A25] mt-0.5">
                    {selectedEvent.reason_code}
                  </div>
                </div>
              )}

              {/* Forensic Evidence JSON if Oracle Verdict */}
              {selectedEvent.evidence_json && Object.keys(selectedEvent.evidence_json).length > 0 && (
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#859087] mb-1">
                    Oracle Forensic State Proof
                  </div>
                  <pre className="p-2 rounded-lg bg-[#EEF5E9] border border-[#DCE7D8] font-mono text-[10px] text-[#202A25] overflow-x-auto max-h-24">
                    {JSON.stringify(selectedEvent.evidence_json, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-[#859087]">
              <Info className="w-6 h-6 mb-1 text-[#859087]/50" />
              <p className="text-xs">Select any step in the timeline to inspect forensic proof.</p>
            </div>
          )}

          {/* Footer Action to Jump to Causal DAG */}
          <div className="pt-2 border-t border-[#DCE7D8] flex items-center justify-between">
            <span className="text-[10px] text-[#859087] font-mono">
              Trace ID: {activeRun?.id.slice(0, 12)}...
            </span>
            {onNavigateToEvidence && (
              <button
                onClick={onNavigateToEvidence}
                className="text-[11px] font-bold text-[#76A889] hover:text-[#5E8C70] flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Causal Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
