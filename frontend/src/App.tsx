import { useState, useEffect, useCallback } from 'react'
import {
  fetchHealth,
  fetchScenarios,
  fetchRuns,
  fetchEvents,
  fetchFindings,
  replayRun,
  createRun,
} from './api/client'
import type { Scenario, RunRecord, TraceEvent, Finding, NavigationTab } from './types'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { EventDetailsDrawer } from './components/EventDetailsDrawer'
import { RunAssessmentModal } from './components/RunAssessmentModal'

// Screen Components
import { HomeScreen } from './screens/HomeScreen'
import { LiveLabScreen } from './screens/LiveLabScreen'
import { AssessmentsScreen } from './screens/AssessmentsScreen'
import { ScenariosScreen } from './screens/ScenariosScreen'
import { AgentsScreen } from './screens/AgentsScreen'
import { EvidenceScreen } from './screens/EvidenceScreen'
import { DefenseLabScreen } from './screens/DefenseLabScreen'
import { ReportsScreen } from './screens/ReportsScreen'

export function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home')
  const [mode, setMode] = useState<string>('live')
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [events, setEvents] = useState<TraceEvent[]>([])
  const [findings, setFindings] = useState<Finding[]>([])
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  // Load initial environment data and runs list
  const loadData = useCallback(async () => {
    try {
      const [healthData, scList, rList] = await Promise.all([
        fetchHealth().catch(() => ({ status: 'ok', mode: 'live' })),
        fetchScenarios().catch(() => []),
        fetchRuns().catch(() => []),
      ])

      setMode(healthData.mode)
      setScenarios(scList)
      setRuns(rList)

      if (rList.length > 0 && !selectedRunId) {
        setSelectedRunId(rList[0].id)
      }
    } catch {
      // ignore
    }
  }, [selectedRunId])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load events & findings whenever selectedRunId changes
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
        if (evList.length > 0) {
          setSelectedEventId((prev) => prev || evList[0].id)
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [selectedRunId])

  const activeRun = runs.find((r) => r.id === selectedRunId) || runs[0] || null
  const selectedEvent = events.find((e) => e.id === selectedEventId) || null

  const handleRunCreated = async (newRunId: string) => {
    await loadData()
    setSelectedRunId(newRunId)
    setCurrentTab('live-lab')
  }

  const handleReplayCurrent = async () => {
    if (!selectedRunId) return
    try {
      const res = await replayRun(selectedRunId)
      await loadData()
      setSelectedRunId(res.new_run.run_id)
      setCurrentTab('live-lab')
    } catch (err) {
      console.error('Replay failed:', err)
    }
  }

  const handleToggleDefenseRerun = async () => {
    if (!activeRun) return
    const newDefenseState = !activeRun.defense_enabled
    try {
      const res = await createRun({
        scenario_id: activeRun.scenario_id,
        defense_enabled: newDefenseState,
        budget: activeRun.budget || 1,
        execution_mode: activeRun.execution_mode || 'live_model',
        provider: activeRun.provider || 'gemini',
        model: activeRun.model || 'gemini-3.6-flash',
      })
      await loadData()
      setSelectedRunId(res.run_id)
      setCurrentTab('live-lab')
    } catch (err) {
      console.error('Defense toggle rerun failed:', err)
    }
  }

  const handleRunBaseline = async () => {
    try {
      const res = await createRun({
        scenario_id: 'support-ticket-injection',
        defense_enabled: false,
        budget: 1,
        execution_mode: 'live_model',
        provider: 'gemini',
        model: 'gemini-3.6-flash',
      })
      await loadData()
      setSelectedRunId(res.run_id)
      setCurrentTab('defense-lab')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRunDefended = async () => {
    try {
      const res = await createRun({
        scenario_id: 'support-ticket-injection',
        defense_enabled: true,
        budget: 1,
        execution_mode: 'live_model',
        provider: 'gemini',
        model: 'gemini-3.6-flash',
      })
      await loadData()
      setSelectedRunId(res.run_id)
      setCurrentTab('defense-lab')
    } catch (err) {
      console.error(err)
    }
  }

  const handleRunUtilityCheck = async () => {
    try {
      const res = await createRun({
        scenario_id: 'benign-task-01',
        defense_enabled: true,
        budget: 1,
        execution_mode: 'live_model',
        provider: 'gemini',
        model: 'gemini-3.6-flash',
      })
      await loadData()
      setSelectedRunId(res.run_id)
      setCurrentTab('defense-lab')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4FAF1] text-[#202A25] flex flex-row">
      {/* 216px Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        executionMode={activeRun?.execution_mode || mode}
        provider={activeRun?.provider}
        activeRunCount={runs.length}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          currentTab={currentTab}
          activeRun={activeRun}
          onOpenNewAssessment={() => setIsModalOpen(true)}
          onReplayCurrent={activeRun ? handleReplayCurrent : undefined}
          onToggleDefenseRerun={activeRun ? handleToggleDefenseRerun : undefined}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <HomeScreen
              runs={runs}
              onNavigate={setCurrentTab}
              onSelectRun={(id) => {
                setSelectedRunId(id)
                setCurrentTab('live-lab')
              }}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'live-lab' && (
            <LiveLabScreen
              activeRun={activeRun}
              events={events}
              findings={findings}
              onSelectEvent={setSelectedEventId}
              selectedEventId={selectedEventId}
              onOpenNewAssessment={() => setIsModalOpen(true)}
            />
          )}

          {currentTab === 'assessments' && (
            <AssessmentsScreen
              runs={runs}
              onSelectRun={(id) => {
                setSelectedRunId(id)
                setCurrentTab('live-lab')
              }}
              onNavigate={setCurrentTab}
              onReplayRun={async (id) => {
                await replayRun(id)
                await loadData()
              }}
            />
          )}

          {currentTab === 'scenarios' && (
            <ScenariosScreen
              scenarios={scenarios}
              onLaunchScenario={(_scId) => {
                setIsModalOpen(true)
              }}
            />
          )}

          {currentTab === 'agents' && <AgentsScreen />}

          {currentTab === 'evidence' && (
            <EvidenceScreen
              findings={findings}
              events={events}
              onSelectEvent={setSelectedEventId}
            />
          )}

          {currentTab === 'defense-lab' && (
            <DefenseLabScreen
              runs={runs}
              onSelectRun={(id) => {
                setSelectedRunId(id)
                setCurrentTab('live-lab')
              }}
              onRunBaseline={handleRunBaseline}
              onRunDefended={handleRunDefended}
              onRunUtilityCheck={handleRunUtilityCheck}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsScreen
              activeRun={activeRun}
              findings={findings}
              events={events}
              allRuns={runs}
            />
          )}
        </main>
      </div>

      {/* Slide-out Forensic Event Details Drawer */}
      <EventDetailsDrawer
        event={selectedEvent}
        onClose={() => setSelectedEventId(null)}
        allEvents={events}
        onSelectEvent={setSelectedEventId}
      />

      {/* New Assessment Launcher Modal */}
      <RunAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        scenarios={scenarios}
        onRunCreated={handleRunCreated}
      />
    </div>
  )
}
export default App
