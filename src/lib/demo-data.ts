// DEMO DATA — all content here is sample data for the Faczz prototype.
// Nothing is live-connected. Replace via src/lib/integrations.ts adapters.
const night = "/race-hero.svg";
const pit = "/pit-lane.svg";
const tech = "/race-tech.svg";

export const DEMO_UPDATED = "2026-11-04T15:30:00Z";

export type Team = { id: string; name: string; short: string; color: string; base: string; principal: string; engine: string; founded: number; titles: number; url: string };
export type Driver = { id: string; name: string; code: string; number: number; teamId: string; nationality: string; born: string; wins: number; podiums: number; poles: number; starts: number; url: string };
export type Topic = { id: string; name: string; blurb: string };
export type Source = { id: string; name: string; kind: "publisher" | "influencer"; handle?: string; platform?: string; url: string; blurb: string; followers: string; region: string };

export const teams: Team[] = [
  { id: "mclaren", name: "McLaren", short: "MCL", color: "oklch(0.72 0.17 55)", base: "Woking, UK", principal: "Andrea Stella", engine: "Mercedes", founded: 1963, titles: 10, url: "https://www.formula1.com/en/teams/mclaren" },
  { id: "ferrari", name: "Ferrari", short: "FER", color: "oklch(0.55 0.22 27)", base: "Maranello, Italy", principal: "Frédéric Vasseur", engine: "Ferrari", founded: 1950, titles: 16, url: "https://www.formula1.com/en/teams/ferrari" },
  { id: "redbull", name: "Red Bull Racing", short: "RBR", color: "oklch(0.42 0.12 265)", base: "Milton Keynes, UK", principal: "Laurent Mekies", engine: "Red Bull Ford", founded: 2005, titles: 6, url: "https://www.formula1.com/en/teams/red-bull-racing" },
  { id: "mercedes", name: "Mercedes", short: "MER", color: "oklch(0.75 0.12 185)", base: "Brackley, UK", principal: "Toto Wolff", engine: "Mercedes", founded: 2010, titles: 8, url: "https://www.formula1.com/en/teams/mercedes" },
  { id: "aston", name: "Aston Martin", short: "AMR", color: "oklch(0.48 0.1 165)", base: "Silverstone, UK", principal: "Adrian Newey", engine: "Honda", founded: 2021, titles: 0, url: "https://www.formula1.com/en/teams/aston-martin" },
  { id: "williams", name: "Williams", short: "WIL", color: "oklch(0.55 0.15 255)", base: "Grove, UK", principal: "James Vowles", engine: "Mercedes", founded: 1977, titles: 9, url: "https://www.formula1.com/en/teams/williams" },
  { id: "alpine", name: "Alpine", short: "ALP", color: "oklch(0.65 0.15 330)", base: "Enstone, UK", principal: "Flavio Briatore", engine: "Mercedes", founded: 2021, titles: 0, url: "https://www.formula1.com/en/teams/alpine" },
  { id: "haas", name: "Haas", short: "HAA", color: "oklch(0.6 0.01 60)", base: "Kannapolis, USA", principal: "Ayao Komatsu", engine: "Ferrari", founded: 2016, titles: 0, url: "https://www.formula1.com/en/teams/haas" },
  { id: "rb", name: "Racing Bulls", short: "RB", color: "oklch(0.6 0.12 250)", base: "Faenza, Italy", principal: "Alan Permane", engine: "Red Bull Ford", founded: 2006, titles: 0, url: "https://www.formula1.com/en/teams/racing-bulls" },
  { id: "audi", name: "Audi", short: "AUD", color: "oklch(0.5 0.02 60)", base: "Hinwil, Switzerland", principal: "Jonathan Wheatley", engine: "Audi", founded: 2026, titles: 0, url: "https://www.formula1.com/en/teams/audi" },
  { id: "cadillac", name: "Cadillac", short: "CAD", color: "oklch(0.35 0.01 60)", base: "Silverstone, UK / Indiana, USA", principal: "Graeme Lowdon", engine: "Ferrari", founded: 2026, titles: 0, url: "https://www.formula1.com/en/teams/cadillac" },
];

const d = (id: string, name: string, code: string, number: number, teamId: string, nationality: string, born: string, wins: number, podiums: number, poles: number, starts: number): Driver =>
  ({ id, name, code, number, teamId, nationality, born, wins, podiums, poles, starts, url: `https://www.formula1.com/en/drivers/${id}` });

export const drivers: Driver[] = [
  d("norris", "Lando Norris", "NOR", 1, "mclaren", "British", "1999-11-13", 14, 48, 15, 150),
  d("piastri", "Oscar Piastri", "PIA", 81, "mclaren", "Australian", "2001-04-06", 11, 30, 6, 90),
  d("leclerc", "Charles Leclerc", "LEC", 16, "ferrari", "Monégasque", "1997-10-16", 9, 52, 27, 170),
  d("hamilton", "Lewis Hamilton", "HAM", 44, "ferrari", "British", "1985-01-07", 105, 203, 104, 378),
  d("verstappen", "Max Verstappen", "VER", 3, "redbull", "Dutch", "1997-09-30", 70, 125, 47, 231),
  d("hadjar", "Isack Hadjar", "HAD", 6, "redbull", "French", "2004-09-28", 0, 2, 0, 45),
  d("russell", "George Russell", "RUS", 63, "mercedes", "British", "1998-02-15", 7, 30, 8, 172),
  d("antonelli", "Kimi Antonelli", "ANT", 12, "mercedes", "Italian", "2006-08-25", 1, 6, 1, 45),
  d("alonso", "Fernando Alonso", "ALO", 14, "aston", "Spanish", "1981-07-29", 32, 106, 22, 425),
  d("stroll", "Lance Stroll", "STR", 18, "aston", "Canadian", "1998-10-29", 0, 3, 1, 190),
  d("albon", "Alex Albon", "ALB", 23, "williams", "Thai", "1996-03-23", 0, 2, 0, 128),
  d("sainz", "Carlos Sainz", "SAI", 55, "williams", "Spanish", "1994-09-01", 4, 30, 6, 230),
  d("gasly", "Pierre Gasly", "GAS", 10, "alpine", "French", "1996-02-07", 1, 5, 0, 175),
  d("colapinto", "Franco Colapinto", "COL", 43, "alpine", "Argentine", "2003-05-27", 0, 0, 0, 40),
  d("ocon", "Esteban Ocon", "OCO", 31, "haas", "French", "1996-09-17", 1, 4, 0, 180),
  d("bearman", "Oliver Bearman", "BEA", 87, "haas", "British", "2005-05-08", 0, 0, 0, 48),
  d("lawson", "Liam Lawson", "LAW", 30, "rb", "New Zealander", "2002-02-11", 0, 0, 0, 55),
  d("lindblad", "Arvid Lindblad", "LIN", 41, "rb", "British", "2007-08-08", 0, 0, 0, 21),
  d("hulkenberg", "Nico Hülkenberg", "HUL", 27, "audi", "German", "1987-08-19", 0, 1, 1, 250),
  d("bortoleto", "Gabriel Bortoleto", "BOR", 5, "audi", "Brazilian", "2004-10-14", 0, 0, 0, 45),
  d("perez", "Sergio Pérez", "PER", 11, "cadillac", "Mexican", "1990-01-26", 6, 39, 3, 302),
  d("bottas", "Valtteri Bottas", "BOT", 77, "cadillac", "Finnish", "1989-08-28", 10, 67, 20, 267),
];

export const topics: Topic[] = [
  { id: "regs2026", name: "2026 Regulations", blurb: "Active aero, new power units, sustainable fuels." },
  { id: "tech", name: "Tech & Upgrades", blurb: "Floor, wing and sidepod developments." },
  { id: "strategy", name: "Race Strategy", blurb: "Tyres, undercuts and pit windows." },
  { id: "silly", name: "Driver Market", blurb: "Contracts, seats and rumours." },
  { id: "penalties", name: "Penalties & Stewards", blurb: "Decisions, grid drops and appeals." },
  { id: "rookies", name: "Rookies", blurb: "First-season drivers and juniors." },
  { id: "business", name: "Business & Media", blurb: "Commercial deals and broadcast." },
  { id: "safety", name: "Safety", blurb: "Incidents, FIA safety work." },
];

export const sources: Source[] = [
  { id: "f1com", name: "Formula1.com", kind: "publisher", url: "https://www.formula1.com/en/latest", blurb: "Official F1 news, results and features.", followers: "Official", region: "Global" },
  { id: "autosport", name: "Autosport", kind: "publisher", url: "https://www.autosport.com/f1/", blurb: "Long-running motorsport magazine and analysis.", followers: "Publisher", region: "UK" },
  { id: "therace", name: "The Race", kind: "publisher", url: "https://www.the-race.com/formula-1/", blurb: "Independent motorsport journalism and video.", followers: "Publisher", region: "UK" },
  { id: "motorsport", name: "Motorsport.com", kind: "publisher", url: "https://www.motorsport.com/f1/news/", blurb: "Global motorsport news network.", followers: "Publisher", region: "Global" },
  { id: "bbc", name: "BBC Sport", kind: "publisher", url: "https://www.bbc.com/sport/formula1", blurb: "Public broadcaster F1 coverage.", followers: "Publisher", region: "UK" },
  { id: "racefans", name: "RaceFans", kind: "publisher", url: "https://www.racefans.net/", blurb: "Independent F1 news and data.", followers: "Publisher", region: "UK" },
  { id: "apex", name: "Apex Analytics", kind: "influencer", handle: "@apexanalytics", platform: "X", url: "https://x.com/", blurb: "Demo creator persona — lap-time charts and stint analysis.", followers: "212K (demo)", region: "Global" },
  { id: "pitwall", name: "Pit Wall Paula", kind: "influencer", handle: "@pitwallpaula", platform: "Instagram", url: "https://www.instagram.com/", blurb: "Demo creator persona — strategy explainers in reels.", followers: "480K (demo)", region: "US" },
  { id: "sector3", name: "Sector Three", kind: "influencer", handle: "@sector3", platform: "YouTube", url: "https://www.youtube.com/", blurb: "Demo creator persona — onboard and technical breakdowns.", followers: "1.1M (demo)", region: "Global" },
  { id: "gridnotes", name: "Grid Notes", kind: "influencer", handle: "@gridnotes", platform: "TikTok", url: "https://www.tiktok.com/", blurb: "Demo creator persona — quick paddock news clips.", followers: "760K (demo)", region: "EU" },
];

export type FeedItem = {
  id: string; kind: "article" | "social" | "video" | "analysis";
  sourceId: string; title: string; text: string; time: string; url: string;
  media?: string; video?: string; embeddable?: boolean;
  embedUrl?: string;
  teams: string[]; drivers: string[]; topics: string[];
  ai: string; discovery?: string; evidence?: { label: string; url: string }[];
};


export const feed: FeedItem[] = [
  { id: "s1", kind: "article", sourceId: "f1com", title: "São Paulo weekend preview: sprint format returns to Interlagos", text: "The championship heads to Interlagos for the penultimate sprint weekend of the season. Weather models suggest a chance of showers on Saturday, which could shake up both the Sprint and Qualifying order. Teams have brought revised cooling packages for the altitude-free but humid conditions.", time: "2026-11-04T13:10:00Z", url: "https://www.formula1.com/en/latest", media: night, teams: [], drivers: [], topics: ["strategy"], ai: "Interlagos hosts a sprint weekend; possible Saturday rain may reorder the grid. Teams bring cooling tweaks for humidity.", discovery: "Grouped with 3 other previews mentioning rain risk" },
  { id: "s2", kind: "social", sourceId: "apex", title: "Long-run pace from Mexico, fuel-corrected", text: "Fuel-corrected long-run averages from Mexico FP2: McLaren still the reference on the mediums, Ferrari within 0.15s per lap, Mercedes strong on hards. Red Bull's degradation curve flattened after lap 12 — watch that in Brazil. Chart + data in thread 🧵", time: "2026-11-04T11:42:00Z", url: "https://x.com/", teams: ["mclaren", "ferrari", "mercedes", "redbull"], drivers: [], topics: ["strategy"], ai: "Creator analysis says McLaren led long runs in Mexico FP2; Ferrari ~0.15s/lap behind; Red Bull's tyre deg improved late in stints.", discovery: "Data-heavy post with high engagement among analysts" },
  { id: "s3", kind: "video", sourceId: "pitwall", title: "Why the undercut is so powerful at Interlagos (reel)", text: "60 seconds on pit-lane loss, tyre warm-up and why track position matters so much in Brazil. Save this before Sunday!", time: "2026-11-04T09:05:00Z", url: "https://www.instagram.com/", video: "unavailable", embeddable: false, media: pit, teams: [], drivers: [], topics: ["strategy"], ai: "Explainer reel: short pit-lane loss and quick tyre warm-up make the undercut strong at Interlagos." },
  { id: "s4", kind: "article", sourceId: "therace", title: "Ferrari's floor update: what changed and why it matters", text: "Ferrari introduced a revised floor edge and diffuser kick-up in Mexico. Early data indicates a more stable rear in high-speed corners, which Leclerc has asked for since the summer. The team will evaluate a second step in São Paulo.", time: "2026-11-03T18:20:00Z", url: "https://www.the-race.com/formula-1/", media: tech, teams: ["ferrari"], drivers: ["leclerc", "hamilton"], topics: ["tech"], ai: "Ferrari's new floor edge/diffuser improved high-speed rear stability; a second step may come in Brazil.", discovery: "Matches your interest in Tech & Upgrades" },
  { id: "s5", kind: "article", sourceId: "bbc", title: "Antonelli: 'I'm learning every weekend'", text: "Mercedes' Kimi Antonelli reflected on a difficult Mexico weekend, saying that the second half of his sophomore season has been about consistency rather than outright pace. Team boss Toto Wolff praised his race management.", time: "2026-11-03T15:00:00Z", url: "https://www.bbc.com/sport/formula1", teams: ["mercedes"], drivers: ["antonelli"], topics: ["rookies"], ai: "Antonelli says focus is consistency; Wolff praised his race management after Mexico." },
  { id: "s6", kind: "analysis", sourceId: "racefans", title: "Data: qualifying gaps between teammates, 2026 so far", text: "Median qualifying gap between teammates across 20 rounds. The closest intra-team battle is at Williams; the largest gap is at Cadillac, though sample sizes vary due to reliability.", time: "2026-11-03T12:30:00Z", url: "https://www.racefans.net/", teams: ["williams", "cadillac"], drivers: ["albon", "sainz"], topics: ["strategy"], ai: "Williams has the closest teammate quali gap in 2026; Cadillac the largest (smaller sample).", discovery: "Discovered data card", evidence: [{ label: "RaceFans data hub", url: "https://www.racefans.net/" }, { label: "Formula1.com results", url: "https://www.formula1.com/en/results" }] },
  { id: "s7", kind: "social", sourceId: "gridnotes", title: "Paddock whispers: Cadillac 2027 driver talks", text: "Hearing Cadillac has started early conversations about its 2027 line-up. Nothing signed, both current drivers remain the priority according to people close to the team. Treat as rumour.", time: "2026-11-03T08:15:00Z", url: "https://www.tiktok.com/", video: "unavailable", embeddable: false, media: night, teams: ["cadillac"], drivers: ["perez", "bottas"], topics: ["silly"], ai: "Unconfirmed rumour: Cadillac in early 2027 driver talks; current drivers reportedly priority." },
  { id: "s8", kind: "article", sourceId: "autosport", title: "Stewards explain Mexico track-limits penalty", text: "The FIA stewards published their reasoning for the five-second penalty issued in Mexico, citing four separate track-limits breaches at Turn 2. The team said it accepted the decision.", time: "2026-11-02T21:40:00Z", url: "https://www.autosport.com/f1/", teams: ["haas"], drivers: ["bearman"], topics: ["penalties"], ai: "5s penalty for four track-limit breaches at Turn 2; team accepted the decision." },
  { id: "s9", kind: "video", sourceId: "sector3", title: "Onboard breakdown: Verstappen's Mexico lap", text: "Sector by sector, where the time comes from on the Red Bull. Brake points, throttle traces and that Turn 12 rotation.", time: "2026-11-02T17:00:00Z", url: "https://www.youtube.com/", video: "unavailable", embeddable: false, media: night, teams: ["redbull"], drivers: ["verstappen"], topics: ["tech"], ai: "Onboard analysis of Verstappen's qualifying lap: late braking and strong rotation in Turn 12." },
  { id: "s10", kind: "article", sourceId: "motorsport", title: "Audi confirms power-unit upgrade timeline", text: "Audi says its next power-unit specification will arrive for the final two rounds, within homologation allowances. Hülkenberg may take a grid penalty if a new element is required.", time: "2026-11-02T10:30:00Z", url: "https://www.motorsport.com/f1/news/", media: tech, teams: ["audi"], drivers: ["hulkenberg", "bortoleto"], topics: ["regs2026", "penalties"], ai: "Audi PU update due for final two rounds; Hülkenberg could get a grid penalty for new elements." },
  { id: "s11", kind: "analysis", sourceId: "apex", title: "Pit stop medians: McLaren & Ferrari lead the season", text: "Season median stationary times show McLaren and Ferrari under 2.4s. Williams improved most since the summer break.", time: "2026-11-01T22:00:00Z", url: "https://x.com/", teams: ["mclaren", "ferrari", "williams"], drivers: [], topics: ["strategy"], ai: "McLaren and Ferrari have sub-2.4s median stops; Williams most improved.", discovery: "Discovered data card", evidence: [{ label: "DHL Fastest Pit Stop", url: "https://inside.dhl.com/en/motorsport/formula1" }] },
  { id: "s12", kind: "article", sourceId: "f1com", title: "Norris on title fight: 'Brazil is about execution'", text: "Lando Norris says the team has the pace to fight in Brazil, but stressed clean execution across the sprint format would decide the weekend.", time: "2026-11-01T14:00:00Z", url: "https://www.formula1.com/en/latest", media: pit, teams: ["mclaren"], drivers: ["norris", "piastri"], topics: [], ai: "Norris: McLaren has pace; clean execution in the sprint format is key in Brazil." },
];

export type Session = { id: string; name: string; short: string; start: string; status: "done" | "live" | "upcoming" };
export const raceWeekend = {
  name: "São Paulo Grand Prix", round: 21, circuit: "Autódromo José Carlos Pace", location: "Interlagos, Brazil",
  sessions: [
    { id: "fp1", name: "Practice 1", short: "FP1", start: "2026-11-06T14:30:00Z", status: "upcoming" },
    { id: "sq", name: "Sprint Qualifying", short: "SQ", start: "2026-11-06T18:30:00Z", status: "upcoming" },
    { id: "sprint", name: "Sprint", short: "SPR", start: "2026-11-07T14:00:00Z", status: "upcoming" },
    { id: "quali", name: "Qualifying", short: "Q", start: "2026-11-07T18:00:00Z", status: "upcoming" },
    { id: "race", name: "Race", short: "RACE", start: "2026-11-08T17:00:00Z", status: "upcoming" },
  ] as Session[],
};

export const calendar = [
  { round: 19, name: "United States GP", date: "2026-10-25", circuit: "Austin", winner: "norris" },
  { round: 20, name: "Mexico City GP", date: "2026-11-01", circuit: "Mexico City", winner: "verstappen" },
  { round: 21, name: "São Paulo GP", date: "2026-11-08", circuit: "Interlagos", winner: null },
  { round: 22, name: "Las Vegas GP", date: "2026-11-21", circuit: "Las Vegas", winner: null },
  { round: 23, name: "Qatar GP", date: "2026-11-29", circuit: "Lusail", winner: null },
  { round: 24, name: "Abu Dhabi GP", date: "2026-12-06", circuit: "Yas Marina", winner: null },
];

// Deterministic pseudo-values (no Math.random at module scope).
export const seed = (i: number, k = 1) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;

export const driverPoints = drivers.map((dr, i) => ({ id: dr.id, pts: Math.round(380 - i * 16 - seed(i) * 12) })).sort((a, b) => b.pts - a.pts);
export const teamPoints = teams.map((t) => ({ id: t.id, pts: driverPoints.filter((p) => drivers.find((x) => x.id === p.id)?.teamId === t.id).reduce((s, p) => s + p.pts, 0) })).sort((a, b) => b.pts - a.pts);

export const lastResult = driverPoints.map((p, i) => ({ pos: i + 1, id: p.id, gap: i === 0 ? "1:38:42.117" : `+${(i * 2.84 + seed(i, 3) * 3).toFixed(3)}s`, pts: [25, 18, 15, 12, 10, 8, 6, 4, 2, 1][i] ?? 0 }));

export const notifications = [
  { id: "n1", kind: "session", title: "FP1 São Paulo starts in 2 days", body: "Fri 6 Nov, 14:30 UTC · Interlagos", time: "2026-11-04T15:00:00Z" },
  { id: "n2", kind: "source", title: "The Race published: Ferrari's floor update", body: "Matches followed team Ferrari", time: "2026-11-03T18:21:00Z", link: "/story/s4" },
  { id: "n3", kind: "breaking", title: "Stewards decision published (demo)", body: "Mexico track-limits penalty explained", time: "2026-11-02T21:41:00Z", link: "/story/s8" },
  { id: "n4", kind: "results", title: "Mexico City GP results available", body: "Classification and points updated (demo)", time: "2026-11-01T22:05:00Z", link: "/data/results" },
  { id: "n5", kind: "source", title: "Apex Analytics posted a data thread", body: "Long-run pace, fuel-corrected", time: "2026-11-04T11:43:00Z", link: "/story/s2" },
];

export const getTeam = (id: string) => teams.find((t) => t.id === id);
export const getDriver = (id: string) => drivers.find((x) => x.id === id);
export const getSource = (id: string) => sources.find((s) => s.id === id);
export const getTopic = (id: string) => topics.find((t) => t.id === id);
export const getItem = (id: string) => feed.find((f) => f.id === id);

const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmt = (iso: string) => { const t = new Date(iso); return `${M[t.getUTCMonth()]} ${t.getUTCDate()}, ${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")} UTC`; };
export const fmtDate = (iso: string) => { const t = new Date(iso); return `${M[t.getUTCMonth()]} ${t.getUTCDate()}, ${t.getUTCFullYear()}`; };
