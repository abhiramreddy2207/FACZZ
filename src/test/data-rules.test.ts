import { describe, expect, it } from "vitest";
import { datasets, getDataset } from "@/lib/data-catalog";
import { filteredData } from "@/lib/data-views";
import { sessionRows } from "@/lib/session-data";
import { defaults, getState, setState, toggleBookmark, toggleFollow } from "@/lib/store";

describe("Complete Data menu", () => {
  it("contains all 16 required categories and no Home destination", () => {
    expect(datasets.map((d) => d.label)).toEqual(["Live Timing", "Schedule", "Results", "Driver Standings", "Constructor Standings", "Drivers", "Teams", "Driver Stats", "Head To Head", "Consistency", "Race Pace", "Pit Stops", "Tech Updates", "Used Elements", "Destructors Championship", "Track DNA"]);
  });
  it.each(datasets.map((d) => [d.label, d] as const))("populates %s with chart values and attributed dated data", (_, ds) => {
    expect(ds.rows().length).toBeGreaterThan(0);
    expect(ds.providerUrl.startsWith("https://")).toBe(true);
    expect(Number.isNaN(Date.parse(ds.updated))).toBe(false);
    if (ds.chart) expect(ds.rows().every((row) => typeof row[ds.chart?.y ?? ""] === "number")).toBe(true);
  });
  it("keeps damage costs unavailable rather than inventing facts", () => {
    const ds = getDataset("destructors-championship");
    expect(ds?.rows().every((r) => r.cost === "Not available")).toBe(true);
  });
  it("filters actual rows by selected team and driver", () => {
    const ds = getDataset("driver-standings"); if (!ds) throw Error("Missing standings");
    const rows = filteredData(ds, { season: "2026", event: "Mexico City GP", session: "race", team: "mclaren", driver: "norris" });
    expect(rows).toHaveLength(1); expect(rows[0].driver).toBe("norris");
  });
  it("changes classifications with session, event and season choices", () => {
    const baseline = sessionRows("race", "Mexico City GP", "2026");
    expect(sessionRows("quali", "Mexico City GP", "2026")).not.toEqual(baseline);
    expect(sessionRows("race", "São Paulo GP", "2026")).not.toEqual(baseline);
    expect(sessionRows("race", "Mexico City GP", "2025")).not.toEqual(baseline);
  });
});

describe("Prototype preference rules", () => {
  it("starts without event notification permission enabled", () => { expect(defaults.eventNotifs).toBe(false); });
  it("supports multiple follows and removing one independently", () => {
    setState({ teams: [] }); toggleFollow("teams", "mclaren"); toggleFollow("teams", "ferrari");
    expect(getState().teams).toEqual(["mclaren", "ferrari"]); toggleFollow("teams", "mclaren"); expect(getState().teams).toEqual(["ferrari"]);
  });
  it("adds and removes story bookmarks", () => {
    setState({ bookmarks: [] }); const item = { id: "s1", type: "story" as const, title: "Sample", href: "/story/s1" };
    toggleBookmark(item); expect(getState().bookmarks[0].id).toBe("s1"); toggleBookmark(item); expect(getState().bookmarks).toHaveLength(0);
  });
  it("persists theme and chosen alert timing on the device", () => {
    setState({ theme: "dark", alertLead: 15 });
    const stored = JSON.parse(localStorage.getItem("paddock-intel:v1") ?? "{}");
    expect(stored.theme).toBe("dark"); expect(stored.alertLead).toBe(15);
  });
});