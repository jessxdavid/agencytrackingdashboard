"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLeads } from "@/lib/leads-store";
import { computeSummary, presetRange, type TimePreset, type FunnelStep } from "@/lib/metrics";
import { STAGE_META, STAGE_TONES } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { Sparkles, Users, CheckCircle2, Heart, Send, Mail, MailPlus, Clapperboard, Star } from "lucide-react";

const PRESETS: { key: TimePreset; label: string }[] = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "biweekly", label: "Bi-weekly" },
  { key: "30d", label: "30 Days" },
  { key: "custom", label: "Custom" },
];

export default function DashboardPage() {
  const { leads } = useLeads();
  const [preset, setPreset] = useState<TimePreset>("30d");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const range = useMemo(() => {
    if (preset === "custom" && customStart && customEnd) {
      return presetRange("custom", { start: new Date(customStart), end: new Date(customEnd + "T23:59:59") });
    }
    return presetRange(preset === "custom" ? "30d" : preset);
  }, [preset, customStart, customEnd]);

  const s = useMemo(() => computeSummary(leads, range), [leads, range]);
  const recent = leads.slice(0, 6);

  const outreach = [
    { label: "Close Friends Outreach", value: s.closeFriendsOutreach, icon: <Heart className="h-4 w-4" /> },
    { label: "DM Outreach", value: s.dmOutreach, icon: <Send className="h-4 w-4" /> },
    { label: "Emails Sent", value: s.emailsSent, icon: <Mail className="h-4 w-4" /> },
    { label: "Follow-up Emails", value: s.followupEmails, icon: <MailPlus className="h-4 w-4" /> },
    { label: "Looms", value: s.looms, icon: <Clapperboard className="h-4 w-4" /> },
    { label: "Close Friends Stories", value: s.stories, icon: <Star className="h-4 w-4" /> },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade opacity-30" />
        <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.18em] text-amber-500/90">
              Acquisition Dashboard
            </span>
          </div>
          <h1 className="text-[2rem] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[2.5rem]">
            What is in the pipeline.
          </h1>
          <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
            A live summary of every lead, where they sit in the funnel, and the outreach behind them.
          </p>
          <div className="mt-5 flex items-center gap-1.5 text-[13px] text-muted-foreground/70">
            <Sparkles className="h-3 w-3" />
            <span>Updates live as the team works the pipeline.</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-[14px] font-medium transition",
                  preset === p.key
                    ? "border-border-strong bg-surface-2 text-foreground"
                    : "border-border bg-surface-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
            {preset === "custom" && (
              <div className="ml-1 flex items-center gap-1.5">
                <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="text-[14px]" />
                <span className="text-[14px] text-muted-foreground">to</span>
                <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="text-[14px]" />
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Headline cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <SplitCard label="Total Leads" subtitle="In the pipeline (window)" value={s.total} icon={<Users className="h-4 w-4" />} accent="info" />
          <SplitCard label="Active Leads" subtitle="Not closed, lost or no-show" value={Math.max(0, s.active)} icon={<Sparkles className="h-4 w-4" />} accent="info" />
          <SplitCard label="Closed Deals" subtitle="Signed in window" value={s.closeDeal} icon={<CheckCircle2 className="h-4 w-4" />} accent="brand" />
        </div>

        {/* Hard metrics — pipeline stage rollup */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6">
          <SectionHeader title="Pipeline breakdown" hint="Leads per stage in the selected window" />
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <Metric letter="A" label="Possible Clients" value={s.possible} />
            <Metric letter="B" label="Qualified Partner" value={s.qualified} />
            <Metric letter="C" label="Loom Made" value={s.loom} />
            <Metric letter="D" label="Outreach Sent" value={s.outreach} />
            <Metric letter="E" label="Engaged" value={s.engaged} />
            <Metric letter="F" label="Calls Booked" value={s.callsBooked} highlight />
            <Metric letter="G" label="Follow Up" value={s.followUp} />
            <Metric letter="H" label="No Show" value={s.noShow} />
            <Metric letter="I" label="No Close" value={s.noClose} />
            <Metric letter="J" label="Close Deal" value={s.closeDeal} highlight />
            <Metric letter="K" label="Close Friends Stories" value={s.stories} />
          </div>
        </section>

        {/* Acquisition funnel across all 12 stages */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <div className="flex items-baseline gap-3">
              <span className="section-eyebrow">Acquisition funnel</span>
              <span className="text-[13px] text-muted-foreground/70">Every stage of the pipeline - click a stage to open the board</span>
            </div>
            <span className="shrink-0 rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wider text-brand">
              Pipeline
            </span>
          </div>
          <StageFunnel funnel={s.funnel} />
        </section>

        {/* Outreach activity totals */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6">
          <SectionHeader title="Outreach activity" hint="Totals in the selected window" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {outreach.map((o) => (
              <BigStat key={o.label} label={o.label} value={String(o.value)} icon={o.icon} />
            ))}
          </div>
        </section>

        {/* Recent leads */}
        <section className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <SectionHeader title="Recent leads" hint="Latest additions" noMargin />
            <Link href="/pipeline" className="text-[14px] font-medium text-muted-foreground transition hover:text-foreground">
              View pipeline
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-[15px] text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {recent.map((l) => {
                const tone = STAGE_TONES[STAGE_META[l.stage].tone];
                return (
                  <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center justify-between gap-3 py-3 transition hover:opacity-80">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium">{l.name || "Untitled"}</div>
                      <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {[l.niche, l.funnel].filter(Boolean).join(" / ") || "-"}
                        {l.added_by ? " / by " + l.added_by : ""}
                      </div>
                    </div>
                    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", tone.chip, tone.fg)}>
                      {STAGE_META[l.stage].label}
                    </span>
                    <span className="hidden w-[120px] shrink-0 text-right font-mono text-[12px] text-muted-foreground sm:block">
                      {formatDate(l.date)}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function SectionHeader({ title, hint, noMargin }: { title: string; hint?: string; noMargin?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", !noMargin && "mb-5")}>
      <div className="flex items-baseline gap-3">
        <span className="section-eyebrow">{title}</span>
        {hint && <span className="text-[13px] text-muted-foreground/70">{hint}</span>}
      </div>
    </div>
  );
}

function Metric({ letter, label, value, highlight }: { letter: string; label: string; value: number | string; highlight?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
        <span className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[11px] text-muted-foreground">{letter}</span>
        <span>{label}</span>
      </div>
      <div className={cn("break-words font-mono text-[20px] font-medium tabular-nums sm:text-[24px]", highlight && "text-success")}>
        {value}
      </div>
    </div>
  );
}

function SplitCard({
  label, subtitle, value, icon, accent,
}: { label: string; subtitle: string; value: number; icon: React.ReactNode; accent: "info" | "brand" }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-subtle">
      <div className={cn("pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full blur-3xl", accent === "info" ? "bg-info/15" : "bg-brand/15")} />
      <div className={cn("mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-[0.18em]", accent === "info" ? "text-info" : "text-brand")}>
        {icon}
        {label}
      </div>
      <div className="font-mono text-[48px] font-semibold leading-none tabular-nums">{value}</div>
      <div className="mt-2 text-[14px] text-muted-foreground">{subtitle}</div>
    </div>
  );
}

function BigStat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-5">
      <div className="mb-1.5 flex items-center gap-1.5 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
        {icon && <span className="opacity-70">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div className="font-mono text-[28px] font-medium tabular-nums">{value}</div>
    </div>
  );
}

function StageFunnel({ funnel }: { funnel: FunnelStep[] }) {
  const top = funnel[0]?.count ?? 0;
  if (top === 0) {
    return <p className="py-6 text-center text-[15px] text-muted-foreground">No leads in the selected window.</p>;
  }
  return (
    <div className="-mx-2 overflow-x-auto pb-2">
      <div className="mx-2 min-w-[980px] space-y-4">
        <div className="flex h-32 items-stretch gap-1">
          {funnel.map((step) => {
            const tone = STAGE_TONES[STAGE_META[step.key].tone];
            const heightPct = Math.max(step.pct_of_top, step.count ? 16 : 6);
            return (
              <Link key={step.key} href="/pipeline" className="group relative flex flex-1 flex-col items-center justify-end">
                <div
                  className={cn(
                    "relative flex w-full items-center justify-center overflow-hidden rounded-md border border-border transition group-hover:border-border-strong",
                    step.count ? tone.bg : "bg-surface-2",
                  )}
                  style={{ height: `${heightPct}%`, minHeight: 24 }}
                >
                  <span className={cn("relative font-mono text-[16px] font-semibold tabular-nums", step.count && tone.fg)}>
                    {step.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="flex items-start gap-1">
          {funnel.map((step) => (
            <div key={step.key} className="flex flex-1 flex-col items-center px-0.5 text-center">
              <div className="text-[10px] font-medium uppercase leading-tight tracking-wide text-muted-foreground">{step.label}</div>
              <div className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground/80">{step.pct_of_top}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
