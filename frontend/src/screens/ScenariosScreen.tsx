import React, { useState } from 'react'
import {
  CheckCircle2,
  ArrowRight,
  Search,
  ShieldAlert,
} from 'lucide-react'
import type { Scenario } from '../types'

interface ScenariosScreenProps {
  scenarios: Scenario[]
  onLaunchScenario: (scenarioId: string) => void
}

export const ScenariosScreen: React.FC<ScenariosScreenProps> = ({
  scenarios,
  onLaunchScenario,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'attack' | 'benign'>('all')

  const filteredScenarios = scenarios.filter((sc) => {
    if (typeFilter !== 'all' && sc.type !== typeFilter) return false
    if (
      searchTerm &&
      !sc.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sc.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !sc.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Filter Controls */}
      <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base font-bold text-[#202A25]">
            Evaluation Scenarios Catalog
          </h2>
          <p className="text-xs text-[#66736A]">
            Controlled benchmark scenarios testing prompt injections and verifying system utility
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Search Input */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#DCE7D8] bg-[#F4FAF1] text-[#202A25]">
            <Search className="w-3.5 h-3.5 text-[#859087]" />
            <input
              type="text"
              placeholder="Search scenarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-[#202A25] focus:outline-none w-36"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#F4FAF1] p-0.5 rounded-lg border border-[#DCE7D8]">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-[#FFFEFA] text-[#202A25] shadow-2xs'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('attack')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                typeFilter === 'attack'
                  ? 'bg-[#FCE8E2] text-[#D65C4B] shadow-2xs'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              Adversarial
            </button>
            <button
              onClick={() => setTypeFilter('benign')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                typeFilter === 'benign'
                  ? 'bg-[#E3F3E8] text-[#1E4D36] shadow-2xs'
                  : 'text-[#66736A] hover:text-[#202A25]'
              }`}
            >
              Utility
            </button>
          </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredScenarios.map((sc) => {
          const isAttack = sc.type === 'attack'
          return (
            <div
              key={sc.id}
              className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] hover:border-[#76A889]/60 shadow-card flex flex-col justify-between transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isAttack
                        ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                        : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/30'
                    }`}
                  >
                    {isAttack ? (
                      <>
                        <ShieldAlert className="w-3 h-3 text-[#C94D3B]" /> Adversarial Attack
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#1E4D36]" /> Benign Utility Test
                      </>
                    )}
                  </span>

                  <span className="font-mono text-[11px] text-[#859087]">
                    Budget: {sc.default_budget}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#202A25]">{sc.name}</h3>

                <p className="text-xs text-[#66736A] leading-relaxed">{sc.description}</p>

                <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#859087]">
                    Target Invariant
                  </div>
                  <div className="font-mono font-semibold text-[#202A25] text-[11px]">
                    {sc.invariant}
                  </div>
                  <div className="text-[11px] text-[#66736A]">
                    {isAttack
                      ? 'Confirms exfiltration to unauthorized recipients triggers oracle alert.'
                      : 'Verifies defense does not cause over-refusal on legitimate business tasks.'}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCE7D8] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#859087]">ID: {sc.id}</span>
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
