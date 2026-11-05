import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { setState, useStore } from "@/lib/store";
import { PageHeader, Chip, EmptyState } from "@/components/bits";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [
    { title: "Saved — Faczz" },
    { name: "description", content: "Bookmarked stories, posts and datasets in research collections." },
    { property: "og:title", content: "Saved — Faczz" },
    { property: "og:description", content: "Your research collections." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Saved,
});

function Saved() {
  const bms = useStore((s) => s.bookmarks); const cols = useStore((s) => s.collections);
  const [filter, setFilter] = useState<string>("all"); const [name, setName] = useState("");
  const list = bms.filter((b) => filter === "all" || (filter === "none" ? !b.collectionId : b.collectionId === filter));
  return (
    <div>
      <PageHeader eyebrow="Research" title="Saved" />
      <form className="mb-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; setState((s) => ({ collections: [...s.collections, { id: `c-${Date.now()}`, name: name.trim() }] })); setName(""); }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New collection name" aria-label="New collection name" className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 text-sm" />
        <Button variant="unstyled" className="rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Create</Button>
      </form>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <Chip active={filter === "all"} onClick={() => setFilter("all")}>All ({bms.length})</Chip>
        <Chip active={filter === "none"} onClick={() => setFilter("none")}>Unsorted</Chip>
        {cols.map((c) => <span key={c.id} className="flex items-center"><Chip active={filter === c.id} onClick={() => setFilter(c.id)}>{c.name}</Chip>
          <Button variant="unstyled" aria-label={`Delete ${c.name}`} onClick={() => { setState((s) => ({ collections: s.collections.filter((x) => x.id !== c.id), bookmarks: s.bookmarks.map((b) => b.collectionId === c.id ? { ...b, collectionId: null } : b) })); if (filter === c.id) setFilter("all"); }} className="p-1 text-muted-foreground"><Trash2 className="h-3.5 w-3.5" /></Button></span>)}
      </div>
      {!list.length ? <EmptyState title="Nothing saved yet" body="Tap the bookmark on any story, post or dataset to save it here." action={<Link to="/" className="text-sm font-semibold text-primary">Browse Home</Link>} /> : (
        <ul className="space-y-2">{list.map((b) => (
          <li key={b.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
            <a href={b.href} className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{b.type}</p><p className="truncate font-semibold">{b.title}</p></a>
            <select aria-label="Move to collection" value={b.collectionId ?? ""} onChange={(e) => setState((s) => ({ bookmarks: s.bookmarks.map((x) => x.id === b.id ? { ...x, collectionId: e.target.value || null } : x) }))} className="h-9 rounded-lg border border-input bg-background px-2 text-sm">
              <option value="">Unsorted</option>{cols.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Button variant="unstyled" aria-label="Remove" onClick={() => setState((s) => ({ bookmarks: s.bookmarks.filter((x) => x.id !== b.id) }))} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
          </li>))}</ul>
      )}
    </div>
  );
}
