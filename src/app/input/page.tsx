"use client";

import { useState } from "react";
import Link from "next/link";
import { addLead, useLeads, deleteLead } from "@/lib/leads-store";
import { STAGE_META, STAGE_TONES, WHO_OPTIONS, type Who } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { UserPlus, Check, Trash2, ArrowUpRight } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);

interface FormState {
  name: string;
  ig: string;
  youtube: string;
  email: string;
  niche: string;
  funnel: string;
  date: string;
  added_by: Who | "";
}

const EMPTY: FormState = {
  name: "",
  ig: "",
  youtube: "",
  email: "",
  niche: "",
  funnel: "",
  date: today(),
  added_by: "",
};

export default function InputPage() {
  const { leads } = useLeads();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await addLead({
        name: form.name.trim(),
        ig: form.ig.trim(),
        youtube: form.youtube.trim(),
        email: form.email.trim(),
        niche: form.niche.trim(),
        funnel: form.funnel.trim(),
        date: form.date || today(),
        added_by: form.added_by || null,
      });
      setForm({ ...EMPTY, date: form.date || today(), added_by: form.added_by });
      setToast("Lead added to Possible Clients.");
      setTimeout(() => setToast(null), 3500);
    } finally {
      setSaving(false);
    }
  }

  const recent = leads.slice(0, 8);

  const FIELDS: { key: keyof FormState; label: string; type?: string; placeholder?: string }[] = [
    { key: "name", label: "Name", placeholder: "Full name" },
    { key: "ig", label: "IG", placeholder: "@handle or link" },
    { key: "youtube", label: "YouTube", placeholder: "channel or link" },
    { key: "email", label: "Email", type: "email", placeholder: "name@email.com" },
    { key: "niche", label: "Niche", placeholder: "e.g. fitness coaching" },
    { key: "funnel", label: "Funnel", placeholder: "e.g. webinar, VSL" },
    { key: "date", label: "Date", type: "date" },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <div>
          <span className="section-eyebrow">Add Lead</span>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight sm:text-[28px]">New outreach lead</h1>
          <p className="mt-1 text-[14px] text-muted-foreground">
            New leads drop straight into Possible Clients.
          </p>
        </div>
        <Link
          href="/pipeline"
          className="hidden items-center gap-1.5 rounded-md border border-border bg-surface-2 px-3 py-2 text-[14px] text-muted-foreground transition hover:text-foreground sm:inline-flex"
        >
          View Pipeline <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        <form
          onSubmit={submit}
          className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <label
                key={f.key}
                className={cn("flex flex-col gap-1.5", f.key === "name" && "sm:col-span-2")}
              >
                <span className="text-[13px] font-medium text-muted-foreground">{f.label}</span>
                <input
                  type={f.type ?? "text"}
                  value={form[f.key]}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              </label>
            ))}

            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-muted-foreground">Added by</span>
              <select value={form.added_by} onChange={(e) => set("added_by", e.target.value)}>
                <option value="">Who added it?</option>
                {WHO_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && <p className="mt-4 text-[13px] text-brand">{error}</p>}

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-[15px] font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {saving ? "Adding..." : "Add Lead"}
            </button>
            {toast && (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-[13px] font-medium text-success">
                <Check className="h-4 w-4" /> {toast}{" "}
                <Link href="/pipeline" className="underline underline-offset-2">
                  View
                </Link>
              </span>
            )}
          </div>
        </form>

        <div className="rounded-xl border border-border bg-card p-4 shadow-subtle sm:p-6">
          <span className="section-eyebrow">Recently added</span>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {recent.length === 0 && (
              <p className="py-6 text-center text-[14px] text-muted-foreground">No leads yet.</p>
            )}
            {recent.map((l) => {
              const tone = STAGE_TONES[STAGE_META[l.stage].tone];
              const meta = [l.niche, l.funnel].filter(Boolean).join(" · ") || formatDate(l.date);
              const byline = l.added_by ? meta + " · by " + l.added_by : meta;
              return (
                <div key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/leads/${l.id}`} className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium hover:underline">
                      {l.name || "Untitled"}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 truncate text-[12px] text-muted-foreground">
                      <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase", tone.chip, tone.fg)}>
                        {STAGE_META[l.stage].label}
                      </span>
                      <span className="truncate">{byline}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteLead(l.id)}
                    aria-label="Delete lead"
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-brand"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
