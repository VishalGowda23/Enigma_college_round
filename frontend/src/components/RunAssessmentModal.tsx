import { useState } from 'react'
import type { Scenario } from '../types'

interface RunAssessmentModalProps {
  scenarios: Scenario[]
  isOpen: boolean
  onClose: () => void
  onRunCreated: (runId: string) => void
}

export function RunAssessmentModal({
  scenarios,
  isOpen,
  onClose,
  onRunCreated,
}: RunAssessmentModalProps) {
  const [scenarioId, setScenarioId] = useState<string>(
    scenarios[0]?.id || 'support-ticket-injection'
  )
  const [defenseEnabled, setDefenseEnabled] = useState<boolean>(false)
  const [budget, setBudget] = useState<number>(3)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const selectedScenario = scenarios.find((s) => s.id === scenarioId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_id: scenarioId,
          defense_enabled: defenseEnabled,
          budget: selectedScenario?.type === 'benign' ? 1 : budget,
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to start run: ${res.statusText}`)
      }

      const data = await res.json()
      onRunCreated(data.run_id)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Unknown error starting assessment')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <h2 className="text-lg font-bold text-white">Execute Security Assessment</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Scenario Select */}
          <div>
            <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5">
              Target Scenario Fixture
            </label>
            <select
              value={scenarioId}
              onChange={(e) => {
                const newId = e.target.value
                setScenarioId(newId)
                const sc = scenarios.find((s) => s.id === newId)
                if (sc && sc.type === 'benign') {
                  setDefenseEnabled(true)
                  setBudget(1)
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  [{sc.type.toUpperCase()}] {sc.name}
                </option>
              ))}
            </select>
            {selectedScenario && (
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {selectedScenario.description}
              </p>
            )}
          </div>

          {/* Defense Toggle */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">
                Tool-Boundary Defense
              </span>
              <span className="text-xs text-slate-400">
                Intercepts <code className="text-cyan-400">send_email</code> and enforces recipient allowlist
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={defenseEnabled}
                onChange={(e) => setDefenseEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Budget Slider (Attack Scenarios only) */}
          {selectedScenario?.type === 'attack' && (
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs font-mono text-slate-400">
                <span>ATTEMPT BUDGET & MUTATIONS</span>
                <span className="text-white font-bold">{budget} attempt(s)</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 (Seed Only)</span>
                <span>3 (Adaptive Mutations)</span>
                <span>5 (Deep Exploration)</span>
              </div>
            </div>
          )}

          {/* Expected Behavior Badge */}
          <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs font-mono text-slate-400 flex items-center justify-between">
            <span>Expected Oracle Verdict:</span>
            <span
              className={`font-bold ${
                defenseEnabled
                  ? selectedScenario?.type === 'benign'
                    ? 'text-cyan-400'
                    : 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {defenseEnabled
                ? selectedScenario?.type === 'benign'
                  ? 'NO_EXPLOIT_OBSERVED'
                  : 'BLOCKED'
                : 'CONFIRMED_EXPLOIT'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-900/30 transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Executing Assessment...' : 'Start Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
