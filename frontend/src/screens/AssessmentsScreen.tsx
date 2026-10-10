import React, { useState, useMemo } from 'react'
import {
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
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
  const [filterOutcome, setFilterOutcome] = useState<string>('all')

  const stats = useMemo(() => {
    let total = runs.length
    let exploits = 0
    let blocked = 0
    let benignPass = 0

    runs.forEach((r) => {
      if (r.exploits_count > 0) exploits++
      if (r.blocks_count > 0) blocked++
      if (r.scenario_id.startsWith('benign') && r.exploits_count === 0) benignPass++
    })

    return { total, exploits, blocked, benignPass }
  }, [runs])

  const filteredRuns = runs.filter((r) => {
    if (filterMode !== 'all' && (r.execution_mode || 'deterministic') !== filterMode) return false
    if (filterDefense === 'defended' && !r.defense_enabled) return false
    if (filterDefense === 'baseline' && r.defense_enabled) return false
    if (filterOutcome === 'vulnerable' && r.exploits_count === 0) return false
    if (filterOutcome === 'protected' && r.exploits_count > 0) return false
    return true
  })

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Screen Header & Filters */}
      <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base font-bold text-[#202A25]">
            Security Assessment Ledger
          </h2>
          <p className="text-xs text-[#66736A]">
            Complete audit trail of all executed AI security assessments and ground-truth verdicts
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
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
              <option value="all">All Policies</option>
              <option value="defended">Defended Only</option>
              <option value="baseline">Baseline Only</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#859087] font-semibold text-[11px] uppercase">Outcome:</span>
            <select
              value={filterOutcome}
              onChange={(e) => setFilterOutcome(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-[#DCE7D8] bg-[#F4FAF1] text-[#202A25] font-medium"
            >
              <option value="all">All Outcomes</option>
              <option value="vulnerable">Vulnerable (Exploit)</option>
              <option value="protected">Protected (Verified)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate Assessment Outcome Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#859087]">Total Executions</div>
          <div className="font-serif text-xl font-bold text-[#202A25] mt-0.5">{stats.total}</div>
          <div className="text-[10px] text-[#66736A]">Recorded in database</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#D65C4B] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-[#D65C4B]" /> Confirmed Exploits
          </div>
          <div className="font-serif text-xl font-bold text-[#D65C4B] mt-0.5">{stats.exploits}</div>
          <div className="text-[10px] text-[#66736A]">Verified side effects</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#438A68] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#438A68]" /> Blocked Attacks
          </div>
          <div className="font-serif text-xl font-bold text-[#438A68] mt-0.5">{stats.blocked}</div>
          <div className="text-[10px] text-[#438A68]">Stopped by Sentinel</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] uppercase font-bold text-[#4E8CCB] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#4E8CCB]" /> Utility Verified
          </div>
          <div className="font-serif text-xl font-bold text-[#4E8CCB] mt-0.5">{stats.benignPass}</div>
          <div className="text-[10px] text-[#66736A]">Legitimate tasks intact</div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F4FAF1] border-b border-[#DCE7D8] text-[#859087] uppercase text-[10px] font-bold tracking-wider">
              <th className="py-2.5 px-4">Run ID</th>
              <th className="py-2.5 px-4">Scenario Under Test</th>
              <th className="py-2.5 px-4">Engine / Model</th>
              <th className="py-2.5 px-4">Policy Mode</th>
              <th className="py-2.5 px-4">Attempts</th>
              <th className="py-2.5 px-4">ASR (Exploit)</th>
              <th className="py-2.5 px-4">Created</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
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
                    <td className="py-2.5 px-4 font-mono font-bold text-[#202A25]">
                      {r.id.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-[#202A25]">{r.scenario_id}</td>
                    <td className="py-2.5 px-4">
                      <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#EEF5E9] text-[#4E8CCB] font-semibold border border-[#DCE7D8]">
                        {r.execution_mode || 'deterministic'}
                      </span>
                      {r.provider && (
                        <span className="ml-1.5 text-[10px] text-[#66736A]">({r.provider})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          r.defense_enabled
                            ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                            : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                        }`}
                      >
                        {r.defense_enabled ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#438A68]" /> Defended
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3 h-3 text-[#C94D3B]" /> Baseline
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono">{r.attempts_count}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-semibold ${
                          isExploit ? 'text-[#C94D3B]' : 'text-[#438A68]'
                        }`}
                      >
                        {(r.asr * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#859087] text-[11px] font-mono">
                      {r.created_at}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onSelectRun(r.id)
                            onNavigate('live-lab')
                          }}
                          className="px-2 py-1 rounded bg-[#EEF5E9] hover:bg-[#DCE7D8] text-[11px] font-semibold text-[#202A25] flex items-center gap-1 cursor-pointer"
                        >
                          <span>Trace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onReplayRun(r.id)}
                          className="p-1 rounded bg-[#F4FAF1] hover:bg-[#DCE7D8] text-[#66736A] hover:text-[#202A25] cursor-pointer"
                          title="Rerun assessment"
                          aria-label="Rerun assessment"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
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
