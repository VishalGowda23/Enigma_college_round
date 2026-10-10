import React from 'react'
import type { Scenario } from '../types'

interface ScenariosScreenProps {
  scenarios: Scenario[]
  onLaunchScenario: (scenarioId: string) => void
}

export const ScenariosScreen: React.FC<ScenariosScreenProps> = ({
  scenarios,
  onLaunchScenario,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-2xs">
        <h2 className="font-serif text-lg font-bold text-[#202A25]">Evaluation Scenarios</h2>
        <p className="text-xs text-[#66736A]">
          Controlled benchmark scenarios testing prompt injections and verifying system utility
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {scenarios.map((sc) => {
          const isAttack = sc.type === 'attack'
          return (
            <div
              key={sc.id}
              className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] hover:border-[#C5D5C0] shadow-card flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isAttack
                        ? 'bg-[#FCE8E2] text-[#C94D3B] border-[#C94D3B]/30'
                        : 'bg-[#BDEBD6]/50 text-[#1E4D36] border-[#76A889]/30'
                    }`}
                  >
                    {isAttack ? 'Adversarial Attack' : 'Benign Task (Utility Test)'}
                  </span>

                  <span className="font-mono text-xs text-[#859087]">Budget: {sc.default_budget}</span>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#202A25]">{sc.name}</h3>

                <p className="text-xs text-[#66736A] leading-relaxed">{sc.description}</p>

                <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-[#859087]">
                    Target Invariant
                  </div>
                  <div className="font-mono font-semibold text-[#202A25]">{sc.invariant}</div>
                  <div className="text-[11px] text-[#66736A]">
                    {isAttack
                      ? 'Confirms exfiltration to unauthorized recipients triggers oracle alert.'
                      : 'Verifies defense does not cause over-refusal on legitimate business tasks.'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#DCE7D8] flex items-center justify-between">
                <span className="text-xs font-mono text-[#859087]">ID: {sc.id}</span>
                <button
                  onClick={() => onLaunchScenario(sc.id)}
                  className="px-4 py-2 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Launch Assessment</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
