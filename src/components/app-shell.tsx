import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Compass, Home, Search, Bookmark, BarChart3, User } from "lucide-react";
import { useState, type ReactNode } from "react";
import { notifications } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/data", label: "Data", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/icon-192.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg" />
      <span className="font-display text-lg font-extrabold tracking-tight">Faczz</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const unread = useStore((s) => notifications.filter((n) => !s.readNotifs.includes(n.id) && !s.clearedNotifs.includes(n.id)).length);
  const user = useStore((s) => s.user);
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  if (path.startsWith("/welcome")) return <>{children}</>;

  return (
    <div className="min-h-screen md:pl-60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card px-4 py-6 md:flex">
        <Brand />
        <nav aria-label="Primary" className="mt-8 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} aria-current={active(to) ? "page" : undefined}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active(to) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
              <Icon className="h-5 w-5" /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-dashed border-border p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Prototype</p>All feeds, timing and stats are clearly-labelled demo data. No live sources connected.
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
          <div className="shrink-0 md:hidden"><Link to="/" aria-label="Faczz Home"><img src="/icon-192.png" alt="Faczz" width={32} height={32} /></Link></div>
          <form role="search" className="relative ml-auto flex-1 md:ml-0 md:max-w-md" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/explore", search: { q } }); }}>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search teams, drivers, sources…" aria-label="Search"
              className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          </form>
          <Link to="/notifications" aria-label={`Notifications, ${unread} unread`} className="relative rounded-full p-2 hover:bg-muted md:ml-auto">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
          </Link>
          <Link to="/profile" aria-label="Profile and settings" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold">
            {user ? user.name.slice(0, 1).toUpperCase() : <User className="h-4 w-4" />}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 md:pb-12">{children}</main>

      <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {nav.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} aria-current={active(to) ? "page" : undefined}
            className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold", active(to) ? "text-primary" : "text-muted-foreground")}>
            <Icon className="h-5 w-5" /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
