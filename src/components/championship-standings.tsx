import { useState, useEffect, useTransition } from "react";
import { Link } from "@tanstack/react-router";
import { Trophy, RefreshCw, ChevronRight, Activity, Users, Shield } from "lucide-react";
import {
  fetchF1DriverStandingsClient,
  fetchF1ConstructorStandingsClient,
} from "@/lib/f1-client";
import type { DriverStandingItem, ConstructorStandingItem, F1Meta } from "@/server/f1/types";
import { getDriver, getTeam } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export function ChampionshipStandingsWidget() {
  const [tab, setTab] = useState<"drivers" | "constructors">("drivers");
  const [driverStandings, setDriverStandings] = useState<DriverStandingItem[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStandingItem[]>([]);
  const [meta, setMeta] = useState<F1Meta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);

  const loadData = async (force = false) => {
    setIsLoading(true);
    if (tab === "drivers") {
      const res = await fetchF1DriverStandingsClient("current", force);
      if (res?.data) {
        setDriverStandings(res.data);
        setMeta(res.meta);
      }
    } else {
      const res = await fetchF1ConstructorStandingsClient("current", force);
      if (res?.data) {
        setConstructorStandings(res.data);
        setMeta(res.meta);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    startTransition(() => {
      loadData(false);
    });
  }, [tab]);

  const maxPoints =
    tab === "drivers"
      ? driverStandings[0]?.points || 400
      : constructorStandings[0]?.points || 600;

  const displayDrivers = expanded ? driverStandings : driverStandings.slice(0, 5);
  const displayConstructors = expanded ? constructorStandings : constructorStandings.slice(0, 5);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-5">
      {/* Header with Switcher and Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-black uppercase tracking-wider text-foreground">
            2026 World Championship
          </h3>
        </div>

        {/* Tab switcher: Drivers vs Constructors */}
        <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/40">
          <button
            type="button"
            onClick={() => setTab("drivers")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all",
              tab === "drivers"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3 w-3" /> Drivers
          </button>
          <button
            type="button"
            onClick={() => setTab("constructors")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all",
              tab === "constructors"
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="h-3 w-3" /> Teams
          </button>
        </div>
      </div>

      {/* Freshness Badge & Controls */}
      <div className="flex items-center justify-between py-2 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              meta?.freshness === "live"
                ? "bg-emerald-500 animate-pulse"
                : meta?.freshness === "cached"
                  ? "bg-amber-400"
                  : "bg-blue-400"
            )}
          />
          <span className="uppercase font-semibold">
            {meta?.freshness === "live"
              ? "Live"
              : meta?.freshness === "cached"
                ? "Cached (SWR)"
                : "Archive"}{" "}
            · {meta?.provider ?? "Official Data"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => loadData(true)}
          disabled={isLoading || isPending}
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
          title="Refresh telemetry cache from upstream provider"
        >
          <RefreshCw className={cn("h-3 w-3", (isLoading || isPending) && "animate-spin text-primary")} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Standings List */}
      <div className="space-y-2 mt-1">
        {tab === "drivers" &&
          displayDrivers.map((item) => {
            const driver = getDriver(item.driverId);
            const team = getTeam(item.teamId);
            const pct = Math.max(8, (item.points / maxPoints) * 100);

            return (
              <div
                key={item.driverId}
                className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-all hover:border-primary/40 hover:bg-muted/40"
              >
                {/* Pos & Color Tag */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-black",
                      item.pos === 1
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {item.pos}
                  </span>

                  <div className="h-7 w-1 rounded-full shrink-0" style={{ backgroundColor: team?.color ?? "var(--primary)" }} />

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/driver/${item.driverId}` as any}
                        className="truncate text-sm font-bold text-foreground hover:text-primary transition-colors"
                      >
                        {item.driverName}
                      </Link>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">{item.code}</span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{item.teamName}</p>
                  </div>
                </div>

                {/* Points & Bar */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-black text-foreground">{item.points} <span className="text-[10px] text-muted-foreground font-normal">PTS</span></span>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: team?.color ?? "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

        {tab === "constructors" &&
          displayConstructors.map((item) => {
            const team = getTeam(item.teamId);
            const pct = Math.max(8, (item.points / maxPoints) * 100);

            return (
              <div
                key={item.teamId}
                className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-all hover:border-primary/40 hover:bg-muted/40"
              >
                {/* Pos & Team Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-black",
                      item.pos === 1
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {item.pos}
                  </span>

                  <div className="h-7 w-1 rounded-full shrink-0" style={{ backgroundColor: team?.color ?? "var(--primary)" }} />

                  <div className="min-w-0">
                    <Link
                      to={`/team/${item.teamId}` as any}
                      className="truncate text-sm font-bold text-foreground hover:text-primary transition-colors block"
                    >
                      {item.teamName}
                    </Link>
                    <span className="text-[10px] text-muted-foreground font-mono">{team?.engine ?? item.engine ?? "Power Unit"}</span>
                  </div>
                </div>

                {/* Points & Bar */}
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-black text-foreground">{item.points} <span className="text-[10px] text-muted-foreground font-normal">PTS</span></span>
                  <div className="mt-1 h-1.5 w-24 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: team?.color ?? "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer view all link */}
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-2.5 text-xs">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground font-medium transition-colors"
        >
          {expanded ? "Show Top 5" : "Expand Full Grid (20+)"}
        </button>

        <Link
          to="/data/$slug"
          params={{ slug: tab === "drivers" ? "driver-standings" : "constructor-standings" }}
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          Full Telemetry & Standings <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
