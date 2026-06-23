// LIVE-only config. We talk to Supabase PostgREST directly over fetch (no
// supabase-js client). The env values are sanitized defensively: pasting into
// hosting dashboards can introduce stray whitespace/newlines (and even a
// duplicated key), and a newline inside a header value makes fetch throw
// "Invalid value". We extract the first clean URL + JWT so it always works.
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const urlMatch = rawUrl.match(/https?:\/\/[^\s"']+\.supabase\.co/i);
const url = (urlMatch ? urlMatch[0] : rawUrl.trim()).replace(/\/+$/, "");

// A Supabase anon key is a JWT: three base64url segments separated by dots.
const jwtMatch = rawAnon.match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
const anon = jwtMatch ? jwtMatch[0] : rawAnon.replace(/\s+/g, "");

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
