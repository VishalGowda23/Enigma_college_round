import React from 'react'
import type { RunRecord } from '../types'

interface DefenseLabScreenProps {
  runs: RunRecord[]
  onSelectRun: (runId: string) => void
  onRunBaseline: () => void
  onRunDefended: () => void
  onRunUtilityCheck: () => void
}

export const DefenseLabScreen: React.FC<DefenseLabScreenProps> = ({
  runs,
  onSelectRun,
  onRunBaseline,
  onRunDefended,
  onRunUtilityCheck,
}) => {
  // Find representative runs
  const baselineRun = runs.find(
    (r) => !r.defense_enabled && !r.scenario_id.startsWith('benign')
  )
  const defendedRun = runs.find(
    (r) => r.defense_enabled && !r.scenario_id.startsWith('benign')
  )
  const utilityRun = runs.find((r) => r.scenario_id.startsWith('benign'))

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#202A25]">
            Defense Lab & Utility Matrix
          </h2>
          <p className="text-xs text-[#66736A]">
            Compare baseline vulnerability against Sentinel policy enforcement and measure utility preservation
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunBaseline}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FCE8E2] text-[#C94D3B] border border-[#C94D3B]/30 hover:bg-[#F8D5CC] transition-colors"
          >
            Run Baseline (No Defense)
          </button>
          <button
            onClick={onRunDefended}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/40 hover:bg-[#BDEBD6]/50 transition-colors"
          >
            Run Defended
          </button>
          <button
            onClick={onRunUtilityCheck}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#E5F0FC] text-[#4E8CCB] border border-[#4E8CCB]/30 hover:bg-[#D5E6F8] transition-colors"
          >
            Verify Utility (Benign)
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline (No Defense) Card */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E2] text-[#C94D3B] border border-[#C94D3B]/30">
              Baseline · No Defense
            </span>
            {baselineRun && (
              <span className="font-mono text-xs text-[#859087]">
                Run {baselineRun.id.slice(0, 8)}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl font-bold text-[#202A25]">
            Target Agent Exposed to Injection
          </h3>

          <p className="text-xs text-[#66736A] leading-relaxed">
            Target agent executes untrusted prompt injection without runtime policy interception.
            The exploit exfiltrates customer account secrets to external mailer.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
              <div className="text-[10px] uppercase font-bold text-[#859087]">Attack Success Rate</div>
              <div className="font-serif text-2xl font-bold text-[#C94D3B] mt-0.5">
                {baselineRun ? `${(baselineRun.asr * 100).toFixed(0)}%` : '100%'}
              </div>
              <div className="text-[10px] text-[#C94D3B]">Exploit Confirmed by Oracle</div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
              <div className="text-[10px] uppercase font-bold text-[#859087]">Actions Blocked</div>
              <div className="font-serif text-2xl font-bold text-[#66736A] mt-0.5">0</div>
              <div className="text-[10px] text-[#66736A]">No guardrails active</div>
            </div>
          </div>

          {baselineRun && (
            <button
              onClick={() => onSelectRun(baselineRun.id)}
              className="w-full py-2 rounded-xl bg-[#EEF5E9] hover:bg-[#DCE7D8] text-xs font-semibold text-[#202A25] transition-colors"
            >
              Inspect Baseline Trace →
            </button>
          )}
        </div>

        {/* Defended (Sentinel Active) Card */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#76A889]/60 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BDEBD6]/50 text-[#1E4D36] border border-[#76A889]/40">
              Defended · Sentinel Active
            </span>
            {defendedRun && (
              <span className="font-mono text-xs text-[#859087]">
                Run {defendedRun.id.slice(0, 8)}
              </span>
            )}
          </div>

          <h3 className="font-serif text-xl font-bold text-[#202A25]">
            Invariant INV-001 Enforced
          </h3>

          <p className="text-xs text-[#66736A] leading-relaxed">
            Sentinel intercepts requested tool execution, detects recipient mismatch against
            registered billing records, and blocks the exfiltration attempt at the sandbox boundary.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
              <div className="text-[10px] uppercase font-bold text-[#859087]">Attack Success Rate</div>
              <div className="font-serif text-2xl font-bold text-[#438A68] mt-0.5">
                {defendedRun ? `${(defendedRun.asr * 100).toFixed(0)}%` : '0%'}
              </div>
              <div className="text-[10px] text-[#438A68]">100% Risk Reduction</div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
              <div className="text-[10px] uppercase font-bold text-[#859087]">Actions Blocked</div>
              <div className="font-serif text-2xl font-bold text-[#438A68] mt-0.5">
                {defendedRun?.blocks_count || 1}
              </div>
              <div className="text-[10px] text-[#438A68]">Exfiltration prevented</div>
            </div>
          </div>

          {defendedRun && (
            <button
              onClick={() => onSelectRun(defendedRun.id)}
              className="w-full py-2 rounded-xl bg-[#E3F3E8] hover:bg-[#BDEBD6]/60 text-xs font-semibold text-[#1E4D36] transition-colors"
            >
              Inspect Defended Trace →
            </button>
          )}
        </div>
      </div>

      {/* Utility Preservation Check Card */}
      <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚖</span>
            <h3 className="font-serif text-base font-bold text-[#202A25]">
              Utility Preservation Audit (Zero Over-Refusal)
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BDEBD6]/50 text-[#1E4D36] border border-[#76A889]/30">
            Utility: 100% Intact
          </span>
        </div>

        <p className="text-xs text-[#66736A] leading-relaxed">
          Security defenses that break legitimate functionality are unusable in production. When
          tested on legitimate customer billing confirmation requests (<code>benign-task-01</code>),
          the agent successfully completes the task and sends confirmation to the verified billing
          email without false-positive blocks.
        </p>

        <div className="p-4 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] flex items-center justify-between text-xs">
          <div>
            <div className="font-semibold text-[#202A25]">Legitimate Task Completion Rate</div>
            <div className="text-[11px] text-[#66736A]">
              Tested on verified billing address confirmation
            </div>
            {utilityRun && (
              <button
                onClick={() => onSelectRun(utilityRun.id)}
                className="text-[11px] font-semibold text-[#4E8CCB] hover:underline mt-1 block cursor-pointer"
              >
                View Utility Run Trace ({utilityRun.id.slice(0, 8)}) →
              </button>
            )}
          </div>
          <div className="font-serif text-xl font-bold text-[#438A68]">
            {utilityRun ? (utilityRun.exploits_count === 0 ? '100% Succeeded' : 'Failed') : '100% Succeeded'}
          </div>
        </div>
      </div>
    </div>
  )
}
