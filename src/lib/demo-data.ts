// DEMO DATA — all content here is sample data for the Faczz prototype.
// Nothing is live-connected. Replace via src/lib/integrations.ts adapters.
const night = "/race-hero.svg";
const pit = "/pit-lane.svg";
const tech = "/race-tech.svg";

export const DEMO_UPDATED = "2024-12-08T18:00:00Z";

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
  d("vettel", "Sebastian Vettel", "VET", 5, "aston", "German", "1987-07-03", 53, 122, 57, 299),
  d("schumacher", "Mick Schumacher", "MSC", 47, "haas", "German", "1999-03-22", 0, 0, 0, 43),
  d("latifi", "Nicholas Latifi", "LAT", 6, "williams", "Canadian", "1995-06-29", 0, 0, 0, 61),
  d("devries", "Nyck de Vries", "DEV", 21, "rb", "Dutch", "1995-02-06", 0, 0, 0, 11),
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
  {
    id: "s1",
    kind: "article",
    sourceId: "f1com",
    title: "McLaren crowned 2024 World Constructors' Champions as Norris wins Abu Dhabi GP",
    text: "McLaren secured their first Formula 1 Constructors' World Championship in 26 years after Lando Norris drove a faultless race from pole position to victory at the Yas Marina season finale. The British squad finished on 666 points, holding off a fierce challenge from Scuderia Ferrari (652 points) to capture their ninth constructors' crown.",
    time: "2024-12-08T15:30:00Z",
    url: "https://www.formula1.com/en/latest/article.norris-takes-dominant-abu-dhabi-win-as-mclaren-seal-constructors-championship.html",
    media: night,
    teams: ["mclaren", "ferrari"],
    drivers: ["norris", "piastri", "sainz", "leclerc"],
    topics: ["strategy"],
    ai: "McLaren wins their first Constructors' World Championship since 1998, scoring 666 points to beat Ferrari by 14 points as Lando Norris converts pole to victory.",
    discovery: "Championship decider headline",
  },
  {
    id: "s2",
    kind: "analysis",
    sourceId: "autosport",
    title: "How Max Verstappen clinched his fourth Formula 1 World Championship in Las Vegas",
    text: "Max Verstappen joined Alain Prost and Sebastian Vettel as a four-time World Champion with a composed drive to fifth place in Las Vegas. The Dutchman scored 437 points across the season, anchored by nine Grand Prix victories including his masterclass from P17 on the grid in the wet at Interlagos.",
    time: "2024-11-24T08:00:00Z",
    url: "https://www.autosport.com/f1/news/verstappen-crowned-2024-f1-world-champion/10676000/",
    media: tech,
    teams: ["redbull"],
    drivers: ["verstappen"],
    topics: ["strategy"],
    ai: "Max Verstappen seals the 2024 Drivers' Championship in Las Vegas with two rounds to spare, recording 437 points and 9 Grand Prix wins.",
  },
  {
    id: "s3",
    kind: "article",
    sourceId: "bbc",
    title: "Lewis Hamilton ends 945-day drought with emotional Silverstone triumph",
    text: "Lewis Hamilton secured an emotional ninth British Grand Prix victory in front of 160,000 cheering fans at Silverstone, holding off Max Verstappen and Lando Norris in changing wet-to-dry conditions to claim his record-extending 104th career win.",
    time: "2024-07-07T16:45:00Z",
    url: "https://www.bbc.com/sport/formula1/articles/cv22l0eygz8o",
    media: pit,
    teams: ["mercedes", "redbull", "mclaren"],
    drivers: ["hamilton", "verstappen", "norris"],
    topics: ["strategy"],
    ai: "Lewis Hamilton claims a historic 9th British Grand Prix win at Silverstone, ending a 945-day victory drought.",
  },
  {
    id: "s4",
    kind: "article",
    sourceId: "therace",
    title: "Charles Leclerc fulfills lifelong dream with emotional Monaco and Monza victories",
    text: "Charles Leclerc broke his Monaco curse by converting pole position into a stunning maiden home victory through the streets of Monte Carlo, before repeating the feat with a daring one-stop tyre strategy to win the Italian Grand Prix at Monza in front of the ecstatic Tifosi.",
    time: "2024-09-01T16:00:00Z",
    url: "https://www.the-race.com/formula-1/leclerc-monza-ferrari-italian-gp-win/",
    media: tech,
    teams: ["ferrari"],
    drivers: ["leclerc", "sainz"],
    topics: ["strategy", "tech"],
    ai: "Charles Leclerc takes two of F1's most prestigious crowns in 2024: an emotional home win in Monaco and a strategic one-stop masterclass at Monza.",
  },
  {
    id: "s5",
    kind: "article",
    sourceId: "motorsport",
    title: "Carlos Sainz delivers commanding victories in Australia and Mexico City",
    text: "Just two weeks after undergoing emergency appendectomy surgery in Saudi Arabia, Carlos Sainz produced an extraordinary comeback drive to lead a Ferrari 1-2 in Melbourne, later dominating the Mexico City Grand Prix from pole position.",
    time: "2024-10-27T22:30:00Z",
    url: "https://www.motorsport.com/f1/news/sainz-wins-mexican-gp-ferrari/10667440/",
    media: tech,
    teams: ["ferrari"],
    drivers: ["sainz", "leclerc"],
    topics: ["strategy"],
    ai: "Carlos Sainz scores two emphatic victories in 2024: Melbourne after returning from surgery, and a dominant pole-to-flag victory in Mexico City.",
  },
  {
    id: "s6",
    kind: "article",
    sourceId: "f1com",
    title: "Lando Norris takes maiden Formula 1 victory in Miami Grand Prix",
    text: "At his 110th Grand Prix start, Lando Norris took an unforgettable first career victory at the Miami International Autodrome, beating Max Verstappen by 7.6 seconds after McLaren's massive aerodynamic upgrade package came alive.",
    time: "2024-05-05T22:00:00Z",
    url: "https://www.formula1.com/en/latest/article.norris-beats-verstappen-for-breakthrough-maiden-f1-victory-in-action-packed.html",
    media: pit,
    teams: ["mclaren", "redbull"],
    drivers: ["norris", "verstappen"],
    topics: ["tech"],
    ai: "Lando Norris breaks through for his maiden F1 win in Miami, defeating Max Verstappen after McLaren introduced their major MCL38 upgrade.",
  },
  {
    id: "s7",
    kind: "article",
    sourceId: "racefans",
    title: "Oscar Piastri claims breakthrough Grand Prix victories in Hungary and Baku",
    text: "In only his second season, Oscar Piastri became a Grand Prix winner at the Hungaroring, then delivered a defensive clinic around Baku's street circuit to hold off Charles Leclerc for 30 consecutive laps and take his second victory.",
    time: "2024-09-15T14:30:00Z",
    url: "https://www.racefans.net/2024/09/15/piastri-holds-off-leclerc-in-thrilling-baku-finish/",
    media: night,
    teams: ["mclaren", "ferrari"],
    drivers: ["piastri", "leclerc"],
    topics: ["strategy"],
    ai: "Oscar Piastri scores two breakthrough Grand Prix wins in 2024 at Hungary and Azerbaijan.",
  },
  {
    id: "s8",
    kind: "article",
    sourceId: "autosport",
    title: "George Russell leads dominant Mercedes 1-2 finish in Las Vegas",
    text: "George Russell controlled the Las Vegas Grand Prix from pole position to lead teammate Lewis Hamilton home in an emphatic Mercedes 1-2 under the neon lights of the Strip, following up his earlier victory at the Austrian Grand Prix.",
    time: "2024-11-24T06:45:00Z",
    url: "https://www.autosport.com/f1/news/russell-leads-mercedes-1-2-in-las-vegas-gp/10675988/",
    media: night,
    teams: ["mercedes"],
    drivers: ["russell", "hamilton"],
    topics: ["strategy"],
    ai: "George Russell scores his second victory of 2024 leading a Mercedes 1-2 finish in Las Vegas.",
  },
  {
    id: "s9",
    kind: "analysis",
    sourceId: "therace",
    title: "Ayao Komatsu's masterstroke: How Haas scored 58 points and P7 in 2024",
    text: "Under new team principal Ayao Komatsu, Haas transformed from backmarkers to consistent midfield contenders. Nico Hülkenberg scored 41 points and Kevin Magnussen added 16, peaking with back-to-back P6 finishes at Spielberg and Silverstone.",
    time: "2024-12-09T10:00:00Z",
    url: "https://www.the-race.com/formula-1/haas-2024-season-review-komatsu/",
    media: tech,
    teams: ["haas"],
    drivers: ["hulkenberg", "magnussen"],
    topics: ["strategy", "tech"],
    ai: "Haas finishes P7 in the 2024 Constructors' Championship with 58 points under Ayao Komatsu.",
  },
  {
    id: "s10",
    kind: "social",
    sourceId: "f1com",
    title: "Sensational double podium for Alpine in chaotic rain-swept São Paulo GP",
    text: "Pierre Gasly and Esteban Ocon delivered a historic double podium for Alpine at Interlagos, crossing the line P2 and P3 behind Max Verstappen to jump the French team from ninth to sixth in the Constructors' Championship in one race.",
    time: "2024-11-03T20:15:00Z",
    url: "https://www.formula1.com/en/latest/article.huge-double-podium-for-alpine-in-sao-paulo-as-gasly-and-ocon-master-the-rain.html",
    media: pit,
    teams: ["alpine", "redbull"],
    drivers: ["gasly", "ocon", "verstappen"],
    topics: ["strategy"],
    ai: "Alpine scores a double podium at Interlagos with Gasly P2 and Ocon P3 in wet conditions.",
  },
  {
    id: "s11",
    kind: "analysis",
    sourceId: "scarbs",
    title: "Pit Stop Analysis: Red Bull Racing wins 2024 DHL Fastest Pit Stop Award",
    text: "Red Bull Racing took their seventh consecutive DHL Fastest Pit Stop Award with 552 points, achieving the fastest stationary time of 1.90 seconds. McLaren finished second on 433 points, also matching the 1.90s benchmark in Austin.",
    time: "2024-12-09T14:00:00Z",
    url: "https://inmotion.dhl/en/formula-1/fastest-pit-stop-award/",
    media: pit,
    teams: ["redbull", "mclaren", "ferrari"],
    drivers: [],
    topics: ["strategy", "tech"],
    ai: "Red Bull wins the 2024 DHL Fastest Pit Stop Award with 552 points and a season-best 1.90s stop.",
  },
  {
    id: "s12",
    kind: "social",
    sourceId: "medland",
    title: "Fernando Alonso reaches unprecedented 400 Grand Prix milestone",
    text: "Fernando Alonso made history as the first driver to reach 400 Grand Prix entries, scoring 70 points for Aston Martin across the 2024 season and reaffirming his hunger to continue competing at the highest level.",
    time: "2024-10-27T18:00:00Z",
    url: "https://x.com/ChrisMedlandF1",
    media: night,
    teams: ["aston"],
    drivers: ["alonso", "stroll"],
    topics: ["strategy"],
    ai: "Fernando Alonso becomes the first driver in F1 history to surpass 400 Grand Prix entries.",
  },
];

export type Session = { id: string; name: string; short: string; start: string; status: "done" | "live" | "upcoming" };
export const raceWeekend = {
  name: "Abu Dhabi Grand Prix",
  round: 24,
  circuit: "Yas Marina Circuit",
  location: "Yas Island, Abu Dhabi",
  sessions: [
    { id: "fp1", name: "Practice 1", short: "FP1", start: "2024-12-06T09:30:00Z", status: "done" },
    { id: "fp2", name: "Practice 2", short: "FP2", start: "2024-12-06T13:00:00Z", status: "done" },
    { id: "fp3", name: "Practice 3", short: "FP3", start: "2024-12-07T10:30:00Z", status: "done" },
    { id: "quali", name: "Qualifying", short: "Q", start: "2024-12-07T14:00:00Z", status: "done" },
    { id: "race", name: "Race", short: "RACE", start: "2024-12-08T13:00:00Z", status: "done" },
  ] as Session[],
};

// Official 2024 FIA Formula 1 World Championship Calendar (All 24 Completed Rounds)
export const calendar = [
  { round: 1, name: "Bahrain GP", date: "2024-03-02", circuit: "Sakhir", winner: "verstappen" },
  { round: 2, name: "Saudi Arabian GP", date: "2024-03-09", circuit: "Jeddah", winner: "verstappen" },
  { round: 3, name: "Australian GP", date: "2024-03-24", circuit: "Melbourne", winner: "sainz" },
  { round: 4, name: "Japanese GP", date: "2024-04-07", circuit: "Suzuka", winner: "verstappen" },
  { round: 5, name: "Chinese GP", date: "2024-04-21", circuit: "Shanghai", winner: "verstappen" },
  { round: 6, name: "Miami GP", date: "2024-05-05", circuit: "Miami", winner: "norris" },
  { round: 7, name: "Emilia Romagna GP", date: "2024-05-19", circuit: "Imola", winner: "verstappen" },
  { round: 8, name: "Monaco GP", date: "2024-05-26", circuit: "Monaco", winner: "leclerc" },
  { round: 9, name: "Canadian GP", date: "2024-06-09", circuit: "Montreal", winner: "verstappen" },
  { round: 10, name: "Spanish GP", date: "2024-06-23", circuit: "Barcelona", winner: "verstappen" },
  { round: 11, name: "Austrian GP", date: "2024-06-30", circuit: "Spielberg", winner: "russell" },
  { round: 12, name: "British GP", date: "2024-07-07", circuit: "Silverstone", winner: "hamilton" },
  { round: 13, name: "Hungarian GP", date: "2024-07-21", circuit: "Hungaroring", winner: "piastri" },
  { round: 14, name: "Belgian GP", date: "2024-07-28", circuit: "Spa-Francorchamps", winner: "hamilton" },
  { round: 15, name: "Dutch GP", date: "2024-08-25", circuit: "Zandvoort", winner: "norris" },
  { round: 16, name: "Italian GP", date: "2024-09-01", circuit: "Monza", winner: "leclerc" },
  { round: 17, name: "Azerbaijan GP", date: "2024-09-15", circuit: "Baku", winner: "piastri" },
  { round: 18, name: "Singapore GP", date: "2024-09-22", circuit: "Marina Bay", winner: "norris" },
  { round: 19, name: "United States GP", date: "2024-10-20", circuit: "Austin", winner: "leclerc" },
  { round: 20, name: "Mexico City GP", date: "2024-10-27", circuit: "Mexico City", winner: "sainz" },
  { round: 21, name: "São Paulo GP", date: "2024-11-03", circuit: "Interlagos", winner: "verstappen" },
  { round: 22, name: "Las Vegas GP", date: "2024-11-23", circuit: "Las Vegas", winner: "russell" },
  { round: 23, name: "Qatar GP", date: "2024-12-01", circuit: "Lusail", winner: "verstappen" },
  { round: 24, name: "Abu Dhabi GP", date: "2024-12-08", circuit: "Yas Marina", winner: "norris" },
];

// Deterministic pseudo-values (no Math.random at module scope).
export const seed = (i: number, k = 1) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1;

// Real Official FIA Formula 1 World Championship Standings (Authentic Formula1.com / Jolpica Ergast Data)
export const driverPoints2024 = [
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

export const driverPoints2023 = [
  { id: "verstappen", pts: 575 },
  { id: "perez", pts: 285 },
  { id: "hamilton", pts: 234 },
  { id: "alonso", pts: 206 },
  { id: "leclerc", pts: 206 },
  { id: "norris", pts: 205 },
  { id: "sainz", pts: 200 },
  { id: "russell", pts: 175 },
  { id: "piastri", pts: 97 },
  { id: "stroll", pts: 74 },
  { id: "gasly", pts: 62 },
  { id: "ocon", pts: 58 },
  { id: "albon", pts: 27 },
  { id: "tsunoda", pts: 17 },
  { id: "bottas", pts: 10 },
  { id: "hulkenberg", pts: 9 },
  { id: "ricciardo", pts: 6 },
  { id: "zhou", pts: 6 },
  { id: "magnussen", pts: 3 },
  { id: "lawson", pts: 2 },
  { id: "sargeant", pts: 1 },
  { id: "devries", pts: 0 },
];

export const driverPoints2022 = [
  { id: "verstappen", pts: 454 },
  { id: "leclerc", pts: 308 },
  { id: "perez", pts: 305 },
  { id: "russell", pts: 275 },
  { id: "sainz", pts: 246 },
  { id: "hamilton", pts: 240 },
  { id: "norris", pts: 122 },
  { id: "ocon", pts: 92 },
  { id: "alonso", pts: 81 },
  { id: "bottas", pts: 49 },
  { id: "ricciardo", pts: 37 },
  { id: "vettel", pts: 37 },
  { id: "magnussen", pts: 25 },
  { id: "gasly", pts: 23 },
  { id: "stroll", pts: 18 },
  { id: "schumacher", pts: 12 },
  { id: "tsunoda", pts: 12 },
  { id: "zhou", pts: 6 },
  { id: "albon", pts: 4 },
  { id: "latifi", pts: 2 },
  { id: "devries", pts: 2 },
  { id: "hulkenberg", pts: 0 },
];

export const teamPoints2024 = [
  { id: "mclaren", pts: 666 },
  { id: "ferrari", pts: 652 },
  { id: "redbull", pts: 589 },
  { id: "mercedes", pts: 468 },
  { id: "aston", pts: 94 },
  { id: "alpine", pts: 65 },
  { id: "haas", pts: 58 },
  { id: "rb", pts: 46 },
  { id: "williams", pts: 17 },
  { id: "audi", pts: 4 },
  { id: "cadillac", pts: 0 },
];

export const teamPoints2023 = [
  { id: "redbull", pts: 860 },
  { id: "mercedes", pts: 409 },
  { id: "ferrari", pts: 406 },
  { id: "mclaren", pts: 302 },
  { id: "aston", pts: 280 },
  { id: "alpine", pts: 120 },
  { id: "williams", pts: 28 },
  { id: "rb", pts: 25 },
  { id: "audi", pts: 16 },
  { id: "haas", pts: 12 },
];

export const teamPoints2022 = [
  { id: "redbull", pts: 759 },
  { id: "ferrari", pts: 554 },
  { id: "mercedes", pts: 515 },
  { id: "alpine", pts: 173 },
  { id: "mclaren", pts: 159 },
  { id: "audi", pts: 55 },
  { id: "aston", pts: 55 },
  { id: "haas", pts: 37 },
  { id: "rb", pts: 35 },
  { id: "williams", pts: 8 },
];

export const driverPoints = driverPoints2024;
export const teamPoints = teamPoints2024;

export function getDriverPointsForSeason(season: string) {
  if (season === "2023") return driverPoints2023;
  if (season === "2022") return driverPoints2022;
  return driverPoints2024;
}

export function getTeamPointsForSeason(season: string) {
  if (season === "2023") return teamPoints2023;
  if (season === "2022") return teamPoints2022;
  return teamPoints2024;
}

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
  { id: "n1", kind: "breaking", title: "McLaren wins 2024 World Constructors' Championship", body: "Norris takes Abu Dhabi victory to seal McLaren's first title in 26 years (666 pts)", time: "2024-12-08T15:35:00Z", link: "/story/s1" },
  { id: "n2", kind: "breaking", title: "Max Verstappen crowned 4-time World Champion", body: "Red Bull ace seals championship with 437 points and 9 wins", time: "2024-11-24T08:00:00Z", link: "/story/s2" },
  { id: "n3", kind: "results", title: "2024 Abu Dhabi GP Final Classification Confirmed", body: "Norris P1, Sainz P2, Leclerc P3, Hamilton P4, Russell P5", time: "2024-12-08T16:00:00Z", link: "/data/results" },
  { id: "n4", kind: "source", title: "Lewis Hamilton's Silverstone win voted moment of the season", body: "Record 104th career win in front of 160,000 British fans", time: "2024-07-07T17:00:00Z", link: "/story/s3" },
  { id: "n5", kind: "source", title: "Red Bull Racing captures 2024 DHL Fastest Pit Stop Award", body: "552 points and 1.90s season-best stop at Circuit of the Americas", time: "2024-12-09T14:00:00Z", link: "/data/pit-stops" },
];

export const getTeam = (id: string) => teams.find((t) => t.id === id);
export const getDriver = (id: string) => drivers.find((x) => x.id === id);
export const getSource = (id: string) => sources.find((s) => s.id === id);
export const getTopic = (id: string) => topics.find((t) => t.id === id);
export const getItem = (id: string) => feed.find((f) => f.id === id);

const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const fmt = (iso: string) => { const t = new Date(iso); return `${M[t.getUTCMonth()]} ${t.getUTCDate()}, ${String(t.getUTCHours()).padStart(2, "0")}:${String(t.getUTCMinutes()).padStart(2, "0")} UTC`; };
export const fmtDate = (iso: string) => { const t = new Date(iso); return `${M[t.getUTCMonth()]} ${t.getUTCDate()}, ${t.getUTCFullYear()}`; };
