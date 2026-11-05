import { createFileRoute, notFound } from "@tanstack/react-router";
import { getSource, feed } from "@/lib/demo-data";
import { Avatar, FollowButton, SourceLink, EmptyState } from "@/components/bits";
import { FeedCard } from "@/components/feed-card";

export const Route = createFileRoute("/source/$id")({
  loader: ({ params }) => { const s = getSource(params.id); if (!s) throw notFound(); return { name: s.name }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Source"} — Faczz` },
    { name: "description", content: `Recent F1 coverage from ${loaderData?.name}.` },
    { property: "og:title", content: `${loaderData?.name ?? "Source"} — Faczz` },
    { property: "og:description", content: `Recent F1 coverage from ${loaderData?.name}.` },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => {
    const { id } = Route.useParams(); const s = getSource(id); if (!s) return null; const items = feed.filter((f) => f.sourceId === id);
    return (
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-4">
          <Avatar label={s.name.slice(0, 2).toUpperCase()} />
          <div className="flex-1"><h1 className="text-3xl font-extrabold">{s.name}</h1>
            <p className="text-sm text-muted-foreground">{s.kind === "publisher" ? "Publisher" : `Creator · ${s.handle} on ${s.platform}`} · {s.region} · {s.followers}</p></div>
          <FollowButton kind="sources" id={id} />
        </div>
        <p className="mb-2">{s.blurb}</p>
        <SourceLink href={s.url}>{s.kind === "publisher" ? "Visit publisher site" : `Open ${s.platform} account`}</SourceLink>
        <h2 className="mb-3 mt-6 font-bold">Recent demo {s.kind === "publisher" ? "articles" : "posts"}</h2>
        <div className="space-y-4">{items.length ? items.map((f) => <FeedCard key={f.id} item={f} />) : <EmptyState title="Nothing recent" body="No demo items from this source yet." />}</div>
      </div>
    );
  },
});
