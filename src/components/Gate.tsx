"use client";

import { useEffect, useState } from "react";
import { Delete, Lock } from "lucide-react";

// Casual-access gate. The passcode lives in NEXT_PUBLIC_APP_PASSCODE (default
// "0000"). Note: this only hides the UI; the data API is still reachable with
// the public anon key, so it is a deterrent, not hard security.
const CODE = (process.env.NEXT_PUBLIC_APP_PASSCODE || "0000").trim();
const KEY = "aod_unlocked_v1";

export function Gate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [entry, setEntry] = useState("");
  const [err, setErr] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) === "1") setUnlocked(true);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  function press(d: string) {
    if (entry.length >= 4) return;
    setErr(false);
    const next = entry + d;
    setEntry(next);
    if (next.length === 4) {
      if (next === CODE) {
        try {
          localStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        setTimeout(() => setUnlocked(true), 120);
      } else {
        setErr(true);
        setTimeout(() => setEntry(""), 500);
      }
    }
  }

  function back() {
    setErr(false);
    setEntry((e) => e.slice(0, -1));
  }

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-black">
        <Lock className="h-5 w-5 text-white" />
      </div>
      <h1 className="text-[17px] font-medium tracking-tight">Enter Passcode</h1>
      <p className="mt-1 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
        Agency Acquisition
      </p>

      <div className={err ? "mt-6 flex gap-4 animate-pulse" : "mt-6 flex gap-4"}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={
              "h-3.5 w-3.5 rounded-full border transition " +
              (err
                ? "border-brand bg-brand"
                : i < entry.length
                ? "border-foreground bg-foreground"
                : "border-border-strong bg-transparent")
            }
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className="h-16 w-16 rounded-full border border-white/10 bg-white/[0.05] text-[24px] font-light backdrop-blur-md transition hover:bg-white/[0.1] active:scale-95"
          >
            {k}
          </button>
        ))}
        <span />
        <button
          onClick={() => press("0")}
          className="h-16 w-16 rounded-full border border-white/10 bg-white/[0.05] text-[24px] font-light backdrop-blur-md transition hover:bg-white/[0.1] active:scale-95"
        >
          0
        </button>
        <button
          onClick={back}
          aria-label="Delete"
          className="flex h-16 w-16 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-95"
        >
          <Delete className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
