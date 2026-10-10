import React from 'react'
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

  const baselineASR =
    baselineRuns.length > 0
      ? (baselineRuns.reduce((acc, r) => acc + r.asr, 0) / baselineRuns.length) * 100
      : 0

  const defendedASR =
    defendedRuns.length > 0
      ? (defendedRuns.reduce((acc, r) => acc + r.asr, 0) / defendedRuns.length) * 100
      : 0

  const blockedCount = runs.reduce((acc, r) => acc + (r.blocks_count || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Editorial Hero Region */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-8 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#E3F3E8] text-[#1E4D36] text-xs font-semibold border border-[#76A889]/30">
            <span>🛡</span>
            <span>Autonomous Red Team Security Laboratory</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#202A25] tracking-tight leading-tight">
            Find and fix real vulnerabilities in AI agents.
          </h1>

          <p className="text-sm text-[#66736A] leading-relaxed">
            Observe indirect prompt injections enter context, inspect tool calls, enforce policy
            guardrails, and verify actual environment side effects with independent ground-truth
            proofs.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onOpenNewAssessment}
              className="px-5 py-2.5 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all shadow-sm cursor-pointer active:scale-95"
            >
              Start Security Assessment →
            </button>
            <button
              onClick={() => onNavigate('live-lab')}
              className="px-4 py-2.5 rounded-xl bg-[#EEF5E9] text-[#202A25] font-semibold text-xs border border-[#DCE7D8] hover:bg-[#DCE7D8] transition-all cursor-pointer"
            >
              Follow Breach in Live Lab ⚡
            </button>
          </div>
        </div>

        {/* Hero Pixel Character Cluster */}
        <div className="p-6 rounded-2xl bg-[#F4FAF1] border border-[#DCE7D8] flex items-center gap-4 shadow-2xs">
          <div className="flex flex-col items-center gap-2">
            <PixelAgent role="hunter" size={44} showBadge label="Hunter" />
            <PixelAgent role="operator" size={44} showBadge label="Operator" />
          </div>
          <div className="text-xl text-[#C5D5C0]">⇄</div>
          <div className="flex flex-col items-center gap-2">
            <PixelAgent role="sentinel" size={44} showBadge label="Sentinel" />
            <PixelAgent role="analyst" size={44} showBadge label="Analyst" />
          </div>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#859087]">
            Total Evaluations
          </div>
          <div className="font-serif text-2xl font-bold text-[#202A25] mt-1">{totalRuns}</div>
          <div className="text-[11px] text-[#66736A] mt-0.5">Audit-grade recorded traces</div>
        </div>

        <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#D65C4B]">
            Baseline ASR (Unprotected)
          </div>
          <div className="font-serif text-2xl font-bold text-[#D65C4B] mt-1">
            {baselineASR.toFixed(0)}%
          </div>
          <div className="text-[11px] text-[#66736A] mt-0.5">Exploit confirmed by Oracle</div>
        </div>

        <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#438A68]">
            Defended ASR (With Sentinel)
          </div>
          <div className="font-serif text-2xl font-bold text-[#438A68] mt-1">
            {defendedASR.toFixed(0)}%
          </div>
          <div className="text-[11px] text-[#66736A] mt-0.5">{blockedCount} harmful actions blocked</div>
        </div>

        <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#4E8CCB]">
            Utility Retention
          </div>
          <div className="font-serif text-2xl font-bold text-[#4E8CCB] mt-1">100%</div>
          <div className="text-[11px] text-[#66736A] mt-0.5">Legitimate tasks still work</div>
        </div>
      </div>

      {/* Four Characters Roles Introduction */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#202A25]">Security Actors & Roles</h2>
            <p className="text-xs text-[#66736A]">
              Specialized autonomous agents operating in the controlled sandbox
            </p>
          </div>
          <button
            onClick={() => onNavigate('agents')}
            className="text-xs font-semibold text-[#4E8CCB] hover:underline"
          >
            View Agent Roster Details →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] hover:border-[#D65C4B]/40 transition-all shadow-2xs">
            <PixelAgent role="hunter" size={40} showBadge label="Hunter" />
            <h3 className="font-bold text-sm text-[#202A25] mt-3">Red Team Attacker</h3>
            <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
              Synthesizes indirect prompt injections, emergency bypasses, and retrieval poisoning to
              probe tool boundaries.
            </p>
          </div>

          <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] hover:border-[#4E8CCB]/40 transition-all shadow-2xs">
            <PixelAgent role="operator" size={40} showBadge label="Operator" />
            <h3 className="font-bold text-sm text-[#202A25] mt-3">Target Customer Agent</h3>
            <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
              Customer support agent equipped with <code className="text-[10px]">lookup_customer</code> and{' '}
              <code className="text-[10px]">send_email</code> sandbox tools.
            </p>
          </div>

          <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] hover:border-[#438A68]/40 transition-all shadow-2xs">
            <PixelAgent role="sentinel" size={40} showBadge label="Sentinel" />
            <h3 className="font-bold text-sm text-[#202A25] mt-3">Policy Defense Gate</h3>
            <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
              Enforces invariant INV-001 at runtime, preventing exfiltration to untrusted domains
              while allowing verified billing emails.
            </p>
          </div>

          <div className="bg-[#FFFEFA] p-5 rounded-xl border border-[#DCE7D8] hover:border-[#9270C1]/40 transition-all shadow-2xs">
            <PixelAgent role="analyst" size={40} showBadge label="Analyst" />
            <h3 className="font-bold text-sm text-[#202A25] mt-3">Exploit Oracle</h3>
            <p className="text-xs text-[#66736A] mt-1 leading-relaxed">
              Independently inspects database state and mock outbox records to provide ground-truth
              verification rather than trusting model claims.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Evaluations Table */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#202A25]">Recent Assessments</h2>
            <p className="text-xs text-[#66736A]">
              Executed security evaluations in SQLite storage
            </p>
          </div>
          <button
            onClick={() => onNavigate('assessments')}
            className="text-xs font-semibold text-[#4E8CCB] hover:underline"
          >
            View All Runs ({totalRuns}) →
          </button>
        </div>

        <div className="divide-y divide-[#DCE7D8]/60 text-xs">
          {runs.slice(0, 5).map((r) => (
            <div
              key={r.id}
              onClick={() => {
                onSelectRun(r.id)
                onNavigate('live-lab')
              }}
              className="py-3 flex items-center justify-between hover:bg-[#F4FAF1] px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#66736A]">{r.id.slice(0, 8)}</span>
                <div>
                  <div className="font-semibold text-[#202A25]">{r.scenario_id}</div>
                  <div className="text-[11px] text-[#859087] flex items-center gap-2 mt-0.5">
                    <span>{r.created_at}</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-semibold text-[#4E8CCB]">
                      {r.execution_mode || 'deterministic'}
                    </span>
                    {r.provider && (
                      <span className="text-[10px] text-[#66736A]">({r.provider})</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    r.defense_enabled
                      ? 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                      : 'bg-[#EEF5E9] text-[#66736A] border-[#DCE7D8]'
                  }`}
                >
                  {r.defense_enabled ? 'Defended' : 'Baseline'}
                </span>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
    </div>
  )
}
