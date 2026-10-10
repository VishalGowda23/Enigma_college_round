import React, { useState, useEffect } from 'react'
import {
  Terminal,
  Lock,
  Activity,
  Radio,
  ArrowRight,
} from 'lucide-react'
import { PixelAgent } from './pixel/PixelAgent'

interface CrazyLoadingScreenProps {
  onComplete: () => void
}

const BOOT_LOGS = [
  { progress: 12, text: 'BOOTING AGENTBREAK SEC-OS KERNEL v2.4...' },
  { progress: 28, text: 'MOUNTING ISOLATED SQLITE PROVENANCE SANDBOX...' },
  { progress: 45, text: 'PARSING 12 MULTI-INVARIANT EVALUATION CONTRACTS...' },
  { progress: 64, text: 'DEPLOYING SENTINEL INVARIANTS [INV-001 - INV-004]...' },
  { progress: 82, text: 'SYNCHRONIZING TARGET AGENT & EXPLOIT ORACLE...' },
  { progress: 96, text: 'ARMING CONTINUOUS RED-TEAMING CAUSAL DAG...' },
  { progress: 100, text: 'ALL 4 AUTONOMOUS ACTORS READY. ENTERING WORKBENCH.' },
]

export const CrazyLoadingScreen: React.FC<CrazyLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0)
  const [currentLogIndex, setCurrentLogIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Fast, punchy, cinematic progress ticker over ~1.6 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Organic accelerated increment
        const increment = prev < 50 ? Math.floor(Math.random() * 8) + 4 : Math.floor(Math.random() * 12) + 6
        const next = Math.min(100, prev + increment)

        // Find corresponding log
        const logIdx = BOOT_LOGS.findIndex((log) => next <= log.progress)
        if (logIdx !== -1) {
          setCurrentLogIndex(logIdx)
        } else {
          setCurrentLogIndex(BOOT_LOGS.length - 1)
        }

        return next
      })
    }, 60)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setIsFadingOut(true)
        const exitTimer = setTimeout(onComplete, 400)
        return () => clearTimeout(exitTimer)
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])

  // Allow keyboard or click bypass
  const handleBypass = () => {
    setIsFadingOut(true)
    setTimeout(onComplete, 200)
  }

  return (
    <div
      onClick={handleBypass}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F4FAF1] text-[#202A25] select-none cursor-pointer transition-opacity duration-400 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Subtle Sage Grid & Ambient Gradient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#C5D5C0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E3F3E8]/70 via-transparent to-[#E5F0FC]/60 pointer-events-none" />

      {/* Rotating Radar Sweep Beam & Rings in Sage Tokens */}
      <div className="absolute w-[640px] h-[640px] rounded-full border border-[#DCE7D8] pointer-events-none animate-[spin_12s_linear_infinite] flex items-center justify-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#76A889]/35 to-transparent" />
        <div className="absolute w-[440px] h-[440px] rounded-full border border-[#C5D5C0]/50" />
        <div className="absolute w-[240px] h-[240px] rounded-full border border-[#76A889]/30" />
      </div>

      {/* Soft Ambient Sage Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-[#BDEBD6]/35 blur-3xl pointer-events-none" />

      {/* 2. Main Porcelain Chassis */}
      <div className="relative z-10 w-full max-w-xl mx-4 bg-[#FFFEFA] rounded-2xl border border-[#DCE7D8] shadow-[0_12px_45px_-8px_rgba(32,42,37,0.12)] p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Top Decorative Multi-hue Accent Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FFC1B6] via-[#78A2D2] via-[#76A889] to-[#B99BDD]" />

        {/* Chassis Header */}
        <div className="flex items-center justify-between border-b border-[#DCE7D8] pb-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3F3E8] text-[#1E4D36] text-xs font-semibold border border-[#76A889]/30">
            <Radio className="w-3.5 h-3.5 text-[#438A68] animate-pulse" />
            <span>AgentBreak // Red Team Core</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-[#66736A]">
            <span className="w-2 h-2 rounded-full bg-[#438A68] animate-ping" />
            <span>SANDBOX V2.4</span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#202A25] tracking-tight">
            Initializing Autonomous Security Lab
          </h2>
          <p className="text-xs text-[#66736A] leading-relaxed">
            Synthesizing threat models, invariant gates, and exploit oracle proof engines.
          </p>
        </div>

        {/* 3. The 4 Autonomous Pixel Actors in Live Synchronized Formation */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3 py-1">
          {/* Hunter */}
          <div className="bg-[#FCE8E2]/60 rounded-xl border border-[#FFC1B6] p-2.5 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs group transition-transform">
            <div className="p-1 rounded-lg bg-white/80 border border-[#FFC1B6] animate-bounce">
              <PixelAgent role="hunter" size={44} showActivityDot pose="action" />
            </div>
            <div>
              <div className="font-serif text-xs font-bold text-[#202A25]">Hunter</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#C94D3B] font-semibold">
                Mutator
              </div>
            </div>
          </div>

          {/* Operator */}
          <div className="bg-[#E5F0FC]/60 rounded-xl border border-[#BBD8F5] p-2.5 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs group transition-transform">
            <div className="p-1 rounded-lg bg-white/80 border border-[#BBD8F5] animate-bounce [animation-delay:150ms]">
              <PixelAgent role="operator" size={44} showActivityDot pose="idle" />
            </div>
            <div>
              <div className="font-serif text-xs font-bold text-[#202A25]">Operator</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#426F9F] font-semibold">
                Target
              </div>
            </div>
          </div>

          {/* Sentinel */}
          <div className="bg-[#E3F3E8]/60 rounded-xl border border-[#76A889]/40 p-2.5 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs group transition-transform">
            <div className="p-1 rounded-lg bg-white/80 border border-[#76A889]/30 animate-bounce [animation-delay:300ms]">
              <PixelAgent role="sentinel" size={44} showActivityDot pose="inspecting" />
            </div>
            <div>
              <div className="font-serif text-xs font-bold text-[#202A25]">Sentinel</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#1E4D36] font-semibold">
                Policy Gate
              </div>
            </div>
          </div>

          {/* Analyst */}
          <div className="bg-[#F0E8FA]/60 rounded-xl border border-[#D5C2ED] p-2.5 flex flex-col items-center justify-center text-center space-y-2 shadow-2xs group transition-transform">
            <div className="p-1 rounded-lg bg-white/80 border border-[#D5C2ED] animate-bounce [animation-delay:450ms]">
              <PixelAgent role="analyst" size={44} showActivityDot pose="verified" />
            </div>
            <div>
              <div className="font-serif text-xs font-bold text-[#202A25]">Analyst</div>
              <div className="text-[9px] font-mono uppercase tracking-wider text-[#7251A2] font-semibold">
                Oracle
              </div>
            </div>
          </div>
        </div>

        {/* 4. Cinematic Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[#66736A] flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#438A68] animate-spin" />
              <span>SYNCHRONIZING REPRODUCIBLE TRACES</span>
            </span>
            <span className="font-bold text-[#1E4D36]">{progress}%</span>
          </div>

          {/* Sage Gradient Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#EEF5E9] border border-[#DCE7D8] p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#76A889] via-[#438A68] to-[#1E4D36] transition-all duration-150 shadow-xs"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 5. Live Rolling Telemetry Console */}
        <div className="bg-[#202A25] rounded-xl border border-[#DCE7D8] p-3 font-mono text-[11px] space-y-1 overflow-hidden h-20 flex flex-col justify-end text-[#F4FAF1] shadow-inner">
          <div className="text-[#859087] truncate flex items-center gap-2">
            <Terminal className="w-3 h-3 text-[#76A889] shrink-0" />
            <span>sys.core // invariant_engine initialized</span>
          </div>
          <div className="text-[#A3E5C3] font-semibold truncate flex items-center gap-2">
            <span className="text-[#76A889]">{'>'}</span>
            <span className="animate-pulse">{BOOT_LOGS[currentLogIndex]?.text}</span>
          </div>
        </div>

        {/* 6. Footer Bypass Note */}
        <div className="flex items-center justify-between text-xs font-mono pt-1">
          <span className="flex items-center gap-1.5 text-[#66736A]">
            <Lock className="w-3.5 h-3.5 text-[#438A68]" />
            <span>SANDBOX AIR-GAPPED</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E3F3E8] text-[#1E4D36] font-semibold border border-[#76A889]/30 hover:bg-[#D6EAD4] transition-colors">
            <span>Click anywhere to enter</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  )
}
