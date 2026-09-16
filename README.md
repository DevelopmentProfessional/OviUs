# OviUs — Multi-Client Algorithmic Menstrual Tracker

Client-server web app that tracks multiple clients' cycles using a self-correcting,
weighted-indicator calculation engine, visualized on a shared master calendar.

## Stack
- **Database:** PostgreSQL (`db/schema.sql`, `db/seed.sql`)
- **Backend:** Node.js + Express (`server/`)
- **Frontend:** React + Vite (`client/`)

## Setup

### 1. Database
Create a database (default name `ovius`) and apply the schema + seed data:

```powershell
createdb ovius
cd server
copy .env.example .env   # edit DATABASE_URL if needed
npm install
npm run db:init
```

### 2. Backend API
```powershell
cd server
npm install
npm run dev    # http://localhost:4000
```

### 3. Frontend
```powershell
cd client
npm install
npm run dev    # http://localhost:5173 (proxies /api to the backend)
```

## Calculation Engine (`server/src/engine/cycleEngine.js`)
- **Baseline:** a new client's creation date is Ovulation Day 0 with a default 28-day cycle.
- **Dynamic Complete Shift:** any indicator with weight ≥ 7.0 immediately replaces the
  current anchor date/phase — no averaging.
- **Accumulated Shift:** low-weight opposing indicators accumulate a recency-decayed
  score; once the combined score crosses a threshold, the anchor shifts to the
  weighted-centroid date of the contributing observations.
- **Recency Bias:** every indicator score decays exponentially with age (45-day
  half-life), so the model naturally tracks cycle drift over time.
- **Adaptive Cycle Length:** derived from recency-weighted intervals between
  same-phase anchor events (falls back to 28 days with insufficient history).

## API Overview
| Method | Path | Description |
| --- | --- | --- |
| GET/POST | `/api/clients` | List / create clients |
| GET/DELETE | `/api/clients/:id` | Fetch / delete a client |
| PUT | `/api/clients/:id/profile` | Update qualitative profile |
| GET/POST | `/api/clients/:id/logs` | List / log indicator observations |
| GET | `/api/indicators` | Predetermined indicator menu |
| GET | `/api/calendar?month=YYYY-MM` | Ovulation milestones grouped by date |
| GET | `/api/calendar/client/:id` | Full prediction diagnostics for one client |
