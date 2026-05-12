import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import AssignmentTrackerSheet from './components/AssignmentTrackerSheet'
import HabitTrackerSheet from './components/HabitTrackerSheet'
import ReportDashboard from './components/ReportDashboard'
import { useAppStore } from './store/useAppStore'

export default function App() {
  const [activeTab, setActiveTab] = useState('Assignment')
  const hasHydrated = useAppStore((state) => state.hasHydrated)
  const lastSaved = useAppStore((state) => state.lastSaved)
  const saveStatus = !hasHydrated
    ? 'Restoring data...'
    : lastSaved
      ? `Saved ${formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}`
      : 'Autosave ready'

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* App Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-sheet-border bg-white text-xs text-slate-700">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="font-bold text-slate-900 whitespace-nowrap">Momentum Workspace</div>
          {['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions', 'Help'].map(item => (
            <span 
              key={item} 
              className="hidden sm:inline-flex px-2 py-1 rounded text-slate-500"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 whitespace-nowrap">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          {saveStatus}
        </div>
      </div>
      
      {/* Workbook context bar */}
      <div className="flex items-center px-2 py-1 border-b border-sheet-border bg-white text-xs">
        <div className="border border-sheet-border px-2 py-1 w-24 bg-white font-mono text-center flex-shrink-0">
          {activeTab}
        </div>
        <div className="mx-2 text-slate-400 font-bold italic border-r border-slate-300 pr-2">fx</div>
        <div className="flex-1 px-2 py-1 text-slate-500">
          Local autosave is active. Data stays on this device and restores automatically.
        </div>
      </div>

      {/* Main Sheet Content */}
      <div className="flex-1 overflow-hidden relative bg-[#f1f5f9]">
        {activeTab === 'Assignment' && <AssignmentTrackerSheet />}
        {activeTab === 'Habit' && <HabitTrackerSheet />}
        {activeTab === 'Report' && <ReportDashboard />}
      </div>

      {/* Bottom Tabs */}
      <div className="h-9 border-t border-sheet-border bg-sheet-header-bg flex items-center px-2 text-xs select-none z-50 relative">
        <div className="flex gap-1 h-full">
          <button 
            onClick={() => setActiveTab('Assignment')}
            className={`px-4 h-full flex items-center border-x border-t border-transparent ${activeTab === 'Assignment' ? 'bg-white font-bold text-teal-700 border-sheet-border shadow-[0_-1px_0_0_#0f9d58]' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Assignment Tracker
          </button>
          <button 
            onClick={() => setActiveTab('Habit')}
            className={`px-4 h-full flex items-center border-x border-t border-transparent ${activeTab === 'Habit' ? 'bg-white font-bold text-teal-700 border-sheet-border shadow-[0_-1px_0_0_#0f9d58]' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Habit Tracker
          </button>
          <button 
            onClick={() => setActiveTab('Report')}
            className={`px-4 h-full flex items-center border-x border-t border-transparent ${activeTab === 'Report' ? 'bg-white font-bold text-teal-700 border-sheet-border shadow-[0_-1px_0_0_#0f9d58]' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            Dashboard Report
          </button>
        </div>
        <div className="flex-1 border-b border-transparent"></div>
      </div>
    </div>
  )
}
