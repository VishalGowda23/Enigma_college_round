interface HeaderProps {
  mode: string
  activeTab: 'dashboard' | 'comparison'
  setActiveTab: (tab: 'dashboard' | 'comparison') => void
  onOpenRunModal: () => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function Header({
  mode,
  activeTab,
  setActiveTab,
  onOpenRunModal,
  onRefresh,
  isRefreshing,
}: HeaderProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/20 font-bold text-white text-lg">
            AB
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">AgentBreak</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-950/70 border border-red-500/30 text-red-400">
                AI Red Team
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-slate-800 text-cyan-400 border border-slate-700">
                Mode: {mode}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Exploit Oracle & Tool-Boundary Policy Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Assessment Workspace
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-md transition ${
                activeTab === 'comparison'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              A/B Regression View
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer disabled:opacity-50"
            title="Refresh runs"
          >
            {isRefreshing ? '↻' : '⟳'}
          </button>

          <button
            onClick={onOpenRunModal}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-900/30 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-base leading-none">+</span> Run Assessment
          </button>
        </div>
      </div>
    </header>
  )
}
