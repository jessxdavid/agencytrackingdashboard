import { createClient } from "@supabase/supabase-js";

// LIVE-only. The app requires Supabase so the whole team shares one dataset.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "This dashboard is live-only (shared team data). Set both in .env.local " +
      "(local) and in the Vercel project settings (production), then restart.",
  );
}

export const hasSupabase = true;

export const supabase = createClient(url, anon, {
  realtime: { params: { eventsPerSecond: 5 } },
});
