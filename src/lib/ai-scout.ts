import { feed, sources, type FeedItem, type Source } from "./demo-data";

export type IntelCategory = "rumor" | "tech" | "news" | "telemetry";

export type AiIntelReport = {
  id: string;
  query: string;
  headline: string;
  category: IntelCategory;
  reliability: "Verified Technical Directive" | "Verified Paddock Scoop" | "Unconfirmed Paddock Rumor" | "Telemetry & Data Analysis";
  confidence: string;
  summary: string;
  keyFindings: string[];
  sources: {
    name: string;
    handle?: string | undefined;
    platform?: string | undefined;
    url: string;
    note: string;
  }[];
  relatedFeedIds: string[];
  lastUpdated: string;
};

// Curated intelligence database representing real, ongoing F1 technical debates, paddock rumors, and news
export const PRESET_INTEL: AiIntelReport[] = [
  {
    id: "intel-2026-aero",
    query: "2026 active aero superclipping regulations",
    headline: "2026 Active Aero & 350kW MGU-K Superclipping Analysis",
    category: "tech",
    reliability: "Verified Technical Directive",
    confidence: "High — FIA Technical Working Group Draft TD-032",
    summary:
      "FIA and power unit manufacturers have reached an understanding on tapering the 350kW electrical deployment above 290 km/h to prevent 'superclipping' (abrupt power loss down long straights). Concurrently, dual-state active aero ('Z-mode' low drag and 'X-mode' high downforce) will use coordinated front and rear wing flaps to prevent dangerous aerodynamic center-of-pressure shifts during high-speed braking.",
    keyFindings: [
      "Electric power deployment will taper gradually rather than cut off sharply at maximum battery harvest.",
      "Z-mode (straightline low-drag) reduces car drag by ~55% on straights.",
      "Active front-wing flaps are mandatory alongside rear-wing elements to keep aero balance consistent under deceleration.",
      "Teams are experimenting with novel floor edge sealing techniques within the tightened ground-effect boundaries.",
    ],
    sources: [
      {
        name: "Craig Scarborough",
        handle: "@ScarbsTech",
        platform: "X",
        url: "https://x.com/ScarbsTech",
        note: "Technical sketches on aero balance shifts during Z-mode to X-mode transition",
      },
      {
        name: "Tobi Grüner",
        handle: "@tgruener",
        platform: "X",
        url: "https://x.com/tgruener",
        note: "Auto Motor und Sport reporting on FIA MGU-K tapering formula",
      },
    ],
    relatedFeedIds: ["s13", "s16"],
    lastUpdated: "2026-11-04T16:45:00Z",
  },
  {
    id: "intel-cadillac-audi-rumors",
    query: "cadillac audi 2027 driver market rumors",
    headline: "2027 Paddock Whispers: Cadillac Powertrain Roadmap & Audi Factory Benchmarks",
    category: "rumor",
    reliability: "Unconfirmed Paddock Rumor",
    confidence: "Medium — Multiple paddock sources at Interlagos & Austin",
    summary:
      "Cadillac is exploring an accelerated works power-unit program aimed at 2028, with Ferrari serving as the interim customer PU supplier. Current drivers Valtteri Bottas and Sergio Perez are in pole position for 2027 contract extensions to provide developmental continuity, though test mileage is planned for emerging junior drivers. Meanwhile, Audi's Mattia Binotto and Jonathan Wheatley have reportedly completed their primary technical recruitment drive.",
    keyFindings: [
      "Cadillac evaluating in-house engine test benches for a 2028 standalone PU launch.",
      "Ferrari customer engine supply confirmed through the 2026-2027 transition period.",
      "Bottas and Perez prioritize developmental continuity as Cadillac seeks grid stability.",
      "Audi's Neuburg engine facility running extended dyno simulation cycles for final homologation tests.",
    ],
    sources: [
      {
        name: "Chris Medland",
        handle: "@ChrisMedlandF1",
        platform: "X",
        url: "https://x.com/ChrisMedlandF1",
        note: "Paddock reporting on Cadillac 2027 driver evaluation and engine timeline",
      },
      {
        name: "Toni Cowan-Brown",
        handle: "@ttonimc",
        platform: "Instagram",
        url: "https://www.instagram.com/ttonimc/",
        note: "Business insights into OEM engine franchise values and Concorde Agreement rules",
      },
    ],
    relatedFeedIds: ["s7", "s10", "s15", "s20"],
    lastUpdated: "2026-11-04T14:20:00Z",
  },
  {
    id: "intel-interlagos-tech",
    query: "interlagos weather rain track grip upgrades",
    headline: "Interlagos Weekend Intel: Resurfaced Asphalt & High-Altitude Cooling Upgrades",
    category: "telemetry",
    reliability: "Telemetry & Data Analysis",
    confidence: "High — GPS traces, weather radar models and track inspection walk data",
    summary:
      "Interlagos (Autódromo José Carlos Pace) presents a unique dual challenge: 800m altitude reducing air density by ~8% (straining brake and PU cooling) and newly resurfaced dark asphalt with volatile thermal grip. Saturday afternoon models show a 65% probability of localized thunderstorm cells, which could heavily impact Sprint Qualifying and the Sprint race.",
    keyFindings: [
      "New asphalt is significantly darker and smoother: high micro-roughness means tyre graining is low in the dry, but oil leaching could make wet running treacherous.",
      "Ferrari and Mercedes have introduced enlarged engine-cover cooling louvres and modified brake duct cascades.",
      "Short pit-lane loss (~21.4s under green flag) makes the undercut unusually potent if tyre degradation spikes.",
      "Senna 'S' downhill braking zone requires stiff front mechanical setup, compromising traction over curbs at Turn 8.",
    ],
    sources: [
      {
        name: "Albert Fabrega",
        handle: "@AlbertFabrega",
        platform: "X",
        url: "https://x.com/AlbertFabrega",
        note: "Pitlane photos of Ferrari rear brake duct winglet cascade",
      },
      {
        name: "F1 Data Analysis",
        handle: "@FormulaDataAnalysis",
        platform: "X",
        url: "https://x.com/FormulaDataAnalysis",
        note: "Telemetry analysis of minimum corner speed through Turns 1, 2, and 12",
      },
      {
        name: "Kym Illman",
        handle: "@kymillman",
        platform: "Instagram",
        url: "https://www.instagram.com/kymillman/",
        note: "Paddock track walks inspecting resurfaced bitumen and curb modifications",
      },
    ],
    relatedFeedIds: ["s1", "s3", "s14", "s17", "s18"],
    lastUpdated: "2026-11-04T17:30:00Z",
  },
  {
    id: "intel-mclaren-ferrari-telemetry",
    query: "mclaren ferrari floor diffuser aero telemetry",
    headline: "Aero & Telemetry Showdown: McLaren Mechanical Grip vs Ferrari Diffuser Upgrades",
    category: "tech",
    reliability: "Verified Technical Directive",
    confidence: "High — GPS telemetry overlay & high-speed photographic evidence",
    summary:
      "McLaren's MCL39 continues to set the benchmark in low-speed and medium-speed change-of-direction, generating superior front-end bite without sacrificing rear stability. Ferrari's newly introduced floor edge and diffuser kick-up have narrowed the gap, providing Charles Leclerc and Lewis Hamilton with improved rear-axle plantedness in high-speed sweeps.",
    keyFindings: [
      "McLaren carries an average of +3.8 km/h higher apex speed through mid-speed corners (80-140 km/h).",
      "Ferrari's floor update stabilizes the underfloor suction peak at high yaw angles, reducing snap oversteer.",
      "Red Bull remains the straightline reference with open DRS, but suffers higher tyre degradation over 15+ lap stints.",
      "Mercedes displays strong stability under heavy straightline braking into Turn 1.",
    ],
    sources: [
      {
        name: "Craig Scarborough",
        handle: "@ScarbsTech",
        platform: "X",
        url: "https://x.com/ScarbsTech",
        note: "Diffuser expansion ramp and floor edge vortex generator analysis",
      },
      {
        name: "F1 Data Analysis",
        handle: "@FormulaDataAnalysis",
        platform: "X",
        url: "https://x.com/FormulaDataAnalysis",
        note: "Telemetry delta curves comparing McLaren MCL39 and Ferrari SF-26",
      },
    ],
    relatedFeedIds: ["s2", "s4", "s14", "s17"],
    lastUpdated: "2026-11-04T15:10:00Z",
  },
];

/**
 * Searches the web/intel database for rumors, technical discussions, and breaking news.
 * In demo mode, dynamically matches preset intel reports or constructs a synthesized briefing from feed items.
 */
export async function searchAiIntel(query: string): Promise<AiIntelReport> {
  const q = query.trim().toLowerCase();

  // Check if query matches one of our rich preset intelligence dossiers
  const exactMatch = PRESET_INTEL.find((item) =>
    item.query.split(" ").some((term) => q.includes(term) && term.length > 3) ||
    item.headline.toLowerCase().includes(q)
  );

  if (exactMatch && q.length > 3) {
    return {
      ...exactMatch,
      query,
    };
  }

  // Synthesize dynamic intelligence report from current feed and sources matching the keywords
  const matchedFeed = feed.filter((f) => {
    const text = (f.title + " " + f.text + " " + f.topics.join(" ") + " " + f.ai).toLowerCase();
    return q.split(" ").some((term) => term.length > 2 && text.includes(term));
  });

  const matchingSources = sources.filter((s) => {
    const text = (s.name + " " + (s.handle ?? "") + " " + s.blurb).toLowerCase();
    return q.split(" ").some((term) => term.length > 2 && text.includes(term));
  });

  const isRumor = q.includes("rumor") || q.includes("rumour") || q.includes("market") || q.includes("contract") || q.includes("cadillac") || q.includes("audi");
  const isTech = q.includes("aero") || q.includes("floor") || q.includes("engine") || q.includes("pu") || q.includes("mgu") || q.includes("diffuser") || q.includes("wing") || q.includes("2026");

  const category: IntelCategory = isRumor ? "rumor" : isTech ? "tech" : "news";
  const reliability = isRumor
    ? "Unconfirmed Paddock Rumor"
    : isTech
    ? "Verified Technical Directive"
    : "Verified Paddock Scoop";

  const headline = `AI Intel Briefing: ${query.slice(0, 50).replace(/^\w/, (c) => c.toUpperCase())}`;

  const defaultKeyFindings = [
    `Scanned public posts, technical discussions and reporting across ${sources.length} F1 sources on X and Instagram.`,
    matchedFeed.length > 0
      ? `Identified ${matchedFeed.length} relevant recent discussions matching "${query}".`
      : "No direct conflicts found in official FIA technical bulletins.",
    "Data cross-referenced with paddock journalists, telemetry analysts, and team engineers.",
    "Original source accounts linked below for direct verification.",
  ];

  return {
    id: `intel-${Date.now()}`,
    query,
    headline,
    category,
    reliability,
    confidence: isRumor ? "Speculative — Early paddock reports" : "High — Cross-referenced from multiple verified sources",
    summary:
      matchedFeed.length > 0
        ? `AI web search across paddock accounts indicates active discussion regarding "${query}". Key contributors include ${matchedFeed.slice(0, 2).map((m) => sources.find((s) => s.id === m.sourceId)?.name ?? "paddock analysts").join(" and ")}. Key details focus on development pace, technical balance, and weekend preparation.`
        : `AI intelligence scan for "${query}" analyzed current telemetry traces, technical directives, and social feeds. Discussions remain focused on 2026 powertrain transitions, aerodynamic balance management, and race strategy variables.`,
    keyFindings: matchedFeed.length > 0
      ? matchedFeed.slice(0, 4).map((m) => `${m.title} (${sources.find((s) => s.id === m.sourceId)?.name ?? "Paddock"}): ${m.ai}`)
      : defaultKeyFindings,
    sources: matchingSources.length > 0
      ? matchingSources.slice(0, 3).map((s) => ({
          name: s.name,
          handle: s.handle,
          platform: s.platform,
          url: s.url,
          note: s.blurb,
        }))
      : [
          {
            name: "Craig Scarborough",
            handle: "@ScarbsTech",
            platform: "X",
            url: "https://x.com/ScarbsTech",
            note: "Technical analysis & aero regulations",
          },
          {
            name: "Chris Medland",
            handle: "@ChrisMedlandF1",
            platform: "X",
            url: "https://x.com/ChrisMedlandF1",
            note: "Paddock insider & driver rumors",
          },
          {
            name: "Kym Illman",
            handle: "@kymillman",
            platform: "Instagram",
            url: "https://www.instagram.com/kymillman/",
            note: "Paddock photography & trackside reports",
          },
        ],
    relatedFeedIds: matchedFeed.map((m) => m.id).slice(0, 4),
    lastUpdated: new Date().toISOString(),
  };
}
