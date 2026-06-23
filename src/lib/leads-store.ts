"use client";

import { useEffect, useState, useCallback } from "react";
import { REST, sbHeaders } from "./supabase";
import type { Lead, Stage } from "./types";

// LIVE data via Supabase PostgREST (direct fetch). Sync = poll + refetch on
// focus; own-tab writes refresh instantly via a custom event.

const POLL_MS = 12000;

function ping() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("leads:changed"));
}

async function sbSelect(): Promise<Lead[]> {
  const r = await fetch(`${REST}?select=*&order=created_at.desc`, {
    headers: sbHeaders,
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`select failed: ${r.status}`);
  return (await r.json()) as Lead[];
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLeads(await sbSelect());
    } catch {
      /* keep last good data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    const onVis = () => {
      if (!document.hidden) refresh();
    };
    window.addEventListener("leads:changed", onChange);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onVis);
    const id = window.setInterval(refresh, POLL_MS);
    return () => {
      window.removeEventListener("leads:changed", onChange);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onVis);
      window.clearInterval(id);
    };
  }, [refresh]);

  return { leads, loading, refresh };
}

export function useLead(id: string) {
  const { leads, loading, refresh } = useLeads();
  return { lead: leads.find((l) => l.id === id) ?? null, loading, refresh };
}

export async function upsertLead(lead: Lead) {
  const r = await fetch(REST, {
    method: "POST",
    headers: { ...sbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(lead),
  });
  if (!r.ok) throw new Error(`upsert failed: ${r.status}`);
  ping();
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  const r = await fetch(`${REST}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...sbHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({ ...patch, updated_at: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`update failed: ${r.status}`);
  ping();
}

export async function deleteLead(id: string) {
  const r = await fetch(`${REST}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { ...sbHeaders, Prefer: "return=minimal" },
  });
  if (!r.ok) throw new Error(`delete failed: ${r.status}`);
  ping();
}

export async function moveStage(id: string, stage: Stage) {
  const today = new Date().toISOString().slice(0, 10);
  const patch: Partial<Lead> = { stage };
  if (stage === "engaged_positive" || stage === "engaged_negative") patch.engaged_date = today;
  if (stage === "call_one_booked") patch.call_one_date = today;
  if (stage === "call_two_booked") patch.call_two_date = today;
  if (stage === "close_deal") patch.closed_date = today;
  await updateLead(id, patch);
}

export function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `ld_${Math.random().toString(36).slice(2, 10)}`;
}

export function newLeadDefaults(): Lead {
  const now = new Date().toISOString();
  return {
    id: cryptoRandomId(),
    name: "",
    ig: "",
    youtube: "",
    email: "",
    niche: "",
    funnel: "",
    date: now.slice(0, 10),
    added_by: null,
    stage: "possible_clients",
    loom_links: [],
    close_friends: [],
    email_sent_date: null,
    email_followups: [],
    dms: [],
    close_friends_stories: 0,
    notes: null,
    engaged_date: null,
    call_one_date: null,
    call_two_date: null,
    closed_date: null,
    created_at: now,
    updated_at: now,
  };
}

export async function addLead(input: Partial<Lead>): Promise<string> {
  const lead: Lead = { ...newLeadDefaults(), ...input, stage: "possible_clients" };
  await upsertLead(lead);
  return lead.id;
}

export async function clearAllData() {
  await fetch(`${REST}?id=neq.`, { method: "DELETE", headers: { ...sbHeaders, Prefer: "return=minimal" } });
  ping();
}
