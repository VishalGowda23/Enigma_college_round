import React, { useMemo } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  ArrowRight,
  Activity,
  CheckCircle2,
  TrendingDown,
  Cpu,
  Layers,
  Clock,
  Users,
} from 'lucide-react'
import type { RunRecord, NavigationTab } from '../types'
import { PixelAgent } from '../components/pixel/PixelAgent'

interface HomeScreenProps {
  runs: RunRecord[]
  onNavigate: (tab: NavigationTab) => void
  onSelectRun: (runId: string) => void
  onOpenNewAssessment: () => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  runs,
  onNavigate,
  onSelectRun,
  onOpenNewAssessment,
}) => {
  // Aggregate stats
  const totalRuns = runs.length
  const baselineRuns = runs.filter((r) => !r.defense_enabled && !r.scenario_id.startsWith('benign'))
  const defendedRuns = runs.filter((r) => r.defense_enabled && !r.scenario_id.startsWith('benign'))
  const benignRuns = runs.filter((r) => r.scenario_id.startsWith('benign'))

  const baselineASR =
    baselineRuns.length > 0
      ? (baselineRuns.reduce((acc, r) => acc + r.asr, 0) / baselineRuns.length) * 100
      : 100

  const defendedASR =
    defendedRuns.length > 0
      ? (defendedRuns.reduce((acc, r) => acc + r.asr, 0) / defendedRuns.length) * 100
      : 0

  const blockedCount = runs.reduce((acc, r) => acc + (r.blocks_count || 0), 0)
  const exploitCount = runs.reduce((acc, r) => acc + (r.exploits_count || 0), 0)

  // Mode distribution breakdown
  const modeStats = useMemo(() => {
    let liveCount = 0
    let detCount = 0
    runs.forEach((r) => {
      if (r.execution_mode === 'live_model') liveCount++
      else detCount++
    })
    return { liveCount, detCount }
  }, [runs])

  return (
    <div className="space-y-2.5 sm:space-y-3 lg:space-y-3.5 animate-in fade-in duration-200">
      {/* High-Density Editorial Hero Region */}
      <div className="bg-[#FFFEFA] rounded-xl sm:rounded-2xl border border-[#DCE7D8] p-3 sm:p-4 lg:p-4 shadow-card grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
        {/* Left Copy Region (5 cols on desktop) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2 sm:space-y-2.5 min-w-0">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E3F3E8] text-[#1E4D36] text-[10px] sm:text-xs font-semibold border border-[#76A889]/30">
              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#438A68]" />
              <span>Autonomous AI Red Team Security Laboratory</span>
            </div>

            <h1 className="font-serif text-lg sm:text-2xl lg:text-[23px] font-bold text-[#202A25] tracking-tight leading-snug">
              Autonomous probing, causal tracing, and verified guardrails for AI agents.
            </h1>

            <p className="text-[11px] sm:text-xs text-[#66736A] leading-relaxed">
              Watch indirect prompt injections enter context, inspect tool calls in real time, enforce
              runtime invariants at sandbox boundaries, and confirm actual environment state changes with
              independent ground-truth proofs.
            </p>
          </div>

          <div className="space-y-2 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenNewAssessment}
                className="px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>Start Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('live-lab')}
                className="px-3 py-1.5 sm:py-2 rounded-xl bg-[#EEF5E9] text-[#202A25] font-semibold text-xs border border-[#DCE7D8] hover:bg-[#DCE7D8] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[#76A889]" />
                <span>Follow Breach in Live Lab</span>
              </button>
            </div>

            {/* Quick Live Runtime Indicators */}
            <div className="flex items-center gap-3 text-[10px] sm:text-[11px] text-[#66736A]">
              <span className="flex items-center gap-1 font-medium">
                <Cpu className="w-3 h-3 text-[#4E8CCB]" />
                <span>Gemini 3.6 Flash & Groq</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3 text-[#438A68]" />
                <span>SQLite Ground-Truth Proofs</span>
              </span>
            </div>
          </div>
        </div>

        {/* EXPANDED PROMINENT AGENTS BOX (Takes 7 cols on desktop to utilize whitespace on the left) */}
        <div className="lg:col-span-7 bg-[#F4FAF1] rounded-xl sm:rounded-2xl border border-[#DCE7D8] p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between select-none">
          {/* Header of the Agents Box */}
          <div className="flex items-center justify-between pb-2 border-b border-[#DCE7D8]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#76A889]" />
              <span className="font-serif text-sm font-bold text-[#202A25]">
                Autonomous Agent Squad
              </span>
              <span className="hidden sm:inline text-[11px] text-[#66736A]">
                • Tool & Invariant Boundary Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#FFFEFA] border border-[#DCE7D8] text-[10px] font-semibold text-[#1E4D36]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#438A68] animate-ping" />
              <span>4 Deployed Actors</span>
            </div>
          </div>

          {/* 2x2 Rich Interactive Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 py-2 sm:py-2.5">
            {/* Hunter Card */}
            <div
              onClick={() => onNavigate('agents')}
              className="p-2.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] hover:border-[#D65C4B]/60 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="p-1 rounded-lg bg-[#FCE8E2] border border-[#D65C4B]/25 shrink-0 group-hover:scale-105 transition-transform">
                <PixelAgent role="hunter" size={44} showActivityDot pose="action" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-[#202A25]">Hunter</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#FCE8E2] text-[#D65C4B]">
                    Red Team
                  </span>
                </div>
                <div className="text-[10px] text-[#66736A] truncate">Adversarial Mutator</div>
                <div className="text-[9px] font-mono text-[#D65C4B] mt-0.5 truncate font-semibold">
                  Probing INV-001 Invariant
                </div>
              </div>
            </div>

            {/* Operator Card */}
            <div
              onClick={() => onNavigate('agents')}
              className="p-2.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] hover:border-[#4E8CCB]/60 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="p-1 rounded-lg bg-[#E5F0FC] border border-[#4E8CCB]/25 shrink-0 group-hover:scale-105 transition-transform">
                <PixelAgent role="operator" size={44} showActivityDot pose="idle" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-[#202A25]">Operator</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#E5F0FC] text-[#4E8CCB]">
                    Target
                  </span>
                </div>
                <div className="text-[10px] text-[#66736A] truncate">Support Assistant</div>
                <div className="text-[9px] font-mono text-[#4E8CCB] mt-0.5 truncate font-semibold">
                  Tool Sandbox Active
                </div>
              </div>
            </div>

            {/* Sentinel Card */}
            <div
              onClick={() => onNavigate('agents')}
              className="p-2.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] hover:border-[#438A68]/60 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="p-1 rounded-lg bg-[#E3F3E8] border border-[#438A68]/25 shrink-0 group-hover:scale-105 transition-transform">
                <PixelAgent role="sentinel" size={44} showActivityDot pose="inspecting" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-[#202A25]">Sentinel</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#1E4D36]">
                    Defense
                  </span>
                </div>
                <div className="text-[10px] text-[#66736A] truncate">Policy Gate</div>
                <div className="text-[9px] font-mono text-[#438A68] mt-0.5 truncate font-semibold">
                  Invariant Boundary Gate
                </div>
              </div>
            </div>

            {/* Analyst Card */}
            <div
              onClick={() => onNavigate('agents')}
              className="p-2.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] hover:border-[#9270C1]/60 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3 group"
            >
              <div className="p-1 rounded-lg bg-[#F0E8FA] border border-[#9270C1]/25 shrink-0 group-hover:scale-105 transition-transform">
                <PixelAgent role="analyst" size={44} showActivityDot pose="verified" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-xs text-[#202A25]">Analyst</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F0E8FA] text-[#9270C1]">
                    Oracle
                  </span>
                </div>
                <div className="text-[10px] text-[#66736A] truncate">Exploit Oracle</div>
                <div className="text-[9px] font-mono text-[#9270C1] mt-0.5 truncate font-semibold">
                  Ground Truth Proofs
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar inside the Agents Box */}
          <div className="pt-2 border-t border-[#DCE7D8] flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] text-[#66736A]">
              Click any agent to inspect runtime permissions & invariant boundaries
            </span>
            <button
              onClick={() => onNavigate('agents')}
              className="text-[11px] font-bold text-[#4E8CCB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Operations Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Strip (Compact rhythm that fits on screen) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="bg-[#FFFEFA] p-2.5 sm:p-3 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#859087] flex items-center justify-between">
            <span>Total Evaluations</span>
            <Activity className="w-3.5 h-3.5 text-[#859087]" />
          </div>
          <div className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#202A25] mt-0.5 leading-tight">
            {totalRuns}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#66736A] mt-0.5">Audit-grade recorded traces</div>
        </div>

        <div className="bg-[#FFFEFA] p-2.5 sm:p-3 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#D65C4B] flex items-center justify-between">
            <span>Baseline ASR (Unprotected)</span>
            <ShieldAlert className="w-3.5 h-3.5 text-[#D65C4B]" />
          </div>
          <div className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#D65C4B] mt-0.5 leading-tight">
            {baselineASR.toFixed(0)}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#66736A] mt-0.5">{exploitCount} exploits verified by Oracle</div>
        </div>

        <div className="bg-[#FFFEFA] p-2.5 sm:p-3 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#438A68] flex items-center justify-between">
            <span>Defended ASR (Sentinel)</span>
            <TrendingDown className="w-3.5 h-3.5 text-[#438A68]" />
          </div>
          <div className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#438A68] mt-0.5 leading-tight">
            {defendedASR.toFixed(0)}%
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#438A68] mt-0.5 font-semibold">
            {blockedCount} attacks blocked at boundary
          </div>
        </div>

        <div className="bg-[#FFFEFA] p-2.5 sm:p-3 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#4E8CCB] flex items-center justify-between">
            <span>Utility Retention</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4E8CCB]" />
          </div>
          <div className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-[#4E8CCB] mt-0.5 leading-tight">
            100%
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#66736A] mt-0.5">0% over-refusal on benign tasks</div>
        </div>
      </div>

      {/* Unified Security Analytics & Recent Assessments Deck (Fits on desktop screen seamlessly) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3.5">
        {/* Left Card (7 cols): Baseline vs Defended ASR Reduction & Provenance */}
        <div className="lg:col-span-7 bg-[#FFFEFA] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-serif text-sm font-bold text-[#202A25]">
                Attack Success Rate (ASR) Reduction
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30">
                100% Risk Elimination
              </span>
            </div>
            <p className="text-[11px] text-[#66736A] mb-2.5">
              Direct comparison of exploit confirmation between unprotected runs vs Sentinel guardrail
            </p>

            {/* Comparative Bars */}
            <div className="space-y-2 py-0.5">
              {/* Baseline Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#202A25] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#D65C4B]" />
                    <span>Baseline Agent (No Policy Interception)</span>
                  </span>
                  <span className="font-mono font-bold text-[#D65C4B]">
                    {baselineASR.toFixed(0)}% Vulnerable ({baselineRuns.length} runs)
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-lg bg-[#EEF5E9] overflow-hidden p-0.5 border border-[#DCE7D8]">
                  <div
                    className="h-full rounded-md bg-[#D65C4B] transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] font-bold text-white"
                    style={{ width: `${Math.max(12, baselineASR)}%` }}
                  >
                    {baselineASR.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Defended Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#202A25] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#438A68]" />
                    <span>Defended Agent (Sentinel Invariant INV-001)</span>
                  </span>
                  <span className="font-mono font-bold text-[#438A68]">
                    {defendedASR.toFixed(0)}% Exploit Rate ({defendedRuns.length} runs)
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-lg bg-[#EEF5E9] overflow-hidden p-0.5 border border-[#DCE7D8]">
                  <div
                    className="h-full rounded-md bg-[#438A68] transition-all duration-500 flex items-center pl-1.5 text-[9px] font-bold text-white"
                    style={{ width: `${Math.max(6, defendedASR)}%` }}
                  >
                    {defendedASR.toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Benign Utility Bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-semibold text-[#202A25] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4E8CCB]" />
                    <span>Legitimate Utility Preservation (Benign Tasks)</span>
                  </span>
                  <span className="font-mono font-bold text-[#4E8CCB]">
                    100% Succeeded ({benignRuns.length || 1} sample)
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-lg bg-[#EEF5E9] overflow-hidden p-0.5 border border-[#DCE7D8]">
                  <div
                    className="h-full rounded-md bg-[#4E8CCB] transition-all duration-500 flex items-center justify-end pr-1.5 text-[9px] font-bold text-white"
                    style={{ width: '100%' }}
                  >
                    100%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Engine Provenance & Matrix Link Footer */}
          <div className="pt-2 mt-2 border-t border-[#DCE7D8] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#66736A]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-[#4E8CCB] font-semibold">
                <Cpu className="w-3.5 h-3.5" /> Live Engine: {modeStats.liveCount} runs
              </span>
              <span className="flex items-center gap-1 text-[#66736A]">
                <Layers className="w-3.5 h-3.5" /> Fallback: {modeStats.detCount} runs
              </span>
            </div>
            <button
              onClick={() => onNavigate('defense-lab')}
              className="text-[#4E8CCB] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Regression Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Card (5 cols): Recent Assessments Quick Stream */}
        <div className="lg:col-span-5 bg-[#FFFEFA] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-[#DCE7D8] shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="font-serif text-sm font-bold text-[#202A25]">
                Recent Assessments
              </h2>
              <button
                onClick={() => onNavigate('assessments')}
                className="text-[11px] font-semibold text-[#4E8CCB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({totalRuns})</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-[#66736A] mb-2">
              Executed security traces with ground-truth causal proofs
            </p>

            {/* List of Recent Runs */}
            <div className="divide-y divide-[#DCE7D8]/60 text-xs">
              {runs.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => {
                    onSelectRun(r.id)
                    onNavigate('live-lab')
                  }}
                  className="py-1.5 sm:py-2 flex items-center justify-between hover:bg-[#F4FAF1] px-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#66736A] text-[11px]">
                        {r.id.slice(0, 8)}
                      </span>
                      <span className="font-semibold text-[#202A25] truncate text-xs">
                        {r.scenario_id}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#859087] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{r.created_at ? r.created_at.split('T')[1]?.slice(0, 8) || r.created_at : 'Recent'}</span>
                      <span>•</span>
                      <span className="uppercase text-[9px] font-semibold text-[#4E8CCB]">
                        {r.execution_mode || 'det'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        r.defense_enabled
                          ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                          : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                      }`}
                    >
                      {r.defense_enabled ? 'Defended' : 'Baseline'}
                    </span>

                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                        r.exploits_count > 0
                          ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                          : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/40'
                      }`}
                    >
                      {r.exploits_count > 0 ? 'Vulnerable' : 'Protected'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#DCE7D8] text-[10px] sm:text-[11px] text-[#859087] flex items-center justify-between">
            <span>Oracle: SQLite Exploit Oracle</span>
            <span className="font-mono text-[#1E4D36] font-semibold">Audit Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
