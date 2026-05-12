import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { differenceInDays, parseISO } from 'date-fns'
import { Plus } from 'lucide-react'

export default function TaskTracker() {
  const { tasks, addTask, updateTask, deleteTask } = useAppStore()
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDate, setNewTaskDate] = useState('')

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!newTaskName.trim()) return

    addTask({
      id: Date.now().toString(),
      name: newTaskName,
      dueDate: newTaskDate || new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: 'Medium',
      progress: 0
    })
    setNewTaskName('')
    setNewTaskDate('')
  }

  const formatDaysLeft = (dueDate) => {
    if (!dueDate) return '-'
    const days = differenceInDays(parseISO(dueDate), new Date())
    if (days < 0) return `${Math.abs(days)} days overdue`
    return `${days} days left`
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'pill-green'
      case 'In Progress': return 'pill-yellow'
      case 'Pending': return 'pill-orange'
      default: return 'pill-orange'
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'Low': return 'pill-green'
      case 'Medium': return 'pill-yellow'
      case 'High': return 'pill-red'
      default: return 'pill-yellow'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Add Task Form - Keep it minimal outside the sheet */}
      <div className="bg-white p-4 border-2 border-slate-800 shadow-sm flex gap-4">
        <input 
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="New Task Name"
          className="flex-1 px-3 py-1 border border-slate-300 text-sm outline-none focus:border-slate-800"
        />
        <input 
          type="date"
          value={newTaskDate}
          onChange={(e) => setNewTaskDate(e.target.value)}
          className="px-3 py-1 border border-slate-300 text-sm outline-none focus:border-slate-800"
        />
        <button 
          onClick={handleAddTask}
          className="px-4 py-1 bg-slate-800 text-white text-sm font-bold flex items-center gap-1 hover:bg-slate-700 transition-colors"
        >
          <Plus size={16} /> ADD
        </button>
      </div>

      <div className="sheet-container">
        <table className="w-full text-center border-collapse table-fixed">
          <thead>
            <tr>
              <th className="sheet-th w-1/4">TASK NAME</th>
              <th className="sheet-th w-1/6">DAYS LEFT</th>
              <th className="sheet-th w-1/6">STATUS</th>
              <th className="sheet-th w-1/6">PRIORITY</th>
              <th className="sheet-th w-1/6">PROGRESS</th>
              <th className="sheet-th w-12"></th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 group">
                <td className="sheet-cell text-left">
                  <input 
                    type="text"
                    value={task.name}
                    onChange={(e) => updateTask(task.id, { name: e.target.value })}
                    className="w-full bg-transparent outline-none cursor-text focus:bg-white px-1"
                  />
                </td>
                <td className="sheet-cell text-slate-700">
                  {formatDaysLeft(task.dueDate)}
                </td>
                <td className="sheet-cell">
                  <div className="px-2">
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, { status: e.target.value })}
                      className={`pill ${getStatusClass(task.status)}`}
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </td>
                <td className="sheet-cell">
                  <div className="px-2">
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value })}
                      className={`pill ${getPriorityClass(task.priority)}`}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </td>
                <td className="sheet-cell">
                  <select
                      value={task.progress}
                      onChange={(e) => updateTask(task.id, { progress: Number(e.target.value) })}
                      className="w-full bg-transparent outline-none text-center cursor-pointer font-medium"
                    >
                      <option value="0">0%</option>
                      <option value="25">25%</option>
                      <option value="50">50%</option>
                      <option value="75">75%</option>
                      <option value="100">100%</option>
                    </select>
                </td>
                <td className="sheet-cell">
                  <button onClick={() => deleteTask(task.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 px-1 font-bold">×</button>
                </td>
              </tr>
            ))}
            {/* Empty grid rows for visual effect */}
            {Array.from({ length: Math.max(0, 15 - tasks.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="sheet-cell h-8"></td>
                <td className="sheet-cell"></td>
                <td className="sheet-cell">
                   <div className="px-2"><div className="w-full h-5 rounded-full bg-slate-100/50"></div></div>
                </td>
                <td className="sheet-cell">
                   <div className="px-2"><div className="w-full h-5 rounded-full bg-slate-100/50"></div></div>
                </td>
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
