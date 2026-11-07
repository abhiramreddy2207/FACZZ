import {
  JolpicaDriverStandingRawSchema,
  JolpicaConstructorStandingRawSchema,
  type DriverStandingItem,
  type ConstructorStandingItem,
} from "../types";
import { normalizeDriverId, normalizeConstructorId } from "../mappings";
import { getDriver, getTeam } from "@/lib/demo-data";

const JOLPICA_BASE = "https://api.jolpica.com/ergast/f1";

export class JolpicaAdapter {
  private static userAgent = "Faczz-Motorsport-Platform/2.6.0 (https://faczz.app; telemetry@faczz.app)";

  /**
   * Fetch Driver Standings from Jolpica / Ergast API
   */
  static async fetchDriverStandings(season = "current"): Promise<{
    data: DriverStandingItem[];
    provider: string;
    providerUrl: string;
    season: string;
    round?: string;
  }> {
    const url = `${JOLPICA_BASE}/${season}/driverStandings.json`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Jolpica driver standings HTTP error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const standingsList = json?.MRData?.StandingsTable?.StandingsLists?.[0];
    if (!standingsList || !Array.isArray(standingsList.DriverStandings)) {
      throw new Error("Invalid Jolpica driver standings response structure");
    }

    const rawStandings = standingsList.DriverStandings;
    const seasonYear = standingsList.season ?? season;
    const roundNumber = standingsList.round;

    let leaderPoints = 0;
    const items: DriverStandingItem[] = [];

    for (const raw of rawStandings) {
      const parsed = JolpicaDriverStandingRawSchema.safeParse(raw);
      if (!parsed.success) continue;

      const { position, points, wins, Driver, Constructors } = parsed.data;
      const pos = parseInt(position, 10);
      const pts = parseFloat(points) || 0;
      const winCount = parseInt(wins, 10) || 0;

      if (pos === 1) {
        leaderPoints = pts;
      }

      const driverId = normalizeDriverId(Driver.driverId, Driver.code, Driver.familyName);
      const catalogDriver = getDriver(driverId);
      const constructorRawId = Constructors[0]?.constructorId ?? "";
      const teamId = normalizeConstructorId(constructorRawId, Constructors[0]?.name);
      const catalogTeam = getTeam(teamId);

      items.push({
        pos,
        driverId,
        driverName: catalogDriver?.name ?? `${Driver.givenName} ${Driver.familyName}`,
        code: catalogDriver?.code ?? Driver.code ?? Driver.familyName.slice(0, 3).toUpperCase(),
        number: catalogDriver?.number ?? (Driver.permanentNumber ? parseInt(Driver.permanentNumber, 10) : undefined),
        teamId: catalogDriver?.teamId ?? teamId,
        teamName: catalogTeam?.name ?? Constructors[0]?.name ?? "Independent",
        points: pts,
        wins: winCount,
        behindLeader: +(leaderPoints - pts).toFixed(1),
      });
    }

    if (items.length === 0) {
      throw new Error("No valid driver standings parsed from Jolpica");
    }

    return {
      data: items,
      provider: "FIA Formula 1 World Championship / Jolpica Ergast API",
      providerUrl: url,
      season: seasonYear,
      round: roundNumber,
    };
  }

  /**
   * Fetch Constructor Standings from Jolpica / Ergast API
   */
  static async fetchConstructorStandings(season = "current"): Promise<{
    data: ConstructorStandingItem[];
    provider: string;
    providerUrl: string;
    season: string;
    round?: string;
  }> {
    const url = `${JOLPICA_BASE}/${season}/constructorStandings.json`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": this.userAgent,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) {
      throw new Error(`Jolpica constructor standings HTTP error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const standingsList = json?.MRData?.StandingsTable?.StandingsLists?.[0];
    if (!standingsList || !Array.isArray(standingsList.ConstructorStandings)) {
      throw new Error("Invalid Jolpica constructor standings response structure");
    }

    const rawStandings = standingsList.ConstructorStandings;
    const seasonYear = standingsList.season ?? season;
    const roundNumber = standingsList.round;

    let leaderPoints = 0;
    const items: ConstructorStandingItem[] = [];

    for (const raw of rawStandings) {
      const parsed = JolpicaConstructorStandingRawSchema.safeParse(raw);
      if (!parsed.success) continue;

      const { position, points, wins, Constructor } = parsed.data;
      const pos = parseInt(position, 10);
      const pts = parseFloat(points) || 0;
      const winCount = parseInt(wins, 10) || 0;

      if (pos === 1) {
        leaderPoints = pts;
      }

      const teamId = normalizeConstructorId(Constructor.constructorId, Constructor.name);
      const catalogTeam = getTeam(teamId);

      items.push({
        pos,
        teamId,
        teamName: catalogTeam?.name ?? Constructor.name,
        points: pts,
        wins: winCount,
        behindLeader: +(leaderPoints - pts).toFixed(1),
        engine: catalogTeam?.engine,
      });
    }

    if (items.length === 0) {
      throw new Error("No valid constructor standings parsed from Jolpica");
    }

    return {
      data: items,
      provider: "FIA Formula 1 World Championship / Jolpica Ergast API",
      providerUrl: url,
      season: seasonYear,
      round: roundNumber,
    };
  }
}
