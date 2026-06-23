"use client";

import Link from "next/link";
import { useLeads } from "@/lib/leads-store";
import { computeMetrics } from "@/lib/metrics";
import { STAGES, STAGE_META, STAGE_TONES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import {
  Users,
  Handshake,
  MessageSquare,
  CalendarCheck,
  CheckCircle2,
  Star,
  Heart,
  Send,
  Mail,
  Clapperboard,
  ArrowUpRight,
  Plus,
} from "lucide-react";

// Glassmorphism panel (dashboard only). Mild backdrop blur keeps first paint cheap.
const GLASS =
  "rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur-md " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-12px_rgba(0,0,0,0.6)]";

export default function DashboardPage() {
  const { leads, loading } = useLeads();
  const m = computeMetrics(leads);

  const kpis = [
    { label: "Total Leads", value: m.total, icon: Users },
    { label: "Qualified Partners", value: m.qualified, icon: Handshake },
    { label: "Engaged", value: m.engaged, icon: MessageSquare },
    { label: "Calls Booked", value: m.callOne + m.callTwo, icon: CalendarCheck },
    { label: "Closed", value: m.closed, icon: CheckCircle2 },
  ];

  const hardMetrics = [
    { label: "Close Friends Outreach", value: m.closeFriendsOutreach, icon: Heart },
    { label: "DM Outreach", value: m.dmOutreach, icon: Send },
    { label: "Emails Sent", value: m.emailsSent, icon: Mail },
    { label: "Follow-up Emails", value: m.emailFollowups, icon: Mail },
    { label: "Looms", value: m.looms, icon: Clapperboard },
  ];

  const maxStage = Math.max(1, ...STAGES.map((s) => m.stageCounts[s]));
  const recent = leads.slice(0, 6);

  return (
    <>
      {/* light decorative backdrop so the glass panels read (cheap to paint) */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 top-0 h-[360px] w-[360px] rounded-full bg-brand/15 blur-[90px]" />
        <div className="absolute right-0 top-1/2 h-[380px] w-[380px] rounded-full bg-info/10 blur-[90px]" />
      </div>

      <main className="mx-auto w-full max-w-[1900px] space-y-5 px-4 py-6 sm:space-y-6 sm:px-8 sm:py-8 lg:px-12">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="section-eyebrow">Overview</span>
            <h1 className="mt-0.5 text-[22px] font-semibold tracking-tight sm:text-[26px]">
              Agency Acquisition Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/input"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3.5 py-2 text-[14px] font-semibold text-brand-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Link>
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-[14px] text-muted-foreground transition hover:text-foreground"
            >
              Pipeline <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("h-[96px] animate-pulse", GLASS)} />
            ))}
          </div>
        ) : (
          <>
            {/* KPIs */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {kpis.map((k) => (
                <div key={k.label} className={cn(GLASS, "p-5")}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] uppercase tracking-wider text-muted-foreground">
                      {k.label}
                    </span>
                    <k.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 font-mono text-[38px] font-semibold leading-none tabular-nums">
                    {k.value}
                  </div>
                </div>
              ))}
            </section>

            {/* Hard metrics */}
            <section className={cn(GLASS, "p-5")}>
              <span className="section-eyebrow">Hard Metrics</span>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_2.4fr]">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-4">
                  <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-muted-foreground">
                    <Star className="h-4 w-4 text-warning" /> Close Friends Stories
                  </div>
                  <div className="font-mono text-[48px] font-bold leading-none tabular-nums">
                    {m.closeFriendsStories}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {hardMetrics.map((h) => (
                    <div key={h.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3.5">
                      <h.icon className="h-4 w-4 text-muted-foreground" />
                      <div className="mt-2 font-mono text-[26px] font-semibold leading-none tabular-nums">
                        {h.value}
                      </div>
                      <div className="mt-1.5 text-[10px] uppercase leading-tight tracking-wider text-muted-foreground">
                        {h.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Pipeline distribution */}
              <section className={cn(GLASS, "p-5")}>
                <div className="flex items-center justify-between">
                  <span className="section-eyebrow">Pipeline Distribution</span>
                  <Link href="/pipeline" className="text-[12px] text-muted-foreground hover:text-foreground">
                    Open
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
                  {STAGES.map((s) => {
                    const tone = STAGE_TONES[STAGE_META[s].tone];
                    const count = m.stageCounts[s];
                    return (
                      <Link key={s} href="/pipeline" className="flex items-center gap-2.5">
                        <span className="w-[120px] shrink-0 truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {STAGE_META[s].label}
                        </span>
                        <div className="relative h-4 flex-1 overflow-hidden rounded bg-white/[0.06]">
                          <div
                            className={cn("absolute inset-y-0 left-0 rounded", tone.bg)}
                            style={{
                              width: `${Math.round((count / maxStage) * 100)}%`,
                              minWidth: count ? "6px" : "0",
                            }}
                          />
                        </div>
                        <span className={cn("w-5 shrink-0 text-right font-mono text-[12px] tabular-nums", tone.fg)}>
                          {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              {/* Recent leads */}
              <section className={cn(GLASS, "p-5")}>
                <span className="section-eyebrow">Recent Leads</span>
                <div className="mt-3 flex flex-col divide-y divide-white/[0.06]">
                  {recent.length === 0 && (
                    <p className="py-6 text-center text-[13px] text-muted-foreground">No leads yet.</p>
                  )}
                  {recent.map((l) => {
                    const tone = STAGE_TONES[STAGE_META[l.stage].tone];
                    return (
                      <Link
                        key={l.id}
                        href={`/leads/${l.id}`}
                        className="flex items-center justify-between gap-3 py-2.5 transition hover:opacity-80"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14px] font-medium">{l.name || "Untitled"}</div>
                          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {[l.niche, l.funnel].filter(Boolean).join(" / ") || "-"}
                            {l.added_by ? " / by " + l.added_by : ""}
                          </div>
                        </div>
                        <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase", tone.chip, tone.fg)}>
                          {STAGE_META[l.stage].label}
                        </span>
                        <span className="hidden w-[100px] shrink-0 text-right text-[11px] text-muted-foreground sm:block">
                          {formatDate(l.date)}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
