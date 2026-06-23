// LIVE-only config. We talk to Supabase PostgREST directly over fetch (no
// supabase-js client) because the library's auth/lock wrapper stalled the
// first query by several seconds. Plain REST with the anon key is ~200ms.
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
export const SUPABASE_URL = url;
export const SUPABASE_ANON = anon;
export const REST = `${url}/rest/v1/leads`;
export const sbHeaders: Record<string, string> = {
  apikey: anon,
  Authorization: `Bearer ${anon}`,
  "Content-Type": "application/json",
};
