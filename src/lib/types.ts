// Agency acquisition pipeline: one funnel, 12 stages. New leads land in Possible Clients.
export const STAGES = [
  "possible_clients",
  "qualified_partner",
  "loom_made",
  "outreach_sent",
  "engaged_positive",
  "engaged_negative",
  "call_one_booked",
  "follow_up",
  "no_show",
  "call_two_booked",
  "no_close",
  "close_deal",
] as const;

export type Stage = (typeof STAGES)[number];

export type Who = "Jonas" | "Austin" | "Jake";
export const WHO_OPTIONS: Who[] = ["Jonas", "Austin", "Jake"];

// Outreach tracking entries inside a lead card.
export interface CloseFriendEntry {
  id: string;
  date: string; // YYYY-MM-DD
  who: Who;
}
export interface DmEntry {
  id: string;
  date: string; // YYYY-MM-DD
  who: Who;
  time: string; // HH:MM
}

export interface Lead {
  id: string;
  // ---- input fields ----
  name: string;
  ig: string;
  youtube: string;
  email: string;
  niche: string;
  funnel: string;
  date: string; // input date, YYYY-MM-DD
  // ---- pipeline ----
  stage: Stage;
  // ---- lead card sections ----
  loom_links: string[];                 // Add Loom
  close_friends: CloseFriendEntry[];    // Close Friends outreach (date + who)
  email_sent_date: string | null;       // Email outreach: date email was sent
  email_followups: string[];            // dates follow-up emails were sent
  dms: DmEntry[];                        // DM outreach (date + who + time)
  close_friends_stories: number;        // hard metric
  notes: string | null;
  // ---- stage stamps ----
  engaged_date: string | null;
  call_one_date: string | null;
  call_two_date: string | null;
  closed_date: string | null;
  created_at: string;
  updated_at: string;
}

export const STAGE_META: Record<
  Stage,
  { label: string; tone: keyof typeof STAGE_TONES; order: number }
> = {
  possible_clients: { label: "POSSIBLE CLIENTS", tone: "inbound", order: 0 },
  qualified_partner: { label: "QUALIFIED PARTNER", tone: "rapport", order: 1 },
  loom_made: { label: "LOOM MADE", tone: "problem", order: 2 },
  outreach_sent: { label: "OUTREACH SENT", tone: "proposed", order: 3 },
  engaged_positive: { label: "ENGAGED — POSITIVE REPLY", tone: "discovery", order: 4 },
  engaged_negative: { label: "ENGAGED — NEGATIVE REPLY", tone: "outbound", order: 5 },
  call_one_booked: { label: "CALL 1 BOOKED 🚀", tone: "booked", order: 6 },
  follow_up: { label: "FOLLOW UP", tone: "follow", order: 7 },
  no_show: { label: "NO SHOW", tone: "broke", order: 8 },
  call_two_booked: { label: "CALL 2 BOOKED 🚀", tone: "booked", order: 9 },
  no_close: { label: "NO CLOSE", tone: "broke", order: 10 },
  close_deal: { label: "CLOSE DEAL ✅", tone: "closed", order: 11 },
};

export const STAGE_TONES = {
  outbound: { bg: "bg-stage-outbound-bg", fg: "text-stage-outbound-fg", chip: "bg-stage-outbound-chip" },
  inbound: { bg: "bg-stage-inbound-bg", fg: "text-stage-inbound-fg", chip: "bg-stage-inbound-chip" },
  rapport: { bg: "bg-stage-rapport-bg", fg: "text-stage-rapport-fg", chip: "bg-stage-rapport-chip" },
  discovery: { bg: "bg-stage-discovery-bg", fg: "text-stage-discovery-fg", chip: "bg-stage-discovery-chip" },
  problem: { bg: "bg-stage-problem-bg", fg: "text-stage-problem-fg", chip: "bg-stage-problem-chip" },
  proposed: { bg: "bg-stage-proposed-bg", fg: "text-stage-proposed-fg", chip: "bg-stage-proposed-chip" },
  follow: { bg: "bg-stage-follow-bg", fg: "text-stage-follow-fg", chip: "bg-stage-follow-chip" },
  booked: { bg: "bg-stage-booked-bg", fg: "text-stage-booked-fg", chip: "bg-stage-booked-chip" },
  closed: { bg: "bg-stage-closed-bg", fg: "text-stage-closed-fg", chip: "bg-stage-closed-chip" },
  broke: { bg: "bg-stage-broke-bg", fg: "text-stage-broke-fg", chip: "bg-stage-broke-chip" },
} as const;

export function pipelineColumns(): Stage[] {
  return [...STAGES];
}
