import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { BarChart3, ChevronDown, Pause, Play, Sparkles, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { fmt, getSource, getTeam, type FeedItem } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { SaveButton, SourceLink, DemoBadge } from "./bits";
import { cn } from "@/lib/utils";

export function InlineMedia({ item }: { item: FeedItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const autoplay = useStore((s) => s.privacy.autoplay);
  const src = getSource(item.sourceId);

  if (item.embedUrl?.startsWith("social-x:")) return (
    <div className="overflow-hidden rounded-lg border border-border bg-background p-3">
      <blockquote className="twitter-tweet"><a href={item.url}>View this post on X</a></blockquote>
      <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8" />
    </div>
  );
  if (item.embedUrl?.startsWith("social-instagram:")) return (
    <div className="overflow-hidden rounded-lg border border-border bg-background p-2">
      <blockquote className="instagram-media" data-instgrm-permalink={item.url} data-instgrm-version="14" style={{ margin: "0 auto", width: "100%" }}><a href={item.url}>View this post on Instagram</a></blockquote>
      <script async src="https://www.instagram.com/embed.js" />
    </div>
  );
  if (item.embedUrl) return (
    <div className="overflow-hidden rounded-lg bg-foreground">
      <iframe src={item.embedUrl} title={`${item.title} player`} className="aspect-video w-full" loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      <p className="bg-card px-3 py-2 text-xs text-muted-foreground">Embedded from {src?.platform ?? src?.name} · <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline">Open original</a></p>
    </div>
  );

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!autoplay) { v.pause(); setPlaying(false); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.6) v.play().then(() => setPlaying(true)).catch(() => {});
      else { v.pause(); setPlaying(false); }
    }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => { io.disconnect(); v.pause(); };
  }, [autoplay]);

  if (failed) return <p className="rounded-lg border border-border p-3 text-sm text-muted-foreground">Video unavailable. <SourceLink href={item.url}>Open source</SourceLink></p>;
  if (item.video && item.embeddable) {
    return (
      <div className="relative overflow-hidden rounded-lg bg-foreground">
        <video onError={() => setFailed(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} ref={ref} src={item.video} poster={item.media} muted={muted} loop playsInline className="aspect-video w-full object-cover" aria-label={`${item.title} video`} />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <Button variant="unstyled" type="button" aria-label={playing ? "Pause" : "Play"} onClick={(e) => { e.preventDefault(); const v = ref.current; if (!v) return; if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } }}
            className="rounded-full bg-background/85 p-2 text-foreground backdrop-blur">{playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</Button>
          <span className="rounded bg-background/85 px-2 py-0.5 text-[10px] font-semibold uppercase text-foreground">Archive demo · 2011 Australian GP</span>
          <Button variant="unstyled" type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={(e) => { e.preventDefault(); setMuted((m) => !m); }}
            className="inline-flex items-center gap-1 rounded-full bg-background/85 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{muted ? "Tap to unmute" : "Mute"}
          </Button>
        </div>
        <p className="relative bg-card p-2 text-[10px] text-muted-foreground">Illustrative archive, not this post’s original video · <a className="underline" href="https://commons.wikimedia.org/wiki/File:2011_Australian_GP_-_Video.ogv" target="_blank" rel="noopener noreferrer">Takashi / Takot</a> · <a className="underline" href="https://creativecommons.org/licenses/by/2.0/" target="_blank" rel="noopener noreferrer">CC BY 2.0</a> · transcoded</p>
      </div>
    );
  }
  if (item.video && !item.embeddable) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        {item.media && <img src={item.media} alt="" loading="lazy" width={1280} height={720} className="aspect-video w-full object-cover opacity-80" />}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10 p-4 text-center text-background">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-black/35 backdrop-blur-sm"><Play className="ml-0.5 h-5 w-5 fill-current" /></span>
          <p className="text-sm font-bold">Reel preview</p>
          <p className="text-xs text-background/85">Open the original on {src?.platform}</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground">Watch on {src?.platform} <ExternalLink className="h-3.5 w-3.5" /></a>
        </div>
      </div>
    );
  }
  if (item.media && item.kind === "video") return <a href={item.url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden rounded-lg"><img src={item.media} alt="Video preview" loading="lazy" width={1280} height={720} className="aspect-video w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><span className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold"><Play className="h-4 w-4 fill-current" /> Play on {src?.name}</span></span></a>;
  if (item.media) return <img src={item.media} alt="" loading="lazy" width={1280} height={720} className="aspect-video w-full rounded-lg object-cover" />;
  return null;
}

export function AiSummary({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button variant="unstyled" type="button" aria-expanded={open} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className="inline-flex items-center gap-1.5 rounded-full bg-ai px-3 py-1.5 text-xs font-semibold text-ai-foreground">
        <Sparkles className="h-3.5 w-3.5" /> AI summary <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </Button>
      {open && (
        <div className="mt-2 rounded-lg border-l-2 border-ai-foreground bg-ai/60 p-3 text-sm text-foreground" onClick={(e) => e.preventDefault()}>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ai-foreground">AI-generated summary · demo · check the original</p>
          {text}
        </div>
      )}
    </div>
  );
}

export function FeedCard({ item, live = false }: { item: FeedItem; live?: boolean }) {
  const src = getSource(item.sourceId); if (!src) return null;
  const kindLabel = { article: "Article", social: "Post", video: "Reel / Video", analysis: "Data card" }[item.kind];
  return (
    <article className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link to="/source/$id" params={{ id: src.id }} className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">{src.name.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{src.name} {src.handle && <span className="font-normal text-muted-foreground">{src.handle}</span>}</span>
            <span className="block text-xs text-muted-foreground"><time dateTime={item.time}>{fmt(item.time)}</time> · {kindLabel}</span>
          </span>
        </Link>
        <SaveButton item={{ id: item.id, type: item.kind === "article" ? "story" : "post", title: item.title, href: `/story/${item.id}` }} />
      </div>
      {item.discovery && <p className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-primary"><Sparkles className="h-3 w-3" /> {item.discovery}</p>}
      {live ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="block"><h3 className="text-lg font-bold leading-snug group-hover:text-primary md:text-xl">{item.title}</h3><p className="mt-2 text-[15px] leading-relaxed text-foreground/85">{item.text}</p></a> : <Link to="/story/$id" params={{ id: item.id }} className="block"><h3 className="text-lg font-bold leading-snug group-hover:text-primary md:text-xl">{item.title}</h3><p className="mt-2 text-[15px] leading-relaxed text-foreground/85">{item.text}</p></Link>}
      {(item.media || item.video || item.embedUrl) && <div className="mt-3"><InlineMedia item={item} /></div>}
      {item.kind === "video" && !item.embedUrl && !item.video && <div className="mt-3"><a href={item.url} target="_blank" rel="noopener noreferrer" className="flex aspect-video items-center justify-center rounded-lg bg-muted text-sm font-semibold hover:bg-secondary"><Play className="mr-2 h-5 w-5" /> Play video on {src.name} <ExternalLink className="ml-2 h-4 w-4" /></a></div>}
      {item.evidence && (
        <div className="mt-3 rounded-lg border border-border bg-muted/50 p-3">
          <p className="mb-1 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"><BarChart3 className="h-3.5 w-3.5" /> Evidence</p>
          <ul className="space-y-1">{item.evidence.map((e) => <li key={e.label}><SourceLink href={e.url}>{e.label}</SourceLink></li>)}</ul>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.teams.slice(0, 3).map((t) => <span key={t} className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"><span className="h-1.5 w-1.5 rounded-full" style={{ background: getTeam(t)?.color }} />{getTeam(t)?.name}</span>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        {live ? <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-700 dark:text-green-400"><span className="h-1.5 w-1.5 rounded-full bg-current" /> Live source</span> : <AiSummary text={item.ai} />}
        <div className="flex items-center gap-3">{live ? <span className="text-xs text-muted-foreground">{src.name}</span> : <DemoBadge>Demo</DemoBadge>}<SourceLink href={item.url} /></div>
      </div>
    </article>
  );
}
