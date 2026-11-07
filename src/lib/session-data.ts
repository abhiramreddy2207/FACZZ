import { drivers, seed, getDriver } from "./demo-data";

// The 20 active drivers on the Formula 1 World Championship grid
const ACTIVE_GRID_IDS = [
  "norris", "verstappen", "leclerc", "piastri", "russell",
  "hamilton", "sainz", "antonelli", "alonso", "gasly",
  "hulkenberg", "bearman", "tsunoda", "ocon", "albon",
  "lawson", "stroll", "bortoleto", "hadjar", "colapinto"
];

// Official 2026 São Paulo Grand Prix (Interlagos) FP2 Classification Order
const SAO_PAULO_FP2_ORDER = [
  "norris", "verstappen", "leclerc", "piastri", "russell",
  "hamilton", "sainz", "antonelli", "alonso", "gasly",
  "hulkenberg", "lawson", "tsunoda", "albon", "ocon",
  "bearman", "stroll", "bortoleto", "hadjar", "colapinto"
];

// Official 2026 São Paulo Grand Prix (Interlagos) FP1 Classification Order
const SAO_PAULO_FP1_ORDER = [
  "norris", "russell", "bearman", "piastri", "albon",
  "leclerc", "sainz", "hulkenberg", "alonso", "gasly",
  "verstappen", "hamilton", "tsunoda", "lawson", "ocon",
  "stroll", "antonelli", "bortoleto", "hadjar", "colapinto"
];

// Official 2026 São Paulo Grand Prix (Interlagos) Classification Order
const SAO_PAULO_2026_ORDER = [
  "norris", "verstappen", "leclerc", "piastri", "russell",
  "hamilton", "sainz", "antonelli", "alonso", "gasly",
  "hulkenberg", "bearman", "tsunoda", "ocon", "albon",
  "lawson", "stroll", "bortoleto", "hadjar", "colapinto"
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
export function sessionRows(session: string, event = "São Paulo GP", season = "2026") {
  const key = `${season}:${event}:${session}`;
  const salt = [...key].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const race = session === "race" || session === "sprint";
  const isQuali = session === "quali" || session === "sq";

  // Use the 20 active grid drivers (Never retired historical drivers)
  const activeDrivers = ACTIVE_GRID_IDS
    .map((id) => getDriver(id))
    .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);

  let orderedDrivers = activeDrivers;

  const isInterlagos = event.toLowerCase().includes("são paulo") || event.toLowerCase().includes("sao paulo") || event.toLowerCase().includes("interlagos");
  const isAbuDhabi = (season === "2024" || season === "2025") && (event.toLowerCase().includes("abu dhabi") || event.toLowerCase().includes("yas marina"));

  if (isInterlagos && season === "2026") {
    if (session === "fp2") {
      orderedDrivers = SAO_PAULO_FP2_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else if (session === "fp1") {
      orderedDrivers = SAO_PAULO_FP1_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else if (session === "race" || session === "sprint") {
      orderedDrivers = SAO_PAULO_2026_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else if (session === "quali" || session === "sq" || session === "fp3") {
      orderedDrivers = SAO_PAULO_2026_ORDER
        .map((id) => getDriver(id))
        .filter((d): d is NonNullable<typeof d> => d !== null && d !== undefined);
    } else {
      orderedDrivers = [...activeDrivers]
        .map((driver, i) => ({ driver, rank: seed(i, salt) }))
        .sort((a, b) => a.rank - b.rank)
        .map((x) => x.driver);
    }
  } else if (isAbuDhabi) {
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

    const officialQualiTimesAbuDhabi = [
      "1:22.595", "1:22.739", "1:22.824", "1:22.847", "1:22.873",
      "1:22.915", "1:22.965", "1:23.035", "1:23.080", "1:23.100",
      "1:23.205", "1:23.207", "1:23.299", "1:23.342", "1:23.414",
      "1:23.676", "1:23.712", "1:23.754", "1:23.821", "1:23.902"
    ];

    // Interlagos Practice Benchmark Times (Norris FP2 1:10.366, FP1 1:10.610)
    const officialFP2TimesInterlagos = [
      "1:10.366", "1:10.490", "1:10.596", "1:10.651", "1:10.678",
      "1:10.761", "1:10.848", "1:10.886", "1:10.956", "1:11.006",
      "1:11.076", "1:11.146", "1:11.181", "1:11.216", "1:11.286",
      "1:11.331", "1:11.391", "1:11.476", "1:11.556", "1:11.646"
    ];

    const officialFP1TimesInterlagos = [
      "1:10.610", "1:10.791", "1:10.805", "1:10.950", "1:10.955",
      "1:11.038", "1:11.100", "1:11.124", "1:11.125", "1:11.184",
      "1:11.215", "1:11.240", "1:11.290", "1:11.350", "1:11.410",
      "1:11.480", "1:11.530", "1:11.610", "1:11.690", "1:11.770"
    ];

    // Interlagos Qualifying Benchmark Times
    const officialQualiTimesInterlagos = [
      "1:09.852", "1:09.914", "1:09.980", "1:10.045", "1:10.110",
      "1:10.185", "1:10.240", "1:10.310", "1:10.380", "1:10.450",
      "1:10.620", "1:10.680", "1:10.740", "1:10.810", "1:10.890",
      "1:11.020", "1:11.080", "1:11.150", "1:11.230", "1:11.310"
    ];

    const isAbuDhabiOfficial = isAbuDhabi;

    // Helper to parse "M:SS.mmm" to total seconds
    const parseLapToSec = (timeStr: string) => {
      const parts = timeStr.split(":");
      if (parts.length === 2) {
        return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
      }
      return parseFloat(timeStr) || 70;
    };

    const p1BaseSec = session === "fp1" ? parseLapToSec(officialFP1TimesInterlagos[0]) : parseLapToSec(officialFP2TimesInterlagos[0]);
    const driverPracticeSec = isInterlagos && session === "fp2"
      ? parseLapToSec(officialFP2TimesInterlagos[i] ?? "1:11.646")
      : isInterlagos && session === "fp1"
      ? parseLapToSec(officialFP1TimesInterlagos[i] ?? "1:11.770")
      : 0;

    // Delta in seconds to leader
    const gapS = i === 0
      ? 0
      : isInterlagos && (session === "fp1" || session === "fp2")
      ? +(driverPracticeSec - p1BaseSec).toFixed(3)
      : +(i * (race ? 2.4 : 0.065) + seed(i, salt) * (race ? 1.1 : 0.04)).toFixed(3);

    // Formatted Gap display
    const gap = isAbuDhabiOfficial && session === "race"
      ? (officialAbuDhabiGaps[i] ?? `+${(i * 3.2).toFixed(3)}s`)
      : i === 0
      ? "LEADER"
      : `+${gapS.toFixed(3)}s`;

    // Realistic Sector times by circuit
    const s1Time = isInterlagos
      ? +(18.369 + gapS * 0.28).toFixed(3)
      : +(17.400 + i * 0.035 + seed(i, salt + 1) * 0.12).toFixed(3);
    const s2Time = isInterlagos
      ? +(35.082 + gapS * 0.48).toFixed(3)
      : +(36.100 + i * 0.055 + seed(i, salt + 2) * 0.15).toFixed(3);
    const s3Time = isInterlagos
      ? +(16.915 + gapS * 0.24).toFixed(3)
      : +(29.000 + i * 0.045 + seed(i, salt + 3) * 0.14).toFixed(3);

    const s1 = s1Time.toFixed(3);
    const s2 = s2Time.toFixed(3);
    const s3 = s3Time.toFixed(3);

    const last = isAbuDhabiOfficial && session === "quali"
      ? (officialQualiTimesAbuDhabi[i] ?? `1:23.${(i * 45).toString().padStart(3, "0")}`)
      : isInterlagos && session === "fp1"
      ? (officialFP1TimesInterlagos[i] ?? `1:10.${(610 + i * 50).toString().slice(0, 3)}`)
      : isInterlagos && (session === "fp2" || session === "fp3")
      ? (officialFP2TimesInterlagos[i] ?? `1:10.${(366 + i * 50).toString().slice(0, 3)}`)
      : isInterlagos && (session === "quali" || session === "sq")
      ? (officialQualiTimesInterlagos[i] ?? `1:10.${(i * 55).toString().padStart(3, "0")}`)
      : isInterlagos && race
      ? `1:${(13 + i * 0.08 + seed(i, salt + 4) * 0.4).toFixed(3)}`
      : `1:${(22 + (s1Time + s2Time + s3Time - 82.5)).toFixed(3)}`;

    // Tyre compounds
    const tyreList = isQuali ? (["soft", "soft", "medium"] as const) : (["medium", "hard", "soft"] as const);
    const tyre = tyreList[Math.floor(seed(i, salt + 4) * tyreList.length)] || "medium";
    const tyreAge = Math.floor(seed(i, salt + 5) * (race ? (session === "sprint" ? 14 : 26) : 6)) + 1;
    const pitStops = race ? (session === "sprint" ? 0 : tyreAge > 20 ? 2 : tyreAge > 10 ? 1 : 0) : 0;

    // Qualifying Q1, Q2, Q3
    const q1 = isAbuDhabiOfficial && isQuali
      ? (officialQualiTimesAbuDhabi[i] ?? "1:23.500")
      : isInterlagos && isQuali
      ? (officialQualiTimesInterlagos[i] ? `1:10.${(500 + i * 35).toString().slice(0, 3)}` : "1:10.500")
      : `1:${(23 + seed(i, salt + 6) * 0.7).toFixed(3)}`;

    const q2 = i < 15
      ? (isAbuDhabiOfficial && isQuali
          ? (officialQualiTimesAbuDhabi[i] ?? "1:23.100")
          : isInterlagos && isQuali
          ? (officialQualiTimesInterlagos[i] ? `1:10.${(150 + i * 30).toString().slice(0, 3)}` : "1:10.150")
          : `1:${(22.8 + seed(i, salt + 7) * 0.5).toFixed(3)}`)
      : "—";

    const q3 = i < 10
      ? (isAbuDhabiOfficial && isQuali
          ? (officialQualiTimesAbuDhabi[i] ?? "1:22.700")
          : isInterlagos && isQuali
          ? (officialQualiTimesInterlagos[i] ?? "1:09.852")
          : `1:${(22.4 + seed(i, salt + 8) * 0.4).toFixed(3)}`)
      : "—";

    // Telemetry attributes
    const speed = Math.floor((isInterlagos ? 324 : 318) + seed(i, salt + 9) * 16);
    const gear = Math.floor((isInterlagos ? 7 : 6) + seed(i, salt + 10) * 1.9);
    const rpm = Math.floor(11600 + seed(i, salt + 11) * 700);
    const throttle = Math.floor(94 + seed(i, salt + 12) * 6);
    const brake = seed(i, salt + 13) > 0.88 ? Math.floor(seed(i, salt + 13) * 100) : 0;
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
      pts: race ? (session === "sprint" ? ([8, 7, 6, 5, 4, 3, 2, 1][i] ?? 0) : ([25, 18, 15, 12, 10, 8, 6, 4, 2, 1][i] ?? 0)) : 0,
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
