import { useAppStore } from '../store/useAppStore'
import { Area, AreaChart, BarChart, Bar, CartesianGrid, Cell, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { format, parseISO, differenceInDays } from 'date-fns'

export default function AssignmentTrackerSheet() {
  const { tasks, addTask, updateTask, deleteTask } = useAppStore()
  const activeTasks = tasks.filter(t => !t.isEmpty)

  // Calculate Chart Data
  const completed = activeTasks.filter(t => t.status === 'Completed').length
  const inProgress = activeTasks.filter(t => t.status === 'In Progress').length
  const pending = activeTasks.filter(t => t.status === 'Pending').length

  const high = activeTasks.filter(t => t.priority === 'High').length
  const med = activeTasks.filter(t => t.priority === 'Medium').length
  const low = activeTasks.filter(t => t.priority === 'Low').length

  const pieStatus = [
    { name: 'Completed', value: completed, color: '#4fa41e' },
    { name: 'In Progress', value: inProgress, color: '#eeb015' },
    { name: 'Pending', value: pending, color: '#e25822' },
  ].filter(d => d.value > 0)

  const piePriority = [
    { name: 'High', value: high, color: '#e25822' },
    { name: 'Medium', value: med, color: '#eeb015' },
    { name: 'Low', value: low, color: '#4fa41e' },
  ].filter(d => d.value > 0)

  const courseCounts = {}
  activeTasks.forEach(t => {
    if (!t.isEmpty && t.course && t.course.trim() !== '') {
      const c = t.course.trim()
      courseCounts[c] = (courseCounts[c] || 0) + 1
    }
  })
  const barData = Object.keys(courseCounts).length > 0 
    ? Object.keys(courseCounts).map(course => ({ name: course, count: courseCounts[course] }))
    : [{ name: 'No Assignments', count: 0 }]

  const formatDaysLeft = (dueDate) => {
    if (!dueDate) return ''
    const days = differenceInDays(parseISO(dueDate), new Date())
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    return `${days} days left`
  }

  const handleAddEmptyTask = () => {
    addTask({
      id: Date.now().toString(),
      name: '',
      course: '',
      dueDate: '',
      assignedDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Pending',
      priority: 'Medium',
      progress: 0,
      submissionType: 'Physical Submission',
      completedDate: ''
    })
  }

  // Keep the sheet compact while still leaving room to add assignments.
  const displayTasks = [...tasks]
  while (displayTasks.length < 10) {
    displayTasks.push({ id: `empty-${displayTasks.length}`, isEmpty: true })
  }
  const insightsSpacerRow = 15 + displayTasks.length
  const insightsRow = insightsSpacerRow + 1

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1)
  const getDayFromDate = (date) => {
    if (!date) return null
    const parsed = parseISO(date)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.getDate()
  }
  const getWeekIndex = (task) => {
    const day = getDayFromDate(task.dueDate || task.assignedDate)
    if (!day) return 4
    return Math.min(Math.floor((day - 1) / 7), 4)
  }
  const assignmentGoal = activeTasks.length * 100
  const assignmentCompleted = activeTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0)
  const assignmentProgress = displayTasks.slice(0, 10).map((task, idx) => {
    const progress = task.isEmpty ? 0 : Number(task.progress || 0)
    return {
      name: task.name || task.course || `Assignment ${idx + 1}`,
      progress,
      count: `${progress} / 100`,
      status: task.status || '',
      priority: task.priority || '',
    }
  })
  const weekColors = [
    { label: 'week 1', bg: '#eef6ff', bar: '#80aee8' },
    { label: 'week 2', bg: '#fff0f7', bar: '#db7caf' },
    { label: 'week 3', bg: '#ecfeff', bar: '#72c3c9' },
    { label: 'week 4', bg: '#fff8db', bar: '#efc84a' },
    { label: 'week 5', bg: '#f4f5ff', bar: '#c7d2fe' },
  ]
  const weeklyAssignmentSummaries = weekColors.map((week, index) => {
    const weekTasks = activeTasks.filter(task => getWeekIndex(task) === index)
    const totalProgress = weekTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0)
    const max = Math.max(weekTasks.length * 100, 100)
    return {
      ...week,
      totalProgress,
      max,
      count: weekTasks.length,
      percentage: Math.round((totalProgress / max) * 100),
    }
  })
  const assignmentTrend = monthDays.map(day => {
    const dueTasks = activeTasks.filter(task => {
      const taskDay = getDayFromDate(task.dueDate || task.assignedDate)
      return taskDay !== null && taskDay <= day
    })
    const totalProgress = dueTasks.reduce((sum, task) => sum + Number(task.progress || 0), 0)
    const max = Math.max(dueTasks.length * 100, 100)
    return {
      day,
      percentage: Math.round((totalProgress / max) * 100),
      count: dueTasks.length,
    }
  })

  return (
    <div className="w-full h-full overflow-auto bg-sheet-bg relative">
      <table className="border-collapse table-fixed w-max min-w-full">
        <thead className="sticky top-0 z-20 bg-sheet-bg">
          <tr>
            <th className="sheet-row-header w-10 border-b-2 border-sheet-border"></th>
            {/* Define column widths */}
            <th className="sheet-col-header w-10 border-b-2 border-sheet-border">A</th>
            <th className="sheet-col-header w-32 border-b-2 border-sheet-border">B</th>
            <th className="sheet-col-header w-56 border-b-2 border-sheet-border">C</th>
            <th className="sheet-col-header w-28 border-b-2 border-sheet-border">D</th>
            <th className="sheet-col-header w-28 border-b-2 border-sheet-border">E</th>
            <th className="sheet-col-header w-28 border-b-2 border-sheet-border">F</th>
            <th className="sheet-col-header w-28 border-b-2 border-sheet-border">G</th>
            <th className="sheet-col-header w-24 border-b-2 border-sheet-border">H</th>
            <th className="sheet-col-header w-36 border-b-2 border-sheet-border">I</th>
            <th className="sheet-col-header w-32 border-b-2 border-sheet-border">J</th>
            <th className="sheet-col-header w-28 border-b-2 border-sheet-border">K</th>
            <th className="sheet-col-header w-16 border-b-2 border-sheet-border">L</th>
            <th className="sheet-col-header w-8 border-b-2 border-sheet-border">M</th>
          </tr>
        </thead>
        <tbody>
          
          {/* Row 1: Title */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">1</td>
            <td colSpan={11} className="tracker-main-header bg-tracker-header h-12 align-middle text-2xl font-black">
              SMART ASSIGNMENT TRACKER
            </td>
            <td className="sheet-cell"></td>
            <td className="sheet-cell"></td>
          </tr>

          {/* Row 2: Spacer */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">2</td>
            <td colSpan={13} className="sheet-cell bg-white border-none h-4"></td>
          </tr>

          {/* Row 3-12: Charts Area (simulated by absolute positioning over cells, or simple spanning) */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">3</td>
            <td className="sheet-cell"></td>
            
            {/* Status Pie */}
            <td colSpan={2} rowSpan={10} className="border border-slate-300 p-2 relative align-top">
              <div className="text-xs font-bold text-slate-600 mb-2">OVERALL STATUS</div>
              <div className="h-40 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieStatus} cx="50%" cy="50%" innerRadius={35} outerRadius={60} dataKey="value" stroke="none">
                      {pieStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </td>

            <td className="sheet-cell border-none"></td>

            {/* Bar Chart */}
            <td colSpan={4} rowSpan={10} className="border border-slate-300 p-2 relative align-top">
              <div className="text-xs font-bold text-slate-600 mb-2">ASSIGNMENTS BY SUBJECT</div>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 8, angle: -45, textAnchor: 'end' }} axisLine={{ stroke: '#94a3b8' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 8 }} axisLine={{ stroke: '#94a3b8' }} tickLine={false} domain={[0, 4]} tickCount={5} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} />
                    <Bar dataKey="count" fill="#9ba8d4" barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </td>

            <td className="sheet-cell border-none"></td>

            {/* Priorities Pie */}
            <td colSpan={2} rowSpan={10} className="border border-slate-300 p-2 relative align-top">
              <div className="text-xs font-bold text-slate-600 mb-2">PRIORITIES</div>
              <div className="h-40 w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={piePriority} cx="50%" cy="50%" innerRadius={0} outerRadius={60} dataKey="value" stroke="#334155" strokeWidth={0.5}>
                      {piePriority.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </td>

            <td className="sheet-cell"></td>
          </tr>

          {/* Rows 4-12 empty fillers for spanning */}
          {Array.from({length: 9}).map((_, i) => (
             <tr key={`spacer-${i}`}>
               <td className="sheet-row-header sticky left-0 z-10">{i + 4}</td>
               <td className="sheet-cell"></td>
               <td className="sheet-cell border-none"></td>
               <td className="sheet-cell border-none"></td>
               <td className="sheet-cell"></td>
             </tr>
          ))}

          {/* Row 13: Spacer */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">13</td>
            <td colSpan={13} className="sheet-cell h-4 border-none"></td>
          </tr>

          {/* Row 14: Table Headers */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">14</td>
            <td className="tracker-sub-header text-center">#</td>
            <td className="tracker-sub-header text-left">TASKS</td>
            <td className="tracker-sub-header text-left">ASSIGNMENT</td>
            <td className="tracker-sub-header text-center">ASSIGNED</td>
            <td className="tracker-sub-header text-center">DUE</td>
            <td className="tracker-sub-header text-center">TIME</td>
            <td className="tracker-sub-header text-center">STATUS</td>
            <td className="tracker-sub-header text-center">PRIORITY</td>
            <td className="tracker-sub-header text-center">PROGRESS</td>
            <td className="tracker-sub-header text-center">SUBMIT</td>
            <td className="tracker-sub-header text-center">DONE</td>
            <td className="tracker-sub-header text-center"></td>
            <td className="sheet-cell border-none"></td>
          </tr>

          {/* Row 15+: Table Rows */}
          {displayTasks.map((task, index) => {
            const isData = !task.isEmpty
            const rowNum = 15 + index
            
            return (
            <tr key={task.id} className="h-8 bg-white hover:bg-slate-50 transition-colors">
              <td className="sheet-row-header sticky left-0 z-10">{rowNum}</td>
              <td className="sheet-cell text-center text-xs font-medium text-slate-500">{isData ? index + 1 : ''}</td>
              
              <td className="sheet-cell p-0">
                {isData && (
                  <input type="text" value={task.course || ''} onChange={(e) => updateTask(task.id, { course: e.target.value })} className="w-full h-8 px-2 bg-transparent outline-none text-xs font-medium text-slate-700" />
                )}
              </td>
              
              <td className="sheet-cell p-0">
                {isData && (
                  <input type="text" value={task.name || ''} onChange={(e) => updateTask(task.id, { name: e.target.value })} className="w-full h-8 px-2 bg-transparent outline-none text-xs text-slate-800" />
                )}
              </td>

              <td className="sheet-cell p-0">
                {isData && (
                  <input type="date" value={task.assignedDate || ''} onChange={(e) => updateTask(task.id, { assignedDate: e.target.value })} className="w-full h-8 px-1 bg-transparent text-center outline-none text-[11px] text-slate-600" />
                )}
              </td>

              <td className="sheet-cell p-0">
                {isData && (
                  <input type="date" value={task.dueDate || ''} onChange={(e) => updateTask(task.id, { dueDate: e.target.value })} className="w-full h-8 px-1 bg-transparent text-center outline-none text-[11px] text-slate-600" />
                )}
              </td>

              <td className="sheet-cell text-center text-[11px] text-slate-500 font-medium">
                {isData ? formatDaysLeft(task.dueDate) : ''}
              </td>

              <td className="sheet-cell px-1 py-0">
                {isData && (
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(task.id, { status: e.target.value })}
                    className={`w-full rounded-md border px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer ${task.status === 'Completed' ? 'r-pill-green' : task.status === 'In Progress' ? 'r-pill-yellow' : 'r-pill-red'}`}
                  >
                    <option className="bg-white text-slate-800" value="Completed">Completed</option>
                    <option className="bg-white text-slate-800" value="In Progress">In Progress</option>
                    <option className="bg-white text-slate-800" value="Pending">Pending</option>
                  </select>
                )}
              </td>

              <td className="sheet-cell px-1 py-0">
                {isData && (
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                    className={`w-full rounded-md border px-2 py-1 text-[11px] font-semibold outline-none cursor-pointer ${task.priority === 'High' ? 'r-pill-red' : task.priority === 'Medium' ? 'r-pill-yellow' : 'r-pill-green'}`}
                  >
                    <option className="bg-white text-slate-800" value="High">High</option>
                    <option className="bg-white text-slate-800" value="Medium">Medium</option>
                    <option className="bg-white text-slate-800" value="Low">Low</option>
                  </select>
                )}
              </td>

              <td className="sheet-cell px-2 py-0">
                {isData && (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${task.progress || 0}%` }}></div>
                    </div>
                    <select
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, { progress: Number(e.target.value) })}
                      className="w-14 bg-transparent text-right text-[11px] font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option className="bg-white text-slate-800" value="0">0%</option>
                      <option className="bg-white text-slate-800" value="25">25%</option>
                      <option className="bg-white text-slate-800" value="50">50%</option>
                      <option className="bg-white text-slate-800" value="75">75%</option>
                      <option className="bg-white text-slate-800" value="100">100%</option>
                    </select>
                  </div>
                )}
              </td>

              <td className="sheet-cell px-1 py-0">
                {isData && (
                  <select
                    value={task.submissionType || 'Physical Submission'}
                    onChange={(e) => updateTask(task.id, { submissionType: e.target.value })}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-center text-[11px] text-slate-600 outline-none cursor-pointer"
                  >
                    <option className="bg-white text-slate-800" value="Physical Submission">Physical Submission</option>
                    <option className="bg-white text-slate-800" value="Google Form">Google Form</option>
                    <option className="bg-white text-slate-800" value="Email">Email</option>
                  </select>
                )}
              </td>

              <td className="sheet-cell p-0">
                {isData && (
                  <input type="date" value={task.completedDate || ''} onChange={(e) => updateTask(task.id, { completedDate: e.target.value })} className="w-full h-8 px-1 bg-transparent text-center outline-none text-[11px] text-slate-600" />
                )}
              </td>
              
              <td className="sheet-cell text-center">
                {isData ? (
                  <button onClick={() => deleteTask(task.id)} className="rounded px-2 py-1 text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600">×</button>
                ) : (
                  index === tasks.length ? (
                    <button onClick={handleAddEmptyTask} className="w-full rounded px-2 py-1 text-left text-[10px] font-bold text-teal-700 hover:bg-teal-50">+ ADD</button>
                  ) : null
                )}
              </td>
              <td className="sheet-cell"></td>
            </tr>
          )})}

          {/* End: Live Assignment Insights */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">{insightsSpacerRow}</td>
            <td colSpan={13} className="sheet-cell h-4 border-none bg-white"></td>
          </tr>

          <tr>
            <td className="sheet-row-header sticky left-0 z-10">{insightsRow}</td>
            <td colSpan={13} className="sheet-cell border-none p-4 bg-white">
              <div className="grid grid-cols-12 gap-4 items-start min-w-[1120px]">
                <div className="col-span-5 border border-slate-300 bg-white shadow-sm p-4">
                  <div className="font-black text-sm tracking-widest text-slate-800 mb-4">WEEKLY ASSIGNMENTS</div>
                  <div className="grid grid-cols-5 gap-3">
                    {weeklyAssignmentSummaries.map(week => (
                      <div key={`assignment-${week.label}`} className="flex flex-col items-center gap-2">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center transition-all"
                          style={{ background: `conic-gradient(${week.bar} ${week.percentage * 3.6}deg, ${week.bg} 0deg)` }}
                        >
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-inner">
                            <span className="text-sm font-black italic text-slate-800">{week.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="text-[11px] font-bold italic text-slate-500">{week.label}</div>
                        <div className="text-[10px] font-semibold text-slate-400">{week.count} tasks</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-7 border border-slate-300 bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#9fb9e8] text-center py-3">
                    <div className="font-black text-sm tracking-[0.45em] text-slate-800">ASSIGNMENT PROGRESS</div>
                    <div className="mt-2 text-sm font-bold text-slate-700">{assignmentCompleted} / {assignmentGoal} completed</div>
                  </div>
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#f3ecd7] text-slate-700">
                        <th className="report-cell text-left w-56">assignment</th>
                        <th className="report-cell text-center w-24">percentage</th>
                        <th className="report-cell text-left">progress</th>
                        <th className="report-cell text-center w-24">count</th>
                        <th className="report-cell text-center w-28">status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentProgress.map((assignment, idx) => (
                        <tr key={`assignment-progress-${idx}`} className="hover:bg-slate-50">
                          <td className="report-cell font-medium text-slate-700">{assignment.name}</td>
                          <td className="report-cell text-center font-bold text-slate-700">{assignment.progress}%</td>
                          <td className="report-cell">
                            <div className="h-5 bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-[#94aee1] transition-all"
                                style={{ width: `${Math.min(assignment.progress, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="report-cell text-center font-semibold text-slate-700">{assignment.count}</td>
                          <td className="report-cell text-center font-semibold text-slate-600">{assignment.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="col-span-12 border border-slate-300 bg-white shadow-sm p-4">
                  <div className="font-black text-sm tracking-widest text-slate-800 mb-4">ASSIGNMENT TREND</div>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={assignmentTrend} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="assignmentTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.55} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.08} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} interval={0} />
                        <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value, name) => [name === 'percentage' ? `${value}%` : value, name === 'percentage' ? 'Completion' : 'Assignments']} />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke="#64748b"
                          strokeWidth={3}
                          fill="url(#assignmentTrendFill)"
                          dot={{ r: 3, fill: '#475569', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </td>
          </tr>
          
        </tbody>
      </table>
    </div>
  )
}
