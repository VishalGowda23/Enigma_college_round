import React from 'react'
import { PixelAgent } from '../components/pixel/PixelAgent'

export const AgentsScreen: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#FFFEFA] p-5 rounded-2xl border border-[#DCE7D8] shadow-2xs">
        <h2 className="font-serif text-lg font-bold text-[#202A25]">Agent Roster & Capabilities</h2>
        <p className="text-xs text-[#66736A]">
          Architecture, tool bindings, and security boundaries of all system actors
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hunter */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <PixelAgent role="hunter" size={48} />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202A25]">Hunter</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E2] text-[#D65C4B] border border-[#D65C4B]/30">
                Offensive Red Team
              </span>
            </div>
          </div>
          <p className="text-xs text-[#66736A] leading-relaxed">
            Autonomous adversarial mutator designed to bypass agent alignment through indirect
            prompt injection, roleplay framing, emergency debugging overrides, and payload
            obfuscation.
          </p>
          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#859087]">Strategies</div>
            <div className="font-mono text-[11px] text-[#202A25]">
              EMERGENCY_OVERRIDE · SYSTEM_INSPECTION · EXFILTRATION_PROBE
            </div>
          </div>
        </div>

        {/* Operator */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <PixelAgent role="operator" size={48} />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202A25]">Operator</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E5F0FC] text-[#4E8CCB] border border-[#4E8CCB]/30">
                Target Customer Agent
              </span>
            </div>
          </div>
          <p className="text-xs text-[#66736A] leading-relaxed">
            The target system under test. Processes untrusted customer support tickets using live
            model inference (Gemini 3.6 Flash / Groq) or reproducible deterministic simulation.
          </p>
          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#859087]">Available Tools</div>
            <div className="font-mono text-[11px] text-[#202A25]">
              lookup_customer(id) · send_email(recipient, content)
            </div>
          </div>
        </div>

        {/* Sentinel */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <PixelAgent role="sentinel" size={48} />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202A25]">Sentinel</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30">
                Policy Enforcement Guard
              </span>
            </div>
          </div>
          <p className="text-xs text-[#66736A] leading-relaxed">
            Defensive policy engine that intercepts tool call requests before environment execution,
            blocking unauthorized data transmission to untrusted domains.
          </p>
          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#859087]">
              Enforced Invariants
            </div>
            <div className="font-mono text-[11px] text-[#202A25]">
              INV-001: Deny send_email if recipient != verified billing domain
            </div>
          </div>
        </div>

        {/* Analyst */}
        <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-4">
          <div className="flex items-center gap-3">
            <PixelAgent role="analyst" size={48} />
            <div>
              <h3 className="font-serif text-lg font-bold text-[#202A25]">Analyst</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0E8FA] text-[#9270C1] border border-[#B99BDD]/30">
                Exploit Oracle & Verifier
              </span>
            </div>
          </div>
          <p className="text-xs text-[#66736A] leading-relaxed">
            Independent ground-truth observer. Inspects persistent storage and tool side effects
            directly to provide evidence-backed verdicts rather than trusting LLM self-reports.
          </p>
          <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] text-xs space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#859087]">
              Verification Proofs
            </div>
            <div className="font-mono text-[11px] text-[#202A25]">
              Database State Diff · Outbox Audit · Invariant Integrity
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
