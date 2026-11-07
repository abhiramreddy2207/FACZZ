import React, { useState } from "react";
import { Trophy, Calendar as CalendarIcon, MapPin, Zap, CheckCircle2, Clock } from "lucide-react";
import type { Row } from "@/lib/data-catalog";
import { getTeam } from "@/lib/demo-data";

export function CalendarScheduleView({
  rows,
  season,
}: {
  rows: Row[];
  season: string;
}) {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all");

  const completedCount = rows.filter((r) => r["status"] === "Completed").length;
  const upcomingCount = rows.filter((r) => r["status"] === "Upcoming").length;
  const sprintCount = rows.filter((r) => Boolean(r["sprint"]) && r["sprint"] !== "Standard").length;

  const displayRows = rows.filter((r) => {
    if (filter === "completed") return r["status"] === "Completed";
    if (filter === "upcoming") return r["status"] === "Upcoming";
    return true;
  });

  return (
    <div className="mb-8 space-y-5">
      {/* Calendar Header Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CalendarIcon className="h-3.5 w-3.5 text-primary" />
            <span>Season Schedule</span>
          </div>
          <div className="mt-1 text-xl font-bold font-display text-foreground">
            {rows.length} <span className="text-xs font-normal text-muted-foreground">Rounds</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="mt-1 text-xl font-bold font-display text-foreground">
            {completedCount} <span className="text-xs font-normal text-muted-foreground">Grands Prix</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span>Upcoming</span>
          </div>
          <div className="mt-1 text-xl font-bold font-display text-foreground">
            {upcomingCount} <span className="text-xs font-normal text-muted-foreground">Rounds</span>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-card/60 p-3.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Sprint Events</span>
          </div>
          <div className="mt-1 text-xl font-bold font-display text-foreground">
            {sprintCount} <span className="text-xs font-normal text-muted-foreground">Sprints</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            All Events ({rows.length})
          </button>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("completed")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === "completed"
                  ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Completed ({completedCount})
            </button>
          )}
          {upcomingCount > 0 && (
            <button
              type="button"
              onClick={() => setFilter("upcoming")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                filter === "upcoming"
                  ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          FIA F1 World Championship · {season}
        </span>
      </div>

      {/* Grid of Normal Event Cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {displayRows.map((race) => {
          const roundNum = Number(race["round"]) || 0;
          const isCompleted = race["status"] === "Completed";
          const winnerName = (race["winner"] as string) || "";
          const teamId = (race["team"] as string) || "";
          const teamInfo = teamId ? getTeam(teamId) : null;
          const sprint = Boolean(race["sprint"]) && race["sprint"] !== "Standard";

          return (
            <div
              key={String(race["round"]) + String(race["name"])}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card to-card/70 p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div>
                {/* Top Row: Round pill, Sprint badge, Status */}
                <div className="mb-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-black uppercase text-foreground">
                      ROUND {String(roundNum).padStart(2, "0")}
                    </span>
                    {sprint && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-500 border border-amber-500/20">
                        <Zap className="h-2.5 w-2.5" /> SPRINT
                      </span>
                    )}
                  </div>

                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                      <CheckCircle2 className="h-3 w-3" /> Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/20">
                      <Clock className="h-3 w-3" /> Upcoming
                    </span>
                  )}
                </div>

                {/* Event Name */}
                <h3 className="font-display text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {String(race["name"])}
                </h3>

                {/* Circuit & Country */}
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />
                  <span className="truncate">
                    {String(race["circuit"])}
                    {race["country"] ? ` · ${String(race["country"])}` : ""}
                  </span>
                </div>
              </div>

              {/* Bottom: Date & Winner / Format */}
              <div className="mt-4 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-muted-foreground">
                    {String(race["date"])}
                  </span>

                  {isCompleted && winnerName && winnerName !== "—" ? (
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" />
                      <span
                        className="font-bold text-foreground"
                        style={{ color: teamInfo?.color }}
                      >
                        {winnerName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Grand Prix Weekend
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
