import React, { useState } from 'react'
import type { RunRecord, NavigationTab } from '../types'

interface AssessmentsScreenProps {
  runs: RunRecord[]
  onSelectRun: (runId: string) => void
  onNavigate: (tab: NavigationTab) => void
  onReplayRun: (runId: string) => void
}

export const AssessmentsScreen: React.FC<AssessmentsScreenProps> = ({
  runs,
  onSelectRun,
  onNavigate,
  onReplayRun,
}) => {
  const [filterMode, setFilterMode] = useState<string>('all')
  const [filterDefense, setFilterDefense] = useState<string>('all')

  const filteredRuns = runs.filter((r) => {
    if (filterMode !== 'all' && (r.execution_mode || 'deterministic') !== filterMode) return false
    if (filterDefense === 'defended' && !r.defense_enabled) return false
    if (filterDefense === 'baseline' && r.defense_enabled) return false
    return true
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Screen Header & Filters */}
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#202A25]">Assessment History</h2>
          <p className="text-xs text-[#66736A]">
            Comprehensive audit record of all executed red-team evaluations
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#859087] font-semibold text-[11px] uppercase">Engine:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#DCE7D8] bg-[#F4FAF1] text-[#202A25] font-medium"
            >
              <option value="all">All Engines</option>
              <option value="live_model">Live LLM</option>
              <option value="deterministic">Deterministic</option>
              <option value="replay">Replay</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#859087] font-semibold text-[11px] uppercase">Policy:</span>
            <select
              value={filterDefense}
              onChange={(e) => setFilterDefense(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#DCE7D8] bg-[#F4FAF1] text-[#202A25] font-medium"
            >
              <option value="all">All Runs</option>
              <option value="defended">Defended Only</option>
              <option value="baseline">Baseline Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4FAF1] border-b border-[#DCE7D8] text-[#859087] uppercase text-[10px] font-bold tracking-wider">
              <th className="py-3 px-4">Run ID</th>
              <th className="py-3 px-4">Scenario</th>
              <th className="py-3 px-4">Engine / Model</th>
              <th className="py-3 px-4">Policy Mode</th>
              <th className="py-3 px-4">Attempts</th>
              <th className="py-3 px-4">Exploit Rate (ASR)</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCE7D8]/60">
            {filteredRuns.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#859087]">
                  No assessments match the selected filter.
                </td>
              </tr>
            ) : (
              filteredRuns.map((r) => {
                const isExploit = r.exploits_count > 0
                return (
                  <tr
                    key={r.id}
                    className="hover:bg-[#F4FAF1] transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectRun(r.id)
                      onNavigate('live-lab')
                    }}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#202A25]">
                      {r.id.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#202A25]">{r.scenario_id}</td>
                    <td className="py-3 px-4">
                      <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#EEF5E9] text-[#4E8CCB] font-semibold border border-[#DCE7D8]">
                        {r.execution_mode || 'deterministic'}
                      </span>
                      {r.provider && (
                        <span className="ml-1.5 text-[10px] text-[#66736A]">({r.provider})</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.defense_enabled
                            ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                            : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                        }`}
                      >
                        {r.defense_enabled ? 'Defended' : 'Baseline'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{r.attempts_count}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-semibold ${
                          isExploit ? 'text-[#C94D3B]' : 'text-[#438A68]'
                        }`}
                      >
                        {(r.asr * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#859087] text-[11px]">{r.created_at}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            onSelectRun(r.id)
                            onNavigate('live-lab')
                          }}
                          className="px-2 py-1 rounded bg-[#EEF5E9] hover:bg-[#DCE7D8] text-[11px] font-semibold text-[#202A25]"
                        >
                          View Trace →
                        </button>
                        <button
                          onClick={() => onReplayRun(r.id)}
                          className="px-2 py-1 rounded bg-[#F4FAF1] hover:bg-[#DCE7D8] text-[11px] font-semibold text-[#66736A]"
                          title="Rerun assessment"
                        >
                          ↺
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
