import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, DemoBadge } from "@/components/bits";
import { DataMenu } from "@/components/data-menu";

export const Route = createFileRoute("/data/")({
  head: () => ({ meta: [
    { title: "Data — Faczz" },
    { name: "description", content: "F1 timing, standings, stats, pit stops, tech updates and track DNA." },
    { property: "og:title", content: "F1 Data — Faczz" },
    { property: "og:description", content: "Searchable F1 data hub with charts, tables and sources." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DataHome,
});

function DataHome() {
  return (
    <div>
      <PageHeader eyebrow="Numbers" title="Data"><DemoBadge>Sample datasets</DemoBadge></PageHeader>
      <DataMenu />
      <p className="text-sm text-muted-foreground">Choose a section to explore its charts, tables, and source details.</p>
    </div>
  );
}
