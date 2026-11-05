import { createFileRoute, notFound } from "@tanstack/react-router";
import { getDriver, getTeam, driverPoints } from "@/lib/demo-data";
import { EntityProfile } from "@/components/entity-profile";

export const Route = createFileRoute("/driver/$id")({
  loader: ({ params }) => { const d = getDriver(params.id); if (!d) throw notFound(); return { name: d.name }; },
  head: ({ loaderData }) => ({ meta: [
    { title: `${loaderData?.name ?? "Driver"} — Faczz` },
    { name: "description", content: `${loaderData?.name} news, stats and sessions.` },
    { property: "og:title", content: `${loaderData?.name ?? "Driver"} — Faczz` },
    { property: "og:description", content: `${loaderData?.name} news, stats and sessions.` },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => {
    const { id } = Route.useParams(); const d = getDriver(id); if (!d) return null; const t = getTeam(d.teamId); if (!t) return null;
    const pts = driverPoints.find((p) => p.id === id)?.pts;
    return <EntityProfile kind="drivers" id={id} title={d.name} sub={`#${d.number} · ${t.name} · ${d.nationality}`} avatar={d.code} color={t.color} url={d.url}
      stats={[["Points (sample)", pts ?? 0], ["Wins", d.wins], ["Podiums", d.podiums], ["Poles", d.poles]]}
      filter={(f) => f.drivers.includes(id)} />;
  },
});
