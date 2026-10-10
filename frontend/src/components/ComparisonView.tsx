import type { RunRecord } from '../types'

interface ComparisonViewProps {
  runs: RunRecord[]
  runAId: string | null
  runBId: string | null
  onSelectRunA: (id: string) => void
  onSelectRunB: (id: string) => void
}

export function ComparisonView({
  runs,
  runAId,
  runBId,
  onSelectRunA,
  onSelectRunB,
}: ComparisonViewProps) {
  const runA = runs.find((r) => r.id === runAId)
  const runB = runs.find((r) => r.id === runBId)

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono mb-2">
          A/B Regression & Defense Effectiveness Comparison
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Compare security outcomes between a Baseline run (Defense: OFF) and a Defended run (Defense: ON)
          using identical attack payloads to evaluate defense effectiveness and benign utility preservation.
        </p>

        {/* Slot Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-xs font-mono uppercase text-red-400 font-semibold mb-2">
              Slot A: Baseline Run (Defense OFF)
            </label>
            <select
              value={runAId || ''}
              onChange={(e) => onSelectRunA(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
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

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <label className="block text-xs font-mono uppercase text-emerald-400 font-semibold mb-2">
              Slot B: Defended Run (Defense ON)
            </label>
            <select
              value={runBId || ''}
              onChange={(e) => onSelectRunB(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
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
          <div className="bg-slate-900/80 border border-red-900/50 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-mono font-bold text-red-400 uppercase">
                Baseline (Slot A)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {runA.id.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Defense State:</span>
                <span className="text-rose-400 font-bold">
                  {runA.defense_enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Attempts:</span>
                <span className="text-white">{runA.attempts_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exploits Confirmed:</span>
                <span className="text-red-400 font-bold">{runA.exploits_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Policy Blocks:</span>
                <span className="text-slate-400">{runA.blocks_count}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-400">Attack Success Rate:</span>
                <span className="text-2xl font-bold text-red-400">
                  {Math.round(runA.asr * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Card Delta: Comparison Analysis */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div className="pb-3 border-b border-slate-800 mb-4 text-center">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Regression Deltas (B vs A)
              </span>
            </div>

            <div className="space-y-4 text-center font-mono">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">ASR REDUCTION</span>
                <span className="text-3xl font-extrabold text-emerald-400">
                  {Math.round((runB.asr - runA.asr) * 100)}%
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">POLICY INTERCEPTION DELTA</span>
                <span className="text-2xl font-bold text-cyan-400">
                  +{runB.blocks_count - runA.blocks_count} Blocks
                </span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                {runB.exploits_count === 0 ? (
                  <span className="text-emerald-400 font-semibold">
                    ✓ All unauthorized exfiltration blocked at tool boundary.
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">
                    ⚠ Exploits still observed under current defense.
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[10px] text-center text-slate-500 font-mono">
              Zero fake results • Derived strictly from SQLite records
            </div>
          </div>

          {/* Card B: Run B Details */}
          <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                Defended (Slot B)
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {runB.id.slice(0, 8)}...
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Defense State:</span>
                <span className="text-emerald-400 font-bold">
                  {runB.defense_enabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Attempts:</span>
                <span className="text-white">{runB.attempts_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exploits Confirmed:</span>
                <span className="text-slate-400">{runB.exploits_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Policy Blocks:</span>
                <span className="text-emerald-400 font-bold">{runB.blocks_count}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-slate-400">Attack Success Rate:</span>
                <span className="text-2xl font-bold text-emerald-400">
                  {Math.round(runB.asr * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 border border-slate-800 rounded-xl font-mono">
          Select both a Baseline run and a Defended run to generate the side-by-side regression delta.
        </div>
      )}
    </div>
  )
}
