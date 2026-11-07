import { drivers, seed } from "./demo-data";

/** Deterministic, distinct sample classifications for every weekend session. */
export function sessionRows(session: string, event = "Mexico City GP", season = "2024") {
  const key = `${season}:${event}:${session}`;
  const salt = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const race = session === "race" || session === "sprint";
  const isQuali = session === "quali" || session === "sq";

  return drivers
    .map((driver, i) => ({ driver, rank: seed(i, salt) }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ driver }, i) => {
      // Base lap time in seconds
      const baseLap = (isQuali ? 82.8 : 86.4) + i * (race ? 0.35 : 0.08) + seed(i, salt) * 0.15;
      const s1Time = 17.4 + i * 0.04 + seed(i, salt + 1) * 0.18;
      const s2Time = 36.2 + i * 0.06 + seed(i, salt + 2) * 0.22;
      const s3Time = baseLap - s1Time - s2Time;

      const s1 = s1Time.toFixed(3);
      const s2 = s2Time.toFixed(3);
      const s3 = s3Time.toFixed(3);

      // Tyre compound allocation
      const compoundList = isQuali ? (["soft", "soft", "medium"] as const) : (["medium", "hard", "soft"] as const);
      const tyre = compoundList[Math.floor(seed(i, salt + 3) * compoundList.length)] || "medium";
      const tyreAge = Math.floor(seed(i, salt + 4) * (race ? 28 : 8)) + 1;
      const pitStops = race ? (tyreAge > 20 ? 2 : tyreAge > 12 ? 1 : 0) : 0;

      // Qualifying progression times
      const q1Secs = 84.1 + seed(i, salt + 5) * 0.8;
      const q2Secs = i < 15 ? 83.5 + seed(i, salt + 6) * 0.6 : null;
      const q3Secs = i < 10 ? 82.9 + seed(i, salt + 7) * 0.4 : null;

      const fmtTime = (s: number | null) =>
        s ? `${Math.floor(s / 60)}:${(s % 60).toFixed(3).padStart(6, "0")}` : "—";

      // Live Telemetry attributes
      const speed = Math.floor(310 + seed(i, salt + 8) * 35);
      const gear = Math.floor(6 + seed(i, salt + 9) * 2.9);
      const rpm = Math.floor(11200 + seed(i, salt + 10) * 1200);
      const throttle = Math.floor(88 + seed(i, salt + 11) * 12);
      const brake = seed(i, salt + 12) > 0.8 ? Math.floor(seed(i, salt + 12) * 100) : 0;
      const drs = seed(i, salt + 13) > 0.4;

      return {
        pos: i + 1,
        driver: driver.id,
        name: driver.name,
        code: driver.code,
        team: driver.teamId,
        gapS: i === 0 ? 0 : +(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3),
        gap:
          i === 0
            ? race
              ? "1:38:42.117"
              : "1:10.427"
            : `+${(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3)}s`,
        last: `1:${(12 + seed(i, salt + 1) * 2).toFixed(3)}`,
        pts: race ? ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][i] ?? 0) : 0,
        s1,
        s2,
        s3,
        s1Status: i === 0 ? "purple" : i < 3 ? "green" : "yellow",
        s2Status: i === 1 ? "purple" : i < 4 ? "green" : "yellow",
        s3Status: i === 2 ? "purple" : i < 5 ? "green" : "yellow",
        tyre,
        tyreAge,
        pitStops,
        q1: fmtTime(q1Secs),
        q2: fmtTime(q2Secs),
        q3: fmtTime(q3Secs),
        speed,
        gear,
        rpm,
        throttle,
        brake,
        drs,
      };
    });
}
