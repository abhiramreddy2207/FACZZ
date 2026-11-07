import { calendar, getDriver, getTeam, seed, getDriverPointsForSeason, getTeamPointsForSeason } from "./demo-data";
import type { Dataset, Row } from "./data-catalog";
import { sessionRows } from "./session-data";

export type DataFilters = { season: string; event: string; session: string; team: string; driver: string };
const eventSlugs = new Set(["live-timing", "results", "consistency", "tech-updates", "track-dna"]);
const seasonSlugs = new Set(["schedule", "driver-standings", "constructor-standings", "head-to-head", "consistency", "race-pace", "pit-stops", "tech-updates", "used-elements", "destructors-championship"]);

export function dataCapabilities(ds: Dataset) {
  const rows = ds.rows();
  return {
    season: seasonSlugs.has(ds.slug) || ds.race || ds.slug === "results",
    event: eventSlugs.has(ds.slug),
    session: ds.race || ds.slug === "results",
    team: rows.some((r) => !!r.team),
    driver: rows.some((r) => !!r.driver),
  };
}

export function filteredData(ds: Dataset, f: DataFilters): Row[] {
  let rows: Row[] = [];

  if (ds.slug === "driver-standings") {
    const pts = getDriverPointsForSeason(f.season);
    rows = pts.map((p, i) => {
      const d = getDriver(p.id);
      return {
        pos: i + 1,
        name: d?.name ?? p.id,
        code: d?.code ?? p.id,
        teamName: getTeam(d?.teamId ?? "")?.name ?? "",
        team: d?.teamId ?? "",
        driver: p.id,
        pts: p.pts,
      };
    });
  } else if (ds.slug === "constructor-standings") {
    const pts = getTeamPointsForSeason(f.season);
    rows = pts.map((p, i) => {
      const t = getTeam(p.id);
      return {
        pos: i + 1,
        teamName: t?.name ?? p.id,
        short: t?.short ?? p.id,
        engine: t?.engine ?? "Unavailable",
        team: p.id,
        pts: p.pts,
      };
    });
  } else if (ds.race || ds.slug === "results") {
    rows = sessionRows(f.session, f.event, f.season).map((r) => ({
      ...r,
      teamName: getTeam(r.team)?.name ?? r.team,
    }));
  } else {
    rows = ds.rows().map((row) => ({ ...row }));
  }

  if (ds.slug === "schedule") {
    rows = rows.map((r) => ({
      ...r,
      date: String(r["date"] ?? "").replace("2024", f.season).replace("2026", f.season),
      status: f.season === "2024" ? "Completed" : (r["status"] ?? "Upcoming"),
    }));
  }

  if (ds.slug === "track-dna") {
    const track = calendar.find((c) => c.name === f.event)?.circuit;
    rows = rows.filter((r) => r["name"] === track);
  }

  if (ds.slug === "tech-updates") {
    rows = rows.filter((r) => r["event"] === f.event);
  }

  if (ds.slug === "consistency") {
    const salt = [...f.event].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    rows = rows.map((r, i) => ({ ...r, sd: +(0.28 + seed(i, salt) * 0.5).toFixed(3) })).sort((a, b) => a.sd - b.sd);
  }

  return rows.filter((r) => (!f.team || r.team === f.team) && (!f.driver || r.driver === f.driver));
}
