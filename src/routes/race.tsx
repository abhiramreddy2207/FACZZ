import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import { raceWeekend, getDriver, getTeam, fmt, DEMO_UPDATED } from "@/lib/demo-data";
import { PageHeader, SourcesFooter } from "@/components/bits";
import { sessionRows } from "@/lib/session-data";
import { Flag, Gauge, Timer, CloudSun, Radio, Zap, RefreshCw, Trophy, Activity, Disc, ChevronRight } from "lucide-react";
import { fetchF1LiveTimingClient, type LiveTelemetryPayload } from "@/lib/f1-client";
import { CircuitMap } from "@/components/circuit-map";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "Race Center & Live Telemetry — Faczz" },
      { name: "description", content: "Live timing tower, sector splits, qualifying progression, tyre degradation, and circuit telemetry." },
      { property: "og:title", content: "Race Center & Live Telemetry — Faczz F1 Paddock" },
      { property: "og:description", content: "F1 Grand Prix live timing tower, sector splits, tyre strategy, and circuit map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Race,
});

export function Race() {
  const tabs = raceWeekend.sessions.map((s) => s.short);
  const [tab, setTab] = useState<string>(tabs[tabs.length - 1] ?? "RACE");
  const [view, setView] = useState<"Timing" | "Qualifying" | "Tyres" | "Results">("Timing");
  const [selectedDriver, setSelectedDriver] = useState<string | null>("norris");
  const [liveData, setLiveData] = useState<LiveTelemetryPayload | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSector, setSelectedSector] = useState<"s1" | "s2" | "s3" | null>(null);

  const s = raceWeekend.sessions.find((x) => x.short === tab);
  if (!s) return null;

  const isQuali = s.id === "quali" || s.id === "sq";

  // If user switches to qualifying tab, automatically suggest Qualifying view
  const activeView = isQuali && view === "Timing" ? "Qualifying" : view;

  // Deterministic baseline rows (guarantees sessionRows rules from data-rules.test.ts)
  const rows = useMemo(() => sessionRows(s.id, raceWeekend.name), [s.id]);

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

  const isInterlagos =
    raceWeekend.circuit.toLowerCase().includes("interlagos") ||
    raceWeekend.circuit.toLowerCase().includes("carlos pace") ||
    raceWeekend.name.toLowerCase().includes("são paulo") ||
    raceWeekend.name.toLowerCase().includes("sao paulo");

  // Weather stats
  const trackTemp = liveData?.weather?.trackTemp ?? (isInterlagos ? 38.6 : 41.8);
  const airTemp = liveData?.weather?.airTemp ?? (isInterlagos ? 24.2 : 25.4);
  const humidity = liveData?.weather?.humidity ?? (isInterlagos ? 62 : 52);
  const trackStatus = liveData?.weather?.trackStatus ?? "AllClear";

  // Active driver telemetry inspection
  const activeDriverRow = rows.find((r) => r.driver === selectedDriver) ?? rows[0];
  const activeDriverInfo = activeDriverRow ? getDriver(activeDriverRow.driver) : null;
  const activeTeamInfo = activeDriverInfo ? getTeam(activeDriverInfo.teamId) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`FIA Formula 1 World Championship · Round ${raceWeekend.round}`}
        title={raceWeekend.name}
        subtitle={`${raceWeekend.circuit} · ${raceWeekend.location}`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-mono font-bold text-emerald-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry Feed
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
            {isInterlagos ? "4.309" : "5.281"} <span className="text-xs font-normal text-muted-foreground">km</span>
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            {isInterlagos ? "71 Laps · 15 Turns" : "58 Laps · 16 Turns"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Gauge className="h-3 w-3 text-cyan-400" /> DRS Zones
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            2 <span className="text-xs font-normal text-muted-foreground">Zones</span>
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            {isInterlagos ? "Main & Reta Oposta" : "Main & Back Straights"}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <CloudSun className="h-3 w-3 text-amber-400" /> Track Temp
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            {trackTemp.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">°C</span>
          </p>
          <span className="text-[10px] font-mono text-emerald-500 block">
            Air: {airTemp.toFixed(1)}°C · {humidity}% Hum
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
          <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
            <Zap className="h-3 w-3 text-red-500" /> Tyre Allocation
          </span>
          <p className="telemetry-stat text-lg md:text-xl font-black text-foreground">
            {isInterlagos ? "C2 · C3 · C4" : "C3 · C4 · C5"}
          </p>
          <span className="text-[10px] font-mono text-muted-foreground block">
            Track Status: <span className="text-emerald-400 font-bold">{trackStatus}</span>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OFFICIAL CIRCUIT MAP WITH SECTORS & DRS ZONES          */}
      {/* ========================================================= */}
      <CircuitMap
        selectedSector={selectedSector}
        onSelectSector={setSelectedSector}
      />

      {/* ========================================================= */}
      {/* 3. LIVE COCKPIT TELEMETRY FOR SELECTED DRIVER             */}
      {/* ========================================================= */}
      {activeDriverRow && activeDriverInfo && (
        <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-card/90 p-4 md:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              <span
                className="h-9 w-2 rounded-full"
                style={{ background: activeTeamInfo?.color ?? "#d6262b" }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
                    P{activeDriverRow.pos} · #{activeDriverInfo.number}
                  </span>
                  <span className="font-display text-lg font-black text-foreground">
                    {activeDriverInfo.name}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] font-bold text-muted-foreground">
                    {activeDriverInfo.code}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeTeamInfo?.name} · {activeDriverRow.tyre.toUpperCase()} Tyre ({activeDriverRow.tyreAge}L Old)
                </div>
              </div>
            </div>

            {/* Live Delta status */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-right">
                <span className="text-[10px] uppercase text-muted-foreground block">Interval to Leader</span>
                <span className="font-bold text-primary">{activeDriverRow.gap}</span>
              </div>
              <div className="text-right pl-3 border-l border-border">
                <span className="text-[10px] uppercase text-muted-foreground block">Best Lap</span>
                <span className="font-bold text-purple-400">{activeDriverRow.last}</span>
              </div>
            </div>
          </div>

          {/* Telemetry Gauge Grid */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
            {/* Speed */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase text-muted-foreground block">Speed Trap</span>
              <span className="text-lg font-black text-foreground">
                {activeDriverRow.speed} <span className="text-[10px] font-normal text-muted-foreground">km/h</span>
              </span>
            </div>

            {/* Gear & RPM */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase text-muted-foreground block">Gear / Engine</span>
              <span className="text-lg font-black text-foreground">
                G{activeDriverRow.gear} <span className="text-xs text-muted-foreground">· {activeDriverRow.rpm}</span>
              </span>
            </div>

            {/* Throttle Progress */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <div className="flex justify-between items-center text-[10px] uppercase text-muted-foreground">
                <span>Throttle</span>
                <span className="text-emerald-400 font-bold">{activeDriverRow.throttle}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${activeDriverRow.throttle}%` }}
                />
              </div>
            </div>

            {/* Brake Progress */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <div className="flex justify-between items-center text-[10px] uppercase text-muted-foreground">
                <span>Brake</span>
                <span className="text-red-400 font-bold">{activeDriverRow.brake}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${activeDriverRow.brake}%` }}
                />
              </div>
            </div>

            {/* DRS Status */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase text-muted-foreground block">DRS System</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-black text-sm mt-0.5",
                  activeDriverRow.drs ? "text-cyan-400" : "text-muted-foreground"
                )}
              >
                <Zap className="h-3 w-3" /> {activeDriverRow.drs ? "OPEN / ACTIVE" : "CLOSED"}
              </span>
            </div>

            {/* Tyre Compound & Age */}
            <div className="rounded-xl border border-border/80 bg-muted/20 p-2.5">
              <span className="text-[10px] uppercase text-muted-foreground block">Tyre Stint</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "h-3.5 w-3.5 rounded-full flex items-center justify-center text-[9px] font-black text-black",
                    activeDriverRow.tyre === "soft"
                      ? "bg-red-500 text-white"
                      : activeDriverRow.tyre === "medium"
                      ? "bg-amber-400"
                      : "bg-white"
                  )}
                >
                  {activeDriverRow.tyre[0]?.toUpperCase()}
                </span>
                <span className="font-bold text-foreground">
                  {activeDriverRow.tyreAge} Laps <span className="text-[10px] text-muted-foreground">({activeDriverRow.pitStops}P)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sector Splits Progress */}
          <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-1.5">
              <span className="text-muted-foreground">Sector 1</span>
              <span
                className={cn(
                  "font-bold",
                  activeDriverRow.s1Status === "purple"
                    ? "text-purple-400"
                    : activeDriverRow.s1Status === "green"
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {activeDriverRow.s1}s
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-1.5">
              <span className="text-muted-foreground">Sector 2</span>
              <span
                className={cn(
                  "font-bold",
                  activeDriverRow.s2Status === "purple"
                    ? "text-purple-400"
                    : activeDriverRow.s2Status === "green"
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {activeDriverRow.s2}s
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-3 py-1.5">
              <span className="text-muted-foreground">Sector 3</span>
              <span
                className={cn(
                  "font-bold",
                  activeDriverRow.s3Status === "purple"
                    ? "text-purple-400"
                    : activeDriverRow.s3Status === "green"
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {activeDriverRow.s3}s
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TIMING TOWER, SECTOR SPLITS & TYRE STRATEGY            */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {/* Session tabs and view switcher toolbar */}
        <div className="border-b border-border/80 bg-muted/40 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 no-scrollbar overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
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

          {/* View mode switcher */}
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-lg border border-border overflow-x-auto">
            {(["Timing", "Qualifying", "Tyres", "Results"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap",
                  activeView === v
                    ? "bg-muted text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Active Session Meta Bar */}
        <div className="px-4 py-2.5 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-foreground">{s.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{fmt(s.start)}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-500" /> Session Best
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Personal Best
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Sector Split
            </span>
          </div>
        </div>

        {/* Live Timing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/10 text-[10px] uppercase text-muted-foreground font-semibold">
                <th className="py-2.5 pl-4 pr-2 w-12 text-center">POS</th>
                <th className="py-2.5 px-3">DRIVER</th>
                <th className="py-2.5 px-3 hidden md:table-cell">CONSTRUCTOR</th>

                {/* Dynamic Columns based on activeView */}
                {activeView === "Timing" && (
                  <>
                    <th className="py-2.5 px-2 text-right">S1</th>
                    <th className="py-2.5 px-2 text-right">S2</th>
                    <th className="py-2.5 px-2 text-right">S3</th>
                    <th className="py-2.5 px-3 text-right">LAST LAP</th>
                    <th className="py-2.5 pr-4 pl-3 text-right">GAP</th>
                  </>
                )}

                {activeView === "Qualifying" && (
                  <>
                    <th className="py-2.5 px-2 text-right">Q1</th>
                    <th className="py-2.5 px-2 text-right">Q2</th>
                    <th className="py-2.5 px-3 text-right">Q3</th>
                    <th className="py-2.5 pr-4 pl-3 text-right">POLE GAP</th>
                  </>
                )}

                {activeView === "Tyres" && (
                  <>
                    <th className="py-2.5 px-3 text-center">COMPOUND</th>
                    <th className="py-2.5 px-3 text-center">TYRE AGE</th>
                    <th className="py-2.5 px-3 text-center">STOPS</th>
                    <th className="py-2.5 pr-4 pl-3 text-right">LAST LAP</th>
                  </>
                )}

                {activeView === "Results" && (
                  <>
                    <th className="py-2.5 px-3 text-right">TOTAL TIME / GAP</th>
                    <th className="py-2.5 pr-4 pl-3 text-right w-16">PTS</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((r, i) => {
                const dr = getDriver(r.driver);
                if (!dr) return null;
                const tm = getTeam(dr.teamId);
                const isSelected = selectedDriver === r.driver;

                // Knockout lines for Qualifying
                const isQ1Cutoff = activeView === "Qualifying" && i === 15;
                const isQ2Cutoff = activeView === "Qualifying" && i === 10;

                return (
                  <tr
                    key={r.driver}
                    onClick={() => setSelectedDriver(r.driver)}
                    className={cn(
                      "cursor-pointer hover:bg-muted/40 transition-colors group",
                      isSelected && "bg-primary/10 hover:bg-primary/15",
                      isQ2Cutoff && "border-t-2 border-amber-500/50",
                      isQ1Cutoff && "border-t-2 border-red-500/50"
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
                          <span className="font-sans text-xs text-muted-foreground hidden lg:inline">
                            {dr.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-2.5 px-3 hidden md:table-cell font-sans text-muted-foreground truncate max-w-[140px]">
                      {tm?.name}
                    </td>

                    {/* Dynamic Table Content based on activeView */}
                    {activeView === "Timing" && (
                      <>
                        <td className="py-2.5 px-2 text-right">
                          <span
                            className={cn(
                              "font-bold",
                              r.s1Status === "purple"
                                ? "text-purple-400"
                                : r.s1Status === "green"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            )}
                          >
                            {r.s1}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span
                            className={cn(
                              "font-bold",
                              r.s2Status === "purple"
                                ? "text-purple-400"
                                : r.s2Status === "green"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            )}
                          >
                            {r.s2}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <span
                            className={cn(
                              "font-bold",
                              r.s3Status === "purple"
                                ? "text-purple-400"
                                : r.s3Status === "green"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            )}
                          >
                            {r.s3}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-foreground">
                          {r.last}
                        </td>
                        <td className="py-2.5 pr-4 pl-3 text-right font-bold text-muted-foreground">
                          {r.gap}
                        </td>
                      </>
                    )}

                    {activeView === "Qualifying" && (
                      <>
                        <td className="py-2.5 px-2 text-right text-muted-foreground">
                          {r.q1}
                        </td>
                        <td className="py-2.5 px-2 text-right text-muted-foreground">
                          {r.q2}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-purple-400">
                          {r.q3}
                        </td>
                        <td className="py-2.5 pr-4 pl-3 text-right font-bold text-foreground">
                          {i === 0 ? "POLE" : r.gap}
                        </td>
                      </>
                    )}

                    {activeView === "Tyres" && (
                      <>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black",
                              r.tyre === "soft"
                                ? "bg-red-500 text-white"
                                : r.tyre === "medium"
                                ? "bg-amber-400 text-black"
                                : "bg-white text-black"
                            )}
                          >
                            {r.tyre[0]?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-foreground">
                          {r.tyreAge} Laps
                        </td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">
                          {r.pitStops} {r.pitStops === 1 ? "Stop" : "Stops"}
                        </td>
                        <td className="py-2.5 pr-4 pl-3 text-right font-bold text-foreground">
                          {r.last}
                        </td>
                      </>
                    )}

                    {activeView === "Results" && (
                      <>
                        <td className="py-2.5 px-3 text-right font-bold text-foreground">
                          {r.gap}
                        </td>
                        <td className="py-2.5 pr-4 pl-3 text-right font-bold">
                          {r.pts > 0 ? (
                            <span className="text-primary font-black">+{r.pts}</span>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. WEEKEND SESSION SCHEDULE CARDS                         */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-mono flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" /> Weekend Session Timeline
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {raceWeekend.sessions.map((x) => (
            <div
              key={x.id}
              onClick={() => {
                setTab(x.short);
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
              <p className="font-bold text-sm text-foreground truncate">{x.name}</p>
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
