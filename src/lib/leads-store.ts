"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, hasSupabase } from "./supabase";
import type { Lead, Stage } from "./types";
import { MOCK_LEADS } from "./mock-data";

const LOCAL_KEY = "agency_outreach_v1";
const SEED_DEMO = process.env.NEXT_PUBLIC_SEED_DEMO_DATA === "true";

function loadLocal(): Lead[] {
  if (typeof window === "undefined") return SEED_DEMO ? MOCK_LEADS : [];
  const raw = window.localStorage.getItem(LOCAL_KEY);
  if (!raw) {
    const initial = SEED_DEMO ? MOCK_LEADS : [];
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    return (JSON.parse(raw) as Lead[]).map((l) => ({
      ...l,
      added_by: l.added_by ?? null,
      loom_links: l.loom_links ?? [],
      close_friends: l.close_friends ?? [],
      email_followups: l.email_followups ?? [],
      dms: l.dms ?? [],
      close_friends_stories: l.close_friends_stories ?? 0,
    }));
  } catch {
    return SEED_DEMO ? MOCK_LEADS : [];
  }
}

function saveLocal(leads: Lead[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(leads));
  window.dispatchEvent(new Event("leads:changed"));
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (hasSupabase && supabase) {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setLeads(data as Lead[]);
    } else {
      setLeads(loadLocal());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    if (hasSupabase && supabase) {
      const sb = supabase;
      const channel = sb
        .channel("leads-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => refresh())
        .subscribe();
      return () => {
        sb.removeChannel(channel);
      };
    }
    const handler = () => refresh();
    window.addEventListener("leads:changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("leads:changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return { leads, loading, refresh };
}

export function useLead(id: string) {
  const { leads, loading, refresh } = useLeads();
  return { lead: leads.find((l) => l.id === id) ?? null, loading, refresh };
}

export async function upsertLead(lead: Lead) {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from("leads").upsert(lead);
    if (error) throw error;
    return;
  }
  const all = loadLocal();
  const idx = all.findIndex((l) => l.id === lead.id);
  if (idx >= 0) all[idx] = { ...lead, updated_at: new Date().toISOString() };
  else all.unshift(lead);
  saveLocal(all);
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  if (hasSupabase && supabase) {
    const { error } = await supabase
      .from("leads")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
    return;
  }
  const all = loadLocal();
  const idx = all.findIndex((l) => l.id === id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...patch, updated_at: new Date().toISOString() };
    saveLocal(all);
  }
}

export async function deleteLead(id: string) {
  if (hasSupabase && supabase) {
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const all = loadLocal().filter((l) => l.id !== id);
  saveLocal(all);
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
  if (hasSupabase && supabase) {
    await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_KEY);
    window.dispatchEvent(new Event("leads:changed"));
  }
}
