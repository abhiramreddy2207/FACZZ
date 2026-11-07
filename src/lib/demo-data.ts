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
  { id: "mclaren", name: "McLaren", short: "MCL", color: "oklch(0.72 0.17 55)", base: "Woking, UK", principal: "Andrea Stella", engine: "Mercedes", founded: 1963, titles: 9, url: "https://www.formula1.com/en/teams/mclaren" },
  { id: "ferrari", name: "Ferrari", short: "FER", color: "oklch(0.55 0.22 27)", base: "Maranello, Italy", principal: "Frédéric Vasseur", engine: "Ferrari", founded: 1950, titles: 16, url: "https://www.formula1.com/en/teams/ferrari" },
  { id: "redbull", name: "Red Bull Racing", short: "RBR", color: "oklch(0.42 0.12 265)", base: "Milton Keynes, UK", principal: "Christian Horner", engine: "Honda RBPT", founded: 2005, titles: 6, url: "https://www.formula1.com/en/teams/red-bull-racing" },
  { id: "mercedes", name: "Mercedes", short: "MER", color: "oklch(0.75 0.12 185)", base: "Brackley, UK", principal: "Toto Wolff", engine: "Mercedes", founded: 2010, titles: 8, url: "https://www.formula1.com/en/teams/mercedes" },
  { id: "aston", name: "Aston Martin", short: "AMR", color: "oklch(0.48 0.1 165)", base: "Silverstone, UK", principal: "Mike Krack", engine: "Mercedes", founded: 2021, titles: 0, url: "https://www.formula1.com/en/teams/aston-martin" },
  { id: "alpine", name: "Alpine", short: "ALP", color: "oklch(0.65 0.15 330)", base: "Enstone, UK", principal: "Oliver Oakes", engine: "Renault", founded: 2021, titles: 2, url: "https://www.formula1.com/en/teams/alpine" },
  { id: "haas", name: "Haas", short: "HAA", color: "oklch(0.6 0.01 60)", base: "Kannapolis, USA", principal: "Ayao Komatsu", engine: "Ferrari", founded: 2016, titles: 0, url: "https://www.formula1.com/en/teams/haas" },
  { id: "rb", name: "Racing Bulls (RB)", short: "RB", color: "oklch(0.6 0.12 250)", base: "Faenza, Italy", principal: "Laurent Mekies", engine: "Honda RBPT", founded: 2006, titles: 0, url: "https://www.formula1.com/en/teams/racing-bulls" },
  { id: "williams", name: "Williams", short: "WIL", color: "oklch(0.55 0.15 255)", base: "Grove, UK", principal: "James Vowles", engine: "Mercedes", founded: 1977, titles: 9, url: "https://www.formula1.com/en/teams/williams" },
  { id: "audi", name: "Kick Sauber", short: "KIK", color: "oklch(0.62 0.2 140)", base: "Hinwil, Switzerland", principal: "Mattia Binotto", engine: "Ferrari", founded: 1993, titles: 0, url: "https://www.formula1.com/en/teams/kick-sauber" },
  { id: "cadillac", name: "Cadillac", short: "CAD", color: "oklch(0.35 0.01 60)", base: "Silverstone, UK / Indiana, USA", principal: "Graeme Lowdon", engine: "Ferrari", founded: 2026, titles: 0, url: "https://www.formula1.com/en/teams/cadillac" },
];

const d = (id: string, name: string, code: string, number: number, teamId: string, nationality: string, born: string, wins: number, podiums: number, poles: number, starts: number): Driver =>
  ({ id, name, code, number, teamId, nationality, born, wins, podiums, poles, starts, url: `https://www.formula1.com/en/drivers/${id}` });

// Official Real FIA Formula 1 World Championship Drivers (2024 Season)
export const drivers: Driver[] = [
  d("verstappen", "Max Verstappen", "VER", 1, "redbull", "Dutch", "1997-09-30", 63, 111, 40, 209),
  d("norris", "Lando Norris", "NOR", 4, "mclaren", "British", "1999-11-13", 4, 29, 8, 128),
  d("leclerc", "Charles Leclerc", "LEC", 16, "ferrari", "Monégasque", "1997-10-16", 8, 43, 26, 147),
  d("piastri", "Oscar Piastri", "PIA", 81, "mclaren", "Australian", "2001-04-06", 2, 9, 0, 46),
  d("sainz", "Carlos Sainz", "SAI", 55, "ferrari", "Spanish", "1994-09-01", 4, 25, 6, 206),
  d("russell", "George Russell", "RUS", 63, "mercedes", "British", "1998-02-15", 3, 15, 5, 128),
  d("hamilton", "Lewis Hamilton", "HAM", 44, "mercedes", "British", "1985-01-07", 105, 201, 104, 356),
  d("perez", "Sergio Pérez", "PER", 11, "redbull", "Mexican", "1990-01-26", 6, 39, 3, 281),
  d("alonso", "Fernando Alonso", "ALO", 14, "aston", "Spanish", "1981-07-29", 32, 106, 22, 401),
  d("gasly", "Pierre Gasly", "GAS", 10, "alpine", "French", "1996-02-07", 1, 5, 0, 154),
  d("hulkenberg", "Nico Hülkenberg", "HUL", 27, "haas", "German", "1987-08-19", 0, 0, 1, 227),
  d("tsunoda", "Yuki Tsunoda", "TSU", 22, "rb", "Japanese", "2000-05-11", 0, 0, 0, 87),
  d("stroll", "Lance Stroll", "STR", 18, "aston", "Canadian", "1998-10-29", 0, 3, 1, 166),
  d("ocon", "Esteban Ocon", "OCO", 31, "alpine", "French", "1996-09-17", 1, 4, 0, 156),
  d("magnussen", "Kevin Magnussen", "MAG", 20, "haas", "Danish", "1992-10-05", 0, 1, 1, 185),
  d("albon", "Alex Albon", "ALB", 23, "williams", "Thai", "1996-03-23", 0, 2, 0, 104),
  d("ricciardo", "Daniel Ricciardo", "RIC", 3, "rb", "Australian", "1989-07-01", 8, 32, 3, 257),
  d("bearman", "Oliver Bearman", "BEA", 38, "haas", "British", "2005-05-08", 0, 0, 0, 3),
  d("colapinto", "Franco Colapinto", "COL", 43, "williams", "Argentine", "2003-05-27", 0, 0, 0, 9),
  d("zhou", "Zhou Guanyu", "ZHO", 24, "audi", "Chinese", "1999-05-30", 0, 0, 0, 68),
  d("lawson", "Liam Lawson", "LAW", 30, "rb", "New Zealander", "2002-02-11", 0, 0, 0, 11),
  d("bottas", "Valtteri Bottas", "BOT", 77, "audi", "Finnish", "1989-08-28", 10, 67, 20, 246),
  d("sargeant", "Logan Sargeant", "SAR", 2, "williams", "American", "2000-12-31", 0, 0, 0, 36),
  d("antonelli", "Kimi Antonelli", "ANT", 12, "mercedes", "Italian", "2006-08-25", 0, 0, 0, 0),
  d("hadjar", "Isack Hadjar", "HAD", 6, "redbull", "French", "2004-09-28", 0, 0, 0, 0),
  d("bortoleto", "Gabriel Bortoleto", "BOR", 5, "audi", "Brazilian", "2004-10-14", 0, 0, 0, 0),
  d("lindblad", "Arvid Lindblad", "LIN", 41, "rb", "British", "2007-08-08", 0, 0, 0, 0),
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

  // Famous X (Twitter) F1 Journalists, Engineers & Analysts
  { id: "scarbs", name: "Craig Scarborough", kind: "influencer", handle: "@ScarbsTech", platform: "X", url: "https://x.com/ScarbsTech", blurb: "Leading F1 technical analyst and illustrator. Specialist in 2026 aero, power-unit architecture, and car mechanics.", followers: "145K", region: "UK" },
  { id: "medland", name: "Chris Medland", kind: "influencer", handle: "@ChrisMedlandF1", platform: "X", url: "https://x.com/ChrisMedlandF1", blurb: "Paddock insider and senior journalist (RACER, SiriusXM). Breaking team scoops, contract talks, and race updates.", followers: "248K", region: "Global" },
  { id: "fabrega", name: "Albert Fabrega", kind: "influencer", handle: "@AlbertFabrega", platform: "X", url: "https://x.com/AlbertFabrega", blurb: "Spanish TV F1 technical analyst. Famous for pitlane technical photos, wing variations, and front-wing flap updates.", followers: "420K", region: "Spain" },
  { id: "gruener", name: "Tobi Grüner", kind: "influencer", handle: "@tgruener", platform: "X", url: "https://x.com/tgruener", blurb: "Auto Motor und Sport chief F1 reporter. Engineering scoops, FIA regulation meetings, and PU telemetry leaks.", followers: "185K", region: "Germany" },
  { id: "dataanalysis", name: "F1 Data Analysis", kind: "influencer", handle: "@FormulaDataAnalysis", platform: "X", url: "https://x.com/FormulaDataAnalysis", blurb: "Data engineer tracking GPS traces, acceleration curves, top speeds, and race tyre degradation.", followers: "205K", region: "Italy" },

  // Famous Instagram F1 Creators & Photographers
  { id: "kymillman", name: "Kym Illman", kind: "influencer", handle: "@kymillman", platform: "Instagram", url: "https://www.instagram.com/kymillman/", blurb: "Accredited F1 paddock photographer. Exclusive candid paddock moments, driver fashion, and VIP access.", followers: "1.2M", region: "Australia" },
  { id: "darrenheath", name: "Darren Heath", kind: "influencer", handle: "@darrenheathf1", platform: "Instagram", url: "https://www.instagram.com/darrenheathf1/", blurb: "Award-winning F1 trackside photographer. Iconic motion blur, high-speed shutter art, and race drama captures.", followers: "215K", region: "UK" },
  { id: "lissie", name: "Lissie Mackintosh", kind: "influencer", handle: "@lissiemackintosh", platform: "Instagram", url: "https://www.instagram.com/lissiemackintosh/", blurb: "F1 presenter & content creator. Behind-the-scenes paddock lifestyle, driver interviews, and weekend vlogs.", followers: "475K", region: "UK" },
  { id: "tonicowan", name: "Toni Cowan-Brown", kind: "influencer", handle: "@ttonimc", platform: "Instagram", url: "https://www.instagram.com/ttonimc/", blurb: "F1 tech, business, and paddock culture commentator. Explaining commercial deals, Concorde Agreement, and OEM engines.", followers: "130K", region: "Global" },
  { id: "wtf1", name: "WTF1", kind: "influencer", handle: "@wtf1official", platform: "Instagram", url: "https://www.instagram.com/wtf1official/", blurb: "F1 community, fan culture, spicy race weekend memes, and viral paddock reactions.", followers: "1.5M", region: "UK" },

  // Original Demo Personas
  { id: "apex", name: "Apex Analytics", kind: "influencer", handle: "@apexanalytics", platform: "X", url: "https://x.com/", blurb: "Demo creator persona — lap-time charts and stint analysis.", followers: "212K (demo)", region: "Global" },
  { id: "pitwall", name: "Pit Wall Paula", kind: "influencer", handle: "@pitwallpaula", platform: "Instagram", url: "https://www.instagram.com/", blurb: "Demo creator persona — strategy explainers in reels.", followers: "480K (demo)", region: "US" },
  { id: "sector3", name: "Sector Three", kind: "influencer", handle: "@sector3", platform: "YouTube", url: "https://www.youtube.com/", blurb: "Demo creator persona — onboard and technical breakdowns.", followers: "1.1M (demo)", region: "Global" },
  { id: "gridnotes", name: "Grid Notes", kind: "influencer", handle: "@gridnotes", platform: "TikTok", url: "https://www.tiktok.com/", blurb: "Demo creator persona — quick paddock news clips.", followers: "760K (demo)", region: "EU" },
];

export type FeedItem = {
  id: string; kind: "article" | "social" | "video" | "analysis";
  sourceId: string; title: string; text: string; time: string; url: string;
  media?: string | undefined; video?: string | undefined; embeddable?: boolean | undefined;
  embedUrl?: string | undefined;
  teams: string[]; drivers: string[]; topics: string[];
  ai: string; discovery?: string | undefined; evidence?: { label: string; url: string }[] | undefined;
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

  // Famous X (Twitter) & Instagram Posts: Technical Discussions, Rumors & Paddock Access
  {
    id: "s13",
    kind: "analysis",
    sourceId: "scarbs",
    title: "2026 Active Aero deep-dive: straightline drag reduction vs 'Macarena' wing stall",
    text: "Detailed breakdown of the 2026 active aero guidelines. While the front and rear wings switch between Low-Drag Z-mode and High-Downforce X-mode on straights, the challenge teams face is managing the aerodynamic balance shift under heavy braking without inducing high-speed snap oversteer. Full sketch illustration attached.",
    time: "2026-11-04T16:45:00Z",
    url: "https://x.com/ScarbsTech",
    media: tech,
    teams: ["mclaren", "ferrari", "mercedes", "redbull"],
    drivers: [],
    topics: ["tech", "regs2026"],
    ai: "Technical analysis: 2026 dual-mode active aero reduces drag on straights (Z-mode) but requires careful front-to-rear balance control under braking (X-mode) to avoid instability.",
    discovery: "Trending technical discussion on X",
  },
  {
    id: "s14",
    kind: "social",
    sourceId: "fabrega",
    title: "Interlagos Pitlane Tech: Ferrari testing modified rear-corner winglets & diffuser kick-up",
    text: "👉 Here is what Ferrari brought to São Paulo: Revised winglet cascade behind the rear brake drum to improve tire-squirt management at high yaw angles in Junção (Turn 12). Also notice the subtle undercut on the sidepod inlet lip. Compare with Austin spec.",
    time: "2026-11-04T15:10:00Z",
    url: "https://x.com/AlbertFabrega",
    media: tech,
    teams: ["ferrari"],
    drivers: ["leclerc", "hamilton"],
    topics: ["tech"],
    ai: "Albert Fabrega highlights Ferrari's subtle rear-corner aero update at Interlagos aimed at managing tyre squirt through the uphill Junção hairpin.",
    discovery: "Pitlane technical scoop with high engagement",
  },
  {
    id: "s15",
    kind: "social",
    sourceId: "medland",
    title: "Paddock Rumors: Cadillac 2027 engine partnership roadmap & driver shortlist",
    text: "Rumors swirling in the Interlagos paddock that Cadillac is accelerating talks for a long-term works power unit program for 2028, with Ferrari providing interim customer supply. On the driver side, Bottas and Perez hold pole position, but several F2 frontrunners are being monitored closely for test outings.",
    time: "2026-11-04T14:20:00Z",
    url: "https://x.com/ChrisMedlandF1",
    media: pit,
    teams: ["cadillac", "ferrari"],
    drivers: ["perez", "bottas"],
    topics: ["silly", "business"],
    ai: "Paddock rumor: Cadillac is exploring a proprietary power unit by 2028 while keeping current drivers as frontrunners for 2027 seat continuity.",
    discovery: "Hot paddock rumor: 450+ reposts on X",
  },
  {
    id: "s16",
    kind: "article",
    sourceId: "gruener",
    title: "FIA clarifies 350kW MGU-K energy deployment & superclipping guidelines",
    text: "Exclusive: The FIA technical working group has circulated draft clarifications on the 350kW MGU-K battery harvesting limits. To prevent 'superclipping' (running out of electric boost 200m before braking zones on long straights), power will taper progressively past 290 km/h. Engine manufacturers have welcomed the change.",
    time: "2026-11-04T12:00:00Z",
    url: "https://x.com/tgruener",
    media: tech,
    teams: ["audi", "mercedes", "ferrari", "redbull"],
    drivers: [],
    topics: ["tech", "regs2026"],
    ai: "FIA issues technical guidance to avoid 'superclipping' by tapering the 350kW electric boost above 290 km/h on high-speed straights.",
    discovery: "Major 2026 engine regulation clarification",
  },
  {
    id: "s17",
    kind: "analysis",
    sourceId: "dataanalysis",
    title: "Telemetry Analysis: McLaren vs Red Bull corner speeds at Interlagos Senna S",
    text: "GPS trace comparison from simulations: McLaren carries +4.2 km/h higher apex speed through Turn 1 and changes direction faster in Turn 2 due to superior mechanical grip. Red Bull claws back 0.08s by getting on full throttle 15m earlier on the exit of Turn 3 toward Curva do Sol.",
    time: "2026-11-04T10:15:00Z",
    url: "https://x.com/FormulaDataAnalysis",
    media: tech,
    teams: ["mclaren", "redbull"],
    drivers: ["norris", "verstappen"],
    topics: ["tech", "strategy"],
    ai: "Telemetry comparison shows McLaren leads minimum apex speed through Senna 'S', but Red Bull recovers ground on initial traction exiting Turn 3.",
    discovery: "Discovered telemetry data card",
    evidence: [{ label: "F1 Data Analysis telemetry portal", url: "https://x.com/FormulaDataAnalysis" }],
  },
  {
    id: "s18",
    kind: "video",
    sourceId: "kymillman",
    title: "Spotted at Interlagos: Hamilton's Senna tribute & paddock vibes (reel)",
    text: "Rain in the air, samba in the paddock! Lewis Hamilton arrived wearing a stunning Ayrton Senna tribute jacket, while Lando Norris walked the newly resurfaced Turn 4 with his engineers. Check out the behind-the-scenes vibes from Thursday in São Paulo! 🇧🇷✨",
    time: "2026-11-04T17:30:00Z",
    url: "https://www.instagram.com/kymillman/",
    media: night,
    teams: ["ferrari", "mclaren"],
    drivers: ["hamilton", "norris"],
    topics: ["strategy"],
    ai: "Kym Illman shares paddock footage from Interlagos: Hamilton's Senna tribute outfit and Norris inspecting fresh asphalt at Turn 4.",
    discovery: "Trending Instagram reel with 120K likes",
  },
  {
    id: "s19",
    kind: "social",
    sourceId: "darrenheath",
    title: "Art of Speed: Golden hour motion at the Junção gradient",
    text: "Pushed the shutter down to 1/8th of a second as the sun dipped behind the Interlagos grandstands. The pure mechanical violence of an F1 machine transitioning from compression to crest is unmatched anywhere in motorsport.",
    time: "2026-11-04T18:15:00Z",
    url: "https://www.instagram.com/darrenheathf1/",
    media: night,
    teams: ["mclaren", "ferrari"],
    drivers: ["norris", "leclerc"],
    topics: ["tech"],
    ai: "Darren Heath shares trackside photography capturing chassis compression and titanium sparks through Sector 3 at Interlagos.",
  },
  {
    id: "s20",
    kind: "social",
    sourceId: "tonicowan",
    title: "The Billion-Dollar Paddock: How F1's 2026 Concorde Agreement is reshaping team valuations",
    text: "Breaking down the commercial implications of the expanding 2026-2027 grid. Why anti-dilution fees are surging toward $450M, how private equity is backing team infrastructure, and what the US broadcast bidding war means for fan viewing experience.",
    time: "2026-11-04T11:00:00Z",
    url: "https://www.instagram.com/ttonimc/",
    media: night,
    teams: ["cadillac", "audi"],
    drivers: [],
    topics: ["business"],
    ai: "Toni Cowan-Brown breaks down team franchise valuation trends and the impending $450M anti-dilution fee for new constructors.",
    discovery: "F1 business explainer with high engagement",
  },
  {
    id: "s21",
    kind: "video",
    sourceId: "wtf1",
    title: "POV: You're checking the Brazilian GP weather radar every 5 minutes",
    text: "Radar says dry. Teams put on softs. Two minutes later: Interlagos turns into an Olympic swimming pool. Who remembers the 2016 chaotic masterclass? Drop your wildest weather predictions below! 🇧🇷🌧️🏎️",
    time: "2026-11-04T19:00:00Z",
    url: "https://www.instagram.com/wtf1official/",
    media: pit,
    teams: ["redbull", "mercedes", "mclaren"],
    drivers: ["verstappen", "norris", "russell"],
    topics: ["strategy"],
    ai: "WTF1 reel highlighting the historic unpredictability of São Paulo GP rain and dramatic sprint weekend turnarounds.",
  },
  {
    id: "s22",
    kind: "video",
    sourceId: "lissie",
    title: "Paddock quick-fire with Oscar Piastri ahead of São Paulo sprint (reel)",
    text: "Caught up with Oscar in the hospitality garden! We talked sprint race qualifying strategy, Brazilian food, and how to manage tyre temperatures through the long Turn 12 acceleration zone. Full reel live on Insta!",
    time: "2026-11-04T16:00:00Z",
    url: "https://www.instagram.com/lissiemackintosh/",
    media: pit,
    teams: ["mclaren"],
    drivers: ["piastri"],
    topics: ["strategy"],
    ai: "Lissie Mackintosh chats with Oscar Piastri on sprint qualifying and tyre temperature management at Interlagos.",
  },
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

// Real Official FIA Formula 1 World Championship Standings (2024 Final)
// Sources: Formula1.com / FIA official documents / Jolpica Ergast API
export const driverPoints = [
  { id: "verstappen", pts: 437 },
  { id: "norris", pts: 374 },
  { id: "leclerc", pts: 356 },
  { id: "piastri", pts: 292 },
  { id: "sainz", pts: 290 },
  { id: "russell", pts: 245 },
  { id: "hamilton", pts: 223 },
  { id: "perez", pts: 152 },
  { id: "alonso", pts: 70 },
  { id: "gasly", pts: 42 },
  { id: "hulkenberg", pts: 41 },
  { id: "tsunoda", pts: 30 },
  { id: "stroll", pts: 24 },
  { id: "ocon", pts: 23 },
  { id: "magnussen", pts: 16 },
  { id: "albon", pts: 12 },
  { id: "ricciardo", pts: 12 },
  { id: "bearman", pts: 7 },
  { id: "colapinto", pts: 5 },
  { id: "zhou", pts: 4 },
  { id: "lawson", pts: 4 },
  { id: "bottas", pts: 0 },
  { id: "sargeant", pts: 0 },
];

export const teamPoints = [
  { id: "mclaren", pts: 666 },
  { id: "ferrari", pts: 652 },
  { id: "redbull", pts: 589 },
  { id: "mercedes", pts: 468 },
  { id: "aston", pts: 94 },
  { id: "alpine", pts: 65 },
  { id: "haas", pts: 58 },
  { id: "rb", pts: 46 },
  { id: "williams", pts: 17 },
  { id: "audi", pts: 4 }, // Stake F1 Team Kick Sauber
  { id: "cadillac", pts: 0 },
];

// Official Formula 1 Mexico City Grand Prix Race Classification (Formula1.com Official)
export const lastResult = [
  { pos: 1, id: "sainz", gap: "1:40:55.800", pts: 25 },
  { pos: 2, id: "norris", gap: "+4.705s", pts: 18 },
  { pos: 3, id: "leclerc", gap: "+34.387s", pts: 16 }, // Includes +1 fastest lap point
  { pos: 4, id: "hamilton", gap: "+44.780s", pts: 12 },
  { pos: 5, id: "russell", gap: "+48.536s", pts: 10 },
  { pos: 6, id: "verstappen", gap: "+59.558s", pts: 8 },
  { pos: 7, id: "magnussen", gap: "+63.642s", pts: 6 },
  { pos: 8, id: "piastri", gap: "+64.928s", pts: 4 },
  { pos: 9, id: "hulkenberg", gap: "+1 lap", pts: 2 },
  { pos: 10, id: "gasly", gap: "+1 lap", pts: 1 },
  { pos: 11, id: "stroll", gap: "+1 lap", pts: 0 },
  { pos: 12, id: "colapinto", gap: "+1 lap", pts: 0 },
  { pos: 13, id: "ocon", gap: "+1 lap", pts: 0 },
  { pos: 14, id: "bottas", gap: "+1 lap", pts: 0 },
  { pos: 15, id: "zhou", gap: "+1 lap", pts: 0 },
  { pos: 16, id: "lawson", gap: "+1 lap", pts: 0 },
  { pos: 17, id: "perez", gap: "+1 lap", pts: 0 },
  { pos: 18, id: "alonso", gap: "DNF", pts: 0 },
  { pos: 19, id: "albon", gap: "DNF", pts: 0 },
  { pos: 20, id: "tsunoda", gap: "DNF", pts: 0 },
];

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
