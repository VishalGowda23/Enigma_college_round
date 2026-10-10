import { useState, useEffect, useCallback } from 'react'
import { Home, Zap, Users, Network, Menu } from 'lucide-react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false)

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
    <div className="h-screen bg-[#F4FAF1] text-[#202A25] flex flex-col lg:flex-row overflow-hidden">
      {/* Navigation Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        executionMode={activeRun?.execution_mode || mode}
        provider={activeRun?.provider}
        activeRunCount={runs.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar
          currentTab={currentTab}
          activeRun={activeRun}
          onOpenNewAssessment={() => setIsModalOpen(true)}
          onReplayCurrent={activeRun ? handleReplayCurrent : undefined}
          onToggleDefenseRerun={activeRun ? handleToggleDefenseRerun : undefined}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5 lg:py-3 pb-20 lg:pb-3.5 max-w-7xl w-full mx-auto min-h-0">
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
              onReplayCurrent={activeRun ? handleReplayCurrent : undefined}
              onNavigateToEvidence={() => setCurrentTab('evidence')}
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

          {currentTab === 'agents' && (
            <AgentsScreen
              activeRun={activeRun}
              events={events}
              onNavigate={setCurrentTab}
              onSelectEvent={setSelectedEventId}
            />
          )}

          {currentTab === 'evidence' && (
            <EvidenceScreen
              activeRun={activeRun}
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

      {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens only) */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 bg-[#FFFEFA]/95 backdrop-blur-md border-t border-[#DCE7D8] z-40 flex items-center justify-around py-2 px-1 shadow-lg select-none"
      >
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-[#1E4D36] bg-[#E3F3E8]' : 'text-[#66736A] hover:text-[#202A25]'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setCurrentTab('live-lab')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer relative ${
            currentTab === 'live-lab' ? 'text-[#1E4D36] bg-[#E3F3E8]' : 'text-[#66736A] hover:text-[#202A25]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Live Lab</span>
          {runs.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#D65C4B] absolute top-1 right-2 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setCurrentTab('agents')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            currentTab === 'agents' ? 'text-[#1E4D36] bg-[#E3F3E8]' : 'text-[#66736A] hover:text-[#202A25]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Agents</span>
        </button>

        <button
          onClick={() => setCurrentTab('evidence')}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
            currentTab === 'evidence' ? 'text-[#1E4D36] bg-[#E3F3E8]' : 'text-[#66736A] hover:text-[#202A25]'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Evidence</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-[#66736A] hover:text-[#202A25] transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* Slide-out Forensic Event Details Drawer (Never open on reload; only open when explicitly opened) */}
      <EventDetailsDrawer
        isOpen={isDrawerOpen}
        event={selectedEvent}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedEventId(null)
        }}
        allEvents={events}
        onSelectEvent={(id) => {
          setSelectedEventId(id)
          setIsDrawerOpen(true)
        }}
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
