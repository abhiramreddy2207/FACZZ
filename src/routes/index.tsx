import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { feed, getTeam, getDriver, getTopic, getSource, DEMO_UPDATED, fmt } from "@/lib/demo-data";
import { setState, useStore } from "@/lib/store";
import { Chip, DemoBadge, EmptyState } from "@/components/bits";
import { FeedCard } from "@/components/feed-card";
import { RaceCard } from "@/components/race-card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Faczz — Your F1 news & race feed" },
    { name: "description", content: "Personalised F1 feed: race status, source-linked articles, creator posts and discovered data cards." },
    { property: "og:title", content: "Faczz — Your F1 feed" },
    { property: "og:description", content: "Race status, source-linked F1 news and data in one personalised feed." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Home,
});

function Home() {
  const s = useStore((x) => x);
  const [chip, setChip] = useState("foryou");
  const [panel, setPanel] = useState(false);

  const chips = [
    { id: "foryou", label: "For You" },
    { id: "all", label: "All F1" },
    ...s.teams.map((id) => ({ id: `t:${id}`, label: getTeam(id)?.name ?? id, color: getTeam(id)?.color })),
    ...s.drivers.map((id) => ({ id: `d:${id}`, label: getDriver(id)?.name ?? id, color: getTeam(getDriver(id)?.teamId ?? "")?.color })),
    ...s.topics.map((id) => ({ id: `p:${id}`, label: getTopic(id)?.name ?? id })),
    ...s.sources.map((id) => ({ id: `s:${id}`, label: getSource(id)?.name ?? id })),
  ];

  const items = useMemo(() => {
    const score = (f: (typeof feed)[number]) =>
      f.teams.filter((t) => s.teams.includes(t)).length * 3 + f.drivers.filter((d) => s.drivers.includes(d)).length * 3 +
      f.topics.filter((t) => s.topics.includes(t)).length * 2 + (s.sources.includes(f.sourceId) ? 2 : 0);
    const recent = (f: (typeof feed)[number]) => +new Date(f.time);
    let list = [...feed];
    const [k, id] = chip.split(":");
    if (k === "t") list = list.filter((f) => f.teams.includes(id));
    if (k === "d") list = list.filter((f) => f.drivers.includes(id));
    if (k === "p") list = list.filter((f) => f.topics.includes(id));
    if (k === "s") list = list.filter((f) => f.sourceId === id);
    if (chip === "foryou" && s.privacy.personalize) list.sort((a, b) => score(b) * 864e5 * 0.5 + recent(b) - (score(a) * 864e5 * 0.5 + recent(a)));
    else list.sort((a, b) => recent(b) - recent(a));
    return list;
  }, [chip, s.teams, s.drivers, s.topics, s.sources, s.privacy.personalize]);

  const raceFirst = s.homeEmphasis !== "feed";
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Home</h1>
          <p className="text-xs text-muted-foreground">Personalised + recent · feed refreshed {fmt(DEMO_UPDATED)} <DemoBadge className="ml-1" /></p>
        </div>
        <Button variant="unstyled" onClick={() => setPanel(!panel)} aria-expanded={panel} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Customize
        </Button>
      </div>

      {panel && (
        <div className="mb-5 grid gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
          <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Home emphasis</legend>
            <div className="flex flex-wrap gap-2">{(["balanced", "race", "feed"] as const).map((m) => <Chip key={m} active={s.homeEmphasis === m} onClick={() => setState({ homeEmphasis: m })}>{{ balanced: "Balanced", race: "Race first", feed: "Feed first" }[m]}</Chip>)}</div>
          </fieldset>
          <fieldset><legend className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Race card state (demo preview)</legend>
            <div className="flex flex-wrap gap-2">{(["auto", "next", "live", "results"] as const).map((m) => <Chip key={m} active={s.raceMode === m} onClick={() => setState({ raceMode: m })}>{{ auto: "Auto", next: "Next session", live: "Live now", results: "Results" }[m]}</Chip>)}</div>
          </fieldset>
          <Link to="/welcome" className="text-sm font-semibold text-primary">Edit interests →</Link>
        </div>
      )}

      <div className={cn("grid gap-5", s.homeEmphasis === "balanced" && "lg:grid-cols-[1fr_320px]")}>
        <div className={cn(!raceFirst && "order-2", s.homeEmphasis === "balanced" && "lg:order-2")}>
          <div className={cn(s.homeEmphasis === "balanced" && "lg:sticky lg:top-20")}><RaceCard /></div>
        </div>
        <div className={cn(s.homeEmphasis === "balanced" && "lg:order-1")}>
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" role="toolbar" aria-label="Feed filters">
            {chips.map((c) => <Chip key={c.id} color={"color" in c ? c.color : undefined} active={chip === c.id} onClick={() => setChip(c.id)}>{c.label}</Chip>)}
            <Link to="/explore" className="shrink-0 rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm text-muted-foreground">+ Follow more</Link>
          </div>
          <div className="space-y-4">
            {items.length ? items.map((f) => <FeedCard key={f.id} item={f} />) : <EmptyState title="Nothing here yet" body="No demo stories match this filter. Try All F1 or follow more sources." action={<Button variant="unstyled" onClick={() => setChip("all")} className="text-sm font-semibold text-primary">Show All F1</Button>} />}
          </div>
        </div>
      </div>
    </div>
  );
}
