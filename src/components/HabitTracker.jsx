import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { subDays, format, isSameDay } from 'date-fns'

export default function HabitTracker() {
  const { habits, addHabit, toggleHabitLog } = useAppStore()
  const [newHabit, setNewHabit] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    if (!newHabit.trim()) return
    addHabit({ id: Date.now().toString(), name: newHabit, logs: {} })
    setNewHabit('')
  }

  // Generate 4 weeks of data
  const weeks = [1, 2, 3, 4].map(weekOffset => {
    // Very simplified week generation: last 7 days = week 4, previous 7 = week 3, etc.
    const days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), (4 - weekOffset) * 7 + (6 - i)))
    
    // Create chart data for this week
    const chartData = days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const logsCount = habits.filter(h => h.logs && h.logs[dateStr]).length
      const totalHabits = habits.length || 1
      return {
        day: format(day, 'd'),
        value: Math.round((logsCount / totalHabits) * 100),
        isToday: isSameDay(day, new Date()),
        dateStr
      }
    })

    const totalScore = chartData.reduce((acc, curr) => acc + curr.value, 0)
    const avgScore = chartData.length > 0 ? Math.round(totalScore / chartData.length) : 0

    return { id: `WEEK ${weekOffset}`, data: chartData, avgScore }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-12">
      
      {/* Top Section - Weekly Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 sheet-container p-4 bg-white/50 backdrop-blur-sm">
          {weeks.map((week) => (
            <div key={week.id} className="flex flex-col border-r border-slate-300 last:border-0 pr-4">
              <h4 className="text-center font-bold text-xs mb-2">{week.id}</h4>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={week.data}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {week.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#9ce6c3' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between mt-1 border-b border-slate-200 pb-1">
                {week.data.map((d, i) => (
                  <span key={i} className="text-[10px] font-bold text-slate-500 w-full text-center">{d.day}</span>
                ))}
              </div>
              <div className="text-center mt-2">
                <div className="text-xs font-bold text-slate-600">{week.avgScore}%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-slate-800 space-y-2">
          <h2 className="text-2xl font-black tracking-tight">Track your habits week by week.</h2>
          <p className="text-sm font-medium">Just tick the checkboxes — progress, charts, and rankings update automatically.</p>
        </div>
      </div>

      {/* Bottom Section - Top 10 Daily Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-12">
        <div className="text-center md:text-right space-y-2 pt-12">
          <h2 className="text-3xl font-black tracking-tight">Consistency made visible.</h2>
          <p className="text-sm font-medium text-slate-800">This section shows your weekly habit<br/>performance and Top 10 habits.</p>
          
          <form onSubmit={handleAdd} className="mt-8 flex justify-end gap-2">
            <input 
              type="text" 
              value={newHabit}
              onChange={e => setNewHabit(e.target.value)}
              placeholder="Add a new habit..."
              className="px-3 py-1 border border-slate-400 text-sm outline-none w-64 bg-white"
            />
            <button className="bg-slate-800 text-white px-3 py-1 text-sm font-bold">ADD</button>
          </form>
        </div>

        <div className="sheet-container w-full max-w-md mx-auto md:mx-0 border-2 border-slate-800">
          <div className="bg-primary-light py-4 text-center border-b-2 border-slate-800">
            <h3 className="font-bold text-slate-800 tracking-wider">TOP 10 DAILY HABITS</h3>
          </div>
          <table className="w-full text-left">
            <tbody>
              {habits.slice(0, 10).map((habit, index) => {
                const isLoggedToday = habit.logs && habit.logs[format(new Date(), 'yyyy-MM-dd')]
                return (
                  <tr key={habit.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50 group">
                    <td className="w-8 text-center font-bold text-slate-500 text-sm py-2">{index + 1}</td>
                    <td className="w-8 text-center">
                      <input 
                        type="checkbox" 
                        checked={!!isLoggedToday}
                        onChange={() => toggleHabitLog(habit.id, format(new Date(), 'yyyy-MM-dd'))}
                        className="w-4 h-4 cursor-pointer accent-slate-800"
                      />
                    </td>
                    <td className={`py-2 text-sm font-medium ${isLoggedToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {habit.name}
                    </td>
                  </tr>
                )
              })}
              {/* Fill empty slots up to 10 */}
              {Array.from({ length: Math.max(0, 10 - habits.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-slate-200 last:border-0">
                  <td className="w-8 text-center font-bold text-slate-300 text-sm py-2">{habits.length + i + 1}</td>
                  <td className="w-8 text-center"></td>
                  <td className="py-2 text-sm text-slate-300">---</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
