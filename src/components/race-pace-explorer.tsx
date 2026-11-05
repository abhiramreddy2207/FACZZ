import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Flag, SlidersHorizontal } from "lucide-react";
import { DemoBadge } from "@/components/bits";
import { drivers, seed, teams } from "@/lib/demo-data";

type Lap = {
  driverId: string;
  driver: string;
  code: string;
  teamId: string;
  team: string;
  color: string;
  lap: number;
  seconds: number;
  clean: boolean;
};

const formatLap = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds - minutes * 60).toFixed(3).padStart(6, "0")}`;
};

const chartTooltip = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--popover-foreground)",
};

export function RacePaceExplorer({
  event,
  season,
  team,
  driver,
}: {
  event: string;
  season: string;
  team: string;
  driver: string;
}) {
  const [cleanOnly, setCleanOnly] = useState(true);
  const [outlierCutoff, setOutlierCutoff] = useState(107);
  const [highlight, setHighlight] = useState<"none" | "best" | "personal">("best");

  const allLaps = useMemo(() => {
    const eventOffset = [...event].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 11;
    return drivers.flatMap((d, di) => {
      const ti = teams.findIndex((t) => t.id === d.teamId);
      const t = teams[ti];
      return Array.from({ length: 70 }, (_, index) => {
        const lap = index + 1;
        const noise = seed(lap, di + eventOffset) * 0.34;
        const rhythm = Math.sin(lap * 0.31 + di * 0.65) * 0.25;
        const tyreDrop = Math.max(0, lap - 48) * 0.035;
        const pitOrTraffic = lap % 19 === (di % 7) ? 4.1 + seed(di, lap) * 1.2 : 0;
        const seconds = 79.15 + Math.max(ti, 0) * 0.11 + di * 0.012 + noise + rhythm + tyreDrop + pitOrTraffic + (season === "2025" ? 0.22 : 0);
        return {
          driverId: d.id,
          driver: d.name,
          code: d.code,
          teamId: d.teamId,
          team: t?.name ?? d.teamId,
          color: t?.color ?? "var(--chart-1)",
          lap,
          seconds,
          clean: pitOrTraffic === 0,
        } satisfies Lap;
      });
    });
  }, [event, season]);

  const scoped = useMemo(
    () => allLaps.filter((lap) => (!team || lap.teamId === team) && (!driver || lap.driverId === driver)),
    [allLaps, team, driver],
  );
  const cleanScoped = cleanOnly ? scoped.filter((lap) => lap.clean) : scoped;
  const fastest = Math.min(...cleanScoped.map((lap) => lap.seconds));
  const cutoffTime = fastest * (outlierCutoff / 100);
  const filtered = cleanScoped.filter((lap) => lap.seconds <= cutoffTime);
  const fastestLaps = [...filtered].sort((a, b) => a.seconds - b.seconds).slice(0, 20);
  const personalBests = new Map<string, number>();
  for (const lap of filtered) personalBests.set(lap.driverId, Math.min(personalBests.get(lap.driverId) ?? Infinity, lap.seconds));
  const comparedTeams = team ? teams.filter((entry) => entry.id === team) : teams.slice(0, 6);

  const evolution = useMemo(() => Array.from({ length: 70 }, (_, index) => {
    const lapNo = index + 1;
    const point: Record<string, number> = { lap: lapNo };
    for (const entry of comparedTeams) {
      const teamLaps = filtered.filter((lap) => lap.teamId === entry.id && lap.lap === lapNo);
      if (teamLaps.length) point[entry.short] = teamLaps.reduce((sum, lap) => sum + lap.seconds, 0) / teamLaps.length;
    }
    return point;
  }), [comparedTeams, filtered]);

  const gapRows = useMemo(() => {
    const averages = comparedTeams.map((entry) => {
      const laps = filtered.filter((lap) => lap.teamId === entry.id);
      return { team: entry.short, name: entry.name, color: entry.color, average: laps.length ? laps.reduce((sum, lap) => sum + lap.seconds, 0) / laps.length : null };
    }).filter((entry) => entry.average !== null);
    const best = Math.min(...averages.map((entry) => entry.average ?? Infinity));
    return averages.map((entry) => ({ ...entry, gap: +((entry.average ?? best) - best).toFixed(3) })).sort((a, b) => a.gap - b.gap);
  }, [comparedTeams, filtered]);

  const highlightLabel = highlight === "best" ? "Fastest lap" : highlight === "personal" ? "Personal bests" : "Off";

  return (
    <section className="space-y-5" aria-label="Race pace analysis">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold">Lap filters</span>
          <DemoBadge>Illustrative sample</DemoBadge>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={cleanOnly} onChange={(e) => setCleanOnly(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
          Clean laps only
        </label>
        <label className="flex min-w-56 flex-1 items-center gap-3 text-xs text-muted-foreground sm:max-w-sm">
          <span className="shrink-0">Outlier cutoff</span>
          <input type="range" min="101" max="110" value={outlierCutoff} onChange={(e) => setOutlierCutoff(Number(e.target.value))} className="min-w-20 flex-1 accent-[var(--primary)]" />
          <span className="w-10 text-right font-mono text-foreground">{outlierCutoff}%</span>
        </label>
        <div className="flex items-center gap-1 rounded-xl bg-muted p-1" aria-label="Highlight laps">
          {(["none", "personal", "best"] as const).map((value) => (
            <button key={value} type="button" aria-pressed={highlight === value} onClick={() => setHighlight(value)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${highlight === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {value === "none" ? "Off" : value === "personal" ? "Personal best" : "Fastest lap"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fastest clean lap</p>
          <p className="mt-2 font-mono text-2xl font-bold text-primary">{formatLap(fastest)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{fastestLaps[0]?.driver ?? "No laps"} · {fastestLaps[0]?.team ?? ""}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Laps in analysis</p>
          <p className="mt-2 font-mono text-2xl font-bold">{filtered.length.toLocaleString()}</p>
          <p className="mt-1 text-xs text-muted-foreground">After clean lap and outlier filters</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Highlight</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-bold"><Flag className="h-5 w-5 text-primary" />{highlightLabel}</p>
          <p className="mt-1 text-xs text-muted-foreground">{event} · {season} sample</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Stint view</p><h2 className="mt-1 text-xl font-extrabold">Race Pace Evolution</h2></div>
          <span className="text-xs text-muted-foreground">Average lap time by lap · lower is faster</span>
        </div>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolution} margin={{ top: 12, right: 12, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="lap" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} label={{ value: "Lap", position: "insideBottomRight", offset: -2, fill: "var(--muted-foreground)", fontSize: 11 }} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={48} />
              <Tooltip contentStyle={chartTooltip} labelFormatter={(value) => `Lap ${value}`} formatter={(value) => [`${Number(value).toFixed(3)} s`, "Avg lap"]} />
              <Legend />
              {comparedTeams.map((entry) => <Line key={entry.id} type="monotone" dataKey={entry.short} name={entry.name} stroke={entry.color} strokeWidth={2.4} dot={false} activeDot={{ r: 4 }} connectNulls />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Benchmark</p><h2 className="mt-1 text-lg font-extrabold">Gap to Fastest Team</h2></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gapRows} layout="vertical" margin={{ top: 4, right: 14, bottom: 4, left: 8 }}>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} unit=" s" />
                <YAxis type="category" dataKey="team" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={45} />
                <Tooltip contentStyle={chartTooltip} formatter={(value) => [`+${Number(value).toFixed(3)} s`, "Gap"]} />
                <Bar dataKey="gap" name="Gap to fastest" fill="var(--chart-1)" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="mb-3"><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Consistency</p><h2 className="mt-1 text-lg font-extrabold">Lap Time Spread</h2></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
                <defs><linearGradient id="paceSpread" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.48} /><stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0.03} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="lap" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={48} />
                <Tooltip contentStyle={chartTooltip} labelFormatter={(value) => `Lap ${value}`} />
                {comparedTeams.slice(0, 1).map((entry) => <Area key={entry.id} type="monotone" dataKey={entry.short} name={`${entry.name} lap time`} stroke="var(--chart-3)" strokeWidth={2} fill="url(#paceSpread)" connectNulls />)}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-4 sm:px-5">
          <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">Lap-by-lap</p><h2 className="mt-1 text-lg font-extrabold">Top 20 Fastest Laps</h2></div>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Activity className="h-3.5 w-3.5" /> Filtered sample timing</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted/70 text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-4 py-3">Pos</th><th className="px-4 py-3">Driver</th><th className="px-4 py-3">Team</th><th className="px-4 py-3">Lap</th><th className="px-4 py-3 text-right">Time</th></tr></thead>
            <tbody>{fastestLaps.map((lap, index) => {
              const highlighted = (highlight === "best" && index === 0) || (highlight === "personal" && lap.seconds === personalBests.get(lap.driverId));
              return <tr key={`${lap.driverId}-${lap.lap}`} className={`border-t border-border/80 hover:bg-muted/40 ${highlighted ? "bg-primary/5" : ""}`}>
              <td className="px-4 py-3 font-mono text-muted-foreground">{String(index + 1).padStart(2, "0")}</td>
              <td className="px-4 py-3 font-semibold"><span className="mr-2 inline-block h-5 w-1 rounded-full align-middle" style={{ background: lap.color }} />{lap.code}<span className="ml-2 hidden text-muted-foreground sm:inline">{lap.driver}</span>{highlighted && highlight !== "none" && <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{highlight === "best" ? "FASTEST" : "PB"}</span>}</td>
              <td className="px-4 py-3 text-muted-foreground">{lap.team}</td><td className="px-4 py-3 font-mono">{lap.lap}</td><td className="px-4 py-3 text-right font-mono font-semibold">{formatLap(lap.seconds)}</td>
            </tr>;
            })}</tbody>
          </table>
          {fastestLaps.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No laps match the current filters.</p>}
        </div>
      </div>
    </section>
  );
}
