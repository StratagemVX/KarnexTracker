# Karnex Tracker (`KarnexTracker`) — Student Assignment, Habit & Productivity Workspace

> Local-first spreadsheet-inspired student planner featuring an Assignment Tracker, Habit Compliance Matrix, and Dashboard Report backed by Zustand persisted `localStorage`, built with React 19, Vite, JavaScript, and Tailwind CSS.

[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5%2B-646CFF.svg)](https://vitejs.dev/)

---

## Executive Overview

**Karnex Tracker** (`KarnexTracker` / "Momentum Workspace") helps students track academic assignments, daily habit streaks, weekly schedules, and progress reports in an offline-first browser workspace. Application state persists automatically to browser `localStorage` under the `productivity-storage` key via Zustand `persist` middleware (`src/store/useAppStore.js`).

> **Quality & Security Remediation Status (`main` vs. Open Draft PR #2 — `maintenance/repository-quality-improvements`):**
> - **PR #2** updates dependencies in `package-lock.json` to resolve production `npm audit` vulnerabilities (0 remaining findings), adds `.gitignore` test/build ignores, adds `vitest` unit tests (`src/store/useAppStore.test.js` testing CRUD, habit toggles & store state), and adds `.github/workflows/quality.yml` (verified passing in CI).

---

## Features & Directory Structure

### Implemented Modules
- **Tabbed Workbook UI (`src/App.jsx`):** Switches between **Assignment Tracker** (`AssignmentTrackerSheet.jsx`), **Habit Tracker** (`HabitTrackerSheet.jsx`), and **Dashboard Report** (`ReportDashboard.jsx`) with live autosave indicator.
- **Additional Workspace Components:** `Dashboard.jsx`, `HabitTracker.jsx`, `TaskTracker.jsx`, `WeeklyPlanner.jsx`.
- **Zustand Persisted Store (`src/store/useAppStore.js`):** Actions for `addTask`, `updateTask`, `deleteTask`, `addHabit`, `updateHabit`, `deleteHabit`, `toggleHabitLog`, `setWeeklyPlan`, and `setWeeklyCategory` with state version `2` migration.

```text
KarnexTracker/
├── .github/workflows/quality.yml     # CI: npm ci --ignore-scripts, audit, lint, test, build (PR #2)
├── src/
│   ├── components/
│   │   ├── AssignmentTrackerSheet.jsx
│   │   ├── Dashboard.jsx
│   │   ├── HabitTracker.jsx
│   │   ├── HabitTrackerSheet.jsx
│   │   ├── ReportDashboard.jsx
│   │   ├── TaskTracker.jsx
│   │   └── WeeklyPlanner.jsx
│   ├── store/
│   │   ├── useAppStore.js            # Zustand localStorage-persisted state store
│   │   └── useAppStore.test.js       # Vitest store unit tests (PR #2)
│   ├── App.jsx                       # Momentum Workspace tabbed shell
│   └── main.jsx
├── package.json
└── README.md
```

---

## Setup & Verification Scripts (`package.json`)

```bash
git clone https://github.com/StratagemVX/KarnexTracker.git
cd KarnexTracker

npm ci --ignore-scripts
npm run dev
```

| Script | Command | Notes |
|---|---|---|
| `npm run dev` | `vite` | Start local Vite dev server |
| `npm run build` | `vite build` | Production bundle build |
| `npm run lint` | `eslint .` | ESLint checks |
| `npm test` | `vitest run` | Added in PR #2 (`src/store/useAppStore.test.js`) |
| `npm run preview` | `vite preview` | Preview built output |

*Note: All workspace data is stored locally in the browser (`localStorage`); clearing site data removes stored entries.*

---

## Contributor Attribution & Profile

- **Lead Engineer:** Chethan Kumar B S (`StratagemVX`)
- **GitHub:** [https://github.com/StratagemVX](https://github.com/StratagemVX)
- **Portfolio:** [https://chethan-kumar-portfolio.vercel.app/](https://chethan-kumar-portfolio.vercel.app/)
- **LinkedIn:** [https://linkedin.com/in/chethan-kumar-b-s-781a002bb](https://linkedin.com/in/chethan-kumar-b-s-781a002bb)
