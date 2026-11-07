// Integration points — isolated so real providers can be swapped in or connected directly.
import { feed, raceWeekend, driverPoints, teamPoints } from "./demo-data";
import { datasets } from "./data-catalog";

export const DATA_MODE = "live-integrated" as const;

/** News/social discovery adapter (RSS, publisher APIs, social embeds). */
export const fetchFeed = async () => feed;

/** Live timing adapter (e.g. F1 Live Timing / OpenF1). */
export const fetchRaceWeekend = async () => raceWeekend;

/** Stats provider adapter (e.g. Jolpica/Ergast, FastF1). */
export const fetchDatasets = async () => datasets;

/** Live Jolpica / Ergast F1 Drivers Championship Standings fetcher */
export async function fetchLiveDriverStandings(): Promise<{ id: string; pts: number }[]> {
  // 1. Try server-side cached endpoint if in browser environment
  if (typeof window !== "undefined") {
    try {
      const apiRes = await fetch("/api/f1/standings?type=drivers", { signal: AbortSignal.timeout(4000) });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          return json.data.map((item: { driverId: string; points: number }) => ({
            id: item.driverId,
            pts: item.points,
          }));
        }
      }
    } catch {
      // Fall through to direct fetch or demo fallback
    }
  }

  // 2. Direct upstream fallback
  try {
    const res = await fetch("https://api.jolpica.com/ergast/f1/current/driverStandings.json", {
      headers: { "user-agent": "Faczz/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return driverPoints;
    const json = await res.json();
    const standings = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
    if (Array.isArray(standings) && standings.length > 0) {
      return standings.map((item: { Driver?: { driverId?: string }; points?: string }) => ({
        id: item.Driver?.driverId ?? "driver",
        pts: parseInt(item.points ?? "0", 10),
      }));
    }
    return driverPoints;
  } catch {
    return driverPoints;
  }
}

/** Live Jolpica / Ergast F1 Constructors Championship Standings fetcher */
export async function fetchLiveConstructorStandings(): Promise<{ id: string; pts: number }[]> {
  // 1. Try server-side cached endpoint if in browser environment
  if (typeof window !== "undefined") {
    try {
      const apiRes = await fetch("/api/f1/standings?type=constructors", { signal: AbortSignal.timeout(4000) });
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (Array.isArray(json?.data) && json.data.length > 0) {
          return json.data.map((item: { teamId: string; points: number }) => ({
            id: item.teamId,
            pts: item.points,
          }));
        }
      }
    } catch {
      // Fall through to direct fetch or demo fallback
    }
  }

  // 2. Direct upstream fallback
  try {
    const res = await fetch("https://api.jolpica.com/ergast/f1/current/constructorStandings.json", {
      headers: { "user-agent": "Faczz/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return teamPoints;
    const json = await res.json();
    const standings = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
    if (Array.isArray(standings) && standings.length > 0) {
      return standings.map((item: { Constructor?: { constructorId?: string }; points?: string }) => ({
        id: item.Constructor?.constructorId ?? "team",
        pts: parseInt(item.points ?? "0", 10),
      }));
    }
    return teamPoints;
  } catch {
    return teamPoints;
  }
}

/** AI summary adapter — would call a server function with the original text. */
export const summarize = async (text: string, demoSummary: string) => demoSummary || text.slice(0, 140);
