import { useState, useEffect } from 'react'

interface HealthResponse {
  status: string
  mode: string
}

export function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<string>('')

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    try {
      // Use relative endpoint first (works via Vite proxy), fallback to direct localhost:8000
      let res: Response
      try {
        res = await fetch('/api/health')
      } catch {
        res = await fetch('http://localhost:8000/api/health')
      }

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`)
      }
      const data: HealthResponse = await res.json()
      setHealth(data)
      setLastChecked(new Date().toLocaleTimeString())
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to connect to backend server')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <div className="max-w-4xl mx-auto w-full pt-10">
        {/* Header */}
        <header className="mb-8 border-b border-slate-800 pb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-xs font-mono uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Autonomous AI Red Team
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              AgentBreak
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                Phase 0/1 • T00-T01 Preflight
              </span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Grey-box tool-boundary security validation & exploit oracle engine
            </p>
          </div>

          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Probing...' : 'Re-check Seam'}
          </button>
        </header>

        {/* Integration Seam Status Card */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              API Integration Seam Verification
            </h2>

            {loading && !health ? (
              <div className="py-8 text-center text-slate-400 animate-pulse">
                Testing connection to Backend (GET /api/health)...
              </div>
            ) : error ? (
              <div className="bg-red-950/40 border border-red-800/60 rounded-lg p-4 text-red-300 text-sm">
                <p className="font-semibold mb-1">Connection Error</p>
                <p className="font-mono text-xs text-red-400">{error}</p>
                <p className="mt-3 text-xs text-slate-400">
                  Ensure the FastAPI backend is running on <code className="text-slate-200">http://localhost:8000</code>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-mono">Backend Status</span>
                    <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                      {health?.status === 'ok' ? 'Backend Status: ok' : health?.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase font-mono">Execution Mode</span>
                    <p className="text-sm font-mono text-cyan-400 font-semibold mt-0.5">
                      {health?.mode}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-slate-950/40 border border-slate-800/60 font-mono text-xs">
                  <div className="text-slate-500 mb-1">// Raw payload from GET /api/health</div>
                  <pre className="text-emerald-300">{JSON.stringify(health, null, 2)}</pre>
                  {lastChecked && (
                    <div className="text-slate-500 mt-2 text-[10px]">
                      Verified at: {lastChecked}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Architecture Status Column */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl backdrop-blur flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                System Contracts
              </h2>
              <ul className="space-y-2.5 text-xs font-mono text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Enums: 5 Outcomes Frozen
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Invariant: INV-001 Defined
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Tool: Mock Outbox Adapter
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-400">✓</span> Persistence: SQLite SQLite
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono uppercase">Next Milestone</span>
              <p className="text-xs text-cyan-300 font-medium mt-1">
                T02: Synthetic Agent & Mock Tools
              </p>
            </div>
          </div>
        </main>
      </div>

      <footer className="max-w-4xl mx-auto w-full border-t border-slate-900 pt-4 text-center text-xs text-slate-600 font-mono">
        AgentBreak • 24-Hour Hackathon Implementation • Strictly Verified Evidence
      </footer>
    </div>
  )
}

export default App
