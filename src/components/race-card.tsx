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
  const fallbackSession = raceWeekend.sessions[0] ?? { id: "fp1", name: "Practice 1", short: "FP1", start: "2026-11-06T14:30:00Z", status: "upcoming" as const };
  const next = raceWeekend.sessions.find((x) => now === null || +new Date(x.start) > now) ?? fallbackSession;
  const prev = calendar.find((c) => c.round === raceWeekend.round - 1);
  const winnerId = lastResult[0]?.id;
  return (
    <Link to="/race" className="group relative block overflow-hidden rounded-2xl bg-foreground p-5 text-background md:p-6">
      <div className="checker-stripe absolute inset-x-0 top-0 h-1.5" aria-hidden />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">Round {raceWeekend.round} · {raceWeekend.location}</p>
        <DemoBadge className="border-background/30 bg-background/10 text-background">Sample</DemoBadge>
      </div>
      {mode === "next" && (<>
        <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">{raceWeekend.name}</h2>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div><p className="flex items-center gap-1.5 text-sm opacity-70"><Timer className="h-4 w-4" /> Next: {next.name}</p>
            <p className="font-mono text-3xl font-bold md:text-4xl">{now === null ? "—" : countdown(+new Date(next.start) - now)}</p>
            <p className="text-xs opacity-60">{fmt(next.start)}</p></div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Race Center <ChevronRight className="h-4 w-4" /></span>
        </div>
      </>)}
      {mode === "live" && (<>
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-bold uppercase text-live"><span className="live-dot h-2.5 w-2.5 rounded-full bg-live" /> Live now (demo) · Race · Lap 34/71</p>
        <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">{raceWeekend.name}</h2>
        <ol className="mt-3 grid gap-1 font-mono text-sm">
          {lastResult.slice(0, 3).map((r, i) => <li key={r.id} className="flex justify-between"><span>{i + 1}. {getDriver(r.id)?.code}</span><span className="opacity-70">{i ? `+${(i * 1.4).toFixed(3)}` : "Leader"}</span></li>)}
        </ol>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold"><Radio className="h-4 w-4" /> Open live timing <ChevronRight className="h-4 w-4" /></span>
      </>)}
      {mode === "results" && (<>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm opacity-70"><Flag className="h-4 w-4" /> Results · {prev?.name}</p>
        <h2 className="mt-1 text-2xl font-extrabold">{winnerId ? getDriver(winnerId)?.name : "Winner"} wins (sample)</h2>
        <div className="mt-3 flex gap-4 font-mono text-sm">{lastResult.slice(0, 3).map((r) => <span key={r.id}>P{r.pos} {getDriver(r.id)?.code}</span>)}</div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold">Full classification <ChevronRight className="h-4 w-4" /></span>
      </>)}
    </Link>
  );
}
