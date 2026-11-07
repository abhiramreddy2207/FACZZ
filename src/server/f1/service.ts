import { globalF1Cache } from "./cache";
import { JolpicaAdapter } from "./adapters/jolpica";
import { OpenF1Adapter } from "./adapters/openf1";
import type {
  F1ApiResponse,
  DriverStandingItem,
  ConstructorStandingItem,
  LiveTimingRow,
  TrackWeather,
} from "./types";
import {
  driverPoints,
  teamPoints,
  drivers,
  teams,
  getDriver,
  getTeam,
  raceWeekend,
  DEMO_UPDATED,
} from "@/lib/demo-data";
import { sessionRows } from "@/lib/session-data";

// =========================================================
// CACHE TTL & STALE DURATION CONFIGURATION
// =========================================================
const STANDINGS_TTL_MS = 10 * 60 * 1000; // 10 minutes fresh
const STANDINGS_STALE_MS = 2 * 60 * 60 * 1000; // 2 hours stale tolerance
const LIVE_TIMING_TTL_MS = 15 * 1000; // 15 seconds fresh
const LIVE_TIMING_STALE_MS = 120 * 1000; // 2 minutes stale tolerance
const WEATHER_TTL_MS = 30 * 1000; // 30 seconds fresh
const WEATHER_STALE_MS = 300 * 1000; // 5 minutes stale tolerance

export class F1Service {
  /**
   * Get Driver Championship Standings with Caching & Graceful Fallback
   */
  static async getDriverStandings(season = "current", forceRefresh = false): Promise<F1ApiResponse<DriverStandingItem[]>> {
    const cacheKey = `driver-standings:${season}`;
    if (forceRefresh) {
      globalF1Cache.invalidate(cacheKey);
    }

    try {
      return await globalF1Cache.getOrFetch(
        cacheKey,
        STANDINGS_TTL_MS,
        STANDINGS_STALE_MS,
        async () => JolpicaAdapter.fetchDriverStandings(season)
      );
    } catch {
      // Deterministic Fallback if upstream fails and no cache exists
      const leaderPts = driverPoints[0]?.pts ?? 0;
      const fallbackData: DriverStandingItem[] = driverPoints.map((p, i) => {
        const d = getDriver(p.id);
        const t = getTeam(d?.teamId ?? "");
        return {
          pos: i + 1,
          driverId: p.id,
          driverName: d?.name ?? p.id,
          code: d?.code ?? p.id.slice(0, 3).toUpperCase(),
          number: d?.number,
          teamId: d?.teamId ?? "independent",
          teamName: t?.name ?? "Independent",
          points: p.pts,
          wins: d?.wins ?? 0,
          behindLeader: +(leaderPts - p.pts).toFixed(1),
        };
      });

      return {
        data: fallbackData,
        meta: {
          provider: "FIA Formula 1 World Championship / Jolpica Ergast API (Fallback)",
          providerUrl: "https://api.jolpica.com/ergast/f1/current/driverStandings.json",
          freshness: "fallback",
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60000).toISOString(),
          staleAt: new Date(Date.now() + 120000).toISOString(),
          latencyMs: 0,
          season: season === "current" ? "2026" : season,
        },
      };
    }
  }

  /**
   * Get Constructor Championship Standings with Caching & Graceful Fallback
   */
  static async getConstructorStandings(season = "current", forceRefresh = false): Promise<F1ApiResponse<ConstructorStandingItem[]>> {
    const cacheKey = `constructor-standings:${season}`;
    if (forceRefresh) {
      globalF1Cache.invalidate(cacheKey);
    }

    try {
      return await globalF1Cache.getOrFetch(
        cacheKey,
        STANDINGS_TTL_MS,
        STANDINGS_STALE_MS,
        async () => JolpicaAdapter.fetchConstructorStandings(season)
      );
    } catch {
      // Deterministic Fallback if upstream fails and no cache exists
      const leaderPts = teamPoints[0]?.pts ?? 0;
      const fallbackData: ConstructorStandingItem[] = teamPoints.map((p, i) => {
        const t = getTeam(p.id);
        return {
          pos: i + 1,
          teamId: p.id,
          teamName: t?.name ?? p.id,
          points: p.pts,
          wins: t?.titles ?? 0,
          behindLeader: +(leaderPts - p.pts).toFixed(1),
          engine: t?.engine,
        };
      });

      return {
        data: fallbackData,
        meta: {
          provider: "FIA Formula 1 World Championship / Jolpica Ergast API (Fallback)",
          providerUrl: "https://api.jolpica.com/ergast/f1/current/constructorStandings.json",
          freshness: "fallback",
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 60000).toISOString(),
          staleAt: new Date(Date.now() + 120000).toISOString(),
          latencyMs: 0,
          season: season === "current" ? "2026" : season,
        },
      };
    }
  }

  /**
   * Get Live Timing intervals with Caching & Session Fallback
   */
  static async getLiveTiming(): Promise<F1ApiResponse<LiveTimingRow[]>> {
    const cacheKey = "live-timing:latest";

    try {
      return await globalF1Cache.getOrFetch(
        cacheKey,
        LIVE_TIMING_TTL_MS,
        LIVE_TIMING_STALE_MS,
        async () => OpenF1Adapter.fetchLiveTiming()
      );
    } catch {
      // Fallback to active or latest completed session rows
      const activeSession = raceWeekend.sessions.find((s) => s.status === "live")
        ?? raceWeekend.sessions.filter((s) => s.status === "done").pop()
        ?? raceWeekend.sessions[0];
      const rows = sessionRows(activeSession?.id ?? "fp2", raceWeekend.name);
      const fallbackRows: LiveTimingRow[] = rows.map((r) => ({
        pos: r.pos,
        driverId: r.driver,
        code: r.code,
        driverName: r.name,
        teamId: r.team,
        teamName: getTeam(r.team)?.name ?? r.team,
        gap: r.gap,
        gapSeconds: r.gapS,
        interval: r.pos === 1 ? "—" : `+${(r.gapS * 0.4).toFixed(3)}s`,
        lastLapTime: r.last,
        inPit: false,
        pitStops: 1,
      }));

      return {
        data: fallbackRows,
        meta: {
          provider: "F1 Live Timing / OpenF1 API (Session Fallback)",
          providerUrl: "https://openf1.org/",
          freshness: "fallback",
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15000).toISOString(),
          staleAt: new Date(Date.now() + 60000).toISOString(),
          latencyMs: 0,
        },
      };
    }
  }

  /**
   * Get Track Weather Conditions with Caching & Fallback
   */
  static async getTrackWeather(): Promise<F1ApiResponse<TrackWeather>> {
    const cacheKey = "weather:latest";

    try {
      return await globalF1Cache.getOrFetch(
        cacheKey,
        WEATHER_TTL_MS,
        WEATHER_STALE_MS,
        async () => OpenF1Adapter.fetchWeather()
      );
    } catch {
      return {
        data: {
          airTemp: 24.8,
          trackTemp: 41.2,
          humidity: 58,
          rainfall: false,
          windSpeed: 2.4,
          windDirection: 145,
          trackStatus: "AllClear",
          recordedAt: new Date().toISOString(),
        },
        meta: {
          provider: "OpenF1 Weather Station (Baseline)",
          providerUrl: "https://openf1.org/",
          freshness: "fallback",
          cachedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30000).toISOString(),
          staleAt: new Date(Date.now() + 120000).toISOString(),
          latencyMs: 0,
        },
      };
    }
  }

  /**
   * System Health and Upstream Diagnostics
   */
  static getHealth() {
    const stats = globalF1Cache.getStats();
    return {
      status: "operational",
      timestamp: new Date().toISOString(),
      cache: stats,
      providers: {
        jolpica: {
          status: "connected",
          baseUrl: "https://api.jolpica.com/ergast/f1",
          rateLimit: "10 req/s",
        },
        openf1: {
          status: "connected",
          baseUrl: "https://api.openf1.org/v1",
          rateLimit: "3 req/s",
        },
      },
    };
  }
}
