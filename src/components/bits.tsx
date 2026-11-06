import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Check, ExternalLink, FlaskConical, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toggleBookmark, toggleFollow, useStore, type Bookmark as BM, type EntityKind } from "@/lib/store";
import { toast } from "sonner";

export function DemoBadge({ className, children = "Demo data" }: { className?: string; children?: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-dashed border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", className)}>
      <FlaskConical className="h-3 w-3" aria-hidden /> {children}
    </span>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold md:text-4xl">{title}</h1>
      </div>
      {children}
    </header>
  );
}

export function Chip({ active, onClick, children, color }: { active?: boolean; onClick?: () => void; children: ReactNode; color?: string | undefined }) {
  return (
    <Button variant="unstyled" type="button" onClick={onClick} aria-pressed={active}
      className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground/40")}>
      {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} aria-hidden />}
      {children}
    </Button>
  );
}

export function FollowButton({ kind, id, size = "md" }: { kind: EntityKind; id: string; size?: "sm" | "md" }) {
  const following = useStore((s) => s[kind].includes(id));
  return (
    <Button variant="unstyled" type="button" aria-pressed={following}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(kind, id); toast(following ? "Unfollowed" : "Following — added to Home filters"); }}
      className={cn("inline-flex shrink-0 items-center gap-1 rounded-full font-semibold transition-colors",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
        following ? "border border-border bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
      {following ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export function SaveButton({ item, label = false }: { item: Omit<BM, "collectionId" | "savedAt">; label?: boolean }) {
  const saved = useStore((s) => s.bookmarks.some((b) => b.id === item.id));
  return (
    <Button variant="unstyled" type="button" aria-pressed={saved} aria-label={saved ? "Remove bookmark" : "Save"}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(item); toast(saved ? "Removed from Saved" : "Saved"); }}
      className={cn("inline-flex items-center gap-1.5 rounded-full p-2 text-sm hover:bg-muted", saved && "text-primary")}>
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {label && (saved ? "Saved" : "Save")}
    </Button>
  );
}

export function SourceLink({ href, children = "Open original" }: { href: string; children?: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
      {children} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function SourcesFooter({ provider, url, updated }: { provider: string; url: string; updated: string }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
      <span className="font-semibold uppercase tracking-wider text-foreground">Sources</span>
      <span>{provider}</span>
      <span>Updated {updated}</span>
      <SourceLink href={url}>Original data</SourceLink>
      <DemoBadge>Sample values</DemoBadge>
    </div>
  );
}

export function Avatar({ label, color }: { label: string; color?: string | undefined }) {
  return (
    <span className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary font-display text-sm font-extrabold">
      {color && <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: color }} aria-hidden />}
      {label}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="racing-grid rounded-lg border border-dashed border-border p-10 text-center">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TabBar<T extends string>({ tabs, value, onChange }: { tabs: readonly T[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => (
        <Button variant="unstyled" key={t} role="tab" aria-selected={value === t} onClick={() => onChange(t)}
          className={cn("shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
            value === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
          {t}
        </Button>
      ))}
    </div>
  );
}

export { Link };
