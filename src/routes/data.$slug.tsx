import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, TrendingUp, Sparkles, SlidersHorizontal, Activity } from "lucide-react";
import { getDataset, type Row } from "@/lib/data-catalog";
import { drivers, teams, calendar, fmt, getTeam, getDriver } from "@/lib/demo-data";
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

type TooltipPayload = {
  payload?: Row;
  value?: number | string;
  name?: string;
};

function CustomTelemetryTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const rowData = item?.payload;
  const value = item?.value;
  const title = (rowData?.["name"] as string) || (rowData?.["teamName"] as string) || label || "Value";
  const sub = (rowData?.["teamName"] && rowData?.["name"] ? rowData["teamName"] : (rowData?.["circuit"] || rowData?.["area"] || "")) as string;

  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-1 rounded-full bg-primary" />
        <span className="text-sm font-bold text-foreground">{title}</span>
      </div>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-border/60 pt-1.5 font-mono text-xs">
        <span className="uppercase text-muted-foreground">{item?.name || "Metric"}:</span>
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
    </div>
  );
}

function DataDetail() {
  const { slug } = Route.useParams();
  const ds = getDataset(slug);
  const [season, setSeason] = useState("2026");
  const [event, setEvent] = useState("Mexico City GP");
  const [team, setTeam] = useState("");
  const [driver, setDriver] = useState("");
  const [session, setSession] = useState("race");
  const [searchQuery, setSearchQuery] = useState("");

  const rows = useMemo(() => ds ? filteredData(ds, { season, event, session, team, driver }) : [], [ds, season, event, session, team, driver]);
  const displayRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, searchQuery]);

  if (!ds) return null;
  const capabilities = dataCapabilities(ds);

  return (
    <div>
      <Link to="/data" className="text-sm text-muted-foreground hover:text-foreground">← Data Overview</Link>
      <DataMenu />
      <PageHeader eyebrow={ds.group} title={ds.label}>
        <SaveButton label item={{ id: `ds-${slug}`, type: "dataset", title: ds.label, href: `/data/${slug}` }} />
      </PageHeader>
      <p className="mb-3 text-muted-foreground">{ds.desc}</p>
      {ds.note && <p className="mb-4 rounded-xl border border-warning/50 bg-warning/10 p-3.5 text-sm">{ds.note}</p>}
      {ds.race && (
        <Link to="/race" className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90">
          <Activity className="h-4 w-4" /> Open Race Center →
        </Link>
      )}

      {/* Filters Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search in table…"
          aria-label="Filter data"
          className="h-9 rounded-lg border border-input bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
        />
        {capabilities.season && (
          <select aria-label="Season" className={sel} value={season} onChange={(e) => setSeason(e.target.value)}>
            <option>2026</option>
            <option>2025</option>
          </select>
        )}
        {capabilities.event && (
          <select aria-label="Event" className={sel} value={event} onChange={(e) => setEvent(e.target.value)}>
            {calendar.map((c) => <option key={c.round}>{c.name}</option>)}
          </select>
        )}
        {capabilities.session && (
          <select aria-label="Session" className={sel} value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="fp1">Practice 1</option>
            <option value="sq">Sprint Qualifying</option>
            <option value="sprint">Sprint</option>
            <option value="quali">Qualifying</option>
            <option value="race">Race</option>
          </select>
        )}
        {capabilities.team && (
          <select aria-label="Team" className={sel} value={team} onChange={(e) => { setTeam(e.target.value); setDriver(""); }}>
            <option value="">All teams</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}
        {capabilities.driver && (
          <select aria-label="Driver" className={sel} value={driver} onChange={(e) => setDriver(e.target.value)}>
            <option value="">All drivers</option>
            {drivers.filter((d) => !team || d.teamId === team).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        <DemoBadge>{capabilities.season ? season : "Career / reference"}{capabilities.event ? ` · ${event}` : ""}</DemoBadge>
      </div>

      {/* Race Pace Explorer */}
      {slug === "race-pace" && <RacePaceExplorer event={event} season={season} team={team} driver={driver} />}

      {/* Appealing Telemetry Graph */}
      {slug !== "race-pace" && ds.chart && (
        <div className="mb-6 rounded-2xl border border-border bg-gradient-to-b from-card via-card to-card/70 p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <p className="font-display text-sm font-bold tracking-tight text-foreground">{ds.chart.label}</p>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{rows.length} entries</span>
          </div>

          <div className="h-72 w-full md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {ds.chart.type === "bar" ? (
                <BarChart data={rows} margin={{ top: 12, right: 12, bottom: 4, left: -10 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.65} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} vertical={false} />
                  <XAxis dataKey={ds.chart.x} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTelemetryTooltip />} />
                  <Bar dataKey={ds.chart.y} fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={Math.max(12, Math.min(32, 450 / (rows.length || 1)))} />
                </BarChart>
              ) : (
                <LineChart data={rows.filter((r) => r["team"] === (team || "mclaren"))} margin={{ top: 12, right: 12, bottom: 4, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.6} vertical={false} />
                  <XAxis dataKey={ds.chart.x} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTelemetryTooltip />} />
                  <Line
                    type="monotone"
                    dataKey={ds.chart.y}
                    stroke="var(--chart-1)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "var(--chart-1)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Comparisons */}
      {ds.compare && <DataComparison headToHead={slug === "head-to-head"} season={season} />}

      {/* Original Accurate Data Table */}
      {slug !== "race-pace" && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {ds.columns.map((c) => <th key={c.key} className="px-3 py-2.5 font-bold">{c.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayRows.map((r, i) => (
                <tr key={i} className="border-t border-border transition-colors hover:bg-muted/40">
                  {ds.columns.map((c) => (
                    <td key={c.key} className="px-3 py-2 font-mono text-[13px]">
                      {c.key === "cite" ? (
                        <a href={ds.providerUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                          {String(r[c.key])}
                        </a>
                      ) : (
                        String(r[c.key] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {displayRows.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No data available for this filter.</p>}
        </div>
      )}

      <SourcesFooter provider={ds.provider} url={ds.providerUrl} updated={fmt(ds.updated)} />
    </div>
  );
}
