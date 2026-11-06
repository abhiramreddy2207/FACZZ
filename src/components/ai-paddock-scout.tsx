import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  TrendingUp,
  Cpu,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PRESET_INTEL, searchAiIntel, type AiIntelReport } from "@/lib/ai-scout";
import { feed, getSource, fmt } from "@/lib/demo-data";
import { toggleBookmark, useStore } from "@/lib/store";
import { toast } from "sonner";

export function AiPaddockScout({
  onSelectFeedTag,
}: {
  onSelectFeedTag?: (tag: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<AiIntelReport | null>(PRESET_INTEL[0] ?? null);
  const isSaved = useStore((s) =>
    activeReport ? s.bookmarks.some((b) => b.id === activeReport.id) : false
  );

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setQuery(q);
    try {
      // Simulate rapid AI multi-source query
      await new Promise((resolve) => setTimeout(resolve, 350));
      const result = await searchAiIntel(q);
      setActiveReport(result);
    } catch {
      toast.error("Failed to fetch intelligence");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = () => {
    if (!activeReport) return;
    toggleBookmark({
      id: activeReport.id,
      type: "dataset",
      title: activeReport.headline,
      href: `/explore?q=${encodeURIComponent(activeReport.query)}`,
    });
    toast(isSaved ? "Removed from Saved" : "Intel saved to Research Collections");
  };

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-primary/10 via-card to-card p-4 shadow-sm md:p-5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-base font-extrabold tracking-tight md:text-lg">
                AI Paddock Scout
              </h2>
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                Live Web Intel
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time internet radar for technical scoops, paddock rumors & viral debates
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Collapse AI Scout" : "Expand AI Scout"}
          className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-4 space-y-4">
          {/* Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask AI to scrape rumors, 2026 aero, telemetry, or contract talks…"
                className="h-11 w-full rounded-xl border border-border bg-background/80 pl-10 pr-4 text-sm placeholder:text-muted-foreground/80 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              <span>Scout</span>
            </button>
          </form>

          {/* Quick Trending Topics Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Trending Intel:
            </span>
            {PRESET_INTEL.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setQuery(item.query);
                  setActiveReport(item);
                }}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                  activeReport?.id === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border/80 bg-background/60 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {item.category === "tech" && <Cpu className="h-3 w-3 text-cyan-400" />}
                {item.category === "rumor" && <Flame className="h-3 w-3 text-amber-500" />}
                {item.category === "telemetry" && <TrendingUp className="h-3 w-3 text-emerald-400" />}
                <span>
                  {item.category === "tech"
                    ? "2026 Active Aero"
                    : item.category === "rumor"
                    ? "Cadillac 2027 Rumors"
                    : "Interlagos Rain & Grip"}
                </span>
              </button>
            ))}
          </div>

          {/* Active Intel Report Box */}
          {activeReport && (
            <div className="rounded-xl border border-border bg-background/90 p-4 shadow-sm">
              {/* Category & Status Bar */}
              <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                      activeReport.category === "rumor"
                        ? "bg-amber-500/10 text-amber-500"
                        : activeReport.category === "tech"
                        ? "bg-cyan-500/10 text-cyan-500"
                        : "bg-emerald-500/10 text-emerald-500"
                    }`}
                  >
                    {activeReport.category === "rumor" ? (
                      <ShieldAlert className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    )}
                    {activeReport.reliability}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground">{activeReport.confidence}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveReport}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {isSaved ? (
                      <BookmarkCheck className="h-3.5 w-3.5 fill-current text-primary" />
                    ) : (
                      <Bookmark className="h-3.5 w-3.5" />
                    )}
                    <span>{isSaved ? "Saved" : "Save Intel"}</span>
                  </button>
                </div>
              </div>

              {/* Title & Synthesis */}
              <h3 className="font-display text-base font-bold text-foreground md:text-lg">
                {activeReport.headline}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                {activeReport.summary}
              </p>

              {/* Key Takeaways */}
              <div className="mt-3.5 rounded-lg bg-secondary/50 p-3">
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Key Findings & Telemetry Signals:
                </h4>
                <ul className="space-y-1.5 text-xs text-foreground/90">
                  {activeReport.keyFindings.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cited Paddock & Social Sources */}
              <div className="mt-3.5 border-t border-border/60 pt-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Original Source Citations (X & Instagram):
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeReport.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs transition-colors hover:border-foreground/30 hover:bg-muted"
                    >
                      <span className="rounded bg-secondary px-1 py-0.5 text-[10px] font-extrabold text-muted-foreground group-hover:text-foreground">
                        {src.platform ?? "Web"}
                      </span>
                      <span className="font-bold text-foreground">
                        {src.handle ?? src.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="mt-3 text-[10px] text-muted-foreground/80 italic">
                * Note: AI Paddock Scout groups and synthesizes public internet reports, telemetry
                traces, and paddock accounts. Rumors are clearly separated from confirmed FIA directives.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
