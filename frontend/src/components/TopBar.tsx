import React from 'react'
import { RotateCw, ShieldCheck, Plus, Menu } from 'lucide-react'
import type { NavigationTab, RunRecord } from '../types'

interface TopBarProps {
  currentTab: NavigationTab
  activeRun?: RunRecord | null
  onOpenNewAssessment: () => void
  onReplayCurrent?: () => void
  onToggleDefenseRerun?: () => void
  isLiveActive?: boolean
  onOpenMobileMenu?: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  activeRun,
  onOpenNewAssessment,
  onReplayCurrent,
  onToggleDefenseRerun,
  isLiveActive = false,
  onOpenMobileMenu,
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
    <header className="h-14 px-3 sm:px-6 bg-[#FFFEFA] border-b border-[#DCE7D8] flex items-center justify-between sticky top-0 z-30 shadow-2xs shrink-0">
      {/* Title & Context */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-[#202A25] hover:bg-[#EEF5E9] transition-colors cursor-pointer shrink-0"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#202A25]" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="font-serif text-base sm:text-lg font-bold text-[#202A25] tracking-tight truncate">
              {title}
            </h1>
            {activeRun && (
              <div className="hidden sm:flex items-center gap-2 shrink-0">
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
          <p className="text-[11px] text-[#66736A] truncate hidden md:block max-w-xl">{subtitle}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {onReplayCurrent && activeRun && (
          <button
            onClick={onReplayCurrent}
            className="px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-[#202A25] bg-[#EEF5E9] hover:bg-[#DCE7D8] border border-[#DCE7D8] transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Replay Trace"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#66736A]" />
            <span className="hidden sm:inline">Replay Trace</span>
          </button>
        )}

        {onToggleDefenseRerun && activeRun && (
          <button
            onClick={onToggleDefenseRerun}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              activeRun.defense_enabled
                ? 'bg-[#EEF5E9] text-[#202A25] border-[#DCE7D8] hover:bg-[#E4EFE0]'
                : 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/40 hover:bg-[#BDEBD6]/60 font-semibold'
            }`}
            title={activeRun.defense_enabled ? 'Test Baseline (No Defense)' : 'Apply Defense & Rerun'}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1E4D36]" />
            <span className="hidden md:inline">
              {activeRun.defense_enabled ? 'Test Baseline (No Defense)' : 'Apply Defense & Rerun'}
            </span>
            <span className="hidden sm:inline md:hidden">
              {activeRun.defense_enabled ? 'Baseline' : 'Defend'}
            </span>
          </button>
        )}

        <button
          onClick={onOpenNewAssessment}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#202A25] hover:bg-[#34443C] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
          title="New Assessment"
        >
          <Plus className="w-3.5 h-3.5 text-[#BDEBD6]" />
          <span className="hidden sm:inline">New Assessment</span>
          <span className="sm:hidden text-xs">New</span>
        </button>
      </div>
    </header>
  )
}
