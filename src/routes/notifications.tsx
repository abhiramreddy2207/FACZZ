import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { notifications, fmt } from "@/lib/demo-data";
import { setState, useStore } from "@/lib/store";
import { PageHeader, EmptyState } from "@/components/bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [
    { title: "Notifications — Faczz" },
    { name: "description", content: "Session alerts and source updates." },
    { property: "og:title", content: "Notifications — Faczz" },
    { property: "og:description", content: "Session alerts and source updates." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Inbox,
});

function Inbox() {
  const read = useStore((s) => s.readNotifs); const cleared = useStore((s) => s.clearedNotifs);
  const list = notifications.filter((n) => !cleared.includes(n.id));
  return (
    <div>
      <PageHeader eyebrow="Inbox · demo alerts" title="Notifications">
        <div className="flex gap-2 text-sm font-semibold">
          <Button variant="unstyled" onClick={() => setState({ readNotifs: notifications.map((n) => n.id) })} className="rounded-full border border-border px-3 py-1.5">Mark all read</Button>
          <Button variant="unstyled" onClick={() => setState({ clearedNotifs: notifications.map((n) => n.id) })} className="rounded-full border border-border px-3 py-1.5">Clear all</Button>
        </div>
      </PageHeader>
      {!list.length ? <EmptyState title="All clear" body="No notifications. Configure alerts in Profile." action={<Button variant="unstyled" onClick={() => setState({ clearedNotifs: [], readNotifs: [] })} className="text-sm font-semibold text-primary">Restore demo alerts</Button>} /> : (
        <ul className="space-y-2">{list.map((n) => { const unread = !read.includes(n.id); return (
          <li key={n.id} className={cn("flex items-start gap-3 rounded-lg border border-border bg-card p-4", unread && "border-l-4 border-l-primary")}>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{n.kind}</p>
              {n.link?.startsWith("/story/") ? <Link to="/story/$id" params={{ id: n.link.slice(7) }} onClick={() => setState((s) => ({ readNotifs: [...s.readNotifs, n.id] }))} className="font-semibold hover:text-primary">{n.title}</Link> : n.link?.startsWith("/data/") ? <Link to="/data/$slug" params={{ slug: n.link.slice(6) }} onClick={() => setState((s) => ({ readNotifs: [...s.readNotifs, n.id] }))} className="font-semibold hover:text-primary">{n.title}</Link> : <Link to="/race" onClick={() => setState((s) => ({ readNotifs: [...s.readNotifs, n.id] }))} className="font-semibold hover:text-primary">{n.title}</Link>}
              <p className="text-sm text-muted-foreground">{n.body} · {fmt(n.time)}</p>
            </div>
            <Button variant="unstyled" onClick={() => setState((s) => ({ readNotifs: unread ? [...s.readNotifs, n.id] : s.readNotifs.filter((x) => x !== n.id) }))} className="text-xs font-semibold text-primary">{unread ? "Mark read" : "Mark unread"}</Button>
            <Button variant="unstyled" aria-label="Dismiss" onClick={() => setState((s) => ({ clearedNotifs: [...s.clearedNotifs, n.id] }))} className="text-xs text-muted-foreground">✕</Button>
          </li>); })}</ul>
      )}
    </div>
  );
}
