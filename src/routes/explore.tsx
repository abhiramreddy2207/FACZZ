import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, TrendingUp } from "lucide-react";
import { teams, drivers, topics, sources, getTeam, getSource } from "@/lib/demo-data";
import { Avatar, Chip, EmptyState, FollowButton, PageHeader, TabBar } from "@/components/bits";
import type { EntityKind } from "@/lib/store";
import { FeedCard } from "@/components/feed-card";
import { useStore } from "@/lib/store";

type LiveFeedEntry = {
  id: string; sourceId: string; kind: "article" | "video"; title: string; text: string;
  time: string; url: string; media?: string; embedUrl?: string;
};

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : undefined }),
  head: () => ({ meta: [
    { title: "Explore — Faczz" },
    { name: "description", content: "Search and follow F1 teams, drivers, topics, publishers and creators." },
    { property: "og:title", content: "Explore F1 — Faczz" },
    { property: "og:description", content: "Discover and follow teams, drivers, topics and sources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Explore,
});

const TABS = ["Feed", "Teams", "Drivers", "Topics", "Sources"] as const;
type ExploreTab = (typeof TABS)[number];
type FeedFilter = "All" | "Posts" | "Videos";
type Row = { kind: EntityKind; id: string; title: string; sub: string; color?: string; to: "/team/$id" | "/driver/$id" | "/source/$id" | null; avatar: string };

function Explore() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  useEffect(() => setQ(initial ?? ""), [initial]);
  const [tab, setTab] = useState<ExploreTab>("Feed");
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("All");
  const [liveItems, setLiveItems] = useState<LiveFeedEntry[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedUpdated, setFeedUpdated] = useState<string | null>(null);
  const followedSources = useStore((s) => s.sources);

  useEffect(() => {
    let active = true;
    const loadFeed = async () => {
      try {
        const response = await fetch("/api/live-feed");
        if (!response.ok) throw new Error("Live feeds are unavailable");
        const result = await response.json() as { items: LiveFeedEntry[]; updatedAt: string };
        if (active) { setLiveItems(result.items); setFeedUpdated(result.updatedAt); }
      } catch {
        if (active) setLiveItems([]);
      } finally { if (active) setFeedLoading(false); }
    };
    void loadFeed();
    const timer = window.setInterval(loadFeed, 5 * 60 * 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const all: Record<Exclude<ExploreTab, "Feed">, Row[]> = {
    Teams: teams.map((t) => ({ kind: "teams", id: t.id, title: t.name, sub: `${t.base} · ${t.engine} PU`, color: t.color, to: "/team/$id", avatar: t.short })),
    Drivers: drivers.map((d) => ({ kind: "drivers", id: d.id, title: d.name, sub: `#${d.number} · ${getTeam(d.teamId)?.name}`, color: getTeam(d.teamId)?.color, to: "/driver/$id", avatar: d.code })),
    Topics: topics.map((t) => ({ kind: "topics", id: t.id, title: t.name, sub: t.blurb, to: null, avatar: "#" })),
    Sources: sources.map((s) => ({ kind: "sources", id: s.id, title: s.name, sub: s.kind === "publisher" ? `Publisher · ${s.region}` : `Creator ${s.handle} · ${s.platform}`, to: "/source/$id", avatar: s.name.slice(0, 2).toUpperCase() })),
  };
  const ql = q.trim().toLowerCase();
  const rows = ql
    ? Object.values(all).flat().filter((r) => (r.title + r.sub).toLowerCase().includes(ql))
    : tab === "Feed" ? [] : all[tab];
  const feedItems = liveItems.filter((item) => {
    const matchesKind = feedFilter === "All" || (feedFilter === "Posts" ? item.embedUrl?.startsWith("social-") : item.kind === "video");
    const matchesFollow = followedSources.length === 0 || followedSources.includes(item.sourceId);
    const matchesQuery = !ql || `${item.title} ${item.text} ${getSource(item.sourceId)?.name ?? ""}`.toLowerCase().includes(ql);
    return matchesKind && matchesFollow && matchesQuery;
  });
  const trending = [...feed].sort((a, b) => b.teams.length + b.drivers.length - (a.teams.length + a.drivers.length)).slice(0, 4);

  return (
    <div>
      <PageHeader eyebrow="Discover" title="Explore" />
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search everything…" aria-label="Universal search" className="h-12 w-full rounded-2xl border border-input bg-card pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {!ql && tab !== "Feed" && (
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground"><TrendingUp className="h-4 w-4 text-primary" /> Trending discovery</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
            {trending.map((f, i) => (
              <Link key={f.id} to="/story/$id" params={{ id: f.id }} className="racing-grid w-64 shrink-0 rounded-2xl border border-border bg-card p-4">
                <p className="font-mono text-3xl font-bold text-primary">0{i + 1}</p>
                <p className="mt-1 line-clamp-2 font-semibold">{f.title}</p>
                <p className="mt-2 text-xs text-muted-foreground">{getSource(f.sourceId)?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
      {!ql ? <TabBar tabs={TABS} value={tab} onChange={setTab} /> : <p className="mb-3 text-sm text-muted-foreground">Search results for “{q}”</p>}
      {tab === "Feed" && !ql ? (
        <section className="mt-4">
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            {(["All", "Posts", "Videos"] as const).map((filter) => (
              <Chip key={filter} active={feedFilter === filter} onClick={() => setFeedFilter(filter)}>{filter}</Chip>
            ))}
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {feedLoading ? "Loading live updates…" : `${feedItems.length} live updates${feedUpdated ? ` · refreshed ${new Date(feedUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}
          </p>
          <div className="mx-auto max-w-2xl space-y-4">
            {feedItems.map((item) => <FeedCard key={item.id} item={{ ...item, teams: [], drivers: [], topics: [], ai: "" }} live />)}
          </div>
          {!feedLoading && feedItems.length === 0 && <EmptyState title={liveItems.length === 0 ? "Live sources are unavailable" : "Nothing in this filter yet"} body={liveItems.length === 0 ? "Check your internet connection and refresh to try the publisher feeds again." : feedFilter === "Posts" ? "The live publishers have no X or Instagram posts right now. Connect social accounts or add a public post link to see embedded posts here." : followedSources.length ? "No new items from your followed sources. Follow a publisher or choose another feed filter." : "Try another feed filter."} />}
        </section>
      ) : rows.length === 0 ? <EmptyState title="No matches" body="Try a team, driver code, topic or publisher name." /> : (
        <ul className="grid gap-2 md:grid-cols-2">
          {rows.map((r) => {
            const inner = (<><Avatar label={r.avatar} color={r.color} /><span className="min-w-0 flex-1"><span className="block truncate font-semibold">{r.title}</span><span className="block truncate text-xs text-muted-foreground">{r.sub}</span></span></>);
            return (
              <li key={r.kind + r.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {r.to ? <Link to={r.to} params={{ id: r.id }} className="flex min-w-0 flex-1 items-center gap-3">{inner}</Link> : <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>}
                <FollowButton kind={r.kind} id={r.id} size="sm" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
