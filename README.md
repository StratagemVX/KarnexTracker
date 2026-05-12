# Karnex Tracker

Karnex Tracker is a local-first productivity workbook built with React and Vite. The app, displayed as Momentum Workspace in the interface, helps users manage assignments, track habits, review progress, and generate printable dashboard reports from one spreadsheet-style workspace.

## Overview

This project is designed for students and productivity-focused users who want a simple, private, browser-based tracker. Data is stored locally on the user's device with automatic restore on refresh, so the application can be used without a backend server or account system.

## Key Features

- Assignment tracker for courses, tasks, assigned dates, due dates, status, priority, progress, submission type, and completion dates.
- Habit tracker with daily checkbox logging, top habit summaries, weekly charts, and completion totals.
- Dashboard report with assignment insights, habit progress tables, weekly progress rings, monthly trend charts, and printable export support.
- Spreadsheet-style layout for fast scanning and editing.
- Automatic local autosave using browser storage.
- Responsive interface with workbook tabs for assignment, habit, and report views.
- Local-only data model that keeps user information on the device.

## Application Sections

### Assignment Tracker

The assignment workspace provides an editable table and visual summaries for academic work. It includes overall status, assignments by subject, priority distribution, weekly progress, and trend reporting.

### Habit Tracker

The habit workspace supports daily habit tracking across a monthly grid. Users can monitor completed days, compare weekly progress, and review habit consistency over time.

### Dashboard Report

The dashboard combines assignment and habit data into a printable report view. It includes progress tables, charts, daily summaries, weekly completion metrics, and monthly trends.

## Tech Stack

- React 19
- Vite 8
- Tailwind CSS 4
- Zustand 5
- Recharts
- date-fns
- react-to-print
- lucide-react

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Open the local development URL shown in the terminal. By default, Vite commonly uses:

```text
http://127.0.0.1:5173/
```

### Production Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Data Storage

Karnex Tracker uses Zustand persistence with `localStorage`.

Saved data includes:

- Assignments
- Habits
- Habit checkbox logs
- Weekly planner tasks
- Weekly planner categories
- Last saved timestamp

Because the app stores data locally, clearing browser site data, using private browsing, or switching devices can remove or hide saved information.

## Project Structure

```text
src/
  App.jsx
  main.jsx
  index.css
  components/
    AssignmentTrackerSheet.jsx
    HabitTrackerSheet.jsx
    ReportDashboard.jsx
    Dashboard.jsx
    HabitTracker.jsx
    TaskTracker.jsx
    WeeklyPlanner.jsx
  store/
    useAppStore.js
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server. |
| `npm run build` | Create a production build. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint checks. |

## Repository

GitHub: https://github.com/StratagemVX/KarnexTracker

## Rights

Personal learning project; not affiliated with or endorsed by the original creator.
