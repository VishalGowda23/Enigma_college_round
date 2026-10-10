import type { RunRecord } from '../types'

interface MetricsOverviewProps {
  runs: RunRecord[]
}

export function MetricsOverview({ runs }: MetricsOverviewProps) {
  const baselineRuns = runs.filter((r) => !r.defense_enabled && !r.scenario_id.startsWith('benign'))
  const defendedRuns = runs.filter((r) => r.defense_enabled && !r.scenario_id.startsWith('benign'))
  const benignRuns = runs.filter((r) => r.scenario_id.startsWith('benign'))

  // Baseline ASR
  const baselineAttempts = baselineRuns.reduce((acc, r) => acc + r.attempts_count, 0)
  const baselineExploits = baselineRuns.reduce((acc, r) => acc + r.exploits_count, 0)
  const baselineAsrPct = baselineAttempts > 0 ? Math.round((baselineExploits / baselineAttempts) * 100) : 0

  // Defended Block Rate
  const defendedAttempts = defendedRuns.reduce((acc, r) => acc + r.attempts_count, 0)
  const defendedBlocks = defendedRuns.reduce((acc, r) => acc + r.blocks_count, 0)
  const defendedBlockPct = defendedAttempts > 0 ? Math.round((defendedBlocks / defendedAttempts) * 100) : 0

  // Benign Utility
  const benignAttempts = benignRuns.reduce((acc, r) => acc + r.attempts_count, 0)
  const benignSuccesses = benignRuns.reduce((acc, r) => acc + (r.attempts_count - r.exploits_count - r.blocks_count), 0)
  const benignPct = benignAttempts > 0 ? Math.round((benignSuccesses / benignAttempts) * 100) : 100

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* Metric 1: Baseline ASR */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>BASELINE ASR (DEFENSE OFF)</span>
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-red-400 font-mono">
            {baselineAttempts > 0 ? `${baselineAsrPct}%` : 'N/A'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({baselineExploits}/{baselineAttempts} attempts)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Exploits confirmed via mock outbox side-effects
        </p>
      </div>

      {/* Metric 2: Defended Interception */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>POLICY INTERCEPTION (DEFENSE ON)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400 font-mono">
            {defendedAttempts > 0 ? `${defendedBlockPct}%` : 'N/A'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({defendedBlocks}/{defendedAttempts} blocked)
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Tool boundary policy enforcement before outbox commit
        </p>
      </div>

      {/* Metric 3: Benign Utility */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>BENIGN TASK UTILITY</span>
          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-cyan-400 font-mono">
            {benignAttempts > 0 ? `${benignPct}%` : '100%'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            ({benignAttempts > 0 ? `${benignSuccesses}/${benignAttempts}` : 'Ready'})
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          Legitimate support tickets unhampered by policy
        </p>
      </div>

      {/* Metric 4: Invariant Audit Status */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>SECURITY INVARIANT INV-001</span>
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-indigo-300 font-mono">
            Mock Outbox Oracle
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 font-mono">
          Zero external side-effects allowed when defended
        </p>
      </div>
    </div>
  )
}
