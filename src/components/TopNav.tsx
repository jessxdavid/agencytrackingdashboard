"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hasSupabase } from "@/lib/supabase";
import { Moon, Sun } from "lucide-react";

const TABS = [
  { href: "/", label: "Dashboard", short: "Home" },
  { href: "/pipeline", label: "Pipeline", short: "Pipe" },
  { href: "/input", label: "Add Lead", short: "Add" },
];

export function TopNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      setTheme(window.localStorage.getItem("theme") === "light" ? "light" : "dark");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const cls = document.documentElement.classList;
    cls.toggle("dark", next === "dark");
    cls.toggle("light", next === "light");
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[12px] font-bold tracking-widest text-white">
            AO
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-[15px] font-semibold tracking-tight">AGENCY</div>
            <div className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
              Outreach Tracker
            </div>
          </div>
        </Link>
        <nav className="flex min-w-0 items-center gap-0.5">
          {TABS.map((t) => {
            const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "inline-flex min-h-[36px] items-center rounded-md px-1.5 py-1.5 text-[13px] transition sm:px-3 sm:text-[15px]",
                  active
                    ? "bg-surface-2 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            );
          })}
          <span
            className={cn(
              "ml-1 hidden rounded-full border px-2 py-0.5 text-[12px] font-medium uppercase tracking-wider sm:ml-3 sm:inline-block",
              hasSupabase
                ? "border-success/30 bg-success/10 text-success"
                : "border-border bg-surface-2 text-muted-foreground",
            )}
            title={hasSupabase ? "Connected to Supabase" : "Using local browser storage"}
          >
            {hasSupabase ? "Live" : "Local"}
          </span>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark/light mode"
            className="ml-0.5 inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
        </nav>
      </div>
    </header>
  );
}
