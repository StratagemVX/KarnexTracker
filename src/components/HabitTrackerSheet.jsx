import { useAppStore } from '../store/useAppStore'
import { BarChart, Bar, ResponsiveContainer, Cell, YAxis } from 'recharts'

export default function HabitTrackerSheet() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitLog } = useAppStore()
  
  // Need exactly 10 habits for the Top 10 list
  const displayHabits = [...habits]
  while (displayHabits.length < 10) {
    displayHabits.push({ id: `empty-${displayHabits.length}`, isEmpty: true })
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  
  // Weekly aggregation blocks (7 days each)
  const weeks = [
    { name: 'WEEK 1', color: '#bce4ce', days: days.slice(0, 7) },
    { name: 'WEEK 2', color: '#f8e5b6', days: days.slice(7, 14) },
    { name: 'WEEK 3', color: '#f3c7c5', days: days.slice(14, 21) },
    { name: 'WEEK 4', color: '#c3d3f4', days: days.slice(21, 28) }
  ]

  const getDayStr = (day) => {
    return `2025-11-${day.toString().padStart(2, '0')}`
  }

  const getWeekData = (weekDays) => {
    return weekDays.map(day => {
      const dateStr = getDayStr(day)
      const count = habits.filter(h => !h.isEmpty && h.logs && h.logs[dateStr]).length
      return { day, count }
    })
  }

  return (
    <div className="w-full h-full overflow-auto bg-sheet-bg relative">
      <table className="border-collapse table-fixed w-max min-w-full">
        <thead className="sticky top-0 z-20 bg-sheet-bg">
          <tr>
            <th className="sheet-row-header w-10 border-b-2 border-sheet-border"></th>
            <th className="sheet-col-header w-10 border-b-2 border-sheet-border">A</th>
            <th className="sheet-col-header w-48 border-b-2 border-sheet-border">B</th>
            <th className="sheet-col-header w-8 border-b-2 border-sheet-border">C</th>
            {days.map(d => (
              <th key={`col-${d}`} className="sheet-col-header w-6 border-b-2 border-sheet-border">
                {String.fromCharCode(67 + d)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          
          {/* Row 1: Spacer */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">1</td>
            <td colSpan={3 + 31} className="sheet-cell bg-white border-none h-4"></td>
          </tr>

          {/* Row 2: Charts Row */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">2</td>
            <td colSpan={2} rowSpan={12} className="border border-slate-300 relative align-top bg-white p-0">
               {/* TOP 10 DAILY HABITS inside the cell */}
               <div className="w-full h-full flex flex-col">
                 <div className="bg-[#f3c7c5] text-center font-bold text-sm py-2 border-b border-slate-300 tracking-widest text-slate-800">
                   TOP 10 DAILY HABITS
                 </div>
                 <div className="flex-1 bg-[#f9faf7]">
                    <table className="w-full border-collapse">
                      <tbody>
                        {displayHabits.slice(0, 10).map((habit, idx) => (
                          <tr key={`habit-row-${idx}`}>
                            <td className="border-b border-slate-200 text-center text-sm font-medium text-slate-600 py-2 w-8">{idx + 1}</td>
                            <td className="border-b border-slate-200 p-0">
                              <input 
                                type="text" 
                                value={habit.name || ''} 
                                onChange={(e) => {
                                  const value = e.target.value
                                  if (habit.isEmpty) {
                                    if (value.trim()) {
                                      addHabit({ id: Date.now().toString(), name: value, logs: {} })
                                    }
                                  } else {
                                    if (!value.trim()) {
                                      deleteHabit(habit.id)
                                    } else {
                                      updateHabit(habit.id, { name: value })
                                    }
                                  }
                                }}
                                className="w-full bg-transparent px-2 text-center outline-none text-sm text-slate-800 font-medium"
                                placeholder=""
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </div>
            </td>

            <td className="sheet-cell border-none"></td>

            {/* Render Weekly Charts using colSpans */}
            {weeks.map(week => {
              const weekData = getWeekData(week.days)
              const totalChecks = weekData.reduce((acc, curr) => acc + curr.count, 0)
              const maxPossible = week.days.length * 10
              const percentage = Math.round((totalChecks / (maxPossible || 1)) * 100)

              return (
                <td key={week.name} colSpan={7} rowSpan={12} className="border border-slate-300 p-0 align-top relative bg-white">
                  <div className="h-full flex flex-col absolute inset-0">
                    <div className="text-center font-bold text-xs py-1 text-slate-800 border-b border-slate-300" style={{ backgroundColor: week.color }}>
                      {week.name}
                    </div>
                    <div className="flex-1 w-full pt-2 min-w-[150px]">
                      <ResponsiveContainer width="99%" height="100%">
                        <BarChart data={weekData}>
                          <YAxis domain={[0, 10]} hide />
                          <Bar dataKey="count" fill={week.color} minPointSize={2}>
                             {weekData.map((entry, index) => <Cell key={`cell-${index}`} fill={week.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between border-t border-b border-slate-300 bg-slate-50">
                        {weekData.map(d => (
                           <div key={d.day} className="flex-1 text-center text-[10px] font-bold text-slate-600 border-r border-slate-200 last:border-0 py-[2px]">{d.count}</div>
                        ))}
                      </div>
                      <div className="text-center text-[10px] font-bold text-slate-600 py-1 bg-slate-50 border-b border-slate-300">
                        {totalChecks}/{maxPossible}
                      </div>
                      <div className="text-center text-[10px] font-bold text-slate-800 py-1 bg-white relative">
                        {percentage}%
                        <div className="absolute bottom-0 left-0 h-[3px] transition-all" style={{ width: `${percentage}%`, backgroundColor: week.color }}></div>
                      </div>
                    </div>
                  </div>
                </td>
              )
            })}
            
            <td colSpan={3} rowSpan={12} className="sheet-cell"></td> {/* Remainder days 29,30,31 */}
          </tr>

          {/* Rows 3-13 spacers for row span */}
          {Array.from({ length: 11 }).map((_, i) => (
             <tr key={`spacer-c-${i}`}>
               <td className="sheet-row-header sticky left-0 z-10">{i + 3}</td>
               <td className="sheet-cell border-none"></td>
             </tr>
          ))}

          {/* Row 14: Spacer */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">14</td>
            <td colSpan={34} className="sheet-cell border-none h-4"></td>
          </tr>

          {/* Row 15: Header Row for Grid */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">15</td>
            <td className="tracker-sub-header text-center">NO</td>
            <td className="tracker-sub-header text-left">HABIT NAME</td>
            <td className="sheet-cell border-none"></td>
            
            {weeks.map(w => (
              <td key={w.name} colSpan={7} className="tracker-sub-header text-center" style={{ backgroundColor: w.color }}>
                {w.name}
              </td>
            ))}
             <td colSpan={3} className="tracker-sub-header text-center bg-slate-200">END</td>
          </tr>

          {/* Row 16: Dates */}
          <tr>
            <td className="sheet-row-header sticky left-0 z-10">16</td>
            <td className="sheet-cell bg-slate-50"></td>
            <td className="sheet-cell bg-slate-50"></td>
            <td className="sheet-cell border-none"></td>
            {days.map(d => (
               <td key={`date-${d}`} className="sheet-cell text-center font-bold text-[10px] bg-slate-50">{d}</td>
            ))}
          </tr>

          {/* Rows 17+: Checkboxes */}
          {displayHabits.slice(0, 10).map((habit, index) => {
            const rowNum = 17 + index
            return (
              <tr key={habit.id || `row-${index}`}>
                <td className="sheet-row-header sticky left-0 z-10">{rowNum}</td>
                <td className="sheet-cell text-center font-normal text-slate-500">{index + 1}</td>
                <td className="sheet-cell font-medium text-xs text-slate-700 truncate">{habit.name}</td>
                <td className="sheet-cell border-none"></td>
                
                {days.map(d => {
                  const dateStr = getDayStr(d)
                  const isChecked = !habit.isEmpty && habit.logs && habit.logs[dateStr]
                  return (
                    <td key={`check-${d}`} className="sheet-cell text-center p-0 align-middle">
                      {!habit.isEmpty ? (
                        <input 
                          type="checkbox" 
                          checked={!!isChecked}
                          onChange={() => toggleHabitLog(habit.id, dateStr)}
                          className="w-3 h-3 cursor-pointer mt-[2px] opacity-70 hover:opacity-100"
                        />
                      ) : (
                        <div className="w-3 h-3 border border-slate-200 mx-auto mt-[2px] rounded-[1px]"></div>
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
          
        </tbody>
      </table>
    </div>
  )
}
