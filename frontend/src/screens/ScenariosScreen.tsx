import React, { useState, useMemo } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Search,
  Filter,
  Wrench,
  Terminal,
  Cpu,
  Target,
  Database,
  Lock,
} from 'lucide-react'
import type { Scenario } from '../types'

interface ScenariosScreenProps {
  scenarios: Scenario[]
  onLaunchScenario: (scenarioId: string) => void
}

export const ScenariosScreen: React.FC<ScenariosScreenProps> = ({
  scenarios = [],
  onLaunchScenario,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'attack' | 'benign'>('all')
  const [familyFilter, setFamilyFilter] = useState<string>('all')
  const [invariantFilter, setInvariantFilter] = useState<string>('all')

  // Available threat families
  const families = useMemo(() => {
    const set = new Set<string>()
    scenarios.forEach((sc) => {
      if (sc.threat_family) set.add(sc.threat_family)
    })
    return Array.from(set)
  }, [scenarios])

  // Available invariants
  const invariants = useMemo(() => {
    const set = new Set<string>()
    scenarios.forEach((sc) => {
      if (sc.invariant) set.add(sc.invariant)
    })
    return Array.from(set).sort()
  }, [scenarios])

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((sc) => {
      if (typeFilter !== 'all' && sc.type !== typeFilter) return false
      if (familyFilter !== 'all' && sc.threat_family !== familyFilter) return false
      if (invariantFilter !== 'all' && sc.invariant !== invariantFilter) return false
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase()
        const matchesName = sc.name.toLowerCase().includes(q)
        const matchesDesc = sc.description.toLowerCase().includes(q)
        const matchesId = sc.id.toLowerCase().includes(q)
        const matchesObj = (sc.objective || '').toLowerCase().includes(q)
        const matchesTools = (sc.required_tools || []).some((t) => t.toLowerCase().includes(q))
        if (!matchesName && !matchesDesc && !matchesId && !matchesObj && !matchesTools) {
          return false
        }
      }
      return true
    })
  }, [scenarios, typeFilter, familyFilter, invariantFilter, searchTerm])

  const getFamilyBadge = (family?: string) => {
    switch (family) {
      case 'injection':
        return { label: 'Prompt Injection', color: '#D65C4B', bg: '#FCE8E2' }
      case 'tool_abuse':
        return { label: 'Privilege & Tool Abuse', color: '#D97706', bg: '#FEF3C7' }
      case 'memory_poisoning':
        return { label: 'Memory & Knowledge Poisoning', color: '#9270C1', bg: '#F0E8FA' }
      case 'evasion':
        return { label: 'Policy Evasion & Bypass', color: '#4E8CCB', bg: '#E5F0FC' }
      case 'utility':
        return { label: 'Benign Business Utility', color: '#438A68', bg: '#E3F3E8' }
      case 'regression':
        return { label: 'Defense Regression', color: '#6366F1', bg: '#EEF2FF' }
      default:
        return { label: 'Security Evaluation', color: '#66736A', bg: '#EEF5E9' }
    }
  }

  const getInvariantTitle = (inv: string) => {
    switch (inv) {
      case 'INV-001':
        return 'INV-001 · External Exfiltration Protection'
      case 'INV-002':
        return 'INV-002 · Principle of Least Privilege'
      case 'INV-003':
        return 'INV-003 · State & Memory Integrity'
      case 'INV-004':
        return 'INV-004 · Credential Confidentiality'
      default:
        return `${inv} · Invariant Gate`
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & Comprehensive Filter Control */}
      <div className="bg-[#FFFEFA] p-4 sm:p-5 rounded-2xl border border-[#DCE7D8] shadow-card space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-lg font-bold text-[#202A25]">
                Security Evaluation Scenario Library
              </h2>
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30 font-semibold">
                {scenarios.length} Standardized Benchmarks
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#EEF5E9] text-[#66736A] border border-[#DCE7D8]">
                100% Executable
              </span>
            </div>
            <p className="text-xs text-[#66736A] mt-1">
              Diverse adversarial threat vectors and benign utility validation tests evaluated with ground-truth state proofs
            </p>
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE7D8] bg-[#F4FAF1] text-[#202A25] w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#859087] shrink-0" />
            <input
              type="text"
              placeholder="Search scenarios, tools, invariants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-[#202A25] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="pt-3 border-t border-[#DCE7D8]/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          {/* Attack vs Benign Segmented Switch */}
          <div className="flex items-center gap-1 bg-[#EEF5E9] p-0.5 rounded-lg border border-[#DCE7D8]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs border border-[#DCE7D8]'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              All Types ({scenarios.length})
            </button>
            <button
              onClick={() => setTypeFilter('attack')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'attack'
                  ? 'bg-[#FCE8E2] text-[#C94D3B] shadow-2xs border border-[#D65C4B]/20'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-[#D65C4B]" />
              <span>Adversarial (8)</span>
            </button>
            <button
              onClick={() => setTypeFilter('benign')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                typeFilter === 'benign'
                  ? 'bg-[#E3F3E8] text-[#1E4D36] shadow-2xs border border-[#76A889]/30'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-[#438A68]" />
              <span>Utility (4)</span>
            </button>
          </div>

          {/* Threat Family Filter Dropdown/Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#859087] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Family:
            </span>
            <button
              onClick={() => setFamilyFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
                familyFilter === 'all'
                  ? 'bg-[#202A25] text-white font-semibold'
                  : 'bg-[#EEF5E9] text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              All Families
            </button>
            {families.map((fam) => (
              <button
                key={fam}
                onClick={() => setFamilyFilter(fam)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer capitalize ${
                  familyFilter === fam
                    ? 'bg-[#202A25] text-white font-semibold'
                    : 'bg-[#EEF5E9] text-[#66736A] hover:text-[#202A25]'
                }`}
              >
                {fam.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Invariant Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[11px] text-[#859087] flex items-center gap-1">
              <Lock className="w-3 h-3" /> Invariant:
            </span>
            <select
              value={invariantFilter}
              onChange={(e) => setInvariantFilter(e.target.value)}
              className="bg-[#EEF5E9] border border-[#DCE7D8] text-[#202A25] rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none"
            >
              <option value="all">All Invariants</option>
              {invariants.map((inv) => (
                <option key={inv} value={inv}>
                  {inv}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((sc) => {
          const isAttack = sc.type === 'attack'
          const famBadge = getFamilyBadge(sc.threat_family)

          return (
            <div
              key={sc.id}
              className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] hover:border-[#76A889] shadow-card flex flex-col justify-between transition-all space-y-3.5 group"
            >
              <div className="space-y-3">
                {/* Badges: Threat Family, Type, and Invariant */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: famBadge.bg,
                        color: famBadge.color,
                        borderColor: `${famBadge.color}30`,
                      }}
                    >
                      {famBadge.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isAttack
                          ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                          : 'bg-[#E3F3E8] text-[#1E4D36] border-[#76A889]/30'
                      }`}
                    >
                      {isAttack ? 'Adversarial' : 'Benign Utility'}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] font-semibold text-[#859087] bg-[#EEF5E9] px-2 py-0.5 rounded-md border border-[#DCE7D8]">
                    Budget: {sc.default_budget}
                  </span>
                </div>

                {/* Scenario Title */}
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202A25] group-hover:text-[#438A68] transition-colors">
                    {sc.name}
                  </h3>
                  <div className="text-[10px] font-mono text-[#859087] mt-0.5">
                    ID: {sc.id}
                  </div>
                </div>

                {/* Objective Statement */}
                {sc.objective && (
                  <div className="p-2.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs">
                    <div className="text-[10px] uppercase font-bold text-[#859087] flex items-center gap-1 mb-0.5">
                      <Target className="w-3 h-3 text-[#438A68]" />
                      <span>Security Objective</span>
                    </div>
                    <p className="text-[11px] text-[#202A25] leading-relaxed">
                      {sc.objective}
                    </p>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs text-[#66736A] leading-relaxed">
                  {sc.description}
                </p>

                {/* Invariant & State Oracle Verification Pill */}
                <div className="p-2.5 rounded-xl bg-[#FFFEFA] border border-[#DCE7D8] text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-[#202A25] flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#4E8CCB]" />
                      <span>{getInvariantTitle(sc.invariant)}</span>
                    </span>
                    <span className="text-[9px] font-mono text-[#438A68] font-bold uppercase bg-[#E3F3E8] px-1.5 py-0.5 rounded">
                      Binding Oracle Proof
                    </span>
                  </div>

                  {sc.observable_outcome && (
                    <div className="text-[10.5px] text-[#66736A] flex items-start gap-1">
                      <Database className="w-3 h-3 text-[#859087] shrink-0 mt-0.5" />
                      <span>{sc.observable_outcome}</span>
                    </div>
                  )}
                </div>

                {/* Required Tools & Execution Capabilities */}
                <div className="flex flex-wrap items-center gap-1 text-[10px]">
                  <span className="text-[#859087] font-semibold flex items-center gap-1 mr-1">
                    <Wrench className="w-3 h-3" /> Tools:
                  </span>
                  {(sc.required_tools || ['read_ticket', 'lookup_customer', 'send_email']).map((tool) => (
                    <span
                      key={tool}
                      className="font-mono px-1.5 py-0.5 rounded bg-[#EEF5E9] text-[#202A25] border border-[#DCE7D8]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-3 border-t border-[#DCE7D8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-[#859087]">
                  <span className="flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-[#76A889]" /> Gemini 2.5 / Groq
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Terminal className="w-3 h-3 text-[#4E8CCB]" /> Deterministic
                  </span>
                </div>

                <button
                  onClick={() => onLaunchScenario(sc.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Launch Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
