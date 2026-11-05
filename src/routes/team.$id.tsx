import { createFileRoute, notFound } from "@tanstack/react-router";
import { getTeam, drivers, teamPoints } from "@/lib/demo-data";
import { EntityProfile } from "@/components/entity-profile";

export const Route = createFileRoute("/team/$id")({
  loader: ({ params }) => { const t = getTeam(params.id); if (!t) throw notFound(); return { name: t.name }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Team"} — Faczz` },
    { name: "description", content: `${loaderData?.name} news, stats and sessions.` },
    { property: "og:title", content: `${loaderData?.name ?? "Team"} — Faczz` },
    { property: "og:description", content: `${loaderData?.name} news, stats and sessions.` },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => {
    const { id } = Route.useParams(); const t = getTeam(id); if (!t) return null;
    const pos = teamPoints.findIndex((p) => p.id === id) + 1;
    return <EntityProfile kind="teams" id={id} title={t.name} sub={`${t.base} · Principal ${t.principal}`} avatar={t.short} color={t.color} url={t.url}
      stats={[["Standing (sample)", `P${pos}`], ["Titles", t.titles], ["Power unit", t.engine], ["Founded", t.founded]]}
      filter={(f) => f.teams.includes(id)}
      extra={<p className="text-sm">Drivers: {drivers.filter((x) => x.teamId === id).map((x) => x.name).join(" · ")}</p>} />;
  },
});
