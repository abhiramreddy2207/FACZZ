import { createFileRoute } from "@tanstack/react-router";

type LiveEntry = {
  id: string;
  sourceId: "bbc" | "autosport";
  kind: "article" | "video";
  title: string;
  text: string;
  time: string;
  url: string;
  media?: string;
  embedUrl?: string;
};

const feeds = [
  { sourceId: "bbc" as const, kind: "article" as const, url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml" },
  { sourceId: "autosport" as const, kind: "article" as const, url: "https://www.autosport.com/rss/f1/news/" },
  { sourceId: "autosport" as const, kind: "video" as const, url: "https://www.autosport.com/rss/f1/videos/" },
];

function decode(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")) : "";
}

function embedFor(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const ytPath = parsed.pathname.match(/\/(?:shorts|live|embed)\/([\w-]{11})/);
    const ytId = host === "youtu.be" ? parsed.pathname.slice(1).match(/^([\w-]{11})$/)?.[1] : parsed.searchParams.get("v") ?? ytPath?.[1];
    if ((host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") && ytId) {
      const id = ytId;
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    const tiktok = parsed.pathname.match(/\/@[^/]+\/video\/(\d+)/);
    if (host.endsWith("tiktok.com") && tiktok) return `https://www.tiktok.com/player/v1/${tiktok[1]}?autoplay=0`;
    const xPost = parsed.pathname.match(/\/status\/(\d+)/);
    if ((host === "x.com" || host === "twitter.com") && xPost) return `social-x:${xPost[1]}`;
    const instagramPost = parsed.pathname.match(/\/(?:p|reel|reels|tv)\/([\w-]+)/);
    if (host === "instagram.com" && instagramPost) return `social-instagram:${instagramPost[1]}`;
    return undefined;
  } catch { return undefined; }
}

async function readFeed(feed: typeof feeds[number]): Promise<LiveEntry[]> {
  try {
    const response = await fetch(feed.url, { headers: { "user-agent": "Faczz/1.0 (F1 news reader)" }, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 15).map(([item]) => {
      const title = tag(item, "title");
      const url = tag(item, "link");
      const description = tag(item, "description").slice(0, 360);
      const date = tag(item, "pubDate");
      if (!title || !url || !/^https:\/\//.test(url)) return null;
      const enclosureTag = item.match(/<(?:media:content|enclosure)\b[^>]*>/i)?.[0];
      const media = enclosureTag?.match(/url=["']([^"']+)["']/i)?.[1];
      const mediaType = enclosureTag?.match(/type=["']([^"']+)["']/i)?.[1] ?? "";
      const inlineVideoUrl = item.match(/https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=[\w-]{11}|shorts\/[\w-]{11})|youtu\.be\/[\w-]{11}|tiktok\.com\/@[^\s"'<>]+\/video\/\d+|(?:x|twitter)\.com\/[\w]+\/status\/\d+|instagram\.com\/(?:p|reel|reels)\/[\w-]+)/i)?.[0];
      const embedUrl = embedFor(url) ?? (inlineVideoUrl ? embedFor(inlineVideoUrl) : undefined);
      return {
        id: `${feed.sourceId}-${BufferlessHash(url)}`,
        sourceId: feed.sourceId,
        kind: feed.kind,
        title,
        text: description,
        time: Number.isNaN(Date.parse(date)) ? new Date().toISOString() : new Date(date).toISOString(),
        url,
        ...(media && /^https:\/\//.test(media) ? (mediaType.startsWith("video/") ? { video: media, embeddable: true } : { media }) : {}),
        ...(embedUrl ? { embedUrl } : {}),
      } satisfies LiveEntry;
    }).filter((entry): entry is LiveEntry => entry !== null);
  } catch { return []; }
}

function BufferlessHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(36);
}

export const Route = createFileRoute("/api/live-feed")({
  server: {
    handlers: {
      GET: async () => {
        const results = await Promise.all(feeds.map(readFeed));
        const items = results.flat().sort((a, b) => Date.parse(b.time) - Date.parse(a.time));
        return Response.json({ items, updatedAt: new Date().toISOString(), sources: feeds.length }, {
          headers: { "cache-control": "public, max-age=120, s-maxage=120" },
        });
      },
    },
  },
});
