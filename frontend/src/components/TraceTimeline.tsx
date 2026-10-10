import React from 'react'
import type { TraceEvent } from '../types'
import { PixelAgent } from './pixel/PixelAgent'

interface TraceTimelineProps {
  events: TraceEvent[]
  selectedEventId: string | null
  onSelectEvent: (eventId: string) => void
  currentIndex?: number
  isPlaying?: boolean
  onTogglePlay?: () => void
  onStepForward?: () => void
  onStepBackward?: () => void
  speed?: number
  onChangeSpeed?: (speed: number) => void
}

export const TraceTimeline: React.FC<TraceTimelineProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  currentIndex = 0,
  isPlaying = false,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  speed = 1,
  onChangeSpeed,
}) => {
  const getRelationBadge = (rel?: string | null) => {
    if (!rel) return null
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#EEF5E9] text-[#66736A] border border-[#DCE7D8]">
        {rel}
      </span>
    )
  }

  const getStatusColor = (ev: TraceEvent) => {
    if (ev.event_type === 'TOOL_CALL_BLOCKED') return 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
    if (ev.event_type === 'ORACLE_VERDICT') {
      const isExploit = ev.reason_code === 'EXPLOIT_CONFIRMED_SIDE_EFFECT_PRESENT'
      return isExploit
        ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/40 font-bold'
        : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/40 font-bold'
    }
    if (ev.event_type === 'TOOL_CALL_EXECUTED') return 'bg-[#E5F0FC] text-[#4E8CCB] border-[#4E8CCB]/30'
    return 'bg-[#FFFEFA] text-[#202A25] border-[#DCE7D8]'
  }

  return (
    <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col h-full overflow-hidden">
      {/* Timeline Controls Header */}
      <div className="p-4 border-b border-[#DCE7D8] bg-[#F4FAF1] flex items-center justify-between">
        <div>
          <h3 className="font-serif text-sm font-bold text-[#202A25]">Forensic Execution Trace</h3>
          <p className="text-[11px] text-[#66736A]">
            {events.length} causal events recorded in chronological order
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5 bg-[#FFFEFA] px-2 py-1 rounded-lg border border-[#DCE7D8] shadow-2xs">
          {onStepBackward && (
            <button
              onClick={onStepBackward}
              disabled={currentIndex <= 0}
              className="p-1 rounded hover:bg-[#EEF5E9] text-xs font-bold text-[#66736A] disabled:opacity-30 cursor-pointer"
              title="Step backward"
            >
              ⏮
            </button>
          )}

          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className="px-2.5 py-1 rounded bg-[#202A25] text-white text-xs font-semibold hover:bg-[#34443C] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{isPlaying ? '⏸' : '▶'}</span>
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
          )}

          {onStepForward && (
            <button
              onClick={onStepForward}
              disabled={currentIndex >= events.length - 1}
              className="p-1 rounded hover:bg-[#EEF5E9] text-xs font-bold text-[#66736A] disabled:opacity-30 cursor-pointer"
              title="Step forward"
            >
              ⏭
            </button>
          )}

          {onChangeSpeed && (
            <div className="flex items-center gap-1 ml-1 pl-2 border-l border-[#DCE7D8] text-[10px]">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    speed === s ? 'bg-[#76A889] text-white' : 'text-[#66736A] hover:bg-[#EEF5E9]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#DCE7D8]/60 p-2">
        {events.length === 0 ? (
          <div className="p-8 text-center text-[#859087] text-xs">
            No events recorded yet. Start an assessment to observe live trace.
          </div>
        ) : (
          events.map((ev, idx) => {
            const isSelected = ev.id === selectedEventId
            const isPlayhead = idx === currentIndex
            const actorRole = ev.actor || 'system'

            return (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev.id)}
                className={`p-2.5 rounded-lg transition-all cursor-pointer flex items-center justify-between text-xs ${
                  isSelected
                    ? 'bg-[#EEF5E9] border border-[#76A889] shadow-2xs'
                    : isPlayhead
                    ? 'bg-[#F4FAF1] border-l-4 border-l-[#76A889]'
                    : 'hover:bg-[#F4FAF1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Sequence Number */}
                  <span className="font-mono text-[11px] font-semibold text-[#859087] w-6">
                    #{ev.sequence_number}
                  </span>

                  {/* Actor Mini Sprite */}
                  <div className="p-0.5 rounded bg-[#FFFEFA] border border-[#DCE7D8]">
                    <PixelAgent role={actorRole} size={18} />
                  </div>

                  {/* Event Type & Tool Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#202A25]">{ev.event_type}</span>
                      {ev.tool_name && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#EEF5E9] font-medium text-[#202A25]">
                          {ev.tool_name}
                        </span>
                      )}
                    </div>
                    {ev.message && (
                      <p className="text-[11px] text-[#66736A] truncate max-w-md mt-0.5">
                        {ev.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Badges */}
                <div className="flex items-center gap-2">
                  {getRelationBadge(ev.relation_type)}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusColor(ev)}`}
                  >
                    {ev.policy_decision || (ev.event_type === 'TOOL_CALL_BLOCKED' ? 'BLOCKED' : 'EVENT')}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
