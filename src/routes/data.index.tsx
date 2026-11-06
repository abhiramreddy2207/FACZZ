import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, DemoBadge } from "@/components/bits";
import { DataMenu } from "@/components/data-menu";
import { datasets } from "@/lib/data-catalog";

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
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const filtered = query
    ? datasets.filter((d) => (d.label + " " + d.desc + " " + d.group + " " + d.provider).toLowerCase().includes(query))
    : datasets;

  const groups = Array.from(new Set(filtered.map((d) => d.group)));

  return (
    <div>
      <PageHeader eyebrow="Numbers" title="Data">
        <DemoBadge>Sample datasets</DemoBadge>
      </PageHeader>
      <DataMenu />

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search datasets, timing, standings, telemetry…"
          aria-label="Search datasets"
          className="h-10 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {group}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered
                .filter((d) => d.group === group)
                .map((d) => (
                  <Link
                    key={d.slug}
                    to="/data/$slug"
                    params={{ slug: d.slug }}
                    className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold group-hover:text-primary">{d.label}</h3>
                        <span className="text-xs text-muted-foreground">→</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{d.desc}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{d.provider}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No datasets matched "{q}".</p>
        )}
      </div>
    </div>
  );
}
