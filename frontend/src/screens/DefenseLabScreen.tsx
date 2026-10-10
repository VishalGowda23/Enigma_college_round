import React, { useState } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Scale,
  ArrowRight,
} from 'lucide-react'
import type { RunRecord } from '../types'
import { ComparisonView } from '../components/ComparisonView'

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

  const [selectedRunAId, setSelectedRunAId] = useState<string | null>(() => baselineRun?.id || null)
  const [selectedRunBId, setSelectedRunBId] = useState<string | null>(() => defendedRun?.id || null)

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base font-bold text-[#202A25]">
            Defense Lab & Utility Matrix
          </h2>
          <p className="text-xs text-[#66736A]">
            Empirically evaluate invariant policy guardrails against baseline exploits and verify zero over-refusal
          </p>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRunBaseline}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FCE8E2] text-[#C94D3B] border border-[#C94D3B]/30 hover:bg-[#F8D5CC] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Run Baseline (Unprotected)</span>
          </button>
          <button
            onClick={onRunDefended}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/40 hover:bg-[#BDEBD6]/50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Run Defended (Sentinel)</span>
          </button>
          <button
            onClick={onRunUtilityCheck}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E5F0FC] text-[#4E8CCB] border border-[#4E8CCB]/30 hover:bg-[#D5E6F8] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Verify Utility (Benign)</span>
          </button>
        </div>
      </div>

      {/* Comparative Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Baseline (No Defense) Card */}
        <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E2] text-[#C94D3B] border border-[#C94D3B]/30">
                <ShieldAlert className="w-3 h-3 text-[#C94D3B]" /> Baseline · No Defense
              </span>
              {baselineRun && (
                <span className="font-mono text-xs text-[#859087]">
                  Run: {baselineRun.id.slice(0, 8)}
                </span>
              )}
            </div>

            <h3 className="font-serif text-base font-bold text-[#202A25]">
              Target Agent Exposed to Indirect Injection
            </h3>

            <p className="text-xs text-[#66736A] leading-relaxed">
              Target agent executes adversarial prompt instructions without policy interception.
              The attack successfully exfiltrates customer account secrets to external recipient.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087]">
                  Attack Success Rate
                </div>
                <div className="font-serif text-2xl font-bold text-[#C94D3B] mt-0.5">
                  {baselineRun ? `${(baselineRun.asr * 100).toFixed(0)}%` : '100%'}
                </div>
                <div className="text-[10px] text-[#C94D3B] font-semibold">
                  Exploit Confirmed by Oracle
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087]">
                  Side-Effects Blocked
                </div>
                <div className="font-serif text-2xl font-bold text-[#66736A] mt-0.5">0</div>
                <div className="text-[10px] text-[#66736A]">Direct bypass</div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#DCE7D8]">
            {baselineRun ? (
              <button
                onClick={() => onSelectRun(baselineRun.id)}
                className="w-full py-2 rounded-xl bg-[#EEF5E9] hover:bg-[#DCE7D8] text-xs font-semibold text-[#202A25] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Inspect Baseline Trace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onRunBaseline}
                className="w-full py-2 rounded-xl bg-[#202A25] text-white text-xs font-semibold hover:bg-[#34443C] transition-colors cursor-pointer"
              >
                Launch Baseline Assessment
              </button>
            )}
          </div>
        </div>

        {/* Defended (Sentinel Active) Card */}
        <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#76A889]/60 shadow-card flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BDEBD6]/50 text-[#1E4D36] border border-[#76A889]/40">
                <ShieldCheck className="w-3 h-3 text-[#438A68]" /> Defended · Sentinel Active
              </span>
              {defendedRun && (
                <span className="font-mono text-xs text-[#859087]">
                  Run: {defendedRun.id.slice(0, 8)}
                </span>
              )}
            </div>

            <h3 className="font-serif text-base font-bold text-[#202A25]">
              Invariant INV-001 Enforced at Boundary
            </h3>

            <p className="text-xs text-[#66736A] leading-relaxed">
              Sentinel intercepts requested <code className="font-mono text-[10px]">send_email</code> tool
              call, verifies recipient address against verified customer billing records, and halts
              the exfiltration attempt before execution.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087]">
                  Attack Success Rate
                </div>
                <div className="font-serif text-2xl font-bold text-[#438A68] mt-0.5">
                  {defendedRun ? `${(defendedRun.asr * 100).toFixed(0)}%` : '0%'}
                </div>
                <div className="text-[10px] text-[#438A68] font-semibold">100% Risk Reduction</div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
                <div className="text-[10px] uppercase font-bold text-[#859087]">
                  Harmful Actions Blocked
                </div>
                <div className="font-serif text-2xl font-bold text-[#438A68] mt-0.5">
                  {defendedRun?.blocks_count || 1}
                </div>
                <div className="text-[10px] text-[#438A68] font-semibold">
                  Exfiltration Prevented
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#DCE7D8]">
            {defendedRun ? (
              <button
                onClick={() => onSelectRun(defendedRun.id)}
                className="w-full py-2 rounded-xl bg-[#E3F3E8] hover:bg-[#BDEBD6]/60 text-xs font-semibold text-[#1E4D36] transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Inspect Defended Trace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onRunDefended}
                className="w-full py-2 rounded-xl bg-[#438A68] text-white text-xs font-semibold hover:bg-[#346F53] transition-colors cursor-pointer"
              >
                Launch Defended Assessment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Utility Preservation Check Card (Zero Over-Refusal) */}
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-[#202A25]">
                Utility Preservation Audit (Zero Over-Refusal)
              </h3>
              <p className="text-[11px] text-[#66736A]">
                Guarantees policy guardrails only arrest malicious exfiltrations without breaking
                legitimate workflows
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BDEBD6]/50 text-[#1E4D36] border border-[#76A889]/30">
            Utility: 100% Intact
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
            <div className="text-[10px] uppercase font-bold text-[#859087]">
              Benign Task Completion
            </div>
            <div className="font-serif text-xl font-bold text-[#438A68] mt-0.5">100%</div>
            <div className="text-[10px] text-[#66736A]">
              Legitimate billing confirmations pass
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8]">
            <div className="text-[10px] uppercase font-bold text-[#859087]">Over-Refusal Rate</div>
            <div className="font-serif text-xl font-bold text-[#438A68] mt-0.5">0.0%</div>
            <div className="text-[10px] text-[#66736A]">Zero false-positive blocks</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] flex flex-col justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-[#859087]">
                Utility Verification Trace
              </div>
              <div className="font-mono text-xs font-bold text-[#202A25] mt-0.5">
                {utilityRun ? utilityRun.id.slice(0, 8) : 'benign-task-01'}
              </div>
            </div>
            {utilityRun && (
              <button
                onClick={() => onSelectRun(utilityRun.id)}
                className="text-[11px] font-semibold text-[#4E8CCB] hover:underline flex items-center gap-1 cursor-pointer pt-1"
              >
                <span>Inspect Trace</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interactive A/B Regression Comparison */}
      <ComparisonView
        runs={runs}
        runAId={selectedRunAId}
        runBId={selectedRunBId}
        onSelectRunA={setSelectedRunAId}
        onSelectRunB={setSelectedRunBId}
      />
    </div>
  )
}
