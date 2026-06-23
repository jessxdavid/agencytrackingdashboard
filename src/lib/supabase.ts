import { createClient } from "@supabase/supabase-js";

// Draft mode: if env is absent, fall back to local browser storage so the
// dashboard runs without a backend. Set both vars to go live + shared.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && anon);

export const supabase = hasSupabase
  ? createClient(url as string, anon as string, {
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null;
