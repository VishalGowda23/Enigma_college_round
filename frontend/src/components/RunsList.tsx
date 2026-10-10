import type { RunRecord } from '../types'

interface RunsListProps {
  runs: RunRecord[]
  selectedRunId: string | null
  onSelectRun: (runId: string) => void
  onReplayRun: (runId: string) => void
  compareRunA: string | null
  compareRunB: string | null
  onSetCompare: (runId: string, slot: 'A' | 'B') => void
}

export function RunsList({
  runs,
  selectedRunId,
  onSelectRun,
  onReplayRun,
  compareRunA,
  compareRunB,
  onSetCompare,
}: RunsListProps) {
  if (runs.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400 text-sm">No assessment runs recorded yet.</p>
        <p className="text-slate-600 text-xs mt-1">
          Click "+ Run Assessment" to execute your first red-team test.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
          Assessment History ({runs.length})
        </h2>
        <span className="text-xs text-slate-500 font-mono">
          Click a run to inspect its event trace
        </span>
      </div>

      <div className="divide-y divide-slate-800/60 max-h-[420px] overflow-y-auto">
        {runs.map((r) => {
          const isSelected = r.id === selectedRunId
          const isBenign = r.scenario_id.startsWith('benign')

          return (
            <div
              key={r.id}
              onClick={() => onSelectRun(r.id)}
              className={`p-4 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800/70 border-l-4 border-red-500'
                  : 'hover:bg-slate-800/30'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {r.id.slice(0, 8)}...
                  </span>

                  {/* Scenario Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      isBenign
                        ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {r.scenario_id}
                  </span>

                  {/* Defense Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      r.defense_enabled
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                        : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                    }`}
                  >
                    {r.defense_enabled ? 'DEFENSE ON' : 'DEFENSE OFF'}
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-3">
                  <span>Attempts: {r.attempts_count}</span>
                  <span>•</span>
                  <span>
                    Exploits:{' '}
                    <strong className={r.exploits_count > 0 ? 'text-red-400' : 'text-slate-300'}>
                      {r.exploits_count}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>Blocks: {r.blocks_count}</span>
                  <span>•</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(r.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Metrics & Actions */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="text-right mr-2 font-mono">
                  <span className="text-xs text-slate-500 block">ASR</span>
                  <span
                    className={`text-sm font-bold ${
                      r.asr > 0 ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {Math.round(r.asr * 100)}%
                  </span>
                </div>

                <button
                  onClick={() => onReplayRun(r.id)}
                  title="Re-execute this exact scenario configuration"
                  className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition cursor-pointer"
                >
                  Replay
                </button>

                <div className="flex rounded border border-slate-700 overflow-hidden text-[10px] font-mono">
                  <button
                    onClick={() => onSetCompare(r.id, 'A')}
                    className={`px-1.5 py-1 transition cursor-pointer ${
                      compareRunA === r.id ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Set as Baseline (Slot A)"
                  >
                    A
                  </button>
                  <button
                    onClick={() => onSetCompare(r.id, 'B')}
                    className={`px-1.5 py-1 transition cursor-pointer ${
                      compareRunB === r.id ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Set as Defended (Slot B)"
                  >
                    B
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
