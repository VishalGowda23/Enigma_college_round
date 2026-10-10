import React from 'react'
import type { NavigationTab, RunRecord } from '../types'

interface TopBarProps {
  currentTab: NavigationTab
  activeRun?: RunRecord | null
  onOpenNewAssessment: () => void
  onReplayCurrent?: () => void
  onToggleDefenseRerun?: () => void
  isLiveActive?: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  activeRun,
  onOpenNewAssessment,
  onReplayCurrent,
  onToggleDefenseRerun,
  isLiveActive = false,
}) => {
  const tabTitles: Record<NavigationTab, { title: string; subtitle: string }> = {
    home: { title: 'Overview', subtitle: 'Autonomous AI Red Teaming & Verification Workbench' },
    'live-lab': { title: 'Live Lab', subtitle: 'Spatial Environment & Forensic Event Execution' },
    assessments: { title: 'Assessments', subtitle: 'Audit Logs & Verification History' },
    scenarios: { title: 'Scenarios', subtitle: 'Controlled Sandbox Threat Models & Invariants' },
    agents: { title: 'Agents', subtitle: 'Target System, Red Team Hunter & Defense Sentinel' },
    evidence: { title: 'Evidence Graph', subtitle: 'Causal DAG & Invariant Violation Proofs' },
    'defense-lab': { title: 'Defense Lab', subtitle: 'Baseline vs Defended Mitigation & Utility Matrix' },
    reports: { title: 'Security Reports', subtitle: 'Forensic Audit Documentation & Export' },
  }

  const { title, subtitle } = tabTitles[currentTab]

  return (
    <header className="h-16 px-6 bg-[#FFFEFA] border-b border-[#DCE7D8] flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Title & Context */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-xl font-bold text-[#202A25] tracking-tight">{title}</h1>
          {activeRun && (
            <div className="flex items-center gap-2">
              <span className="text-[#DCE7D8]">/</span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#EEF5E9] text-[#66736A] border border-[#DCE7D8]">
                {activeRun.id.slice(0, 8)}…
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${
                  activeRun.status === 'COMPLETED'
                    ? activeRun.exploits_count > 0
                      ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                      : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/40'
                    : 'bg-[#E5F0FC] text-[#4E8CCB] border-[#4E8CCB]/30 animate-pulse'
                }`}
              >
                {activeRun.status === 'COMPLETED'
                  ? activeRun.exploits_count > 0
                    ? 'Exploit Confirmed'
                    : 'Protected'
                  : 'Running'}
              </span>
              {isLiveActive && (
                <span className="w-2 h-2 rounded-full bg-[#76A889] animate-ping" title="Live stream active" />
              )}
            </div>
          )}
        </div>
        <p className="text-xs text-[#66736A] truncate max-w-xl">{subtitle}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {onReplayCurrent && activeRun && (
          <button
            onClick={onReplayCurrent}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#202A25] bg-[#EEF5E9] hover:bg-[#DCE7D8] border border-[#DCE7D8] transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <span>↺</span>
            <span>Replay Trace</span>
          </button>
        )}

        {onToggleDefenseRerun && activeRun && (
          <button
            onClick={onToggleDefenseRerun}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 shadow-2xs ${
              activeRun.defense_enabled
                ? 'bg-[#EEF5E9] text-[#202A25] border-[#DCE7D8] hover:bg-[#E4EFE0]'
                : 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/40 hover:bg-[#BDEBD6]/60 font-semibold'
            }`}
          >
            <span>🛡</span>
            <span>{activeRun.defense_enabled ? 'Test Baseline (No Defense)' : 'Apply Defense & Rerun'}</span>
          </button>
        )}

        <button
          onClick={onOpenNewAssessment}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#202A25] hover:bg-[#34443C] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
        >
          <span className="text-[#BDEBD6] font-bold">+</span>
          <span>New Assessment</span>
        </button>
      </div>
    </header>
  )
}
