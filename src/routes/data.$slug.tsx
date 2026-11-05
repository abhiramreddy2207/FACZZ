import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDataset } from "@/lib/data-catalog";
import { drivers, teams, calendar, fmt } from "@/lib/demo-data";
import { PageHeader, SaveButton, SourcesFooter, DemoBadge } from "@/components/bits";
import { filteredData, dataCapabilities } from "@/lib/data-views";
import { DataComparison } from "@/components/data-comparison";
import { DataMenu } from "@/components/data-menu";
import { RacePaceExplorer } from "@/components/race-pace-explorer";

export const Route = createFileRoute("/data/$slug")({
  loader: ({ params }) => { const d = getDataset(params.slug); if (!d) throw notFound(); return { label: d.label, desc: d.desc }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.label ?? "Data"} — Faczz` },
    { name: "description", content: loaderData?.desc ?? "F1 data view" },
    { property: "og:title", content: `${loaderData?.label ?? "Data"} — Faczz` },
    { property: "og:description", content: loaderData?.desc ?? "F1 data view" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DataDetail,
});

const sel = "h-9 rounded-lg border border-input bg-card px-2 text-sm";

function DataDetail() {
  const { slug } = Route.useParams();
  const ds = getDataset(slug);
  const [season, setSeason] = useState("2026");
  const [event, setEvent] = useState("Mexico City GP");
  const [team, setTeam] = useState("");
  const [driver, setDriver] = useState("");
  const [session, setSession] = useState("race");
  const rows = useMemo(() => ds ? filteredData(ds, { season, event, session, team, driver }) : [], [ds, season, event, session, team, driver]);
  if (!ds) return null;
  const capabilities = dataCapabilities(ds);
  return (
    <div>
      <Link to="/data" className="text-sm text-muted-foreground">← Data</Link>
      <DataMenu />
      <PageHeader eyebrow={ds.group} title={ds.label}><SaveButton label item={{ id: `ds-${slug}`, type: "dataset", title: ds.label, href: `/data/${slug}` }} /></PageHeader>
      <p className="mb-3 text-muted-foreground">{ds.desc}</p>
      {ds.note && <p className="mb-4 rounded-lg border border-warning bg-warning/10 p-3 text-sm">{ds.note}</p>}
      {ds.race && <Link to="/race" className="mb-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Open Race Center →</Link>}
      <div className="mb-4 flex flex-wrap gap-2">
        {capabilities.season && <select aria-label="Season" className={sel} value={season} onChange={(e) => setSeason(e.target.value)}><option>2026</option><option>2025</option></select>}
        {capabilities.event && <select aria-label="Event" className={sel} value={event} onChange={(e) => setEvent(e.target.value)}>{calendar.map((c) => <option key={c.round}>{c.name}</option>)}</select>}
        {capabilities.session && <select aria-label="Session" className={sel} value={session} onChange={(e) => setSession(e.target.value)}><option value="fp1">Practice 1</option><option value="sq">Sprint Qualifying</option><option value="sprint">Sprint</option><option value="quali">Qualifying</option><option value="race">Race</option></select>}
        {capabilities.team && <select aria-label="Team" className={sel} value={team} onChange={(e) => { setTeam(e.target.value); setDriver(""); }}><option value="">All teams</option>{teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>}
        {capabilities.driver && <select aria-label="Driver" className={sel} value={driver} onChange={(e) => setDriver(e.target.value)}><option value="">All drivers</option>{drivers.filter((d) => !team || d.teamId === team).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>}
        <DemoBadge>{capabilities.season ? season : "Career / reference"}{capabilities.event ? ` · ${event}` : ""}</DemoBadge>
      </div>
      {slug === "race-pace" && <RacePaceExplorer event={event} season={season} team={team} driver={driver} />}
      {slug !== "race-pace" && ds.chart && (
        <div className="h-72 rounded-lg border border-border bg-card p-3">
          <p className="mb-1 text-xs font-semibold text-muted-foreground">{ds.chart.label}</p>
          <ResponsiveContainer width="100%" height="90%">
            {ds.chart.type === "bar" ? (
              <BarChart data={rows}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={ds.chart.x} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} /><YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} /><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} /><Bar dataKey={ds.chart.y} fill="var(--chart-1)" radius={[4, 4, 0, 0]} /></BarChart>
            ) : (
              <LineChart data={rows.filter((r) => r.team === (team || "mclaren"))}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey={ds.chart.x} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} /><YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} /><Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }} /><Line dataKey={ds.chart.y} stroke="var(--chart-1)" strokeWidth={2} /></LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      {ds.compare && <DataComparison headToHead={slug === "head-to-head"} season={season} />}
      {slug !== "race-pace" && <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground"><tr>{ds.columns.map((c) => <th key={c.key} className="px-3 py-2">{c.label}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-border">{ds.columns.map((c) => <td key={c.key} className="px-3 py-2 font-mono text-[13px]">{c.key === "cite" ? <a href={ds.providerUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">{String(r[c.key])}</a> : String(r[c.key] ?? "—")}</td>)}</tr>)}</tbody>
        </table>
        {rows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No data available for this filter.</p>}
      </div>}
      <SourcesFooter provider={ds.provider} url={ds.providerUrl} updated={fmt(ds.updated)} />
    </div>
  );
}
