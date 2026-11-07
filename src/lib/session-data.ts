import { drivers, seed } from "./demo-data";

/** Deterministic, distinct sample classifications for every weekend session. */
export function sessionRows(session: string, event = "Mexico City GP", season = "2024") {
  const key = `${season}:${event}:${session}`;
  const salt = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const race = session === "race" || session === "sprint";
  return drivers.map((driver, i) => ({ driver, rank: seed(i, salt) }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ driver }, i) => ({
      pos: i + 1, driver: driver.id, name: driver.name, code: driver.code, team: driver.teamId,
      gapS: i === 0 ? 0 : +(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3),
      gap: i === 0 ? (race ? "1:38:42.117" : "1:10.427") : `+${(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3)}s`,
      last: `1:${(12 + seed(i, salt + 1) * 2).toFixed(3)}`,
      pts: race ? ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][i] ?? 0) : 0,
    }));
}