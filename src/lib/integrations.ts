// Integration points — isolated so real providers can be swapped in later.
// Every function currently resolves DEMO data only. No live data is connected.
import { feed, raceWeekend } from "./demo-data";
import { datasets } from "./data-catalog";

export const DATA_MODE = "demo" as const;

/** News/social discovery adapter (RSS, publisher APIs, social embeds). */
export const fetchFeed = async () => feed;
/** Live timing adapter (e.g. F1 Live Timing / OpenF1). */
export const fetchRaceWeekend = async () => raceWeekend;
/** Stats provider adapter (e.g. Jolpica/Ergast, FastF1). */
export const fetchDatasets = async () => datasets;
/** AI summary adapter — would call a server function with the original text. */
export const summarize = async (text: string, demoSummary: string) => demoSummary || text.slice(0, 140);
