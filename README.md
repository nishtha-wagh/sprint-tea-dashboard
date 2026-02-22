# Sprint Tea Party Dashboard

A personal job search tracker with persistent data via Supabase. Track applications, daily practice questions, topics to master, and streaks.

## Quick Setup (15 minutes)

### 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click **New Project** — give it a name, set a password, choose a region
3. Wait for the project to initialize (~2 min)
4. Go to **SQL Editor** (left sidebar) → **New Query**
5. Copy the entire contents of `supabase/schema.sql` and paste it in
6. Click **Run** — this creates all tables and seed data

### 2. Get your API keys

1. In Supabase, go to **Project Settings** → **API** (left sidebar)
2. Copy the **Project URL** (looks like `https://abc123.supabase.co`)
3. Copy the **anon/public** key (the long string under "Project API keys")

### 3. Set up the project locally

```bash
# Clone or download this folder, then:
cd sprint-tea-dashboard
npm install

# Create your environment file
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel (free)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repo
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
5. Click **Deploy**

Your dashboard is now live at `your-project.vercel.app`

## Project Structure

```
sprint-tea-dashboard/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page (wires hook to UI)
│   └── globals.css         # Global styles + animations
├── components/
│   └── Dashboard.tsx       # Full dashboard UI component
├── lib/
│   ├── supabase.ts         # Supabase client initialization
│   ├── db.ts               # All database CRUD operations
│   └── useDashboard.ts     # React hook for state management
├── supabase/
│   └── schema.sql          # Complete database schema + seed data
├── .env.local.example      # Template for environment variables
├── package.json
└── README.md
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `applications` | Job applications with status tracking |
| `daily_practice` | Daily practice questions/tasks |
| `roles` | Role categories (Traditional, Product, etc.) |
| `subcategories` | Topic subcategories under each role |
| `topics` | Individual topics to study |
| `streak_log` | Daily activity logging for streak counting |
| `progress_log` | Daily snapshot for the 14-day chart |

## Features

- **Collapsible Applications** — grouped by status, scales to 100+ apps
- **Daily Practice** — add/check/remove daily tasks
- **Topics to Master** — hierarchical: Roles → Subcategories → Topics
- **14-Day Progress Chart** — visualize applications and questions over time
- **Stats Dashboard** — Total Saved, Total Applied, Questions Practiced, Topics Studied, Daily Streak
- **Persistent Data** — everything saved to Supabase PostgreSQL
- **Optimistic Updates** — UI updates instantly, syncs to DB in background

## Updating the Progress Chart

The 14-day chart reads from the `progress_log` table. To populate it daily, you can:

1. **Manual**: Run this SQL daily in Supabase SQL Editor:
```sql
INSERT INTO progress_log (log_date, applications_count, questions_count)
VALUES (
  CURRENT_DATE,
  (SELECT COUNT(*) FROM applications WHERE applied_date = CURRENT_DATE),
  (SELECT COUNT(*) FROM daily_practice WHERE practice_date = CURRENT_DATE AND done = true)
)
ON CONFLICT (log_date) DO UPDATE SET
  applications_count = EXCLUDED.applications_count,
  questions_count = EXCLUDED.questions_count;
```

2. **Automated**: Set up a Supabase Edge Function or pg_cron to run this nightly.
