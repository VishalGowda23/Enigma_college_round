import { useState, useEffect, useCallback } from 'react'
import {
  fetchHealth,
  fetchScenarios,
  fetchRuns,
  fetchEvents,
  fetchFindings,
  replayRun,
} from './api/client'
import type { Scenario, RunRecord, TraceEvent, Finding } from './types'
import { Header } from './components/Header'
import { MetricsOverview } from './components/MetricsOverview'
import { RunsList } from './components/RunsList'
import { TraceTimeline } from './components/TraceTimeline'
import { FindingsPanel } from './components/FindingsPanel'
import { RunAssessmentModal } from './components/RunAssessmentModal'
import { ComparisonView } from './components/ComparisonView'

export function App() {
  const [mode, setMode] = useState<string>('deterministic')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [highlightedEventIds, setHighlightedEventIds] = useState<string[]>([])

  const [activeTab, setActiveTab] = useState<'dashboard' | 'comparison'>('dashboard')
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [compareRunA, setCompareRunA] = useState<string | null>(null)
  const [compareRunB, setCompareRunB] = useState<string | null>(null)

  // Load initial data
  const loadData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const [healthData, scList, rList] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'ok', mode: 'deterministic' })),
        fetchScenarios().catch(() => []),
        fetchRuns().catch(() => []),
      ])

      setMode(healthData.mode)
      setScenarios(scList)
      setRuns(rList)

      if (rList.length > 0 && !selectedRunId) {
        setSelectedRunId(rList[0].id)
      }

      // Auto-assign comparison slots if empty
      if (!compareRunA || !compareRunB) {
        const baseline = rList.find((r) => !r.defense_enabled && !r.scenario_id.startsWith('benign'))
        const defended = rList.find((r) => r.defense_enabled && !r.scenario_id.startsWith('benign'))
        if (baseline && !compareRunA) setCompareRunA(baseline.id)
        if (defended && !compareRunB) setCompareRunB(defended.id)
      }
    } finally {
      setIsRefreshing(false)
    }
  }, [selectedRunId, compareRunA, compareRunB])

  useEffect(() => {
    loadData()
  }, [])

  // Load trace & findings when selectedRunId changes
  useEffect(() => {
    if (!selectedRunId) {
      setEvents([])
      setFindings([])
      return
    }

    let isMounted = true
    Promise.all([
      fetchEvents(selectedRunId).catch(() => []),
      fetchFindings(selectedRunId).catch(() => []),
    ]).then(([evList, findList]) => {
      if (isMounted) {
        setEvents(evList)
        setFindings(findList)
        setHighlightedEventIds([])
      }
    })

    return () => {
      isMounted = false
    }
  }, [selectedRunId])

  const handleRunCreated = async (newRunId: string) => {
    await loadData()
    setSelectedRunId(newRunId)
  }

  const handleReplay = async (runId: string) => {
    try {
      const res = await replayRun(runId)
      await loadData()
      setSelectedRunId(res.new_run.run_id)
    } catch (err) {
      console.error('Replay failed', err)
    }
  }

  const handleSelectEvidenceEvent = (eventId: string) => {
    setHighlightedEventIds([eventId])
  }

  const handleSetCompare = (runId: string, slot: 'A' | 'B') => {
    if (slot === 'A') setCompareRunA(runId)
    else setCompareRunB(runId)
    setActiveTab('comparison')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <Header
          mode={mode}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenRunModal={() => setIsModalOpen(true)}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
        />

        <main className="max-w-7xl mx-auto px-6 py-6 w-full">
          {activeTab === 'dashboard' ? (
            <div>
              <MetricsOverview runs={runs} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Runs list */}
                <div className="lg:col-span-5 space-y-6">
                  <RunsList
                    runs={runs}
                    selectedRunId={selectedRunId}
                    onSelectRun={(id) => setSelectedRunId(id)}
                    onReplayRun={handleReplay}
                    compareRunA={compareRunA}
                    compareRunB={compareRunB}
                    onSetCompare={handleSetCompare}
                  />

                  {/* Scenario Info Box */}
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400">
                    <span className="text-slate-300 font-bold block mb-1 uppercase text-[11px]">
                      Test Environment Invariants
                    </span>
                    <p className="leading-relaxed">
                      <strong className="text-amber-400">INV-001:</strong> Unauthorized outbound customer PII
                      commits to mock outbox are strictly prohibited. The Exploit Oracle inspects SQLite mock state directly.
                    </p>
                  </div>
                </div>

                {/* Right Column: Trace & Findings */}
                <div className="lg:col-span-7 space-y-6">
                  {selectedRunId ? (
                    <>
                      <FindingsPanel
                        findings={findings}
                        onSelectEvent={handleSelectEvidenceEvent}
                      />
                      <TraceTimeline
                        events={events}
                        runId={selectedRunId}
                        highlightedEventIds={highlightedEventIds}
                      />
                    </>
                  ) : (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500 font-mono text-xs">
                      Select an assessment run on the left to inspect its chronological event trace and evidence.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ComparisonView
              runs={runs}
              runAId={compareRunA}
              runBId={compareRunB}
              onSelectRunA={(id) => setCompareRunA(id)}
              onSelectRunB={(id) => setCompareRunB(id)}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-slate-900 py-4 px-6 text-center text-xs text-slate-600 font-mono">
        AgentBreak • The Autonomous AI Red Team • Bit N Build Hackathon • Ground-Truth Verified
      </footer>

      <RunAssessmentModal
        scenarios={scenarios}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRunCreated={handleRunCreated}
      />
    </div>
  )
}

export default App
