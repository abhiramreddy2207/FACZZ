import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Cpu,
  ExternalLink,
  Flame,
  Heart,
  MessageCircle,
  Play,
  Plus,
  Repeat2,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  Volume2,
  VolumeX,
} from "lucide-react";
import { teams, drivers, topics, sources, getTeam, getDriver, getSource, feed, fmt, type FeedItem } from "@/lib/demo-data";
import { Avatar, Chip, EmptyState, FollowButton, PageHeader, SaveButton, SourceLink, TabBar } from "@/components/bits";
import { InlineMedia, AiSummary } from "@/components/feed-card";
import { toggleBookmark, useStore, type EntityKind } from "@/lib/store";
import { AiPaddockScout } from "@/components/ai-paddock-scout";
import { toast } from "sonner";

export const Route = createFileRoute("/explore")({
  validateSearch: (s: Record<string, unknown>): { q?: string } => (typeof s["q"] === "string" ? { q: s["q"] } : {}),
  head: () => ({ meta: [
    { title: "Explore F1 Feed, Rumors & Tech — Faczz" },
    { name: "description", content: "Explore F1 news, technical scoops, rumors, reels, creator posts, teams, and drivers." },
    { property: "og:title", content: "Explore F1 — Faczz" },
    { property: "og:description", content: "Discover social posts, rumors, technical analysis, reels, teams and drivers." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Explore,
});

const TABS = ["For You", "Tech & Aero", "Rumors & Whispers", "Reels & Media", "Teams", "Drivers", "Sources"] as const;
type ExploreTab = (typeof TABS)[number];

type SocialStats = {
  likes: number;
  comments: number;
  reposts: number;
};

// Social feed post card styled like X (Twitter) & Instagram
function SocialPostCard({
  item,
  isLiked,
  onToggleLike,
}: {
  item: FeedItem;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}) {
  const src = getSource(item.sourceId);
  const isSaved = useStore((s) => s.bookmarks.some((b) => b.id === item.id));
  const isFollowingSource = useStore((s) => s.sources.includes(item.sourceId));

  // Deterministic engagement metrics based on post ID
  const stats = useMemo<SocialStats>(() => {
    const num = item.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return {
      likes: (num * 17) % 4500 + 420,
      comments: (num * 7) % 380 + 34,
      reposts: (num * 11) % 890 + 95,
    };
  }, [item.id]);

  const likeCount = stats.likes + (isLiked ? 1 : 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-foreground/30 hover:shadow-md">
      {/* Author Header */}
      <div className="flex items-center justify-between gap-3 p-4 pb-3">
        <Link to="/source/$id" params={{ id: src?.id ?? item.sourceId }} className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-sm font-extrabold text-foreground ring-2 ring-primary/30">
            {src?.name ? src.name.slice(0, 2).toUpperCase() : "F1"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-bold text-foreground hover:underline">{src?.name ?? "Paddock"}</span>
              {src?.kind === "publisher" && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-primary">Media</span>
              )}
              {src?.kind === "influencer" && (
                <span className="rounded-full bg-secondary px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">{src.platform ?? "Creator"}</span>
              )}
              {isFollowingSource && (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold uppercase text-primary">Following</span>
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {src?.handle ? `${src.handle} · ` : ""}{fmt(item.time)}
            </p>
          </div>
        </Link>

        {src && <FollowButton kind="sources" id={src.id} size="sm" />}
      </div>

      {/* Post Text */}
      <div className="px-4 pb-3">
        {item.discovery && (
          <p className="mb-1.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-3 w-3" /> {item.discovery}
          </p>
        )}
        <Link to="/story/$id" params={{ id: item.id }} className="group block">
          <h3 className="text-base font-bold leading-snug group-hover:text-primary md:text-lg">{item.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">{item.text}</p>
        </Link>
      </div>

      {/* Media: Image / Video / Embed */}
      {(item.media || item.video || item.embedUrl) && (
        <div className="px-4 pb-3">
          <InlineMedia item={item} />
        </div>
      )}

      {/* Tags */}
      {(item.teams.length > 0 || item.topics.length > 0) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {item.teams.map((t) => (
            <Link
              key={t}
              to="/team/$id"
              params={{ id: t }}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground hover:bg-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: getTeam(t)?.color }} />
              #{getTeam(t)?.name}
            </Link>
          ))}
          {item.topics.map((tp) => (
            <span key={tp} className="text-xs text-primary font-medium">#{tp}</span>
          ))}
        </div>
      )}

      {/* AI Summary (Optional tap to expand) */}
      <div className="px-4 pb-3">
        <AiSummary text={item.ai} />
      </div>

      {/* Social Engagement Actions Bar (Like, Comment, Repost, Bookmark, Share) */}
      <div className="flex items-center justify-between border-t border-border/70 px-4 py-2.5 text-xs text-muted-foreground">
        {/* Like Button */}
        <button
          type="button"
          onClick={() => onToggleLike(item.id)}
          aria-label={isLiked ? "Unlike" : "Like"}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
            isLiked ? "text-red-500 font-bold" : "hover:text-red-500 hover:bg-red-500/10"
          }`}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{likeCount.toLocaleString()}</span>
        </button>

        {/* Comment Count */}
        <Link
          to="/story/$id"
          params={{ id: item.id }}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors hover:text-primary hover:bg-primary/10"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{stats.comments}</span>
        </Link>

        {/* Repost Button */}
        <button
          type="button"
          onClick={() => toast("Reposted to your feed (demo)")}
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors hover:text-green-500 hover:bg-green-500/10"
        >
          <Repeat2 className="h-4 w-4" />
          <span>{stats.reposts}</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => {
            toggleBookmark({
              id: item.id,
              type: item.kind === "article" ? "story" : "post",
              title: item.title,
              href: `/story/${item.id}`,
            });
            toast(isSaved ? "Removed from Saved" : "Saved to bookmarks");
          }}
          aria-label={isSaved ? "Saved" : "Save"}
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-colors ${
            isSaved ? "text-primary font-bold" : "hover:text-primary hover:bg-primary/10"
          }`}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
        </button>

        {/* External Link */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original source"
          className="flex items-center gap-1 rounded-full p-1.5 hover:text-foreground hover:bg-muted"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </article>
  );
}

function Explore() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial ?? "");
  useEffect(() => setQ(initial ?? ""), [initial]);
  const [tab, setTab] = useState<ExploreTab>("For You");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(["s2", "s4", "s13", "s18"]));

  const toggleLike = (id: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const ql = q.trim().toLowerCase();

  // Filter feed items based on active tab and search
  const feedItems = useMemo(() => {
    let list = [...feed];

    if (tab === "Tech & Aero") {
      list = list.filter(
        (f) =>
          f.topics.includes("tech") ||
          f.topics.includes("regs2026") ||
          f.kind === "analysis" ||
          f.sourceId === "scarbs" ||
          f.sourceId === "fabrega" ||
          f.sourceId === "dataanalysis"
      );
    } else if (tab === "Rumors & Whispers") {
      list = list.filter(
        (f) =>
          f.topics.includes("silly") ||
          f.topics.includes("business") ||
          f.title.toLowerCase().includes("rumor") ||
          f.text.toLowerCase().includes("whisper") ||
          f.title.toLowerCase().includes("whisper") ||
          f.sourceId === "medland" ||
          f.sourceId === "gridnotes"
      );
    } else if (tab === "Reels & Media") {
      list = list.filter((f) => f.kind === "video" || !!f.media || !!f.video || f.sourceId === "kymillman" || f.sourceId === "wtf1" || f.sourceId === "lissie");
    }

    if (ql) {
      list = list.filter(
        (f) =>
          f.title.toLowerCase().includes(ql) ||
          f.text.toLowerCase().includes(ql) ||
          (getSource(f.sourceId)?.name ?? "").toLowerCase().includes(ql) ||
          (getSource(f.sourceId)?.handle ?? "").toLowerCase().includes(ql)
      );
    }

    // Sort by recency
    return list.sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [tab, ql]);

  // Categories data
  type CategoryRow = {
    kind: EntityKind;
    id: string;
    title: string;
    sub: string;
    color?: string | undefined;
    to: "/team/$id" | "/driver/$id" | "/source/$id" | null;
    avatar: string;
  };

  const categoryData: Record<"Teams" | "Drivers" | "Sources", CategoryRow[]> = {
    Teams: teams.map((t) => ({
      kind: "teams",
      id: t.id,
      title: t.name,
      sub: `${t.base} · ${t.engine} PU · ${t.titles} titles`,
      color: t.color,
      to: "/team/$id",
      avatar: t.short,
    })),
    Drivers: drivers.map((d) => ({
      kind: "drivers",
      id: d.id,
      title: d.name,
      sub: `#${d.number} · ${getTeam(d.teamId)?.name ?? "F1"} · ${d.nationality}`,
      color: getTeam(d.teamId)?.color,
      to: "/driver/$id",
      avatar: d.code,
    })),
    Sources: sources.map((s) => ({
      kind: "sources",
      id: s.id,
      title: s.name,
      sub: s.kind === "publisher" ? `Publisher · ${s.region} · ${s.followers}` : `Creator ${s.handle ?? ""} on ${s.platform ?? "Social"} · ${s.followers}`,
      color: undefined,
      to: "/source/$id",
      avatar: s.name.slice(0, 2).toUpperCase(),
    })),
  };

  const categoryRows = useMemo(() => {
    if (tab === "Teams") return categoryData.Teams;
    if (tab === "Drivers") return categoryData.Drivers;
    if (tab === "Sources") return categoryData.Sources;
    return [];
  }, [tab]);

  const filteredCategoryRows = useMemo(() => {
    if (!ql) return categoryRows;
    return categoryRows.filter((r) => (r.title + " " + r.sub).toLowerCase().includes(ql));
  }, [categoryRows, ql]);

  const isFeedTab = tab === "For You" || tab === "Tech & Aero" || tab === "Rumors & Whispers" || tab === "Reels & Media";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow="Discover & Social" title="Explore" />

      {/* AI Paddock Scout: Web Scraping & Intel Radar */}
      <AiPaddockScout />

      {/* Universal Search Bar */}
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search tweets, reels, stories, teams, drivers…"
          aria-label="Universal search"
          className="h-12 w-full rounded-2xl border border-input bg-card pl-12 pr-4 text-base outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Navigation Tabs */}
      <TabBar tabs={TABS} value={tab} onChange={setTab} />

      {/* Social Feed View (For You, Tech, Rumors, Reels) */}
      {isFeedTab && (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <SocialPostCard
              key={item.id}
              item={item}
              isLiked={likedPosts.has(item.id)}
              onToggleLike={toggleLike}
            />
          ))}

          {feedItems.length === 0 && (
            <EmptyState
              title="No posts found"
              body="Try clearing your search query or switching tabs."
              action={
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  Reset Feed
                </button>
              }
            />
          )}
        </div>
      )}

      {/* Directory Grid View (Teams, Drivers, Sources) */}
      {!isFeedTab && (
        <div>
          {filteredCategoryRows.length === 0 ? (
            <EmptyState title="No matches" body="Try another search term." />
          ) : (
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {filteredCategoryRows.map((r) => {
                const inner = (
                  <>
                    <Avatar label={r.avatar} color={r.color} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-foreground">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>
                    </span>
                  </>
                );
                return (
                  <li
                    key={r.kind + r.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-all hover:border-foreground/30 hover:shadow-md"
                  >
                    {r.to ? (
                      <Link to={r.to} params={{ id: r.id }} className="flex min-w-0 flex-1 items-center gap-3">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3">{inner}</div>
                    )}
                    <FollowButton kind={r.kind} id={r.id} size="sm" />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

