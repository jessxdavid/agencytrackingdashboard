# Agency Acquisition Dashboard

Internal CRM for tracking outreach to sign more agency clients. Leads move through a
12 stage acquisition pipeline, each lead card tracks Close Friends / Email / DM outreach,
and the dashboard rolls everything up into live metrics.

This app is built to run **live** (shared data via Supabase) so the whole team sees each
other's changes in real time. A local browser-storage fallback exists only for first-run
preview before Supabase credentials are added (see "Go live" below).

---

## Features

### Pipeline (12 stages)
1. Possible Clients
2. Qualified Partner
3. Loom Made
4. Outreach Sent
5. Engaged — Positive Reply
6. Engaged — Negative Reply
7. Call 1 Booked
8. Follow Up
9. No Show
10. Call 2 Booked
11. No Close
12. Close Deal

- New leads land in **Possible Clients** automatically.
- Move leads by dragging cards between columns, or via the stage dropdown on each card (mobile friendly).
- Qualified Partner and Engaged moves are manual (team decides / lead replies).

### Add Lead (input)
Seven fields: **Name, IG, YouTube, Email, Niche, Funnel, Date**. Submitting drops the lead
straight into Possible Clients.

### Lead card (`/leads/[id]`)
- **Lead detail**: editable fields, stage selector, notes (auto-saves).
- **Add Loom**: attach one or more Loom links.
- **Outreach tracking**:
  - Close Friends outreach: Date + Who (Jonas / Austin / Jake).
  - Email outreach: date the email was sent + dates of follow-up emails.
  - DM outreach: Date + Who (Jonas / Austin / Jake) + Time.
- **Hard metric**: Close Friends Stories counter.
- Delete lead.

### Dashboard
- KPI cards: Total Leads, Qualified Partners, Engaged, Calls Booked, Closed.
- Hard Metrics block, led by **Close Friends Stories**, plus Close Friends / DM / Email / Loom totals.
- Pipeline distribution across all 12 stages.
- Recent leads.
- Glassmorphism panels, sized to fit one screen with no scrolling.

---

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (HSL design tokens + per stage color tints)
- @dnd-kit for the kanban drag and drop
- lucide-react icons
- Supabase (Postgres + Realtime) for live shared data

---

## Data model

One `leads` table. The TypeScript shape lives in `src/lib/types.ts`:

| field | type | notes |
|-------|------|-------|
| id | text (uuid) | primary key |
| name, ig, youtube, email, niche, funnel | text | input fields |
| date | date (YYYY-MM-DD) | input date |
| stage | text | one of the 12 stage keys |
| loom_links | jsonb (string[]) | Add Loom |
| close_friends | jsonb (CloseFriendEntry[]) | `{ id, date, who }` |
| email_sent_date | date | Email outreach |
| email_followups | jsonb (string[]) | follow-up email dates |
| dms | jsonb (DmEntry[]) | `{ id, date, who, time }` |
| close_friends_stories | int | hard metric |
| notes | text | |
| engaged_date, call_one_date, call_two_date, closed_date | date | stamped on stage move |
| created_at, updated_at | timestamptz | |

`who` is one of `Jonas | Austin | Jake`.

---

## Project structure

```
src/
  app/
    layout.tsx           Root layout + top nav
    page.tsx             Dashboard (glassmorphism, fits one screen)
    pipeline/page.tsx    12-stage kanban (drag + dropdown)
    input/page.tsx       Add Lead form
    leads/[id]/page.tsx  Lead card: detail, loom, outreach tracking, hard metric
    globals.css          Theme tokens + stage tints
  components/
    TopNav.tsx
  lib/
    types.ts             Stages, STAGE_META, STAGE_TONES, Lead shape, Who
    leads-store.ts       Data layer (Supabase live, local fallback), CRUD + moveStage
    metrics.ts           computeMetrics() for the dashboard
    supabase.ts          Supabase client (live when env present)
    utils.ts             cn(), formatDate()
supabase/
  schema.sql             Postgres schema for the leads table
```

---

## How this was built

- The UI design system (dark theme, card surfaces, stage color tints, top nav, kanban
  patterns) was cloned from an existing internal tracking dashboard so the look and feel
  matches the team's other tools. None of that source is referenced in the app UI.
- A shared data contract (`types.ts`, `leads-store.ts`, `metrics.ts`, `supabase.ts`) was
  written first, then the four pages (dashboard, pipeline, input, lead card) were built in
  parallel against that contract.
- The dashboard was later compacted to fit a single screen and restyled with glassmorphism
  panels over a tinted backdrop.

---

## Run locally (preview)

```bash
npm install
npm run dev          # http://localhost:3030
```

Without Supabase env vars the app uses browser local storage so you can preview the UI.
This is preview only. For shared team data, set up Supabase below.

---

## Go live (Supabase, shared data)

1. Create a Supabase project.
2. In the SQL editor, run `supabase/schema.sql`.
3. Copy the project URL and anon key into `.env.local` (see `.env.local.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
   ```

4. Restart `npm run dev`. Once these vars are present the app reads and writes the shared
   Supabase table and subscribes to realtime changes. Local storage is no longer used, so
   localhost and the deployed site show the same live data, and teammates see each other's
   updates instantly.

---

## Deploy (Vercel)

1. Push this repo to GitHub (already wired to `agencytrackingdashboard`).
2. Import the repo in Vercel.
3. Add the two `NEXT_PUBLIC_SUPABASE_*` environment variables in Vercel project settings.
4. Deploy. The same Supabase database backs localhost and production.

---

## Notes

- Dev server runs on port 3030 (`next dev -p 3030`).
- Do not run `npm run build` while `npm run dev` is running in the same folder. The
  production build overwrites the dev `.next` chunks and the dev server then 500s with
  "Cannot find module './630.js'". Stop dev first, or build in a clean checkout.
