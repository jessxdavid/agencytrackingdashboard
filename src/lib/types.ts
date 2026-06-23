// ---------------------------------------------------------------------------
// Agency acquisition pipeline (kanban) — unchanged. 12 stages.
// ---------------------------------------------------------------------------
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

export interface CloseFriendEntry { id: string; date: string; who: Who }
export interface DmEntry { id: string; date: string; who: Who; time: string }

// ---------------------------------------------------------------------------
// DM-setting model (powers the dashboard the boss prefers).
// ---------------------------------------------------------------------------
export type LeadType = "inbound" | "warm_outbound" | "self_book_dial" | "outbound_dial";
export const LEAD_TYPE_META: Record<
  LeadType,
  { label: string; direction: "inbound" | "outbound"; channel: "dm" | "dial" }
> = {
  inbound: { label: "Inbound (DM's)", direction: "inbound", channel: "dm" },
  warm_outbound: { label: "Outbound (DM's)", direction: "outbound", channel: "dm" },
  self_book_dial: { label: "Self Book (Dial)", direction: "inbound", channel: "dial" },
  outbound_dial: { label: "Outbound (Dial)", direction: "outbound", channel: "dial" },
};

export type CloseType = "one_on_one" | "group";

export const DM_STAGES = [
  "outbound",
  "inbound",
  "building_rapport",
  "discovery",
  "problem_awareness",
  "call_proposed",
  "follow_up",
  "call_booked",
  "closed",
  "broke",
] as const;
export type DmStage = (typeof DM_STAGES)[number];

export const DM_STAGE_META: Record<DmStage, { label: string; tone: keyof typeof STAGE_TONES; order: number }> = {
  outbound: { label: "WARM OUTBOUND", tone: "outbound", order: 0 },
  inbound: { label: "INBOUND", tone: "inbound", order: 0 },
  building_rapport: { label: "BUILDING RAPPORT", tone: "rapport", order: 1 },
  discovery: { label: "DISCOVERY / PROBING", tone: "discovery", order: 2 },
  problem_awareness: { label: "PROBLEM AWARENESS", tone: "problem", order: 3 },
  call_proposed: { label: "CALL PROPOSED", tone: "proposed", order: 4 },
  follow_up: { label: "FOLLOW UP", tone: "follow", order: 5 },
  call_booked: { label: "CALL BOOKED", tone: "booked", order: 6 },
  closed: { label: "CLOSED", tone: "closed", order: 7 },
  broke: { label: "BROKE", tone: "broke", order: 8 },
};

export const DIAL_STAGES = [
  "application_submitted",
  "call_booked",
  "no_answer_1",
  "texted_with_response",
  "follow_up",
  "triage_delete_book",
  "closed_deal",
  "no_close",
  "no_show",
  "follow_up_no_close",
] as const;
export type DialStage = (typeof DIAL_STAGES)[number];

export const DIAL_STAGE_META: Record<DialStage, { label: string; tone: keyof typeof STAGE_TONES; order: number }> = {
  application_submitted: { label: "APPLICATION SUBMITTED", tone: "inbound", order: 0 },
  call_booked: { label: "CALL BOOKED", tone: "booked", order: 1 },
  no_answer_1: { label: "NO ANSWER 1", tone: "proposed", order: 2 },
  texted_with_response: { label: "TEXTED W/ RESPONSE", tone: "discovery", order: 3 },
  follow_up: { label: "FOLLOW-UP", tone: "follow", order: 4 },
  triage_delete_book: { label: "CALL BOOKED TRIAGED", tone: "problem", order: 5 },
  closed_deal: { label: "CLOSED DEAL", tone: "closed", order: 6 },
  no_close: { label: "NO-CLOSE", tone: "outbound", order: 7 },
  no_show: { label: "NO-SHOW", tone: "broke", order: 8 },
  follow_up_no_close: { label: "FOLLOW-UP NO-CLOSE", tone: "rapport", order: 9 },
};

export interface EodEntry {
  id: string;
  setter_name: string;
  date: string;
  outbound: number;
  inbound: number;
  new_leads: number;
  calls_pitched: number;
  calls_booked_count: number;
  reflection: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Lead — superset: agency pipeline fields + DM-setting fields (all optional so
// existing agency leads keep working; DM fields drive the new dashboard).
// ---------------------------------------------------------------------------
export interface Lead {
  id: string;
  name: string;
  ig: string;
  youtube: string;
  email: string;
  niche: string;
  funnel: string;
  date: string;
  added_by: Who | null;
  stage: Stage;
  loom_links: string[];
  close_friends: CloseFriendEntry[];
  email_sent_date: string | null;
  email_followups: string[];
  dms: DmEntry[];
  close_friends_stories: number;
  notes: string | null;
  engaged_date: string | null;
  call_one_date: string | null;
  call_two_date: string | null;
  closed_date: string | null;
  created_at: string;
  updated_at: string;
  // ---- DM-setting / dashboard fields (optional) ----
  lead_type?: LeadType | null;
  dm_stage?: DmStage | null;
  first_contact_date?: string | null;
  booking_link_sent_date?: string | null;
  call_booked_date?: string | null;
  follow_ups?: number | null;
  asset_consumed?: boolean | null;
  unqualified?: boolean | null;
  responded?: boolean | null;
  replied?: boolean | null;
  deal_amount?: number | null;
  cash_collected?: number | null;
  close_type?: CloseType | null;
  dial_stage?: DialStage | null;
  dial_entered_date?: string | null;
  confirmed_show?: boolean | null;
}

export const STAGE_META: Record<Stage, { label: string; tone: keyof typeof STAGE_TONES; order: number }> = {
  possible_clients: { label: "POSSIBLE CLIENTS", tone: "inbound", order: 0 },
  qualified_partner: { label: "QUALIFIED PARTNER", tone: "rapport", order: 1 },
  loom_made: { label: "LOOM MADE", tone: "problem", order: 2 },
  outreach_sent: { label: "OUTREACH SENT", tone: "proposed", order: 3 },
  engaged_positive: { label: "ENGAGED - POSITIVE REPLY", tone: "discovery", order: 4 },
  engaged_negative: { label: "ENGAGED - NEGATIVE REPLY", tone: "outbound", order: 5 },
  call_one_booked: { label: "CALL 1 BOOKED", tone: "booked", order: 6 },
  follow_up: { label: "FOLLOW UP", tone: "follow", order: 7 },
  no_show: { label: "NO SHOW", tone: "broke", order: 8 },
  call_two_booked: { label: "CALL 2 BOOKED", tone: "booked", order: 9 },
  no_close: { label: "NO CLOSE", tone: "broke", order: 10 },
  close_deal: { label: "CLOSE DEAL", tone: "closed", order: 11 },
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
