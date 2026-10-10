import React, { useState } from 'react'
import type { Scenario, ExecutionMode } from '../types'
import { createRun } from '../api/client'

interface RunAssessmentModalProps {
  isOpen: boolean
  onClose: () => void
  scenarios: Scenario[]
  onRunCreated: (runId: string) => void
}

export const RunAssessmentModal: React.FC<RunAssessmentModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onRunCreated,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>(
    scenarios[0]?.id || 'support-ticket-injection'
  )
  const [defenseEnabled, setDefenseEnabled] = useState<boolean>(false)
  const [budget, setBudget] = useState<number>(1)
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('live_model')
  const [provider, setProvider] = useState<'gemini' | 'groq'>('gemini')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleStart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const model = provider === 'gemini' ? 'gemini-3.6-flash' : 'openai/gpt-oss-120b'
      const res = await createRun({
        scenario_id: selectedScenario,
        defense_enabled: defenseEnabled,
        budget,
        execution_mode: executionMode,
        provider: executionMode === 'live_model' ? provider : undefined,
        model: executionMode === 'live_model' ? model : undefined,
      })
      onRunCreated(res.run_id)
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to start assessment')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#202A25]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#FFFEFA] border border-[#DCE7D8] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#DCE7D8] bg-[#F4FAF1] flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#202A25]">Launch Security Assessment</h2>
            <p className="text-xs text-[#66736A]">
              Execute controlled sandbox evaluation with real-time tracing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#66736A] hover:bg-[#DCE7D8] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-[#FCE8E2] border border-[#C94D3B]/30 text-[#8F2A1E]">
              {error}
            </div>
          )}

          {/* Scenario Selection */}
          <div>
            <label className="block font-semibold text-[#202A25] mb-1.5 uppercase text-[10px] tracking-wider text-[#859087]">
              Select Threat Scenario
            </label>
            <div className="space-y-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedScenario === sc.id
                      ? 'bg-[#EEF5E9] border-[#76A889] shadow-2xs font-semibold'
                      : 'bg-[#FFFEFA] border-[#DCE7D8] hover:bg-[#F4FAF1]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#202A25] font-semibold">{sc.name}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        sc.type === 'attack'
                          ? 'bg-[#FCE8E2] text-[#C94D3B]'
                          : 'bg-[#BDEBD6]/50 text-[#1E4D36]'
                      }`}
                    >
                      {sc.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66736A] font-normal mt-1 leading-relaxed">
                    {sc.description}
                  </p>
                  <div className="mt-1 text-[10px] text-[#859087] font-mono">
                    Invariant Target: {sc.invariant}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Mode (Live Model vs Deterministic) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#202A25] mb-1.5 uppercase text-[10px] tracking-wider text-[#859087]">
                Execution Engine
              </label>
              <div className="flex rounded-lg border border-[#DCE7D8] p-1 bg-[#F4FAF1]">
                <button
                  type="button"
                  onClick={() => setExecutionMode('live_model')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    executionMode === 'live_model'
                      ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs'
                      : 'text-[#66736A] hover:text-[#202A25]'
                  }`}
                >
                  Live LLM
                </button>
                <button
                  type="button"
                  onClick={() => setExecutionMode('deterministic')}
                  className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                    executionMode === 'deterministic'
                      ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs'
                      : 'text-[#66736A] hover:text-[#202A25]'
                  }`}
                >
                  Deterministic
                </button>
              </div>
            </div>

            {/* Provider Selection (Gemini vs Groq) */}
            {executionMode === 'live_model' ? (
              <div>
                <label className="block font-semibold text-[#202A25] mb-1.5 uppercase text-[10px] tracking-wider text-[#859087]">
                  Model Provider
                </label>
                <div className="flex rounded-lg border border-[#DCE7D8] p-1 bg-[#F4FAF1]">
                  <button
                    type="button"
                    onClick={() => setProvider('gemini')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                      provider === 'gemini'
                        ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs'
                        : 'text-[#66736A] hover:text-[#202A25]'
                    }`}
                  >
                    Gemini 3.6
                  </button>
                  <button
                    type="button"
                    onClick={() => setProvider('groq')}
                    className={`flex-1 py-1.5 rounded-md font-semibold text-xs transition-all ${
                      provider === 'groq'
                        ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs'
                        : 'text-[#66736A] hover:text-[#202A25]'
                    }`}
                  >
                    Groq 120B
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-[#202A25] mb-1.5 uppercase text-[10px] tracking-wider text-[#859087]">
                  Simulation Fidelity
                </label>
                <div className="py-2 text-[11px] text-[#66736A]">
                  Zero-latency repeatable test traces.
                </div>
              </div>
            )}
          </div>

          {/* Defense Policy Toggle */}
          <div className="p-3 rounded-xl border border-[#DCE7D8] bg-[#F4FAF1] flex items-center justify-between">
            <div>
              <div className="font-semibold text-[#202A25]">Sentinel Policy Defense</div>
              <div className="text-[11px] text-[#66736A]">
                Enforce invariant INV-001 (block unauthorized external data exfiltration)
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDefenseEnabled(!defenseEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                defenseEnabled ? 'bg-[#438A68]' : 'bg-[#C5D5C0]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  defenseEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Budget Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-[10px] uppercase tracking-wider text-[#859087]">
                Adaptive Attack Budget
              </label>
              <span className="font-mono font-bold text-xs text-[#202A25]">{budget} Attempt(s)</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-[#202A25] cursor-pointer"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#DCE7D8] bg-[#F4FAF1] flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#66736A] hover:bg-[#DCE7D8] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-[#202A25] hover:bg-[#34443C] transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {isLoading && <span className="animate-spin text-sm">↻</span>}
            <span>{isLoading ? 'Launching…' : 'Start Assessment'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
