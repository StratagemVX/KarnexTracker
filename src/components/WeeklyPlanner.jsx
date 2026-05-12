import { useAppStore } from '../store/useAppStore'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
const HOURS = ['6:00 am', '7:00 am', '8:00 am', '9:00 am', '10:00 am', '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm', '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm']

export default function WeeklyPlanner() {
  const weeklyPlan = useAppStore(state => state.weeklyPlan)
  const weeklyCategories = useAppStore(state => state.weeklyCategories)
  const setWeeklyPlan = useAppStore(state => state.setWeeklyPlan)
  const setWeeklyCategory = useAppStore(state => state.setWeeklyCategory)

  const handleTaskChange = (e, day, hour) => {
    setWeeklyPlan(day, hour, e.target.value)
  }

  const getTaskData = (day, hour) => {
    return weeklyPlan[day]?.[hour] || ''
  }

  const getCategoryData = (day, hour) => {
    return weeklyCategories[day]?.[hour] || ''
  }

  return (
    <div className="max-w-none mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold bg-orange-100 text-orange-900 px-4 py-2 border-2 border-slate-800 inline-block">
          WEEKLY PLANNER
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-8">
          {DAYS.map((day) => (
            <div key={day} className="sheet-container w-[350px] flex-shrink-0">
              <div className="bg-blue-100 border-b-2 border-slate-800 text-center py-2">
                <h3 className="font-bold text-sm tracking-widest text-slate-800">{day}</h3>
                <div className="text-[10px] text-slate-500">Weekly plan</div>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-r border-slate-300 p-1 text-[10px] text-center w-16 bg-slate-50">Time</th>
                    <th className="border-b border-r border-slate-300 p-1 text-[10px] text-center w-24 bg-slate-50">Category</th>
                    <th className="border-b border-slate-300 p-1 text-[10px] text-center bg-slate-50">Task</th>
                  </tr>
                </thead>
                <tbody>
                  {HOURS.map((hour) => (
                    <tr key={hour} className="hover:bg-slate-50">
                      <td className="border-b border-r border-slate-300 p-1 text-[10px] text-slate-500 text-right pr-2">
                        {hour}
                      </td>
                      <td className="border-b border-r border-slate-300 p-1">
                        <select
                          value={getCategoryData(day, hour)}
                          onChange={(e) => setWeeklyCategory(day, hour, e.target.value)}
                          className="w-full text-[10px] bg-transparent outline-none cursor-pointer"
                        >
                          <option value="">-</option>
                          <option value="Work">Work</option>
                          <option value="Personal">Personal</option>
                          <option value="Routine">Routine</option>
                          <option value="Gym">Gym</option>
                        </select>
                      </td>
                      <td className="border-b border-slate-300 p-0">
                        <input
                          type="text"
                          value={getTaskData(day, hour)}
                          onChange={(e) => handleTaskChange(e, day, hour)}
                          className="w-full h-full px-2 py-1 text-xs bg-transparent outline-none focus:bg-white focus:ring-inset focus:ring-1 focus:ring-slate-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
