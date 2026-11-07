import type {
  F1ApiResponse,
  DriverStandingItem,
  ConstructorStandingItem,
  LiveTimingRow,
  TrackWeather,
} from "@/server/f1/types";

export type LiveTelemetryPayload = {
  timing: LiveTimingRow[];
  weather: TrackWeather;
  meta: {
    timing: any;
    weather: any;
    freshness: string;
    updatedAt: string;
  };
};

/**
 * Client-side fetcher for Driver Championship Standings
 */
export async function fetchF1DriverStandingsClient(
  season = "current",
  refresh = false
): Promise<F1ApiResponse<DriverStandingItem[]> | null> {
  try {
    const url = `/api/f1/standings?type=drivers&season=${encodeURIComponent(season)}${refresh ? "&refresh=true" : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Client-side fetcher for Constructor Championship Standings
 */
export async function fetchF1ConstructorStandingsClient(
  season = "current",
  refresh = false
): Promise<F1ApiResponse<ConstructorStandingItem[]> | null> {
  try {
    const url = `/api/f1/standings?type=constructors&season=${encodeURIComponent(season)}${refresh ? "&refresh=true" : ""}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Client-side fetcher for Live Timing and Track Weather
 */
export async function fetchF1LiveTimingClient(): Promise<LiveTelemetryPayload | null> {
  try {
    const res = await fetch("/api/f1/live", { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Client-side health check
 */
export async function fetchF1HealthClient(): Promise<any | null> {
  try {
    const res = await fetch("/api/f1/health", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
