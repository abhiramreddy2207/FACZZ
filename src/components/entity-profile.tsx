import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { feed, raceWeekend, fmt, getSource, type FeedItem } from "@/lib/demo-data";
import { datasets } from "@/lib/data-catalog";
import { FollowButton, TabBar, Avatar, SourceLink, EmptyState } from "./bits";
import { FeedCard } from "./feed-card";
import type { EntityKind } from "@/lib/store";

export function EntityProfile({ kind, id, title, sub, avatar, color, stats, url, filter, extra }: {
  kind: EntityKind; id: string; title: string; sub: string; avatar: string; color?: string;
  stats: [string, string | number][]; url: string; filter: (f: FeedItem) => boolean; extra?: ReactNode;
}) {
  const [tab, setTab] = useState<"Overview" | "News" | "Data">("Overview");
  const news = feed.filter(filter);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Avatar label={avatar} color={color} />
        <div className="flex-1"><h1 className="text-3xl font-extrabold">{title}</h1><p className="text-sm text-muted-foreground">{sub}</p></div>
        <FollowButton kind={kind} id={id} />
      </div>
      <TabBar tabs={["Overview", "News", "Data"] as const} value={tab} onChange={setTab} />
      {tab === "Overview" && (<div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{stats.map(([k, v]) => <div key={k} className="rounded-xl border border-border bg-card p-3"><p className="text-xs text-muted-foreground">{k}</p><p className="font-mono text-xl font-bold">{v}</p></div>)}</div>
        {extra}
        <div><h2 className="mb-2 font-bold">Recent coverage</h2>{news.slice(0, 3).map((n) => <Link key={n.id} to="/story/$id" params={{ id: n.id }} className="mb-2 block rounded-xl border border-border bg-card p-3"><p className="font-semibold">{n.title}</p><p className="text-xs text-muted-foreground">{getSource(n.sourceId)?.name} · {fmt(n.time)} · Demo</p></Link>)}{!news.length && <p className="text-sm text-muted-foreground">No recent demo coverage.</p>}</div>
        <div><h2 className="mb-2 font-bold">Upcoming sessions</h2><ul className="grid gap-2 sm:grid-cols-2">{raceWeekend.sessions.slice(0, 4).map((s) => <li key={s.id} className="rounded-xl border border-border bg-card p-3 text-sm"><b>{s.name}</b> · {fmt(s.start)}</li>)}</ul></div>
        <SourceLink href={url}>Official page</SourceLink>
      </div>)}
      {tab === "News" && <div className="space-y-4">{news.length ? news.map((n) => <FeedCard key={n.id} item={n} />) : <EmptyState title="No coverage yet" body="No demo stories for this profile." />}</div>}
      {tab === "Data" && <div className="grid gap-2 sm:grid-cols-2">{datasets.filter((d) => !d.race).slice(2, 12).map((d) => <Link key={d.slug} to="/data/$slug" params={{ slug: d.slug }} className="rounded-xl border border-border bg-card p-3 font-semibold hover:border-primary">{d.label} →</Link>)}</div>}
    </div>
  );
}
