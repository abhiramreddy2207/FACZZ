import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { raceWeekend, lastResult, getDriver, getTeam, fmt, DEMO_UPDATED, seed } from "@/lib/demo-data";
import { PageHeader, TabBar, SourcesFooter } from "@/components/bits";
import { sessionRows } from "@/lib/session-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/race")({
  head: () => ({ meta: [
    { title: "Race Center — Faczz" },
    { name: "description", content: "Weekend schedule, live timing (demo) and session results." },
    { property: "og:title", content: "Race Center — Faczz" },
    { property: "og:description", content: "Session tabs, timing tower and results for the race weekend." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Race,
});

function Race() {
  const tabs = raceWeekend.sessions.map((s) => s.short);
  const [tab, setTab] = useState(tabs[tabs.length - 1]);
  const [view, setView] = useState<"Timing" | "Results">("Timing");
  const s = raceWeekend.sessions.find((x) => x.short === tab);
  if (!s) return null;
  const rows = sessionRows(s.id, raceWeekend.name);
  return (
    <div>
      <PageHeader eyebrow={`Round ${raceWeekend.round} · ${raceWeekend.circuit}`} title={raceWeekend.name} />
      <p className="mb-4 rounded-lg border border-dashed border-border bg-muted p-3 text-sm">Demo state: positions and times below are sample data, not a live connection.</p>
      <TabBar tabs={tabs} value={tab} onChange={setTab} />
      <h2 className="mb-2 font-bold">{s.name} · {fmt(s.start)}</h2>
      <div className="mb-3 flex gap-2">{(["Timing", "Results"] as const).map((v) => <Button key={v} variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>{v}</Button>)}</div>
      <ol className="overflow-hidden rounded-2xl border border-border bg-card">
        {rows.map((r, i) => { const dr = getDriver(r.driver); if (!dr) return null; return (
          <li key={r.driver} className="flex items-center gap-3 border-t border-border px-3 py-2 font-mono text-sm first:border-0">
            <span className="w-6 text-right font-bold">{i + 1}</span><span className="h-5 w-1 rounded" style={{ background: getTeam(dr.teamId)?.color }} />
            <span className="w-12 font-bold">{dr.code}</span><span className="flex-1 truncate font-sans text-muted-foreground">{getTeam(dr.teamId)?.name}</span>
            <span>{view === "Timing" ? r.last : r.gap}</span>
            {view === "Results" && <span className="w-10 text-right text-muted-foreground">{r.pts} pts</span>}
          </li>); })}
      </ol>
      <h2 className="mb-2 mt-6 font-bold">Weekend schedule</h2>
      <ul className="grid gap-2 sm:grid-cols-2">{raceWeekend.sessions.map((x) => <li key={x.id} className="rounded-xl border border-border bg-card p-3"><p className="font-semibold">{x.name}</p><p className="text-xs text-muted-foreground">{fmt(x.start)}</p></li>)}</ul>
      <SourcesFooter provider="Demo timing feed (F1 Live Timing integration point)" url="https://www.formula1.com/en/timing/f1-live" updated={fmt(DEMO_UPDATED)} />
    </div>
  );
}
