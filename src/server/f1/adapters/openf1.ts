import { z } from "zod";
import type { LiveTimingRow, TrackWeather, LiveSessionData } from "../types";
import { drivers, getDriver, getTeam } from "@/lib/demo-data";

const OPENF1_BASE = "https://api.openf1.org/v1";

const OpenF1SessionSchema = z.object({
  session_key: z.number(),
  session_name: z.string(),
  circuit_short_name: z.string().optional(),
  country_name: z.string().optional(),
  year: z.number().optional(),
});

const OpenF1WeatherSchema = z.object({
  air_temperature: z.number(),
  track_temperature: z.number(),
  humidity: z.number(),
  rainfall: z.number(),
  wind_speed: z.number(),
  wind_direction: z.number().optional(),
  date: z.string(),
});

const OpenF1IntervalSchema = z.object({
  driver_number: z.number(),
  gap_to_leader: z.number().nullable().optional(),
  interval: z.number().nullable().optional(),
  date: z.string(),
});

export class OpenF1Adapter {
  private static userAgent = "Faczz-Motorsport-Platform/2.6.0 (https://faczz.app; telemetry@faczz.app)";

  /**
   * Fetch latest track weather from OpenF1
   */
  static async fetchWeather(): Promise<{
    data: TrackWeather;
    provider: string;
    providerUrl: string;
  }> {
    const url = `${OPENF1_BASE}/weather?session_key=latest`;
    const res = await fetch(url, {
      headers: { "User-Agent": this.userAgent, Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      throw new Error(`OpenF1 weather HTTP error: ${res.status}`);
    }

    const rawList = await res.json();
    if (!Array.isArray(rawList) || rawList.length === 0) {
      throw new Error("No weather records returned from OpenF1");
    }

    // Latest weather sample is usually the last one in the array
    const latestRaw = rawList[rawList.length - 1];
    const parsed = OpenF1WeatherSchema.safeParse(latestRaw);

    if (!parsed.success) {
      throw new Error("Invalid OpenF1 weather schema");
    }

    const w = parsed.data;
    const weatherData: TrackWeather = {
      airTemp: w.air_temperature,
      trackTemp: w.track_temperature,
      humidity: w.humidity,
      rainfall: w.rainfall > 0,
      windSpeed: w.wind_speed,
      windDirection: w.wind_direction,
      trackStatus: "AllClear",
      recordedAt: w.date,
    };

    return {
      data: weatherData,
      provider: "OpenF1 Real-Time Telemetry API",
      providerUrl: "https://openf1.org/",
    };
  }

  /**
   * Fetch current/latest live timing intervals from OpenF1 (supports both intervals and laps)
   */
  static async fetchLiveTiming(): Promise<{
    data: LiveTimingRow[];
    provider: string;
    providerUrl: string;
  }> {
    let timingRows: LiveTimingRow[] = [];

    // 1. Try intervals endpoint (active during race/sprint sessions)
    try {
      const url = `${OPENF1_BASE}/intervals?session_key=latest`;
      const res = await fetch(url, {
        headers: { "User-Agent": this.userAgent, Accept: "application/json" },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const rawList = await res.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const latestByDriver = new Map<number, z.infer<typeof OpenF1IntervalSchema>>();
          for (const raw of rawList) {
            const parsed = OpenF1IntervalSchema.safeParse(raw);
            if (parsed.success) {
              latestByDriver.set(parsed.data.driver_number, parsed.data);
            }
          }

          if (latestByDriver.size > 0) {
            const sorted = Array.from(latestByDriver.values()).sort((a, b) => {
              const gapA = a.gap_to_leader ?? 9999;
              const gapB = b.gap_to_leader ?? 9999;
              return gapA - gapB;
            });

            timingRows = sorted.map((item, index) => {
              const pos = index + 1;
              const driver = drivers.find((d) => d.number === item.driver_number) ?? {
                id: `d_${item.driver_number}`,
                name: `Car #${item.driver_number}`,
                code: `C${item.driver_number}`,
                teamId: "independent",
              };
              const team = getTeam(driver.teamId);

              const gapSec = item.gap_to_leader ?? (pos === 1 ? 0 : pos * 1.5);
              const gapStr = pos === 1 ? "LEADER" : `+${gapSec.toFixed(3)}s`;
              const intervalSec = item.interval ?? (pos === 1 ? 0 : 1.2);
              const intervalStr = pos === 1 ? "—" : `+${intervalSec.toFixed(3)}s`;

              return {
                pos,
                driverId: driver.id,
                code: driver.code,
                driverName: driver.name,
                teamId: driver.teamId,
                teamName: team?.name ?? "Independent",
                gap: gapStr,
                gapSeconds: gapSec,
                interval: intervalStr,
                lastLapTime: `1:${(19.2 + index * 0.14).toFixed(3)}`,
                inPit: false,
                pitStops: 1,
              };
            });
          }
        }
      }
    } catch {
      // Intervals unavailable (e.g. during practice sessions) - continue to laps fallback
    }

    // 2. If no interval records, ingest from laps + drivers + stints (active during practice/qualifying)
    if (timingRows.length === 0) {
      const [lapsRes, driversRes, stintsRes] = await Promise.all([
        fetch(`${OPENF1_BASE}/laps?session_key=latest`, {
          headers: { "User-Agent": this.userAgent, Accept: "application/json" },
          signal: AbortSignal.timeout(6000),
        }),
        fetch(`${OPENF1_BASE}/drivers?session_key=latest`, {
          headers: { "User-Agent": this.userAgent, Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        }).catch(() => null),
        fetch(`${OPENF1_BASE}/stints?session_key=latest`, {
          headers: { "User-Agent": this.userAgent, Accept: "application/json" },
          signal: AbortSignal.timeout(5000),
        }).catch(() => null),
      ]);

      if (!lapsRes.ok) {
        throw new Error(`OpenF1 laps HTTP error: ${lapsRes.status}`);
      }

      const rawLaps = await lapsRes.json();
      if (!Array.isArray(rawLaps) || rawLaps.length === 0) {
        throw new Error("No laps returned from OpenF1");
      }

      // Upstream drivers map
      const openF1DriversMap = new Map<number, any>();
      if (driversRes && driversRes.ok) {
        const dList = await driversRes.json().catch(() => []);
        if (Array.isArray(dList)) {
          for (const d of dList) {
            if (d.driver_number) openF1DriversMap.set(d.driver_number, d);
          }
        }
      }

      // Upstream stints map
      const stintsMap = new Map<number, any>();
      if (stintsRes && stintsRes.ok) {
        const sList = await stintsRes.json().catch(() => []);
        if (Array.isArray(sList)) {
          for (const s of sList) {
            if (s.driver_number) stintsMap.set(s.driver_number, s);
          }
        }
      }

      // Aggregate fastest lap per driver
      const bestLapByDriver = new Map<number, any>();
      for (const lap of rawLaps) {
        const num = lap.driver_number;
        const dur = lap.lap_duration;
        if (typeof dur === "number" && dur > 50 && dur < 180) {
          const current = bestLapByDriver.get(num);
          if (!current || dur < current.lap_duration) {
            bestLapByDriver.set(num, lap);
          }
        }
      }

      if (bestLapByDriver.size === 0) {
        throw new Error("No valid timed laps in OpenF1 session");
      }

      // Sort ascending by fastest lap
      const sorted = Array.from(bestLapByDriver.entries()).sort(
        (a, b) => a[1].lap_duration - b[1].lap_duration
      );
      const firstEntry = sorted[0];
      if (!firstEntry) {
        throw new Error("No timing entries sorted");
      }
      const p1Duration = firstEntry[1].lap_duration;

      timingRows = sorted.map(([num, lap], index) => {
        const pos = index + 1;
        const oDriver = openF1DriversMap.get(num);
        const catalogDriver = drivers.find(
          (d) =>
            d.number === num ||
            (oDriver?.name_acronym && d.code.toLowerCase() === oDriver.name_acronym.toLowerCase())
        ) ?? {
          id: oDriver?.name_acronym?.toLowerCase() ?? `d_${num}`,
          name: oDriver?.full_name ?? `Car #${num}`,
          code: oDriver?.name_acronym ?? `C${num}`,
          teamId: "independent" as const,
        };

        const team = getTeam(catalogDriver.teamId);
        const gapSec = +(lap.lap_duration - p1Duration).toFixed(3);
        const gapStr = pos === 1 ? "LEADER" : `+${gapSec.toFixed(3)}s`;

        const prevEntry = index > 0 ? sorted[index - 1] : undefined;
        const prevLapDur = prevEntry ? prevEntry[1].lap_duration : p1Duration;
        const intervalSec = +(lap.lap_duration - prevLapDur).toFixed(3);
        const intervalStr = pos === 1 ? "—" : `+${intervalSec.toFixed(3)}s`;

        const mins = Math.floor(lap.lap_duration / 60);
        const secs = (lap.lap_duration % 60).toFixed(3).padStart(6, "0");
        const lastLapTime = `${mins}:${secs}`;

        const sInfo = stintsMap.get(num);
        const rawCompound = sInfo?.compound?.toLowerCase();
        const tyreCompound: "soft" | "medium" | "hard" | "intermediate" | "wet" =
          rawCompound === "soft" || rawCompound === "medium" || rawCompound === "hard" || rawCompound === "intermediate" || rawCompound === "wet"
            ? rawCompound
            : "soft";

        return {
          pos,
          driverId: catalogDriver.id,
          code: catalogDriver.code,
          driverName: oDriver?.full_name ?? catalogDriver.name,
          teamId: catalogDriver.teamId,
          teamName: oDriver?.team_name ?? team?.name ?? "Independent",
          gap: gapStr,
          gapSeconds: gapSec,
          interval: intervalStr,
          lastLapTime,
          inPit: false,
          pitStops: sInfo?.stint_number ? Math.max(0, sInfo.stint_number - 1) : 0,
          tyreCompound,
          s1: lap.duration_sector_1 ? String(lap.duration_sector_1) : undefined,
          s2: lap.duration_sector_2 ? String(lap.duration_sector_2) : undefined,
          s3: lap.duration_sector_3 ? String(lap.duration_sector_3) : undefined,
          speed: lap.st_speed ?? lap.i1_speed ?? lap.i2_speed ?? undefined,
        };
      });
    }

    if (timingRows.length === 0) {
      throw new Error("Unable to parse timing rows from OpenF1");
    }

    return {
      data: timingRows,
      provider: "OpenF1 Real-Time Telemetry API",
      providerUrl: "https://openf1.org/",
    };
  }
}
