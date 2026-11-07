import { drivers, seed, getDriver } from "./demo-data";

// The 20 active drivers on the Formula 1 World Championship grid
const ACTIVE_GRID_IDS = [
  "norris", "sainz", "leclerc", "hamilton", "russell",
  "verstappen", "gasly", "hulkenberg", "alonso", "piastri",
  "albon", "tsunoda", "ocon", "stroll", "lawson",
  "magnussen", "zhou", "bottas", "perez", "colapinto"
];

// Official 2024 Abu Dhabi Grand Prix Race Classification
const ABU_DHABI_2024_RACE_ORDER = [
  "norris", "sainz", "leclerc", "hamilton", "russell",
  "verstappen", "gasly", "hulkenberg", "alonso", "piastri",
  "albon", "tsunoda", "ocon", "stroll", "lawson",
  "magnussen", "zhou", "bottas", "perez", "colapinto"
];

// Official 2024 Abu Dhabi Grand Prix Qualifying Order
const ABU_DHABI_2024_QUALI_ORDER = [
  "norris", "piastri", "sainz", "hulkenberg", "verstappen",
  "gasly", "russell", "alonso", "bottas", "perez",
  "tsunoda", "leclerc", "magnussen", "hamilton", "lawson",
  "albon", "zhou", "colapinto", "ocon", "stroll"
];

/** Deterministic, distinct sample classifications for every weekend session. */
export function sessionRows(session: string, event = "Abu Dhabi GP", season = "2024") {
  const key = `${season}:${event}:${session}`;
  const salt = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const race = session === "race" || session === "sprint";
  const isQuali = session === "quali" || session === "sq";

  // Use the 20 active grid drivers (Never retired historical drivers)
  const activeDrivers = ACTIVE_GRID_IDS
    .map((id) => getDriver(id))
    .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);

  let orderedDrivers = activeDrivers;

  const isAbuDhabi = season === "2024" && (event.toLowerCase().includes("abu dhabi") || event.toLowerCase().includes("yas marina"));

  if (isAbuDhabi) {
    if (session === "race") {
      orderedDrivers = ABU_DHABI_2024_RACE_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else if (session === "quali") {
      orderedDrivers = ABU_DHABI_2024_QUALI_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else {
      orderedDrivers = [...activeDrivers]
        .map((driver, i) => ({ driver, rank: seed(i, salt) }))
        .sort((a, b) => a.rank - b.rank)
        .map((x) => x.driver);
    }
  } else {
    orderedDrivers = [...activeDrivers]
      .map((driver, i) => ({ driver, rank: seed(i, salt) }))
      .sort((a, b) => a.rank - b.rank)
      .map((x) => x.driver);
  }

  return orderedDrivers.map((driver, i) => {
    // Official Abu Dhabi race gaps
    const officialAbuDhabiGaps = [
      "1:26:33.291", "+5.832s", "+8.309s", "+12.378s", "+16.091s",
      "+20.211s", "+31.543s", "+34.821s", "+38.645s", "+41.229s",
      "+43.890s", "+46.120s", "+49.432s", "+53.210s", "+56.780s",
      "+61.200s", "+65.400s", "+68.900s", "DNF", "DNF"
    ];

    const officialQualiTimes = [
      "1:22.595", "1:22.739", "1:22.824", "1:22.847", "1:22.873",
      "1:22.915", "1:22.965", "1:23.035", "1:23.080", "1:23.100",
      "1:23.205", "1:23.207", "1:23.299", "1:23.342", "1:23.414",
      "1:23.676", "1:23.712", "1:23.754", "1:23.821", "1:23.902"
    ];

    const isAbuDhabiOfficial = isAbuDhabi;

    const gap = isAbuDhabiOfficial && session === "race"
      ? (officialAbuDhabiGaps[i] ?? `+${(i * 3.2).toFixed(3)}s`)
      : i === 0
      ? (race ? "1:26:33.291" : "1:22.595")
      : `+${(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3)}s`;

    const gapS = i === 0 ? 0 : +(i * (race ? 2.84 : 0.085) + seed(i, salt) * (race ? 2 : 0.05)).toFixed(3);

    // Realistic Sector times
    const s1Time = +(17.4 + i * 0.035 + seed(i, salt + 1) * 0.12).toFixed(3);
    const s2Time = +(36.1 + i * 0.055 + seed(i, salt + 2) * 0.15).toFixed(3);
    const s3Time = +(29.0 + i * 0.045 + seed(i, salt + 3) * 0.14).toFixed(3);

    const s1 = s1Time.toFixed(3);
    const s2 = s2Time.toFixed(3);
    const s3 = s3Time.toFixed(3);

    const last = isAbuDhabiOfficial && session === "quali"
      ? (officialQualiTimes[i] ?? `1:23.${(i * 45).toString().padStart(3, "0")}`)
      : `1:${(22 + (s1Time + s2Time + s3Time - 82.5)).toFixed(3)}`;

    // Tyre compounds
    const tyreList = isQuali ? (["soft", "soft", "medium"] as const) : (["medium", "hard", "soft"] as const);
    const tyre = tyreList[Math.floor(seed(i, salt + 4) * tyreList.length)] || "medium";
    const tyreAge = Math.floor(seed(i, salt + 5) * (race ? 25 : 8)) + 1;
    const pitStops = race ? (tyreAge > 20 ? 2 : tyreAge > 10 ? 1 : 0) : 0;

    // Qualifying Q1, Q2, Q3
    const q1 = isAbuDhabiOfficial && isQuali ? (officialQualiTimes[i] ?? "1:23.500") : `1:${(23 + seed(i, salt + 6) * 0.7).toFixed(3)}`;
    const q2 = i < 15 ? (isAbuDhabiOfficial && isQuali ? (officialQualiTimes[i] ?? "1:23.100") : `1:${(22.8 + seed(i, salt + 7) * 0.5).toFixed(3)}`) : "—";
    const q3 = i < 10 ? (isAbuDhabiOfficial && isQuali ? (officialQualiTimes[i] ?? "1:22.700") : `1:${(22.4 + seed(i, salt + 8) * 0.4).toFixed(3)}`) : "—";

    // Telemetry attributes
    const speed = Math.floor(318 + seed(i, salt + 9) * 22);
    const gear = Math.floor(6 + seed(i, salt + 10) * 2.9);
    const rpm = Math.floor(11400 + seed(i, salt + 11) * 900);
    const throttle = Math.floor(92 + seed(i, salt + 12) * 8);
    const brake = seed(i, salt + 13) > 0.85 ? Math.floor(seed(i, salt + 13) * 100) : 0;
    const drs = seed(i, salt + 14) > 0.35;

    return {
      pos: i + 1,
      driver: driver.id,
      name: driver.name,
      code: driver.code,
      team: driver.teamId,
      gapS,
      gap,
      last,
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
      q1,
      q2,
      q3,
      speed,
      gear,
      rpm,
      throttle,
      brake,
      drs,
    };
  });
}
