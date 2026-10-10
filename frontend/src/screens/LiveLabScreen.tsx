import React, { useState, useEffect } from 'react'
import type { RunRecord, TraceEvent, Finding } from '../types'
import { SpatialWorld } from '../components/world/SpatialWorld'
import { TraceTimeline } from '../components/TraceTimeline'

interface LiveLabScreenProps {
  activeRun: RunRecord | null
  events: TraceEvent[]
  findings: Finding[]
  onSelectEvent: (eventId: string) => void
  selectedEventId: string | null
  onOpenNewAssessment: () => void
}

export const LiveLabScreen: React.FC<LiveLabScreenProps> = ({
  activeRun,
  events,
  findings,
  onSelectEvent,
  selectedEventId,
  onOpenNewAssessment,
}) => {
  const [playheadIndex, setPlayheadIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)

  const safePlayheadIndex = events.length > 0 ? Math.min(playheadIndex, events.length - 1) : 0

  // Playhead auto-advance timer
  useEffect(() => {
    if (!isPlaying || events.length === 0) return

    const intervalMs = Math.max(200, 1000 / playbackSpeed)
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

  const currentEvent = events[safePlayheadIndex] || null

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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Run Summary Banner */}
      {activeRun ? (
        <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#DCE7D8] shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider">
                Scenario Under Evaluation
              </div>
              <div className="font-serif text-base font-bold text-[#202A25]">
                {activeRun.scenario_id}
              </div>
            </div>

            <div className="h-8 w-px bg-[#DCE7D8]" />

            <div>
              <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider">
                Defense Policy
              </div>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
                  activeRun.defense_enabled
                    ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                    : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                }`}
              >
                {activeRun.defense_enabled ? 'Sentinel Active' : 'No Defense'}
              </span>
            </div>

            <div className="h-8 w-px bg-[#DCE7D8]" />

            <div>
              <div className="text-[10px] uppercase font-bold text-[#859087] tracking-wider">
                Execution Provenance
              </div>
              <span className="font-mono text-xs font-semibold text-[#4E8CCB] uppercase">
                {activeRun.execution_mode || 'deterministic'}
                {activeRun.provider && ` · ${activeRun.provider}`}
              </span>
            </div>
          </div>

          {/* Verdict Status */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-[#859087]">Oracle Verdict</div>
              <div
                className={`text-xs font-bold ${
                  activeRun.exploits_count > 0 ? 'text-[#C94D3B]' : 'text-[#438A68]'
                }`}
              >
                {activeRun.exploits_count > 0
                  ? `Confirmed Exploit (${findings.length} findings)`
                  : 'Independent Verification Passed'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] text-center space-y-2">
          <p className="text-sm text-[#66736A]">No assessment loaded yet.</p>
          <button
            onClick={onOpenNewAssessment}
            className="px-4 py-2 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C]"
          >
            Start Your First Assessment →
          </button>
        </div>
      )}

      {/* Spatial World Canvas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-base font-bold text-[#202A25]">Spatial Execution World</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E5F0FC] text-[#4E8CCB] font-semibold">
              Follow the Breach
            </span>
          </div>
          <span className="text-xs text-[#859087]">
            Step {playheadIndex + 1} of {events.length || 1}
          </span>
        </div>

        <SpatialWorld
          currentEvent={currentEvent}
          events={events}
          onSelectEvent={onSelectEvent}
          defenseEnabled={activeRun?.defense_enabled}
        />
      </div>

      {/* Chronological Event Timeline */}
      <div className="h-[360px]">
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
    </div>
  )
}
