import type { Lead, Stage } from "./types";
import { STAGES, STAGE_META } from "./types";

// Time window
export type TimePreset = "daily" | "weekly" | "biweekly" | "30d" | "custom";
export interface DateRange { start: Date; end: Date }

export function presetRange(preset: TimePreset, custom?: DateRange): DateRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  switch (preset) {
    case "daily": break;
    case "weekly": start.setDate(start.getDate() - 6); break;
    case "biweekly": start.setDate(start.getDate() - 13); break;
    case "30d": start.setDate(start.getDate() - 29); break;
    case "custom": if (custom) return custom; break;
  }
  return { start, end };
}

function anchor(l: Lead): string | null {
  return l.date || l.created_at || null;
}
function inRange(dateStr: string | null, r: DateRange): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  return d >= r.start && d <= r.end;
}

export interface FunnelStep {
  key: Stage;
  label: string;
  count: number;
  pct_of_top: number;
  drop_off_pct: number;
}

export interface PipelineSummary {
  total: number;
  active: number;
  closed: number;
  counts: Record<Stage, number>;
  possible: number;
  qualified: number;
  loom: number;
  outreach: number;
  engaged: number;
  callsBooked: number;
  followUp: number;
  noShow: number;
  noClose: number;
  closeDeal: number;
  stories: number;
  closeFriendsOutreach: number;
  dmOutreach: number;
  emailsSent: number;
  followupEmails: number;
  looms: number;
  funnel: FunnelStep[];
}

function emptyCounts(): Record<Stage, number> {
  return STAGES.reduce((acc, s) => { acc[s] = 0; return acc; }, {} as Record<Stage, number>);
}

export function computeSummary(leads: Lead[], range: DateRange): PipelineSummary {
  const inWindow = leads.filter((l) => inRange(anchor(l), range));
  const counts = emptyCounts();
  for (const l of inWindow) counts[l.stage] = (counts[l.stage] ?? 0) + 1;

  const closeDeal = counts.close_deal;
  const noClose = counts.no_close;
  const noShow = counts.no_show;

  const funnel: FunnelStep[] = STAGES.map((s, i) => {
    const count = counts[s];
    const top = counts[STAGES[0]] || 0;
    const prev = i > 0 ? counts[STAGES[i - 1]] : 0;
    return {
      key: s,
      label: STAGE_META[s].label,
      count,
      pct_of_top: top ? Math.round((count / top) * 100) : 0,
      drop_off_pct: i > 0 && prev ? Math.max(0, Math.round(((prev - count) / prev) * 100)) : 0,
    };
  });

  return {
    total: inWindow.length,
    active: inWindow.length - (closeDeal + noClose + noShow),
    closed: closeDeal,
    counts,
    possible: counts.possible_clients,
    qualified: counts.qualified_partner,
    loom: counts.loom_made,
    outreach: counts.outreach_sent,
    engaged: counts.engaged_positive + counts.engaged_negative,
    callsBooked: counts.call_one_booked + counts.call_two_booked,
    followUp: counts.follow_up,
    noShow,
    noClose,
    closeDeal,
    stories: inWindow.reduce((s, l) => s + (l.close_friends_stories || 0), 0),
    closeFriendsOutreach: inWindow.reduce((s, l) => s + (l.close_friends?.length || 0), 0),
    dmOutreach: inWindow.reduce((s, l) => s + (l.dms?.length || 0), 0),
    emailsSent: inWindow.filter((l) => !!l.email_sent_date).length,
    followupEmails: inWindow.reduce((s, l) => s + (l.email_followups?.length || 0), 0),
    looms: inWindow.reduce((s, l) => s + (l.loom_links?.length || 0), 0),
    funnel,
  };
}

export function pct(num: number, denom: number) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}
