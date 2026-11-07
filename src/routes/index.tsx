import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SlidersHorizontal, MessageCircle, Newspaper, Compass, UserCheck } from "lucide-react";
import { feed, getTeam, getDriver, getTopic, getSource, DEMO_UPDATED, fmt } from "@/lib/demo-data";
import { setState, useStore } from "@/lib/store";
import { syncCommunityPosts } from "@/lib/social-client";
import { Chip, DemoBadge, EmptyState } from "@/components/bits";
import { FeedCard } from "@/components/feed-card";
import { RaceCard } from "@/components/race-card";
import { ChampionshipStandingsWidget } from "@/components/championship-standings";
import { SocialPostComposer } from "@/components/social-post-composer";
import { SocialPostCard } from "@/components/social-post-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Faczz — Paddock Social & F1 Race Feed" },
      { name: "description", content: "Community social feed, breaking F1 news, live race status, discussions and telemetry." },
      { property: "og:title", content: "Faczz — Paddock Social & F1 Feed" },
      { property: "og:description", content: "Join community discussions, debrief races, view breaking news and telemetry." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type FeedTab = "all" | "community" | "news" | "myposts";

function Home() {
  const s = useStore((x) => x);
  const [feedTab, setFeedTab] = useState<FeedTab>("all");
  const [chip, setChip] = useState("foryou");
  const [panel, setPanel] = useState(false);

  // Sync community posts from database on mount
  useEffect(() => {
    syncCommunityPosts().catch(() => {});
  }, []);

  const chips = [
    { id: "foryou", label: "For You" },
    { id: "all", label: "All Topics" },
    ...s.teams.map((id) => ({ id: `t:${id}`, label: getTeam(id)?.name ?? id, color: getTeam(id)?.color })),
    ...s.drivers.map((id) => ({ id: `d:${id}`, label: getDriver(id)?.name ?? id, color: getTeam(getDriver(id)?.teamId ?? "")?.color })),
    ...s.topics.map((id) => ({ id: `p:${id}`, label: getTopic(id)?.name ?? id })),
    ...s.sources.map((id) => ({ id: `s:${id}`, label: getSource(id)?.name ?? id })),
  ];

  // News items filtering
  const newsItems = useMemo(() => {
    const score = (f: (typeof feed)[number]) =>
      f.teams.filter((t) => s.teams.includes(t)).length * 3 +
      f.drivers.filter((d) => s.drivers.includes(d)).length * 3 +
      f.topics.filter((t) => s.topics.includes(t)).length * 2 +
      (s.sources.includes(f.sourceId) ? 2 : 0);
    const recent = (f: (typeof feed)[number]) => +new Date(f.time);
    let list = [...feed];
    const [k, id = ""] = chip.split(":");
    if (k === "t" && id) list = list.filter((f) => f.teams.includes(id));
    if (k === "d" && id) list = list.filter((f) => f.drivers.includes(id));
    if (k === "p" && id) list = list.filter((f) => f.topics.includes(id));
    if (k === "s" && id) list = list.filter((f) => f.sourceId === id);
    if (chip === "foryou" && s.privacy.personalize) {
      list.sort((a, b) => score(b) * 864e5 * 0.5 + recent(b) - (score(a) * 864e5 * 0.5 + recent(a)));
    } else {
      list.sort((a, b) => recent(b) - recent(a));
    }
    return list;
  }, [chip, s.teams, s.drivers, s.topics, s.sources, s.privacy.personalize]);

  // Community posts filtering
  const communityPosts = useMemo(() => {
    let posts = [...s.userPosts];
    const [k, id = ""] = chip.split(":");
    if (k === "t" && id) posts = posts.filter((p) => p.teams.includes(id));
    if (k === "d" && id) posts = posts.filter((p) => p.drivers.includes(id));
    if (feedTab === "myposts") {
      posts = posts.filter((p) => p.author.id === s.user?.id || p.author.handle === s.user?.handle);
    }
    return posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [s.userPosts, chip, feedTab, s.user]);

  // Combined timeline for "all" tab
  type TimelineItem =
    | { type: "community"; data: (typeof s.userPosts)[number]; time: number }
    | { type: "news"; data: (typeof feed)[number]; time: number };

  const blendedTimeline: TimelineItem[] = useMemo(() => {
    if (feedTab === "community") {
      return communityPosts.map((p) => ({ type: "community", data: p, time: +new Date(p.createdAt) }));
    }
    if (feedTab === "news") {
      return newsItems.map((n) => ({ type: "news", data: n, time: +new Date(n.time) }));
    }
    if (feedTab === "myposts") {
      return communityPosts.map((p) => ({ type: "community", data: p, time: +new Date(p.createdAt) }));
    }

    // "all" tab: Interleave community posts and news
    const commItems: TimelineItem[] = communityPosts.map((p) => ({
      type: "community",
      data: p,
      time: +new Date(p.createdAt),
    }));
    const newsTimeline: TimelineItem[] = newsItems.map((n) => ({
      type: "news",
      data: n,
      time: +new Date(n.time),
    }));

    return [...commItems, ...newsTimeline].sort((a, b) => b.time - a.time);
  }, [feedTab, communityPosts, newsItems]);

  const raceFirst = s.homeEmphasis !== "feed";

  return (
    <div>
      {/* Top Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Paddock Feed</h1>
          <p className="text-xs text-muted-foreground">
            Social debate + official news · feed refreshed {fmt(DEMO_UPDATED)} <DemoBadge className="ml-1" />
          </p>
        </div>
        <Button
          variant="unstyled"
          onClick={() => setPanel(!panel)}
          aria-expanded={panel}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition-all hover:bg-muted"
        >
          <SlidersHorizontal className="h-4 w-4" /> Customize
        </Button>
      </div>

      {/* Customize Panel */}
      {panel && (
        <div className="mb-5 grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2">
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Home emphasis
            </legend>
            <div className="flex flex-wrap gap-2">
              {(["balanced", "race", "feed"] as const).map((m) => (
                <Chip key={m} active={s.homeEmphasis === m} onClick={() => setState({ homeEmphasis: m })}>
                  {{ balanced: "Balanced", race: "Race first", feed: "Feed first" }[m]}
                </Chip>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Race card state (demo preview)
            </legend>
            <div className="flex flex-wrap gap-2">
              {(["auto", "next", "live", "results"] as const).map((m) => (
                <Chip key={m} active={s.raceMode === m} onClick={() => setState({ raceMode: m })}>
                  {{ auto: "Auto", next: "Next session", live: "Live now", results: "Results" }[m]}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Link to="/welcome" className="text-sm font-semibold text-primary hover:underline">
            Edit follows & interests →
          </Link>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className={cn("grid gap-5 min-w-0", s.homeEmphasis === "balanced" && "xl:grid-cols-[1fr_340px]")}>
        {/* Race Center Column */}
        <div className={cn("min-w-0", !raceFirst && "order-2", s.homeEmphasis === "balanced" && "xl:order-2")}>
          <div className={cn(s.homeEmphasis === "balanced" && "xl:sticky xl:top-20 space-y-4")}>
            <RaceCard />
            <ChampionshipStandingsWidget />
          </div>
        </div>

        {/* Social Feed Column */}
        <div className={cn("min-w-0", s.homeEmphasis === "balanced" && "xl:order-1")}>
          {/* Post Composer */}
          <SocialPostComposer />

          {/* Feed Filter Mode Tabs */}
          <div className="no-scrollbar -mx-4 mb-4 flex items-center gap-1.5 overflow-x-auto px-4 border-b border-border pb-2 whitespace-nowrap">
            {[
              { id: "all" as const, label: "For You", icon: Compass },
              { id: "community" as const, label: "Community", icon: MessageCircle },
              { id: "news" as const, label: "Official F1", icon: Newspaper },
              { id: "myposts" as const, label: "My Posts", icon: UserCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = feedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFeedTab(tab.id)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Horizontal Entity Filter Chips */}
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" role="toolbar" aria-label="Feed filters">
            {chips.map((c) => (
              <Chip key={c.id} color={"color" in c ? c.color : undefined} active={chip === c.id} onClick={() => setChip(c.id)}>
                {c.label}
              </Chip>
            ))}
            <Link to="/explore" className="shrink-0 rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground">
              + Follow more
            </Link>
          </div>

          {/* Feed Items List */}
          <div className="space-y-4">
            {blendedTimeline.length ? (
              blendedTimeline.map((item) =>
                item.type === "community" ? (
                  <SocialPostCard key={item.data.id} post={item.data} />
                ) : (
                  <FeedCard key={item.data.id} item={item.data} />
                )
              )
            ) : (
              <EmptyState
                title="Nothing here yet"
                body="No stories or discussions match this filter. Try switching tabs or following more paddock sources."
                action={
                  <Button
                    variant="unstyled"
                    onClick={() => {
                      setFeedTab("all");
                      setChip("all");
                    }}
                    className="text-sm font-semibold text-primary"
                  >
                    Show All Content
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
