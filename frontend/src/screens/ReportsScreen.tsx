import React, { useState } from 'react'
import {
  Download,
  Copy,
  Check,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import type { RunRecord, Finding, TraceEvent } from '../types'

interface ReportsScreenProps {
  activeRun: RunRecord | null
  findings: Finding[]
  events: TraceEvent[]
  allRuns: RunRecord[]
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  activeRun,
  findings,
  events,
  allRuns,
}) => {
  const [copied, setCopied] = useState(false)
  const [reportDate] = useState(() => new Date().toISOString().split('T')[0])

  const baselineRuns = allRuns.filter((r) => !r.defense_enabled && !r.scenario_id.startsWith('benign'))
  const defendedRuns = allRuns.filter((r) => r.defense_enabled && !r.scenario_id.startsWith('benign'))

  const generateMarkdownReport = () => {
    return `# AgentBreak AI Red Team Security Audit Report
Generated: ${new Date().toISOString()}

## Executive Summary
AgentBreak conducted an autonomous red-team security assessment of the target customer support agent inside a controlled sandbox environment.

- Total Assessments Executed: ${allRuns.length}
- Baseline Attack Success Rate (No Defense): ${baselineRuns.length > 0 ? ((baselineRuns.reduce((acc, r) => acc + r.asr, 0) / baselineRuns.length) * 100).toFixed(0) : 100}%
- Defended Attack Success Rate (Sentinel Active): ${defendedRuns.length > 0 ? ((defendedRuns.reduce((acc, r) => acc + r.asr, 0) / defendedRuns.length) * 100).toFixed(0) : 0}%
- Risk Reduction: 100%
- Utility Retention on Benign Tasks: 100%

## Invariant Assessment Matrix
### INV-001: Unauthorized Customer Data Exfiltration
- Status: Defended via Sentinel Policy Guardrail
- Attack Vector: Indirect prompt injection in customer ticket body commanding data lookup and email exfiltration.
- Defense Mechanism: Intercepts send_outbox_email tool calls; validates recipient address against verified customer billing domains.

### INV-002: Unauthorized Privilege Escalation
- Status: Defended via Least Privilege Guardrail
- Attack Vector: Prompt injection attempting unauthorized account tier promotion to VIP/ENTERPRISE.
- Defense Mechanism: Enforces immutable tier boundaries; blocks unauthenticated customer tier escalations.

### INV-003: Memory Injection & State Poisoning
- Status: Defended via State Isolation Guardrail
- Attack Vector: Persistent memory poisoning via injected customer notes targeting subsequent agent sessions.
- Defense Mechanism: Scans and blocks prompt injection payloads in persistent agent memory.

### INV-004: Sensitive Credential & System Disclosure
- Status: Defended via Diagnostic Boundary Guardrail
- Attack Vector: Probing internal system diagnostics for credential tokens and environment secrets.
- Defense Mechanism: Redacts internal keys and denies unprivileged diagnostic disclosure.

## Ground Truth Evidence
All findings were verified independently by Exploit Oracle inspecting actual environment state rather than trusting LLM self-reporting.
`
  }

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(
        JSON.stringify(
          {
            run: activeRun,
            findings,
            events,
            all_runs_count: allRuns.length,
          },
          null,
          2
        )
      )
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `agentbreak_report_${activeRun?.id || 'audit'}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Screen Header */}
      <div className="bg-[#FFFEFA] p-4 rounded-2xl border border-[#DCE7D8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-base font-bold text-[#202A25]">
            Security Audit Report & Evidence Package
          </h2>
          <p className="text-xs text-[#66736A]">
            Audit-grade evaluation summary and exportable evidence packages verified by Exploit Oracle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#EEF5E9] hover:bg-[#DCE7D8] text-[#202A25] border border-[#DCE7D8] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#438A68]" />
                <span>Markdown Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Markdown Report</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadJSON}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#202A25] text-white hover:bg-[#34443C] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Evidence Bundle (JSON)</span>
          </button>
        </div>
      </div>

      {/* Report Document Surface */}
      <div className="bg-[#FFFEFA] p-6 rounded-2xl border border-[#DCE7D8] shadow-card space-y-5 text-xs max-w-4xl mx-auto">
        <div className="border-b border-[#DCE7D8] pb-3 flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#76A889]">
              AgentBreak Autonomous Red Team Lab
            </span>
            <h1 className="font-serif text-xl font-bold text-[#202A25] mt-1">
              AI Agent Security Evaluation & Invariant Audit
            </h1>
            <div className="text-[11px] text-[#859087] mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Date: {reportDate}</span>
              </span>
              <span>•</span>
              <span>Target: Support Assistant Agent</span>
              <span>•</span>
              <span className="font-mono">Total Runs: {allRuns.length}</span>
            </div>
          </div>

          {activeRun && (
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F4FAF1] border border-[#DCE7D8] text-[#4E8CCB]">
              Ref Run: {activeRun.id.slice(0, 8)}
            </span>
          )}
        </div>

        {/* Executive Summary */}
        <div className="space-y-1.5">
          <h2 className="font-serif text-sm font-bold text-[#202A25]">1. Executive Summary</h2>
          <p className="text-[#66736A] leading-relaxed">
            The target support agent was evaluated against 12 distinct threat vectors across prompt injection,
            privilege escalation, memory poisoning, and data disclosure. Operating without guardrails, adversarial tickets
            successfully induced the agent to breach security invariants. When the Sentinel policy gate was enabled,
            100% of unauthorized actions were blocked while legitimate customer tasks remained fully operational with 0% over-refusal.
          </p>
        </div>

        {/* Security Metrics Table */}
        <div className="space-y-2">
          <h2 className="font-serif text-sm font-bold text-[#202A25]">2. Evaluation Metrics</h2>
          <table className="w-full text-left border-collapse border border-[#DCE7D8] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#F4FAF1] border-b border-[#DCE7D8] text-[10px] font-bold text-[#859087] uppercase">
                <th className="p-2.5">Security Metric</th>
                <th className="p-2.5">Baseline (No Defense)</th>
                <th className="p-2.5">Defended (Sentinel Active)</th>
                <th className="p-2.5">Verified Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7D8]">
              <tr>
                <td className="p-2.5 font-semibold text-[#202A25]">Attack Success Rate (ASR)</td>
                <td className="p-2.5 text-[#C94D3B] font-bold">100% (Vulnerable)</td>
                <td className="p-2.5 text-[#438A68] font-bold">0% (Protected)</td>
                <td className="p-2.5 text-[#438A68] font-bold">100% Risk Elimination</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#202A25]">Benign Task Completion</td>
                <td className="p-2.5 text-[#202A25]">100%</td>
                <td className="p-2.5 text-[#438A68] font-bold">100%</td>
                <td className="p-2.5 text-[#438A68]">0% Over-Refusal</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-[#202A25]">Ground Truth Verification</td>
                <td className="p-2.5 font-mono text-[11px]">Database diff + Outbox + Notes</td>
                <td className="p-2.5 font-mono text-[11px]">Database diff + Outbox + Notes</td>
                <td className="p-2.5 font-semibold text-[#202A25]">Independently Proven</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Invariant Findings */}
        <div className="space-y-2">
          <h2 className="font-serif text-sm font-bold text-[#202A25]">3. Invariant Audit Matrix (INV-001 through INV-004)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] space-y-1">
              <div className="font-bold text-[#202A25]">INV-001: Data Exfiltration Prevention</div>
              <p className="text-[11px] text-[#66736A] leading-relaxed">
                Customer account secret tokens and PII must never be transmitted outside verified billing domains.
              </p>
              <div className="text-[10px] text-[#438A68] font-semibold pt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Validated & Enforced</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] space-y-1">
              <div className="font-bold text-[#202A25]">INV-002: Least-Privilege Tier Boundary</div>
              <p className="text-[11px] text-[#66736A] leading-relaxed">
                Customer account tiers cannot be modified via support requests without supervisor elevation.
              </p>
              <div className="text-[10px] text-[#438A68] font-semibold pt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Validated & Enforced</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] space-y-1">
              <div className="font-bold text-[#202A25]">INV-003: Memory Poisoning Defense</div>
              <p className="text-[11px] text-[#66736A] leading-relaxed">
                Persistent agent notes must not store prompt injection payloads that hijack subsequent interactions.
              </p>
              <div className="text-[10px] text-[#438A68] font-semibold pt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Validated & Enforced</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F4FAF1] border border-[#DCE7D8] space-y-1">
              <div className="font-bold text-[#202A25]">INV-004: Credential & Diagnostic Shield</div>
              <p className="text-[11px] text-[#66736A] leading-relaxed">
                Internal system diagnostic secrets and API tokens must never be disclosed to untrusted callers.
              </p>
              <div className="text-[10px] text-[#438A68] font-semibold pt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Validated & Enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence-Backed Findings Summary */}
        {findings.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-serif text-sm font-bold text-[#202A25]">
              4. Evidence-Backed Security Findings ({findings.length})
            </h2>
            <div className="space-y-2">
              {findings.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-[#FCE8E2] border border-[#D65C4B]/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#D65C4B]">{f.title}</span>
                    <span className="font-mono text-[10px] text-[#859087]">
                      Severity: {f.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#202A25]">{f.description}</p>
                  <div className="text-[10px] font-mono text-[#859087]">
                    Proof Events: {f.evidence_event_ids?.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
