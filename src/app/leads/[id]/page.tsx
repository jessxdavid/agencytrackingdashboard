"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLead, updateLead, deleteLead, moveStage, cryptoRandomId } from "@/lib/leads-store";
import type { Lead, Stage, Who, CloseFriendEntry, DmEntry } from "@/lib/types";
import { STAGES, STAGE_META, STAGE_TONES, WHO_OPTIONS } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Plus, Trash2, Minus } from "lucide-react";

export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { lead, loading } = useLead(id);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 text-center text-muted-foreground">
        Loading lead…
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 text-center text-muted-foreground">
        Lead not found.{" "}
        <Link href="/pipeline" className="underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  const tone = STAGE_TONES[STAGE_META[lead.stage].tone];

  return (
    <main className="mx-auto max-w-[1400px] space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <Link
        href="/pipeline"
        className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to pipeline
      </Link>

      <LeadHeader lead={lead} toneBg={tone.bg} toneChip={tone.chip} toneFg={tone.fg} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <LeadDetailsCard lead={lead} />
          <AddLoomCard lead={lead} />
          <OutreachCard lead={lead} />
        </div>

        <div className="space-y-6">
          <StageCard lead={lead} />
          <HardMetricsCard lead={lead} />
          <button
            onClick={async () => {
              if (confirm(`Delete ${lead.name || "this lead"}?`)) {
                await deleteLead(lead.id);
                router.push("/pipeline");
              }
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-surface-1 py-2.5 text-[14px] text-brand transition hover:bg-brand/10"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete lead
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------------------------------------------- header */

function LeadHeader({
  lead,
  toneBg,
  toneChip,
  toneFg,
}: {
  lead: Lead;
  toneBg: string;
  toneChip: string;
  toneFg: string;
}) {
  const [name, setName] = useState(lead.name);
  useEffect(() => setName(lead.name), [lead.id, lead.name]);

  const igHref = lead.ig
    ? lead.ig.startsWith("http")
      ? lead.ig
      : `https://instagram.com/${lead.ig.replace(/^@/, "")}`
    : "";

  return (
    <div className={cn("rounded-xl border border-border p-4 shadow-subtle sm:p-6", toneBg)}>
      <div className="mb-2 flex items-center gap-2 text-[12px]">
        <span className={cn("rounded px-2 py-0.5 font-semibold tracking-[0.1em]", toneChip, toneFg)}>
          {STAGE_META[lead.stage].label}
        </span>
      </div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => updateLead(lead.id, { name })}
        placeholder="Lead name"
        className="w-full bg-transparent text-[1.6rem] font-semibold leading-[1.05] tracking-[-0.02em] outline-none placeholder:text-muted-foreground/50 sm:text-[2rem]"
      />
      {igHref && (
        <a
          href={igHref}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[15px] text-muted-foreground transition hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          {lead.ig.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- lead detail */

function LeadDetailsCard({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <SectionHeader title="Lead detail" suffix="Auto-saves" />

      <div className="space-y-5">
        <TextField
          label="Instagram"
          value={lead.ig}
          placeholder="@handle or profile URL"
          onCommit={(v) => updateLead(lead.id, { ig: v })}
        />
        <TextField
          label="YouTube"
          value={lead.youtube}
          placeholder="Channel URL"
          isLink
          onCommit={(v) => updateLead(lead.id, { youtube: v })}
        />
        <TextField
          label="Email"
          value={lead.email}
          placeholder="name@example.com"
          type="email"
          onCommit={(v) => updateLead(lead.id, { email: v })}
        />
        <TextField
          label="Niche"
          value={lead.niche}
          placeholder="What space are they in?"
          onCommit={(v) => updateLead(lead.id, { niche: v })}
        />
        <TextField
          label="Funnel"
          value={lead.funnel}
          placeholder="Where did they come from?"
          onCommit={(v) => updateLead(lead.id, { funnel: v })}
        />

        <FieldGroup label="Date">
          <input
            type="date"
            value={lead.date ?? ""}
            onChange={(e) => updateLead(lead.id, { date: e.target.value })}
            className="w-full max-w-xs"
          />
        </FieldGroup>

        <NotesField lead={lead} />
      </div>
    </section>
  );
}

function NotesField({ lead }: { lead: Lead }) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  useEffect(() => setNotes(lead.notes ?? ""), [lead.id, lead.notes]);
  return (
    <FieldGroup label="Notes">
      <textarea
        rows={4}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={() => updateLead(lead.id, { notes: notes || null })}
        placeholder="Anything worth remembering about this lead…"
        className="w-full"
      />
    </FieldGroup>
  );
}

/* ------------------------------------------------------------- add loom */

function AddLoomCard({ lead }: { lead: Lead }) {
  const [draft, setDraft] = useState("");
  const links = lead.loom_links ?? [];

  const add = () => {
    const url = draft.trim();
    if (!url) return;
    updateLead(lead.id, { loom_links: [...links, url] });
    setDraft("");
  };
  const remove = (idx: number) =>
    updateLead(lead.id, { loom_links: links.filter((_, i) => i !== idx) });

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <SectionHeader title="Add Loom" />

      {links.length === 0 ? (
        <p className="mb-4 text-[14px] text-muted-foreground/70">No Loom links yet.</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {links.map((url, i) => (
            <li
              key={`${url}-${i}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-1 px-3 py-2"
            >
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1.5 text-[14px] text-foreground transition hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{url.replace(/^https?:\/\/(www\.)?/, "")}</span>
              </a>
              <button
                onClick={() => remove(i)}
                aria-label="Remove Loom link"
                className="shrink-0 text-muted-foreground transition hover:text-brand"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          placeholder="https://loom.com/share/…"
          className="w-full"
        />
        <button
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3 py-2 text-[14px] transition hover:bg-surface-2"
        >
          <Plus className="h-3.5 w-3.5" /> Add Loom
        </button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------ outreach tracking */

function OutreachCard({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <SectionHeader title="Outreach tracking" />
      <div className="space-y-8">
        <CloseFriendsBlock lead={lead} />
        <EmailBlock lead={lead} />
        <DmBlock lead={lead} />
      </div>
    </section>
  );
}

function CloseFriendsBlock({ lead }: { lead: Lead }) {
  const entries = lead.close_friends ?? [];
  const [date, setDate] = useState("");
  const [who, setWho] = useState<Who>(WHO_OPTIONS[0]);

  const add = () => {
    if (!date) return;
    const entry: CloseFriendEntry = { id: cryptoRandomId(), date, who };
    updateLead(lead.id, { close_friends: [...entries, entry] });
    setDate("");
    setWho(WHO_OPTIONS[0]);
  };
  const remove = (entryId: string) =>
    updateLead(lead.id, { close_friends: entries.filter((e) => e.id !== entryId) });

  return (
    <div>
      <SubHeader>Close friends outreach</SubHeader>

      {entries.length === 0 ? (
        <p className="mb-3 text-[14px] text-muted-foreground/70">No close-friends outreach logged.</p>
      ) : (
        <ul className="mb-3 divide-y divide-border/60 border-y border-border/60">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-[14px]">
              <span className="font-mono tabular-nums text-muted-foreground">{formatDate(e.date)}</span>
              <span className="ml-auto font-medium">{e.who}</span>
              <button
                onClick={() => remove(e.id)}
                aria-label="Remove entry"
                className="text-muted-foreground transition hover:text-brand"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-w-0 flex-1"
        />
        <WhoSelect value={who} onChange={setWho} />
        <AddButton onClick={add} />
      </div>
    </div>
  );
}

function EmailBlock({ lead }: { lead: Lead }) {
  const followups = lead.email_followups ?? [];
  const [followDate, setFollowDate] = useState("");

  const addFollow = () => {
    if (!followDate) return;
    updateLead(lead.id, { email_followups: [...followups, followDate] });
    setFollowDate("");
  };
  const removeFollow = (idx: number) =>
    updateLead(lead.id, { email_followups: followups.filter((_, i) => i !== idx) });

  return (
    <div>
      <SubHeader>Email outreach</SubHeader>

      <FieldGroup label="Date email was sent">
        <input
          type="date"
          value={lead.email_sent_date ?? ""}
          onChange={(e) => updateLead(lead.id, { email_sent_date: e.target.value || null })}
          className="w-full max-w-xs"
        />
      </FieldGroup>

      <div className="mt-4">
        <label className="mb-1.5 block text-[14px] font-semibold tracking-tight text-foreground">
          Follow-up emails sent
        </label>

        {followups.length === 0 ? (
          <p className="mb-3 text-[14px] text-muted-foreground/70">No follow-ups logged.</p>
        ) : (
          <ul className="mb-3 divide-y divide-border/60 border-y border-border/60">
            {followups.map((d, i) => (
              <li key={`${d}-${i}`} className="flex items-center justify-between gap-3 py-2 text-[14px]">
                <span className="font-mono tabular-nums text-muted-foreground">{formatDate(d)}</span>
                <button
                  onClick={() => removeFollow(i)}
                  aria-label="Remove follow-up"
                  className="text-muted-foreground transition hover:text-brand"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={followDate}
            onChange={(e) => setFollowDate(e.target.value)}
            className="min-w-0 flex-1"
          />
          <AddButton onClick={addFollow} />
        </div>
      </div>
    </div>
  );
}

function DmBlock({ lead }: { lead: Lead }) {
  const entries = lead.dms ?? [];
  const [date, setDate] = useState("");
  const [who, setWho] = useState<Who>(WHO_OPTIONS[0]);
  const [time, setTime] = useState("");

  const add = () => {
    if (!date) return;
    const entry: DmEntry = { id: cryptoRandomId(), date, who, time };
    updateLead(lead.id, { dms: [...entries, entry] });
    setDate("");
    setWho(WHO_OPTIONS[0]);
    setTime("");
  };
  const remove = (entryId: string) =>
    updateLead(lead.id, { dms: entries.filter((e) => e.id !== entryId) });

  return (
    <div>
      <SubHeader>DM outreach</SubHeader>

      {entries.length === 0 ? (
        <p className="mb-3 text-[14px] text-muted-foreground/70">No DMs logged.</p>
      ) : (
        <ul className="mb-3 divide-y divide-border/60 border-y border-border/60">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-[14px]">
              <span className="font-mono tabular-nums text-muted-foreground">{formatDate(e.date)}</span>
              <span className="font-medium">{e.who}</span>
              {e.time && <span className="font-mono tabular-nums text-muted-foreground">{e.time}</span>}
              <button
                onClick={() => remove(e.id)}
                aria-label="Remove DM"
                className="ml-auto text-muted-foreground transition hover:text-brand"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="min-w-0 flex-1"
        />
        <WhoSelect value={who} onChange={setWho} />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="min-w-0 flex-1"
        />
        <AddButton onClick={add} />
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- sidebar */

function StageCard({ lead }: { lead: Lead }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <div className="mb-3 flex items-center gap-2">
        <span className="section-eyebrow">Stage</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <select
        value={lead.stage}
        onChange={(e) => moveStage(lead.id, e.target.value as Stage)}
        className="w-full"
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>
            {STAGE_META[s].label}
          </option>
        ))}
      </select>
    </section>
  );
}

function HardMetricsCard({ lead }: { lead: Lead }) {
  const value = lead.close_friends_stories ?? 0;
  const set = (n: number) => updateLead(lead.id, { close_friends_stories: Math.max(0, n) });

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-subtle">
      <div className="mb-3 flex items-center gap-2">
        <span className="section-eyebrow">Hard metrics</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[14px] text-muted-foreground">Close friends stories</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => set(value - 1)}
            aria-label="Decrease"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-1 transition hover:bg-surface-2"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2.5rem] text-center font-mono text-[18px] tabular-nums">{value}</span>
          <button
            onClick={() => set(value + 1)}
            aria-label="Increase"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-1 transition hover:bg-surface-2"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- shared pieces */

function SectionHeader({ title, suffix }: { title: string; suffix?: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <span className="section-eyebrow">{title}</span>
      <div className="h-px flex-1 bg-border" />
      {suffix && (
        <span className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground/60">{suffix}</span>
      )}
    </div>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-[14px] font-semibold tracking-tight text-foreground">{children}</h3>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[14px] font-semibold tracking-tight text-foreground">{label}</label>
      {children}
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  type = "text",
  isLink = false,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  isLink?: boolean;
  onCommit: (value: string) => void;
}) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);

  const href = isLink && value ? (value.startsWith("http") ? value : `https://${value}`) : "";

  return (
    <FieldGroup label={label}>
      <input
        type={type}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onCommit(val.trim())}
        placeholder={placeholder}
        className="w-full"
      />
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[13px] text-muted-foreground transition hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          {value.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      )}
    </FieldGroup>
  );
}

function WhoSelect({ value, onChange }: { value: Who; onChange: (who: Who) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as Who)} className="shrink-0">
      {WHO_OPTIONS.map((w) => (
        <option key={w} value={w}>
          {w}
        </option>
      ))}
    </select>
  );
}

function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3 py-2 text-[14px] transition hover:bg-surface-2"
    >
      <Plus className="h-3.5 w-3.5" /> Add
    </button>
  );
}
