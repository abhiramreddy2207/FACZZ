import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { feed, getItem, getSource, fmt } from "@/lib/demo-data";
import { AiSummary, InlineMedia } from "@/components/feed-card";
import { SaveButton, SourceLink, DemoBadge } from "@/components/bits";

export const Route = createFileRoute("/story/$id")({
  loader: ({ params }) => { const i = getItem(params.id); if (!i) throw notFound(); return { title: i.title, text: i.text }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.title ?? "Story"} — Faczz` },
    { name: "description", content: loaderData?.text.slice(0, 150) ?? "" },
    { property: "og:title", content: loaderData?.title ?? "Story" },
    { property: "og:description", content: loaderData?.text.slice(0, 150) ?? "" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Story,
});

function Story() {
  const { id } = Route.useParams();
  const it = getItem(id); if (!it) return null; const src = getSource(it.sourceId); if (!src) return null;
  const related = feed.filter((f) => f.id !== id && (f.teams.some((t) => it.teams.includes(t)) || f.topics.some((t) => it.topics.includes(t)))).slice(0, 4);
  return (
    <article className="mx-auto max-w-2xl">
      <Link to="/source/$id" params={{ id: src.id }} className="text-sm font-semibold text-primary">{src.name}</Link>
      <h1 className="mt-1 text-3xl font-extrabold">{it.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{fmt(it.time)} · <DemoBadge>Demo excerpt</DemoBadge></p>
      <div className="mt-4"><InlineMedia item={it} /></div>
      <p className="mt-4 text-lg leading-relaxed">{it.text}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3"><SourceLink href={it.url}>Read original on {src.name}</SourceLink><SaveButton label item={{ id: it.id, type: it.kind === "article" ? "story" : "post", title: it.title, href: `/story/${it.id}` }} /></div>
      <div className="mt-4"><AiSummary text={it.ai} /></div>
      <h2 className="mt-8 mb-2 font-bold">Related coverage</h2>
      <ul className="space-y-2">{related.map((r) => <li key={r.id}><Link to="/story/$id" params={{ id: r.id }} className="block rounded-xl border border-border bg-card p-3"><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{getSource(r.sourceId)?.name} · {fmt(r.time)}</p></Link></li>)}</ul>
    </article>
  );
}
