import type { Lead, Stage } from "./types";
import { STAGES } from "./types";

export interface OutreachMetrics {
  total: number;
  stageCounts: Record<Stage, number>;
  qualified: number;
  engaged: number;     // positive + negative replies
  callOne: number;
  callTwo: number;
  followUp: number;
  noShow: number;
  noClose: number;
  closed: number;      // close_deal
  closeFriendsOutreach: number;
  dmOutreach: number;
  emailsSent: number;
  emailFollowups: number;
  looms: number;
  closeFriendsStories: number;
}

function emptyStageCounts(): Record<Stage, number> {
  return STAGES.reduce((acc, s) => {
    acc[s] = 0;
    return acc;
  }, {} as Record<Stage, number>);
}

export function computeMetrics(leads: Lead[]): OutreachMetrics {
  const stageCounts = emptyStageCounts();
  for (const l of leads) stageCounts[l.stage] = (stageCounts[l.stage] ?? 0) + 1;

  return {
    total: leads.length,
    stageCounts,
    qualified: stageCounts.qualified_partner,
    engaged: stageCounts.engaged_positive + stageCounts.engaged_negative,
    callOne: stageCounts.call_one_booked,
    callTwo: stageCounts.call_two_booked,
    followUp: stageCounts.follow_up,
    noShow: stageCounts.no_show,
    noClose: stageCounts.no_close,
    closed: stageCounts.close_deal,
    closeFriendsOutreach: leads.reduce((s, l) => s + (l.close_friends?.length || 0), 0),
    dmOutreach: leads.reduce((s, l) => s + (l.dms?.length || 0), 0),
    emailsSent: leads.filter((l) => !!l.email_sent_date).length,
    emailFollowups: leads.reduce((s, l) => s + (l.email_followups?.length || 0), 0),
    looms: leads.reduce((s, l) => s + (l.loom_links?.length || 0), 0),
    closeFriendsStories: leads.reduce((s, l) => s + (l.close_friends_stories || 0), 0),
  };
}

export function pct(num: number, denom: number) {
  if (!denom) return 0;
  return Math.round((num / denom) * 100);
}
