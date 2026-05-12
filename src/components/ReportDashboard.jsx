import { useRef } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Area, AreaChart, BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO, differenceInDays } from 'date-fns'
import { useReactToPrint } from 'react-to-print'

export default function ReportDashboard() {
  const { tasks, addTask, updateTask, deleteTask, habits, addHabit, updateHabit, deleteHabit, toggleHabitLog } = useAppStore()
  const reportRef = useRef(null)

  const downloadReport = useReactToPrint({
    contentRef: reportRef,
    documentTitle: 'Momentum_Workspace_Report',
    pageStyle: `
      @page { size: auto; margin: 10mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  })

  // Ensure we have 8 tasks for the visual layout
  const displayTasks = [...tasks].slice(0, 8)
  while (displayTasks.length < 8) {
    displayTasks.push({ id: `empty-task-${displayTasks.length}`, isEmpty: true })
  }

  // Ensure we have 10 habits
  const displayHabits = [...habits]
  while (displayHabits.length < 10) {
    displayHabits.push({ id: `empty-habit-${displayHabits.length}`, isEmpty: true })
  }

  const formatDaysLeft = (dueDate) => {
    if (!dueDate) return ''
    const days = differenceInDays(parseISO(dueDate), new Date())
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    return `${days} days left`
  }

  // Habit Weeks Logic
  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const weeks = [
    { name: 'WEEK 1', color: '#cbe6d8', bg: '#f0fdf4', bar: '#a3d2ba', days: days.slice(0, 7) },
    { name: 'WEEK 2', color: '#dce8f8', bg: '#f8fafc', bar: '#93c5fd', days: days.slice(7, 14) },
    { name: 'WEEK 3', color: '#fbe2e6', bg: '#fff1f2', bar: '#fda4af', days: days.slice(14, 21) },
    { name: 'WEEK 4', color: '#fdecc8', bg: '#fffbeb', bar: '#f6c95d', days: days.slice(21, 28) },
    { name: 'WEEK 5', color: '#e4e7ff', bg: '#f5f6ff', bar: '#a5b4fc', days: days.slice(28, 31) },
  ]

  const getDayStr = (day) => `2025-11-${day.toString().padStart(2, '0')}`
  const activeHabits = habits.filter(h => !h.isEmpty).slice(0, 10)
  const habitGoal = days.length

  const getWeekData = (weekDays) => {
    return weekDays.map(day => {
      const dateStr = getDayStr(day)
      const count = activeHabits.filter(h => h.logs && h.logs[dateStr]).length
      return { day, count }
    })
  }

  const getLongestStreak = (habit) => {
    let current = 0
    let longest = 0

    days.forEach(day => {
      if (habit.logs?.[getDayStr(day)]) {
        current += 1
        longest = Math.max(longest, current)
      } else {
        current = 0
      }
    })

    return longest
  }

  // Calculate habit progress for the bottom right section
  const habitProgress = displayHabits.slice(0, 10).map((habit, idx) => {
    let completedCount = 0
    if (!habit.isEmpty && habit.logs) {
      days.forEach(d => {
        if (habit.logs[getDayStr(d)]) completedCount++
      })
    }
    const totalDays = habitGoal
    const left = totalDays - completedCount
    const percentage = Math.round((completedCount / totalDays) * 100)
    return {
      name: habit.name || `Habit ${idx+1}`,
      completed: completedCount,
      left,
      percentage,
      goal: totalDays,
      longestStreak: habit.isEmpty ? 0 : getLongestStreak(habit)
    }
  })

  const monthlyGoal = activeHabits.length * habitGoal
  const monthlyCompleted = habitProgress.reduce((sum, habit) => sum + habit.completed, 0)
  const weeklySummaries = weeks.map(week => {
    const weekData = getWeekData(week.days)
    const total = weekData.reduce((acc, curr) => acc + curr.count, 0)
    const max = Math.max(activeHabits.length, 1) * week.days.length
    return {
      ...week,
      total,
      max,
      percentage: Math.round((total / max) * 100),
      label: week.name.replace('WEEK ', 'week ')
    }
  })
  const monthlyTrend = days.map(day => {
    const count = activeHabits.filter(h => h.logs?.[getDayStr(day)]).length
    const max = Math.max(activeHabits.length, 1)
    return {
      day,
      count,
      percentage: Math.round((count / max) * 100)
    }
  })
  const habitsOver100 = habitProgress.filter(habit => habit.percentage > 100).length

  return (
    <div className="w-full h-full overflow-y-auto bg-[#f1f5f9] p-4 md:p-8">
      {/* Action Bar */}
      <div className="max-w-[1400px] mx-auto mb-4 flex justify-end">
        <button 
          onClick={downloadReport}
          className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-md font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download Report
        </button>
      </div>

      <div className="w-full max-w-[1400px] mx-auto p-8 space-y-6 bg-white shadow-sm border border-slate-200" id="report-dashboard" ref={reportRef}>
      
      {/* 1. Assignments Table */}
      <div className="border border-slate-300 rounded overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="report-header w-12">S.NO</th>
              <th className="report-header w-40">COURSE NAME</th>
              <th className="report-header w-64">ASSIGNMENT TITLE</th>
              <th className="report-header w-32">ASSIGNED DATE</th>
              <th className="report-header w-32">DUE DATE</th>
              <th className="report-header w-32">DAYS LEFT</th>
              <th className="report-header w-36">STATUS</th>
              <th className="report-header w-32">PRIORITY</th>
              <th className="report-header w-48">PROGRESS (%)</th>
              <th className="report-header w-40">SUBMISSION TYPE</th>
              <th className="report-header w-32">COMPLETION</th>
            </tr>
          </thead>
          <tbody>
            {displayTasks.map((task, idx) => {
              const isData = !task.isEmpty

              return (
                <tr key={`task-row-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="report-cell text-center text-slate-500">{idx + 1}</td>
                  
                  <td className="report-cell">
                    <input 
                      type="text" 
                      value={task.course || ''} 
                      onChange={(e) => {
                        if (task.isEmpty) addTask({ id: Date.now().toString(), name: '', course: e.target.value, dueDate: '', assignedDate: format(new Date(), 'yyyy-MM-dd'), status: 'Pending', priority: 'Medium', progress: 0, submissionType: 'Physical', completedDate: '' })
                        else updateTask(task.id, { course: e.target.value })
                      }} 
                      className="w-full bg-transparent outline-none" 
                    />
                  </td>
                  
                  <td className="report-cell font-medium">
                    <input 
                      type="text" 
                      value={task.name || ''} 
                      onChange={(e) => {
                        if (task.isEmpty) addTask({ id: Date.now().toString(), name: e.target.value, course: '', dueDate: '', assignedDate: format(new Date(), 'yyyy-MM-dd'), status: 'Pending', priority: 'Medium', progress: 0, submissionType: 'Physical', completedDate: '' })
                        else updateTask(task.id, { name: e.target.value })
                      }} 
                      className="w-full bg-transparent outline-none" 
                    />
                  </td>
                  
                  <td className="report-cell">
                    {isData && (
                      <input type="date" value={task.assignedDate || ''} onChange={(e) => updateTask(task.id, { assignedDate: e.target.value })} className="w-full bg-transparent outline-none text-center" />
                    )}
                  </td>
                  
                  <td className="report-cell">
                    {isData && (
                      <input type="date" value={task.dueDate || ''} onChange={(e) => updateTask(task.id, { dueDate: e.target.value })} className="w-full bg-transparent outline-none text-center" />
                    )}
                  </td>
                  
                  <td className="report-cell text-center text-xs font-semibold text-slate-600">
                    {isData ? formatDaysLeft(task.dueDate) : ''}
                  </td>
                  
                  <td className="report-cell">
                    {isData && (
                      <select
                        value={task.status || 'Pending'}
                        onChange={(e) => updateTask(task.id, { status: e.target.value })}
                        className={`report-pill-dropdown ${task.status === 'Completed' ? 'r-pill-green' : task.status === 'In Progress' ? 'r-pill-yellow' : 'r-pill-red'}`}
                      >
                        <option className="bg-white text-slate-800" value="Completed">Completed</option>
                        <option className="bg-white text-slate-800" value="In Progress">In Progress</option>
                        <option className="bg-white text-slate-800" value="Pending">Pending</option>
                      </select>
                    )}
                  </td>
                  
                  <td className="report-cell">
                    {isData && (
                      <select
                        value={task.priority || 'Medium'}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                        className={`report-pill-dropdown ${task.priority === 'High' ? 'r-pill-red' : task.priority === 'Medium' ? 'r-pill-yellow' : 'r-pill-green'}`}
                      >
                        <option className="bg-white text-slate-800" value="High">High</option>
                        <option className="bg-white text-slate-800" value="Medium">Medium</option>
                        <option className="bg-white text-slate-800" value="Low">Low</option>
                      </select>
                    )}
                  </td>
                  
                  <td className="report-cell px-4">
                    {isData && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-600 rounded-full transition-all" style={{ width: `${task.progress || 0}%` }}></div>
                        </div>
                        <select
                          value={task.progress || 0}
                          onChange={(e) => updateTask(task.id, { progress: Number(e.target.value) })}
                          className="w-16 bg-transparent outline-none text-right font-bold text-xs"
                        >
                          <option value="0">0%</option>
                          <option value="10">10%</option>
                          <option value="20">20%</option>
                          <option value="50">50%</option>
                          <option value="80">80%</option>
                          <option value="100">100%</option>
                        </select>
                      </div>
                    )}
                  </td>
                  
                  <td className="report-cell">
                     {isData && (
                      <select
                        value={task.submissionType || 'Physical'}
                        onChange={(e) => updateTask(task.id, { submissionType: e.target.value })}
                        className="w-full bg-transparent outline-none text-center text-xs"
                      >
                        <option className="bg-white text-slate-800" value="Physical">Physical</option>
                        <option className="bg-white text-slate-800" value="Google Form">Google Form</option>
                        <option className="bg-white text-slate-800" value="Email">Email</option>
                        <option className="bg-white text-slate-800" value="Classroom">Classroom</option>
                        <option className="bg-white text-slate-800" value="Drive Link">Drive Link</option>
                        <option className="bg-white text-slate-800" value="PDF">PDF</option>
                        <option className="bg-white text-slate-800" value="Github">Github</option>
                        <option className="bg-white text-slate-800" value="Slides">Slides</option>
                      </select>
                    )}
                  </td>

                  <td className="report-cell">
                    {isData ? (
                       <div className="flex items-center gap-1">
                         <select
                          value={task.completedDate || 'Pending'}
                          onChange={(e) => updateTask(task.id, { completedDate: e.target.value })}
                          className="w-full bg-transparent outline-none text-center text-[10px] font-medium text-slate-700"
                         >
                          <option value="Submitted">Submitted</option>
                          <option value="Pending">Pending</option>
                          <option value="In review">In review</option>
                         </select>
                         <button onClick={() => deleteTask(task.id)} className="text-red-400 text-xs px-1 hover:bg-slate-100 rounded">×</button>
                       </div>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 2. Live Habit Insights */}
      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 xl:col-span-7 border border-slate-300 rounded overflow-hidden bg-white shadow-sm">
          <div className="bg-[#9fb9e8] text-center py-3">
            <h3 className="font-black text-sm tracking-[0.5em] text-slate-800">DAILY PROGRESS</h3>
            <p className="mt-2 text-sm font-bold text-slate-700">{monthlyCompleted} / {monthlyGoal} completed</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#f3ecd7] text-slate-700">
                  <th className="report-cell text-left w-52">goal</th>
                  <th className="report-cell text-center w-24">percentage</th>
                  <th className="report-cell text-left">progress</th>
                  <th className="report-cell text-center w-28">count</th>
                  <th className="report-cell text-center w-28">longest streak</th>
                </tr>
              </thead>
              <tbody>
                {habitProgress.map((habit, idx) => (
                  <tr key={`daily-progress-${idx}`} className="hover:bg-slate-50">
                    <td className="report-cell font-medium text-slate-700">{habit.name}</td>
                    <td className="report-cell text-center font-bold text-slate-700">{habit.percentage}%</td>
                    <td className="report-cell">
                      <div className="h-5 bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#94aee1] transition-all"
                          style={{ width: `${Math.min(habit.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="report-cell text-center font-semibold text-slate-700">{habit.completed} / {habit.goal}</td>
                    <td className="report-cell text-center font-semibold text-slate-700">{habit.longestStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-center text-sm font-bold italic text-slate-700 bg-white">
            Over 100% on {habitsOver100} habits - keep going!
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 border border-slate-300 rounded bg-white shadow-sm p-4">
          <h3 className="font-black text-sm tracking-widest text-slate-800 mb-4">WEEKLY PROGRESS</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 xl:grid-cols-3 gap-4">
            {weeklySummaries.map(week => (
              <div key={`${week.name}-donut`} className="flex flex-col items-center gap-2">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center transition-all"
                  style={{ background: `conic-gradient(${week.bar} ${week.percentage * 3.6}deg, ${week.bg} 0deg)` }}
                >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="text-lg font-black italic text-slate-800">{week.percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-xs font-bold italic text-slate-500">{week.label}</div>
                <div className="text-[11px] font-semibold text-slate-400">{week.total}/{week.max}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-slate-300 rounded bg-white shadow-sm p-4">
        <h3 className="font-black text-sm tracking-widest text-slate-800 mb-4">MONTHLY TREND</h3>
        <div className="h-64 min-w-[720px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrend} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthlyTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.55} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.08} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={0} />
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value, name) => [name === 'percentage' ? `${value}%` : value, name === 'percentage' ? 'Completion' : 'Count']} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#64748b"
                strokeWidth={3}
                fill="url(#monthlyTrendFill)"
                dot={{ r: 3, fill: '#475569', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Middle Row: Weekly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {weeks.map(week => {
          const weekData = getWeekData(week.days)
          const total = weekData.reduce((acc, curr) => acc + curr.count, 0)
          const max = Math.max(activeHabits.length, 1) * week.days.length
          const pct = Math.round((total / (max || 1)) * 100)
          
          return (
            <div key={`${week.name}-chart`} className="border border-slate-300 rounded flex flex-col bg-white overflow-hidden shadow-sm">
              <div className="text-center font-bold text-xs py-2 tracking-widest text-slate-700" style={{ backgroundColor: week.color }}>
                {week.name}
              </div>
              <div className="h-28 w-full p-4 pb-0 min-w-[150px]">
                <ResponsiveContainer width="99%" height="100%">
                  <BarChart data={weekData}>
                    <Bar dataKey="count" fill={week.bar} radius={[2,2,0,0]} minPointSize={2} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center px-4 py-2 border-t border-slate-200 mt-2 text-xs font-bold text-slate-500">
                <span>{total}/{max}</span>
                <span className="text-slate-800 text-sm">{pct}%</span>
              </div>
              {/* Mini progress bar at the bottom of the chart card */}
              <div className="w-full h-1 bg-slate-100">
                <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: week.bar }}></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 3. Bottom Row: Habits & Progress */}
      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Habit Grids (7 cols) */}
        <div className="col-span-12 xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {weeks.map(week => (
             <div key={`${week.name}-grid`} className="border border-slate-300 rounded overflow-hidden shadow-sm" style={{ backgroundColor: week.bg }}>
               <div className="text-center font-bold text-[11px] py-2 border-b border-slate-200 text-slate-700 tracking-wider">
                 {week.name}
               </div>
               <div className="grid grid-cols-7 border-b border-slate-200 text-[10px] font-bold text-slate-500">
                 {week.days.map(d => (
                   <div key={`head-${d}`} className="text-center py-1 border-r border-slate-200 last:border-0">{d}</div>
                 ))}
               </div>
               <div className="flex flex-col">
                 {displayHabits.slice(0, 10).map((habit, idx) => (
                   <div key={`gridrow-${idx}`} className="grid grid-cols-7 border-b border-slate-200 last:border-0 hover:bg-black/5">
                     {week.days.map(d => {
                       const dateStr = getDayStr(d)
                       const isChecked = !habit.isEmpty && habit.logs && habit.logs[dateStr]
                       return (
                         <div key={`cell-${d}`} className="flex items-center justify-center py-2 border-r border-slate-200 last:border-0">
                           {!habit.isEmpty ? (
                             <input 
                               type="checkbox"
                               checked={!!isChecked}
                               onChange={() => toggleHabitLog(habit.id, dateStr)}
                             />
                           ) : (
                             <div className="w-4 h-4 border border-slate-200 rounded-sm bg-white opacity-50"></div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                 ))}
               </div>
             </div>
          ))}
        </div>

        {/* Right Side: Top 10 List & Progress Table (5 cols) */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-6">
          
          {/* Top 10 List */}
          <div className="border border-slate-300 rounded shadow-sm bg-white p-4">
            <h3 className="font-black text-sm mb-4 tracking-widest text-slate-800">TOP 10 DAILY HABITS</h3>
            <div className="space-y-3">
              {displayHabits.slice(0, 10).map((habit, idx) => (
                <div key={`top10-${idx}`} className="flex items-center gap-4">
                  <span className="text-slate-400 font-bold w-4 text-right">{idx + 1}</span>
                  <input
                    type="text"
                    value={habit.name || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      if (habit.isEmpty && value.trim()) {
                        addHabit({ id: Date.now().toString(), name: value, logs: {} })
                      } else if (!habit.isEmpty) {
                        if (!value.trim()) deleteHabit(habit.id)
                        else updateHabit(habit.id, { name: value })
                      }
                    }}
                    placeholder={habit.isEmpty ? "" : ""}
                    className="flex-1 bg-transparent outline-none font-medium text-slate-700 placeholder:text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Progress Table */}
          <div className="border border-slate-300 rounded shadow-sm bg-white p-4">
             <h3 className="font-black text-sm mb-4 tracking-widest text-slate-800">PROGRESS</h3>
             <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-2">
               <div className="col-span-2 text-center">COMPLETED</div>
               <div className="col-span-2 text-center">LEFT</div>
               <div className="col-span-8">PROGRESS</div>
             </div>
             <div className="space-y-3 pt-2">
               {habitProgress.map((hp, idx) => (
                 <div key={`hp-${idx}`} className="grid grid-cols-12 gap-2 items-center text-xs">
                   <div className="col-span-2 text-center font-medium text-slate-700">{hp.completed}</div>
                   <div className="col-span-2 text-center font-medium text-slate-700">{hp.left}</div>
                   <div className="col-span-8 flex items-center gap-3">
                     <div className="flex-1 h-3 bg-slate-100 rounded-sm overflow-hidden">
                        <div className="h-full bg-[#4ba34b] transition-all" style={{ width: `${hp.percentage}%` }}></div>
                     </div>
                     <span className="w-8 text-right font-bold text-slate-500 text-[10px]">{hp.percentage}%</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>

        </div>

      </div>

    </div>
  </div>
  )
}
