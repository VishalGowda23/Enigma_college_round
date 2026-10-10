import React from 'react'
import type { NavigationTab, ExecutionMode } from '../types'
import { PixelAgent } from './pixel/PixelAgent'

interface SidebarProps {
  currentTab: NavigationTab
  onSelectTab: (tab: NavigationTab) => void
  executionMode?: ExecutionMode | string
  provider?: string | null
  activeRunCount?: number
}

interface NavItem {
  id: NavigationTab
  label: string
  icon: string
  badge?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  executionMode = 'deterministic',
  provider,
  activeRunCount = 0,
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'live-lab', label: 'Live Lab', icon: '⚡', badge: activeRunCount > 0 ? 'Live' : undefined },
    { id: 'assessments', label: 'Assessments', icon: '⏱' },
    { id: 'scenarios', label: 'Scenarios', icon: '🎯' },
    { id: 'agents', label: 'Agents', icon: '♟' },
    { id: 'evidence', label: 'Evidence', icon: '🔍' },
    { id: 'defense-lab', label: 'Defense Lab', icon: '🛡' },
    { id: 'reports', label: 'Reports', icon: '📄' },
  ]

  return (
    <aside className="w-56 shrink-0 bg-[#EEF5E9] border-r border-[#DCE7D8] flex flex-col justify-between select-none h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#DCE7D8] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFFEFA] border border-[#C5D5C0] flex items-center justify-center shadow-2xs">
            <PixelAgent role="hunter" size={24} />
          </div>
          <div>
            <div className="font-serif text-lg font-bold text-[#202A25] tracking-tight leading-none">
              AgentBreak
            </div>
            <div className="text-[10px] tracking-wider font-semibold uppercase text-[#66736A] mt-0.5">
              Autonomous Red Team
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = currentTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs border border-[#DCE7D8] font-semibold'
                    : 'text-[#66736A] hover:bg-[#E4EFE0] hover:text-[#202A25]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`text-base ${isActive ? 'text-[#76A889]' : 'text-[#859087]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#D65C4B] text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Agents Roster Strip & Sandbox Footer */}
      <div className="p-3 border-t border-[#DCE7D8] bg-[#F4FAF1]/70 space-y-3">
        {/* Four Pixel Agents Mini Roster */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-[#859087] mb-1.5 px-1">
            Active Roster
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-[#FFFEFA] rounded-lg border border-[#DCE7D8]">
            <button
              onClick={() => onSelectTab('agents')}
              title="Hunter · Red Team"
              className="flex justify-center p-1 rounded hover:bg-[#FCE8E2] transition-colors"
            >
              <PixelAgent role="hunter" size={20} />
            </button>
            <button
              onClick={() => onSelectTab('agents')}
              title="Operator · Target"
              className="flex justify-center p-1 rounded hover:bg-[#E5F0FC] transition-colors"
            >
              <PixelAgent role="operator" size={20} />
            </button>
            <button
              onClick={() => onSelectTab('agents')}
              title="Sentinel · Defense"
              className="flex justify-center p-1 rounded hover:bg-[#E3F3E8] transition-colors"
            >
              <PixelAgent role="sentinel" size={20} />
            </button>
            <button
              onClick={() => onSelectTab('agents')}
              title="Analyst · Evidence"
              className="flex justify-center p-1 rounded hover:bg-[#F0E8FA] transition-colors"
            >
              <PixelAgent role="analyst" size={20} />
            </button>
          </div>
        </div>

        {/* Runtime Environment Status */}
        <div className="p-2.5 rounded-lg bg-[#FFFEFA] border border-[#DCE7D8] text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[#66736A] font-medium">Mode:</span>
            <span
              className={`font-semibold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                executionMode === 'live_model'
                  ? 'bg-[#E5F0FC] text-[#4E8CCB] border border-[#4E8CCB]/30'
                  : 'bg-[#EEF5E9] text-[#66736A] border border-[#DCE7D8]'
              }`}
            >
              {executionMode === 'live_model' ? (provider ? `${provider}` : 'Live Model') : 'Deterministic'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#859087]">
            <span>Environment:</span>
            <span className="font-medium text-[#202A25]">Sandbox</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
