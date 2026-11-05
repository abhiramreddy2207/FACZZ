// DEMO datasets for the Data section. Swap `rows` for a real provider adapter later.
import { drivers, teams, driverPoints, teamPoints, lastResult, calendar, getDriver, getTeam, seed, DEMO_UPDATED } from "./demo-data";

export type Row = Record<string, string | number> & { team?: string; driver?: string };
export type Dataset = {
  slug: string; label: string; group: "Live & Calendar" | "Championship" | "Grid" | "Performance" | "Technical" | "Concepts";
  desc: string; provider: string; providerUrl: string; updated: string;
  chart: { type: "bar" | "line"; x: string; y: string; label: string } | null;
  columns: { key: string; label: string }[];
  rows: () => Row[]; compare?: boolean; note?: string; race?: boolean;
};

const dn = (id: string) => getDriver(id)?.name ?? id;
const tn = (id: string) => getTeam(id)?.name ?? id;
const F1 = "https://www.formula1.com/en/results";
const FIA = "https://www.fia.com/documents/championships/fia-formula-one-world-championship-14";

const tracks = [
  { name: "Interlagos", len: 4.309, corners: 15, drs: 2, speed: 315, df: "Medium", deg: "High", overtake: 8 },
  { name: "Las Vegas", len: 6.201, corners: 17, drs: 2, speed: 345, df: "Low", deg: "Low", overtake: 7 },
  { name: "Lusail", len: 5.419, corners: 16, drs: 1, speed: 325, df: "High", deg: "High", overtake: 5 },
  { name: "Yas Marina", len: 5.281, corners: 16, drs: 2, speed: 330, df: "Medium", deg: "Medium", overtake: 5 },
  { name: "Monaco", len: 3.337, corners: 19, drs: 1, speed: 290, df: "Max", deg: "Low", overtake: 1 },
  { name: "Monza", len: 5.793, corners: 11, drs: 2, speed: 355, df: "Min", deg: "Medium", overtake: 8 },
];

export const datasets: Dataset[] = [
  { slug: "live-timing", label: "Live Timing", group: "Live & Calendar", desc: "Session positions, gaps and sectors. Opens the Race Center.", provider: "Demo feed (F1 Live Timing integration point)", providerUrl: "https://www.formula1.com/en/timing/f1-live", updated: DEMO_UPDATED, race: true,
    chart: { type: "bar", x: "code", y: "gapS", label: "Gap to leader (s)" }, columns: [{ key: "pos", label: "Pos" }, { key: "name", label: "Driver" }, { key: "teamName", label: "Team" }, { key: "gap", label: "Gap" }, { key: "last", label: "Last lap" }],
    rows: () => lastResult.slice(0, 12).map((r, i) => ({ pos: r.pos, name: dn(r.id), code: (getDriver(r.id)?.code ?? r.id), teamName: tn((getDriver(r.id)?.teamId ?? "")), team: (getDriver(r.id)?.teamId ?? ""), driver: r.id, gap: i ? `+${(i * 1.21).toFixed(3)}` : "Leader", gapS: +(i * 1.21).toFixed(2), last: `1:${(12 + seed(i, 9) * 1.4).toFixed(3)}` })) },
  { slug: "schedule", label: "Schedule", group: "Live & Calendar", desc: "Remaining rounds of the 2026 season.", provider: "Formula1.com calendar (demo copy)", providerUrl: "https://www.formula1.com/en/racing/2026", updated: DEMO_UPDATED, chart: { type: "bar", x: "circuit", y: "round", label: "Calendar rounds (sample)" },
    columns: [{ key: "round", label: "Rd" }, { key: "name", label: "Event" }, { key: "circuit", label: "Circuit" }, { key: "date", label: "Date" }, { key: "status", label: "Status" }],
    rows: () => calendar.map((c) => ({ ...c, winner: c.winner ?? "", status: c.winner ? "Completed" : "Upcoming" })) },
  { slug: "results", label: "Results", group: "Championship", desc: "Mexico City GP classification (sample).", provider: "Formula1.com results (demo copy)", providerUrl: F1, updated: DEMO_UPDATED,
    chart: { type: "bar", x: "code", y: "pts", label: "Points scored" }, columns: [{ key: "pos", label: "Pos" }, { key: "name", label: "Driver" }, { key: "teamName", label: "Team" }, { key: "gap", label: "Time/Gap" }, { key: "pts", label: "Pts" }],
    rows: () => lastResult.map((r) => ({ ...r, name: dn(r.id), code: (getDriver(r.id)?.code ?? r.id), teamName: tn((getDriver(r.id)?.teamId ?? "")), team: (getDriver(r.id)?.teamId ?? ""), driver: r.id })) },
  { slug: "driver-standings", label: "Driver Standings", group: "Championship", desc: "Drivers' championship after Round 20 (sample values).", provider: "Formula1.com standings (demo)", providerUrl: "https://www.formula1.com/en/results/2026/drivers", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "code", y: "pts", label: "Points" }, columns: [{ key: "pos", label: "Pos" }, { key: "name", label: "Driver" }, { key: "teamName", label: "Team" }, { key: "pts", label: "Pts" }],
    rows: () => driverPoints.map((p, i) => ({ pos: i + 1, name: dn(p.id), code: (getDriver(p.id)?.code ?? p.id), teamName: tn((getDriver(p.id)?.teamId ?? "")), team: (getDriver(p.id)?.teamId ?? ""), driver: p.id, pts: p.pts })) },
  { slug: "constructor-standings", label: "Constructor Standings", group: "Championship", desc: "Constructors' championship after Round 20 (sample values).", provider: "Formula1.com standings (demo)", providerUrl: "https://www.formula1.com/en/results/2026/team", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "short", y: "pts", label: "Points" }, columns: [{ key: "pos", label: "Pos" }, { key: "teamName", label: "Team" }, { key: "engine", label: "PU" }, { key: "pts", label: "Pts" }],
    rows: () => teamPoints.map((p, i) => ({ pos: i + 1, teamName: tn(p.id), short: (getTeam(p.id)?.short ?? p.id), engine: (getTeam(p.id)?.engine ?? "Unavailable"), team: p.id, pts: p.pts })) },
  { slug: "drivers", label: "Drivers", group: "Grid", desc: "The 2026 grid with career figures (approximate demo values).", provider: "Formula1.com driver pages", providerUrl: "https://www.formula1.com/en/drivers", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "code", y: "starts", label: "Career starts" }, columns: [{ key: "number", label: "#" }, { key: "name", label: "Driver" }, { key: "teamName", label: "Team" }, { key: "nationality", label: "Nat." }, { key: "starts", label: "Starts" }],
    rows: () => drivers.map((x) => ({ number: x.number, name: x.name, code: x.code, teamName: tn(x.teamId), team: x.teamId, driver: x.id, nationality: x.nationality, starts: x.starts })) },
  { slug: "teams", label: "Teams", group: "Grid", desc: "All 11 constructors for 2026.", provider: "Formula1.com team pages", providerUrl: "https://www.formula1.com/en/teams", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "short", y: "titles", label: "Constructors' titles" }, columns: [{ key: "teamName", label: "Team" }, { key: "base", label: "Base" }, { key: "principal", label: "Principal" }, { key: "engine", label: "PU" }, { key: "titles", label: "Titles" }],
    rows: () => teams.map((t) => ({ teamName: t.name, short: t.short, base: t.base, principal: t.principal, engine: t.engine, titles: t.titles, team: t.id })) },
  { slug: "driver-stats", label: "Driver Stats", group: "Performance", desc: "Career wins, podiums and poles. Includes prebuilt comparison.", provider: "Formula1.com / FIA records (approx. demo)", providerUrl: "https://www.formula1.com/en/drivers", updated: DEMO_UPDATED, compare: true,
    chart: { type: "bar", x: "code", y: "podiums", label: "Career podiums" }, columns: [{ key: "name", label: "Driver" }, { key: "wins", label: "Wins" }, { key: "podiums", label: "Podiums" }, { key: "poles", label: "Poles" }, { key: "winRate", label: "Win %" }],
    rows: () => drivers.map((x) => ({ name: x.name, code: x.code, team: x.teamId, driver: x.id, wins: x.wins, podiums: x.podiums, poles: x.poles, winRate: ((x.wins / x.starts) * 100).toFixed(1) })) },
  { slug: "head-to-head", label: "Head To Head", group: "Performance", desc: "Teammate battles: qualifying & race head-to-head (sample).", provider: "Demo computation from sample results", providerUrl: F1, updated: DEMO_UPDATED, compare: true,
    chart: { type: "bar", x: "pair", y: "qualiA", label: "Quali H2H wins (driver A)" }, columns: [{ key: "teamName", label: "Team" }, { key: "pair", label: "Pairing" }, { key: "quali", label: "Quali" }, { key: "race", label: "Race" }],
    rows: () => teams.map((t, i) => { const p = drivers.filter((x) => x.teamId === t.id); const qa = Math.round(6 + seed(i, 4) * 10); const ra = Math.round(6 + seed(i, 5) * 10); return { teamName: t.name, team: t.id, pair: `${p[0]?.code ?? "—"} v ${p[1]?.code ?? "—"}`, qualiA: qa, quali: `${qa}–${20 - qa}`, race: `${ra}–${20 - ra}` }; }) },
  { slug: "consistency", label: "Consistency", group: "Performance", desc: "Std. deviation of race-lap times, lower is steadier (sample).", provider: "Demo computation (FastF1-style laps)", providerUrl: "https://docs.fastf1.dev/", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "code", y: "sd", label: "Lap σ (s)" }, columns: [{ key: "name", label: "Driver" }, { key: "teamName", label: "Team" }, { key: "sd", label: "σ (s)" }, { key: "finishes", label: "Points finishes" }],
    rows: () => drivers.map((x, i) => ({ name: x.name, code: x.code, team: x.teamId, driver: x.id, teamName: tn(x.teamId), sd: +(0.28 + seed(i, 6) * 0.5).toFixed(3), finishes: Math.round(8 + seed(i, 7) * 12) })).sort((a, b) => a.sd - b.sd) },
  { slug: "race-pace", label: "Race Pace", group: "Performance", desc: "Median green-flag lap delta to fastest team by round (sample).", provider: "Demo computation (FastF1-style laps)", providerUrl: "https://docs.fastf1.dev/", updated: DEMO_UPDATED,
    chart: { type: "line", x: "round", y: "delta", label: "Delta to fastest (%)" }, columns: [{ key: "round", label: "Round" }, { key: "teamName", label: "Team" }, { key: "delta", label: "Δ %" }],
    rows: () => teams.slice(0, 5).flatMap((t, ti) => [14, 15, 16, 17, 18, 19, 20].map((r) => ({ round: r, team: t.id, teamName: t.name, delta: +(ti * 0.18 + seed(r, ti) * 0.35).toFixed(2) }))) },
  { slug: "pit-stops", label: "Pit Stops", group: "Performance", desc: "Season median stationary time by team (sample).", provider: "DHL Fastest Pit Stop Award (demo values)", providerUrl: "https://inside.dhl.com/en/motorsport/formula1", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "short", y: "median", label: "Median stop (s)" }, columns: [{ key: "teamName", label: "Team" }, { key: "median", label: "Median (s)" }, { key: "best", label: "Best (s)" }, { key: "stops", label: "Stops" }],
    rows: () => teams.map((t, i) => ({ teamName: t.name, short: t.short, team: t.id, median: +(2.25 + seed(i, 8) * 0.7).toFixed(2), best: +(1.85 + seed(i, 2) * 0.4).toFixed(2), stops: Math.round(38 + seed(i, 1) * 10) })).sort((a, b) => a.median - b.median) },
  { slug: "tech-updates", label: "Tech Updates", group: "Technical", desc: "Car upgrades declared in FIA car presentation submissions (sample).", provider: "FIA event documents", providerUrl: FIA, updated: DEMO_UPDATED, chart: { type: "bar", x: "short", y: "count", label: "Updates declared (season)" },
    columns: [{ key: "event", label: "Event" }, { key: "teamName", label: "Team" }, { key: "area", label: "Area" }, { key: "reason", label: "Reason" }],
    rows: () => teams.map((t, i) => ({ event: i % 2 ? "Mexico City GP" : "São Paulo GP", teamName: t.name, short: t.short, team: t.id, area: ["Floor edge", "Front wing", "Rear wing", "Sidepod inlet", "Beam wing"][i % 5], reason: ["Performance", "Circuit specific", "Cooling"][i % 3], count: Math.round(10 + seed(i, 3) * 25) })) },
  { slug: "used-elements", label: "Used Elements", group: "Technical", desc: "Power-unit and gearbox elements used vs. season allocation (sample). Exceeding limits triggers grid penalties.", provider: "FIA power unit element usage documents", providerUrl: FIA, updated: DEMO_UPDATED,
    note: "Allocation limits shown: ICE/TC/MGU-K 4, ES/CE 3, Exhaust 8, Gearbox 5 (sample — check FIA documents for current rules).",
    chart: { type: "bar", x: "code", y: "ice", label: "ICE used (limit 4)" }, columns: [{ key: "name", label: "Driver" }, { key: "ice", label: "ICE /4" }, { key: "tc", label: "TC /4" }, { key: "mguk", label: "MGU-K /4" }, { key: "es", label: "ES /3" }, { key: "gb", label: "GBX /5" }, { key: "flag", label: "Status" }],
    rows: () => drivers.map((x, i) => { const ice = 3 + Math.round(seed(i, 11) * 2); return { name: x.name, code: x.code, team: x.teamId, driver: x.id, ice, tc: 3 + Math.round(seed(i, 12)), mguk: 3 + Math.round(seed(i, 13)), es: 2 + Math.round(seed(i, 14)), gb: 3 + Math.round(seed(i, 15) * 2), flag: ice > 4 ? "Over limit — penalty" : ice === 4 ? "At limit" : "Within limit" }; }) },
  { slug: "destructors-championship", label: "Destructors Championship", group: "Concepts", desc: "DEMO CONCEPT: tracking crash/damage incidents by team. Not an official championship and not real figures.", provider: "Concept — would cite FIA stewards' decisions and team statements", providerUrl: FIA, updated: DEMO_UPDATED,
    note: "Concept view with illustrative sample counts only. Repair-cost information is not publicly available, so it is marked 'Not available'. Never treat these values as fact.",
    chart: { type: "bar", x: "short", y: "incidents", label: "Logged incidents (sample)" }, columns: [{ key: "teamName", label: "Team" }, { key: "incidents", label: "Incidents (sample)" }, { key: "dnfs", label: "Damage DNFs (sample)" }, { key: "cost", label: "Est. cost" }, { key: "cite", label: "Citation" }],
    rows: () => teams.map((t, i) => ({ teamName: t.name, short: t.short, team: t.id, incidents: Math.round(2 + seed(i, 16) * 9), dnfs: Math.round(seed(i, 17) * 4), cost: "Not available", cite: "FIA stewards docs" })).sort((a, b) => b.incidents - a.incidents) },
  { slug: "track-dna", label: "Track DNA", group: "Technical", desc: "Circuit characteristics for remaining & reference tracks.", provider: "Formula1.com circuit guides / Pirelli previews (demo)", providerUrl: "https://press.pirelli.com/", updated: DEMO_UPDATED,
    chart: { type: "bar", x: "name", y: "speed", label: "Top speed (km/h)" }, columns: [{ key: "name", label: "Track" }, { key: "len", label: "Length km" }, { key: "corners", label: "Corners" }, { key: "df", label: "Downforce" }, { key: "deg", label: "Tyre deg" }, { key: "overtake", label: "Overtaking /10" }],
    rows: () => tracks },
];

export const getDataset = (slug: string) => datasets.find((x) => x.slug === slug);
