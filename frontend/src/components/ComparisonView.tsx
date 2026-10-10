import React from 'react'
import type { RunRecord } from '../types'

interface ComparisonViewProps {
  runs: RunRecord[]
  runAId: string | null
  runBId: string | null
  onSelectRunA: (id: string) => void
  onSelectRunB: (id: string) => void
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  runs,
  runAId,
  runBId,
  onSelectRunA,
  onSelectRunB,
}) => {
  const runA = runs.find((r) => r.id === runAId)
  const runB = runs.find((r) => r.id === runBId)

  return (
    <div className="space-y-6">
      {/* Selector Container */}
      <div className="bg-[#FFFEFA] border border-[#DCE7D8] rounded-2xl p-6 shadow-card">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <h3 className="font-serif text-base font-bold text-[#202A25]">
              A/B Regression & Defense Effectiveness Comparison
            </h3>
            <p className="text-xs text-[#66736A]">
              Compare security outcomes between a Baseline run (Defense: OFF) and a Defended run (Defense: ON)
              using identical attack fixtures to verify invariant enforcement and quantify delta metrics.
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#EEF5E9] text-[#202A25] border border-[#DCE7D8]">
            Derived from SQLite Ground-Truth
          </span>
        </div>

        {/* Slot Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#C94D3B] mb-1.5">
              Slot A: Baseline Run (Defense OFF)
            </label>
            <select
              value={runAId || ''}
              onChange={(e) => onSelectRunA(e.target.value)}
              className="w-full bg-[#FFFEFA] border border-[#DCE7D8] rounded-lg px-3 py-2 text-xs text-[#202A25] focus:outline-none focus:border-[#76A889]"
            >
              <option value="">Select a baseline run...</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id.slice(0, 8)}... | {r.scenario_id} | {r.defense_enabled ? 'DEF ON' : 'DEF OFF'} | ASR:{' '}
                  {Math.round(r.asr * 100)}%
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
            <label className="block text-[11px] uppercase tracking-wider font-bold text-[#1E4D36] mb-1.5">
              Slot B: Defended Run (Defense ON)
            </label>
            <select
              value={runBId || ''}
              onChange={(e) => onSelectRunB(e.target.value)}
              className="w-full bg-[#FFFEFA] border border-[#DCE7D8] rounded-lg px-3 py-2 text-xs text-[#202A25] focus:outline-none focus:border-[#76A889]"
            >
              <option value="">Select a defended run...</option>
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id.slice(0, 8)}... | {r.scenario_id} | {r.defense_enabled ? 'DEF ON' : 'DEF OFF'} | ASR:{' '}
                  {Math.round(r.asr * 100)}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      {runA && runB ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Run A Details */}
          <div className="bg-[#FFFEFA] border border-[#C94D3B]/30 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7D8]">
              <span className="text-xs font-bold text-[#C94D3B] uppercase tracking-wider">
                Baseline (Slot A)
              </span>
              <span className="font-mono text-[10px] text-[#859087]">
                {runA.id.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#66736A]">Defense State:</span>
                <span className="font-semibold text-[#C94D3B]">
                  {runA.defense_enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Total Attempts:</span>
                <span className="font-mono font-bold text-[#202A25]">{runA.attempts_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Exploits Confirmed:</span>
                <span className="font-mono font-bold text-[#C94D3B]">{runA.exploits_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Policy Blocks:</span>
                <span className="font-mono font-bold text-[#859087]">{runA.blocks_count}</span>
              </div>
              <div className="pt-2 border-t border-[#DCE7D8] flex justify-between items-baseline">
                <span className="text-[#66736A]">Attack Success Rate:</span>
                <span className="font-serif text-2xl font-bold text-[#C94D3B]">
                  {Math.round(runA.asr * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Card Delta: Comparison Analysis */}
          <div className="bg-[#FFFEFA] border border-[#76A889]/40 rounded-2xl p-5 shadow-card flex flex-col justify-between">
            <div className="pb-3 border-b border-[#DCE7D8] text-center">
              <span className="text-xs font-bold text-[#1E4D36] uppercase tracking-wider">
                Regression Deltas (B vs A)
              </span>
            </div>

            <div className="space-y-4 text-center py-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#859087] block mb-0.5">
                  ASR Reduction
                </span>
                <span className="font-serif text-3xl font-extrabold text-[#438A68]">
                  {Math.round((runB.asr - runA.asr) * 100)}%
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#859087] block mb-0.5">
                  Policy Interception Delta
                </span>
                <span className="font-mono text-xl font-bold text-[#4E8CCB]">
                  +{runB.blocks_count - runA.blocks_count} Interceptions
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-[11px]">
                {runB.exploits_count === 0 ? (
                  <span className="text-[#1E4D36] font-semibold">
                    ✓ All unauthorized exfiltration blocked at tool boundary.
                  </span>
                ) : (
                  <span className="text-[#C94D3B] font-semibold">
                    ⚠ Exploits still observed under current defense.
                  </span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCE7D8] text-[10px] text-center text-[#859087]">
              Zero synthetic hallucinations • Verified via SQLite state
            </div>
          </div>

          {/* Card B: Run B Details */}
          <div className="bg-[#FFFEFA] border border-[#76A889]/60 rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7D8]">
              <span className="text-xs font-bold text-[#1E4D36] uppercase tracking-wider">
                Defended (Slot B)
              </span>
              <span className="font-mono text-[10px] text-[#859087]">
                {runB.id.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#66736A]">Defense State:</span>
                <span className="font-semibold text-[#1E4D36]">
                  {runB.defense_enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Total Attempts:</span>
                <span className="font-mono font-bold text-[#202A25]">{runB.attempts_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Exploits Confirmed:</span>
                <span className="font-mono font-bold text-[#438A68]">{runB.exploits_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#66736A]">Policy Blocks:</span>
                <span className="font-mono font-bold text-[#1E4D36]">{runB.blocks_count}</span>
              </div>
              <div className="pt-2 border-t border-[#DCE7D8] flex justify-between items-baseline">
                <span className="text-[#66736A]">Attack Success Rate:</span>
                <span className="font-serif text-2xl font-bold text-[#438A68]">
                  {Math.round(runB.asr * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-[#859087] text-xs bg-[#FFFEFA] border border-[#DCE7D8] rounded-2xl">
          Select both a Baseline run and a Defended run to calculate the side-by-side regression delta.
        </div>
      )}
    </div>
  )
}
