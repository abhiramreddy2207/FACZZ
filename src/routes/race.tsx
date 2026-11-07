import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { raceWeekend, getDriver, getTeam, fmt, DEMO_UPDATED } from "@/lib/demo-data";
import { PageHeader, SourcesFooter } from "@/components/bits";
import { sessionRows } from "@/lib/session-data";
import { Flag, Gauge, Timer, CloudSun, Radio, Zap, RefreshCw } from "lucide-react";
import { fetchF1LiveTimingClient, type LiveTelemetryPayload } from "@/lib/f1-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "Race Center — Faczz" },
      { name: "description", content: "Weekend schedule, live timing tower, telemetry splits and session results." },
      { property: "og:title", content: "Race Center — Faczz F1 Paddock" },
      { property: "og:description", content: "F1 Grand Prix live timing tower, session classifications, and track conditions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Race,
});

export function Race() {
  const tabs = raceWeekend.sessions.map((s) => s.short);
  const [tab, setTab] = useState<string>(tabs[tabs.length - 1] ?? "RACE");
  const [view, setView] = useState<"Timing" | "Results">("Timing");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [liveData, setLiveData] = useState<LiveTelemetryPayload | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const s = raceWeekend.sessions.find((x) => x.short === tab);
  if (!s) return null;

  // Deterministic baseline rows (guarantees sessionRows rules from data-rules.test.ts)
  const rows = sessionRows(s.id, raceWeekend.name);

  // Poll live telemetry if tab is active
  const pollTelemetry = useCallback(async () => {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
    try {
      const result = await fetchF1LiveTimingClient();
      if (result) {
        setLiveData(result);
      }
    } catch {
      // Fallback cleanly
    }
  }, []);

  useEffect(() => {
    pollTelemetry();
    const timer = setInterval(pollTelemetry, 20000);
    return () => clearInterval(timer);
  }, [pollTelemetry]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await pollTelemetry();
    setIsRefreshing(false);
  };

  // Weather stats
  const trackTemp = liveData?.weather?.trackTemp ?? 41.8;
  const airTemp = liveData?.weather?.airTemp ?? 25.4;
  const humidity = liveData?.weather?.humidity ?? 52;
  const freshness = liveData?.meta?.freshness ?? "cached";

  // Comparison driver baseline
  const referenceDriver = selectedDriver ? rows.find((r) => r.driver === selectedDriver) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`FIA Formula 1 World Championship · Round ${raceWeekend.round}`}
        title={raceWeekend.name}
        subtitle={`${raceWeekend.circuit} · ${raceWeekend.location}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Timing Feed
          </span>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="rounded-full border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground hover:border-primary transition-all disabled:opacity-50"
            title="Refresh Live Timing"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-primary")} />
          </button>
        </div>
      </PageHeader>

      {/* ========================================================= */}
      {/* 1. TRACK & WEATHER TELEMETRY DASHBOARD                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Timer className="h-3 w-3 text-primary" /> Track Length
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            4.309 <span className="text-xs font-normal text-muted-foreground">km</span>
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">71 Laps · 15 Turns</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Gauge className="h-3 w-3 text-cyan-400" /> DRS Zones
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            2 <span className="text-xs font-normal text-muted-foreground">Zones</span>
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">Main & Reta Oposta</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <CloudSun className="h-3 w-3 text-amber-400" /> Track Temp
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            {trackTemp.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">°C</span>
          </p>
          <span className="text-[10px] font-mono text-emerald-500 block">Air: {airTemp.toFixed(1)}°C · {humidity}% Hum</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Zap className="h-3 w-3 text-red-500" /> Tyre Allocation
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            C3 · C4 · C5
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">Pirelli High Degradation</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIMING TOWER & CLASSIFICATION                          */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Session tabs bar */}
        <div className="border-b border-border/80 bg-muted/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 no-scrollbar overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setSelectedDriver(null);
                }}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap",
                  tab === t
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {selectedDriver && (
              <button
                type="button"
                onClick={() => setSelectedDriver(null)}
                className="text-[11px] font-mono text-primary hover:underline pr-2 border-r border-border"
              >
                Clear Delta
              </button>
            )}

            <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border">
              {(["Timing", "Results"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                    view === v
                      ? "bg-muted text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Active Session Header & Delta notice */}
        <div className="px-4 py-3 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-foreground">{s.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-muted-foreground">{fmt(s.start)}</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
            {referenceDriver ? (
              <span className="text-primary font-bold">Delta reference: {referenceDriver.name}</span>
            ) : (
              <span>Tap driver to calculate relative split</span>
            )}
          </div>
        </div>

        {/* Timing List Tower */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/10 text-[10px] uppercase text-muted-foreground font-semibold">
                <th className="py-2.5 pl-4 pr-2 w-12 text-center">POS</th>
                <th className="py-2.5 px-3">DRIVER</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">CONSTRUCTOR</th>
                <th className="py-2.5 px-3 text-right">
                  {view === "Timing" ? "BEST LAP / GAP" : "RACE GAP"}
                </th>
                {view === "Results" && (
                  <th className="py-2.5 pr-4 pl-3 text-right w-16">PTS</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((r, i) => {
                const dr = getDriver(r.driver);
                if (!dr) return null;
                const tm = getTeam(dr.teamId);
                const isLeader = i === 0;
                const isSelected = selectedDriver === r.driver;

                // Relative delta calculation if a driver is clicked
                let displayGap = view === "Timing" ? (isLeader ? r.last : r.gap) : r.gap;
                if (referenceDriver && referenceDriver.driver !== r.driver) {
                  const diff = r.gapS - referenceDriver.gapS;
                  displayGap = `${diff > 0 ? "+" : ""}${diff.toFixed(3)}s`;
                } else if (referenceDriver && referenceDriver.driver === r.driver) {
                  displayGap = "REFERENCE";
                }

                return (
                  <tr
                    key={r.driver}
                    onClick={() => setSelectedDriver(isSelected ? null : r.driver)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/40 transition-colors group",
                      isSelected && "bg-primary/10 hover:bg-primary/15"
                    )}
                  >
                    {/* Position */}
                    <td className="py-2.5 pl-4 pr-2 text-center font-bold">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs",
                          i === 0
                            ? "bg-amber-500/20 text-amber-400 font-extrabold"
                            : i === 1
                            ? "bg-slate-300/20 text-slate-200"
                            : i === 2
                            ? "bg-amber-700/20 text-amber-600"
                            : "text-foreground/80"
                        )}
                      >
                        {i + 1}
                      </span>
                    </td>

                    {/* Driver */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-4 w-1 rounded-full shrink-0"
                          style={{ background: tm?.color ?? "#d6262b" }}
                        />
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-foreground text-sm tracking-tight">
                            {dr.code}
                          </span>
                          <span className="font-sans text-xs text-muted-foreground hidden md:inline">
                            {dr.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-2.5 px-3 hidden sm:table-cell font-sans text-muted-foreground truncate max-w-[160px]">
                      {tm?.name}
                    </td>

                    {/* Lap Time / Gap */}
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span
                        className={cn(
                          isLeader && view === "Timing" && !referenceDriver ? "text-purple-400" : "text-foreground",
                          referenceDriver && referenceDriver.driver === r.driver && "text-primary"
                        )}
                      >
                        {displayGap}
                      </span>
                    </td>

                    {/* Points */}
                    {view === "Results" && (
                      <td className="py-2.5 pr-4 pl-3 text-right font-bold text-foreground">
                        {r.pts > 0 ? (
                          <span className="text-primary font-black">+{r.pts}</span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. WEEKEND SESSION SCHEDULE CARDS                         */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" /> Weekend Session Timeline
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {raceWeekend.sessions.map((x) => (
            <div
              key={x.id}
              onClick={() => {
                setTab(x.short);
                setSelectedDriver(null);
              }}
              className={cn(
                "cursor-pointer rounded-xl border p-3.5 space-y-1.5 transition-all hover:border-primary/50",
                x.short === tab
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase text-primary">
                  {x.short}
                </span>
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  Official Session
                </span>
              </div>
              <p className="font-bold text-sm text-foreground">{x.name}</p>
              <p className="text-xs font-mono text-muted-foreground">{fmt(x.start)}</p>
            </div>
          ))}
        </div>
      </div>

      <SourcesFooter
        provider="F1 Live Timing Integration Engine / OpenF1 Telemetry"
        url="https://openf1.org/"
        updated={fmt(DEMO_UPDATED)}
      />
    </div>
  );
}
