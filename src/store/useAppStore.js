import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const savedNow = () => ({ lastSaved: new Date().toISOString() })

export const useAppStore = create(
  persist(
    (set) => ({
      tasks: [],
      habits: [],
      weeklyPlan: {},
      weeklyCategories: {},
      lastSaved: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task], ...savedNow() })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        ...savedNow()
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        ...savedNow()
      })),

      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit], ...savedNow() })),
      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(h => h.id === id ? { ...h, ...updates } : h),
        ...savedNow()
      })),
      deleteHabit: (id) => set((state) => ({
        habits: state.habits.filter(h => h.id !== id),
        ...savedNow()
      })),
      toggleHabitLog: (habitId, dateStr) => set((state) => {
        const habits = state.habits.map(h => {
          if (h.id === habitId) {
            const logs = { ...h.logs };
            if (logs[dateStr]) {
              delete logs[dateStr];
            } else {
              logs[dateStr] = true;
            }
            return { ...h, logs };
          }
          return h;
        });
        return { habits, ...savedNow() };
      }),

      setWeeklyPlan: (day, time, text) => set((state) => {
        const newPlan = { ...state.weeklyPlan };
        if (!newPlan[day]) newPlan[day] = {};
        newPlan[day][time] = text;
        return { weeklyPlan: newPlan, ...savedNow() };
      }),
      setWeeklyCategory: (day, time, category) => set((state) => {
        const weeklyCategories = { ...state.weeklyCategories };
        if (!weeklyCategories[day]) weeklyCategories[day] = {};
        weeklyCategories[day][time] = category;
        return { weeklyCategories, ...savedNow() };
      })
    }),
    {
      name: 'productivity-storage',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        habits: state.habits,
        weeklyPlan: state.weeklyPlan,
        weeklyCategories: state.weeklyCategories,
        lastSaved: state.lastSaved,
      }),
      migrate: (persistedState) => ({
        tasks: persistedState?.tasks || [],
        habits: persistedState?.habits || [],
        weeklyPlan: persistedState?.weeklyPlan || {},
        weeklyCategories: persistedState?.weeklyCategories || {},
        lastSaved: persistedState?.lastSaved || null,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
