import { useAppStore } from '../store/useAppStore'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function Dashboard() {
  const tasks = useAppStore((state) => state.tasks)
  const updateTask = useAppStore((state) => state.updateTask)

  const completed = tasks.filter(t => t.status === 'Completed').length
  const inProgress = tasks.filter(t => t.status === 'In Progress').length
  const pending = tasks.filter(t => t.status === 'Pending').length
  const total = tasks.length || 1 // prevent div by 0

  const pieData = [
    { name: 'Completed', value: completed, color: '#4fa41e' },
    { name: 'In Progress', value: inProgress, color: '#eeb015' },
    { name: 'Pending', value: pending, color: '#e25822' },
  ].filter(d => d.value > 0) // only show if > 0

  const courseCounts = tasks.reduce((counts, task) => {
    const course = task.course?.trim() || 'Unassigned'
    counts[course] = (counts[course] || 0) + 1
    return counts
  }, {})
  const barData = Object.keys(courseCounts).length > 0
    ? Object.entries(courseCounts).map(([name, count]) => ({ name, count }))
    : [{ name: 'No assignments', count: 0 }]

  const formatPercentage = (value) => `${Math.round((value / total) * 100)}%`

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pie Chart Panel */}
        <div className="sheet-container p-6">
          <h3 className="sheet-header mb-6">OVERALL STATUS</h3>
          <div className="h-64 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-400">No data</div>
            )}
            
            {/* Custom Legend to match image */}
            <div className="absolute inset-0 pointer-events-none">
              {pieData.map((d, i) => {
                // Approximate positions based on the image style
                const positionClasses = [
                  "bottom-4 right-8",
                  "bottom-12 left-4",
                  "top-12 left-12"
                ]
                return (
                  <div key={d.name} className={`absolute text-xs font-bold text-slate-600 ${positionClasses[i % 3]}`}>
                    <div>{d.name}</div>
                    <div className="text-slate-500 font-normal">{formatPercentage(d.value)}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bar Chart Panel */}
        <div className="sheet-container p-6">
          <h3 className="sheet-header mb-6">ASSIGNMENTS BY SUBJECT</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fontWeight: 'bold', angle: -45, textAnchor: 'end' }} 
                  axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                  tickLine={false}
                />
                <YAxis 
                  label={{ value: 'ASSIGNMENT COUNTS', angle: -90, position: 'insideLeft', style: { fontSize: 10, fontWeight: 'bold' } }}
                  tick={{ fontSize: 10, fontWeight: 'bold' }}
                  axisLine={{ stroke: '#334155', strokeWidth: 1 }}
                  tickLine={true}
                  domain={[0, 4]}
                  tickCount={5}
                />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="count" fill="#a9b7dc" barSize={30} stroke="#334155" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Table Row */}
      <div className="sheet-container">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="sheet-th w-16">S.NO</th>
              <th className="sheet-th w-48">TASKS</th>
              <th className="sheet-th">ASSIGNMENT TITLE</th>
              <th className="sheet-th w-40">ASSIGNED DATE</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="sheet-cell text-center p-8 text-slate-400">
                  No assignments recorded.
                </td>
              </tr>
            ) : (
              tasks.map((task, index) => (
                <tr key={task.id} className="hover:bg-slate-50">
                  <td className="sheet-cell text-center font-bold text-slate-600">{index + 1}</td>
                  <td className="sheet-cell">
                    <input
                      type="text"
                      value={task.course || ''}
                      onChange={(e) => updateTask(task.id, { course: e.target.value })}
                      className="w-full bg-transparent outline-none"
                    />
                  </td>
                  <td className="sheet-cell font-medium">{task.name}</td>
                  <td className="sheet-cell text-center text-slate-600">
                    {task.dueDate ? format(parseISO(task.dueDate), 'dd MMM yy') : '-'}
                  </td>
                </tr>
              ))
            )}
            {/* Add empty rows to make it look like a spreadsheet */}
            {Array.from({ length: Math.max(0, 10 - tasks.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="sheet-cell text-center font-bold text-slate-400 opacity-50">{tasks.length + i + 1}</td>
                <td className="sheet-cell"></td>
                <td className="sheet-cell"></td>
                <td className="sheet-cell"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
