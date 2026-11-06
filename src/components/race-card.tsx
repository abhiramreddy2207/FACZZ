import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Flag, Radio, Timer } from "lucide-react";
import { raceWeekend, lastResult, getDriver, fmt, calendar } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { DemoBadge } from "./bits";

export function useRaceStatus() {
  const mode = useStore((s) => s.raceMode);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(t); }, []);
  if (mode !== "auto") return { mode, now };
  if (now === null) return { mode: "next" as const, now };
  const s = raceWeekend.sessions;
  const live = s.find((x) => now >= +new Date(x.start) && now < +new Date(x.start) + 2 * 3600e3);
  if (live) return { mode: "live" as const, now };
  const next = s.find((x) => +new Date(x.start) > now);
  return { mode: next ? ("next" as const) : ("results" as const), now };
}

function countdown(ms: number) {
  if (ms <= 0) return "Starting";
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5), m = Math.floor((ms % 36e5) / 6e4);
  return `${d}d ${h}h ${m}m`;
}

export function RaceCard() {
  const { mode, now } = useRaceStatus();
  const fallbackSession = raceWeekend.sessions[0] ?? {
    id: "fp1",
    name: "Practice 1",
    short: "FP1",
    start: "2026-11-06T14:30:00Z",
    status: "upcoming" as const,
  };
  const next = raceWeekend.sessions.find((x) => now === null || +new Date(x.start) > now) ?? fallbackSession;
  const prev = calendar.find((c) => c.round === raceWeekend.round - 1);
  const winnerId = lastResult[0]?.id;

  return (
    <Link
      to="/race"
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5 md:p-6 transition-all hover:border-primary/50 shadow-sm hover:shadow-md"
    >
      {/* Decorative top racing line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-transparent" />

      {/* Header bar: Round & Circuit */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
            Round {raceWeekend.round}
          </span>
          <span className="font-mono text-muted-foreground uppercase text-[11px]">
            {raceWeekend.circuit} · {raceWeekend.location}
          </span>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Official F1 Schedule
        </span>
      </div>

      {mode === "next" && (
        <div className="mt-3 grid gap-4 md:grid-cols-[1.2fr_auto] items-end">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground font-display">
              {raceWeekend.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1 font-semibold text-foreground/80">
                <Timer className="h-3.5 w-3.5 text-primary" /> {next.name}
              </span>
              <span>·</span>
              <span className="font-mono">{fmt(next.start)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-muted/40 p-3 rounded-xl border border-border/50">
            <div>
              <span className="block text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                Countdown to Session
              </span>
              <p className="telemetry-stat text-2xl font-black text-foreground">
                {now === null ? "—" : countdown(+new Date(next.start) - now)}
              </p>
            </div>

            <div className="hidden sm:block pl-2 border-l border-border/60">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground group-hover:bg-primary/90 transition-all shadow-sm">
                Race Center <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {mode === "live" && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-red-500">
              Session Live · Lap 34/71
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground font-display">
            {raceWeekend.name}
          </h2>

          <div className="grid gap-2 sm:grid-cols-3 font-mono text-xs pt-1">
            {lastResult.slice(0, 3).map((r, i) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-border/40"
              >
                <span className="font-bold">
                  P{i + 1} {getDriver(r.id)?.code}
                </span>
                <span className="text-muted-foreground">
                  {i === 0 ? "LEADER" : `+${(i * 1.4).toFixed(3)}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mode === "results" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
            <Flag className="h-3.5 w-3.5 text-primary" /> Official Classification · {prev?.name}
          </div>
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground font-display">
            {winnerId ? getDriver(winnerId)?.name : "Winner"} Takes Victory
          </h2>
          <div className="flex gap-2 font-mono text-xs pt-1">
            {lastResult.slice(0, 3).map((r) => (
              <span
                key={r.id}
                className="rounded-md bg-muted px-2 py-1 font-semibold border border-border/40"
              >
                P{r.pos} {getDriver(r.id)?.code}
              </span>
            ))}
          </div>
        </div>
      )}
    </Link>
  );
}
