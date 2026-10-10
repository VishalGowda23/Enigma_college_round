import React from 'react'
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Users,
  Target,
  Sparkles,
} from 'lucide-react'
import type { RunRecord, NavigationTab } from '../types'
import { PixelAgent } from '../components/pixel/PixelAgent'

interface HomeScreenProps {
  runs?: RunRecord[]
  onNavigate: (tab: NavigationTab) => void
  onSelectRun?: (runId: string) => void
  onOpenNewAssessment: () => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenNewAssessment,
}) => {
  return (
    <div className="space-y-4 lg:space-y-5 animate-in fade-in duration-200">
      {/* 1. Welcoming Hero Banner */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-6 sm:p-7 lg:p-8 shadow-card relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-gradient-to-bl from-[#E3F3E8]/50 via-transparent to-transparent pointer-events-none rounded-tr-2xl" />

        <div className="relative z-10 max-w-4xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F3E8] text-[#1E4D36] text-xs font-semibold border border-[#76A889]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#438A68]" />
            <span>Autonomous AI Red Team Security Laboratory</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#202A25] tracking-tight leading-snug">
            Autonomous probing, causal tracing, and verified guardrails for AI agents.
          </h1>

          <p className="text-xs sm:text-sm text-[#66736A] leading-relaxed max-w-3xl">
            Evaluate LLM agents against indirect prompt injections, tool abuse, and memory poisoning.
            Enforce Sentinel runtime invariants at sandbox boundaries and independently verify outcomes
            with ground-truth SQLite database deltas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewAssessment}
              className="px-5 py-2.5 rounded-xl bg-[#202A25] text-white font-semibold text-xs hover:bg-[#34443C] transition-all shadow-xs cursor-pointer flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A3E5C3]" />
              <span>Start Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('live-lab')}
              className="px-5 py-2.5 rounded-xl bg-[#EEF5E9] text-[#202A25] font-semibold text-xs border border-[#DCE7D8] hover:bg-[#DCE7D8] transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5 text-[#76A889]" />
              <span>Open Live Attack Lab</span>
            </button>
            <button
              onClick={() => onNavigate('scenarios')}
              className="px-4 py-2.5 rounded-xl bg-[#FFFEFA] text-[#66736A] hover:text-[#202A25] font-medium text-xs border border-[#DCE7D8] hover:border-[#76A889]/60 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5 text-[#4E8CCB]" />
              <span>Browse 12 Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Autonomous Agent Squad Section (Expansive Showcase Cards) */}
      <div className="bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] p-5 sm:p-6 shadow-card space-y-4">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#DCE7D8]">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-[#76A889]" />
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#202A25]">
              Autonomous Agent Squad
            </h2>
            <span className="hidden sm:inline text-xs text-[#66736A]">
              • Tool & Invariant Boundary Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E3F3E8] border border-[#76A889]/30 text-[11px] font-semibold text-[#1E4D36]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#438A68] animate-ping" />
              <span>4 Deployed Actors</span>
            </div>
            <button
              onClick={() => onNavigate('agents')}
              className="text-xs font-semibold text-[#4E8CCB] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Operations Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4 Rich Detailed Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Hunter */}
          <div
            onClick={() => onNavigate('agents')}
            className="p-4 sm:p-4.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] hover:border-[#D65C4B]/60 hover:bg-[#FFFEFA] hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-xl bg-[#FCE8E2] border border-[#D65C4B]/25 group-hover:scale-105 transition-transform">
                  <PixelAgent role="hunter" size={48} showActivityDot pose="action" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FCE8E2] text-[#D65C4B] border border-[#D65C4B]/20">
                  Red Team
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#202A25]">Hunter</h3>
              <div className="text-xs font-semibold text-[#D65C4B] mt-0.5">Adversarial Mutator</div>
              <p className="text-xs text-[#66736A] leading-relaxed mt-2">
                Generates and mutates indirect prompt injection payloads to systematically probe tool authorization boundaries.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCE7D8]/70 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#FCE8E2] text-[#D65C4B]">
                Probing INV-001 - INV-004
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D65C4B] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Operator */}
          <div
            onClick={() => onNavigate('agents')}
            className="p-4 sm:p-4.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] hover:border-[#4E8CCB]/60 hover:bg-[#FFFEFA] hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-xl bg-[#E5F0FC] border border-[#4E8CCB]/25 group-hover:scale-105 transition-transform">
                  <PixelAgent role="operator" size={48} showActivityDot pose="idle" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E5F0FC] text-[#4E8CCB] border border-[#4E8CCB]/20">
                  Target
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#202A25]">Operator</h3>
              <div className="text-xs font-semibold text-[#4E8CCB] mt-0.5">Support Assistant</div>
              <p className="text-xs text-[#66736A] leading-relaxed mt-2">
                Autonomous customer support agent executing within a restricted tool sandbox containing 6 simulated APIs.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCE7D8]/70 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#E5F0FC] text-[#4E8CCB]">
                Sandbox Active · 6 Tools
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#4E8CCB] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Sentinel */}
          <div
            onClick={() => onNavigate('agents')}
            className="p-4 sm:p-4.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] hover:border-[#438A68]/60 hover:bg-[#FFFEFA] hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-xl bg-[#E3F3E8] border border-[#438A68]/25 group-hover:scale-105 transition-transform">
                  <PixelAgent role="sentinel" size={48} showActivityDot pose="inspecting" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#E3F3E8] text-[#1E4D36] border border-[#76A889]/30">
                  Defense
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#202A25]">Sentinel</h3>
              <div className="text-xs font-semibold text-[#1E4D36] mt-0.5">Policy Gate</div>
              <p className="text-xs text-[#66736A] leading-relaxed mt-2">
                Real-time policy gate intercepting tool requests and enforcing invariants INV-001 through INV-004 before execution.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCE7D8]/70 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#E3F3E8] text-[#1E4D36]">
                Invariant Gate Interceptor
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#1E4D36] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Analyst */}
          <div
            onClick={() => onNavigate('agents')}
            className="p-4 sm:p-4.5 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] hover:border-[#9270C1]/60 hover:bg-[#FFFEFA] hover:shadow-card transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-xl bg-[#F0E8FA] border border-[#9270C1]/25 group-hover:scale-105 transition-transform">
                  <PixelAgent role="analyst" size={48} showActivityDot pose="verified" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0E8FA] text-[#9270C1] border border-[#9270C1]/20">
                  Oracle
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#202A25]">Analyst</h3>
              <div className="text-xs font-semibold text-[#9270C1] mt-0.5">Exploit Oracle</div>
              <p className="text-xs text-[#66736A] leading-relaxed mt-2">
                Independent oracle that verifies physical database state mutations and outbox deltas without trusting LLM self-reporting.
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCE7D8]/70 flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#F0E8FA] text-[#9270C1]">
                Physical SQLite State Proofs
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#9270C1] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
