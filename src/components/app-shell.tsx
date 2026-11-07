import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Compass, Home, Search, Bookmark, BarChart3, User, Flag, Zap } from "lucide-react";
import { useState, type ReactNode } from "react";
import { notifications } from "@/lib/demo-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Paddock", icon: Home },
  { to: "/race", label: "Race Center", icon: Flag },
  { to: "/data", label: "Telemetry", icon: BarChart3 },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm shadow-sm transition-transform group-hover:scale-105">
        <span>F1</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-card" />
      </div>
      <div className="flex flex-col">
        <span className="font-display text-base font-black tracking-wider uppercase text-foreground leading-none">
          Faczz
        </span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground leading-tight">
          Paddock Intel
        </span>
      </div>
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
    <div className="min-h-screen md:pl-64 bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* ========================================================= */}
      {/* DESKTOP MOTORSPORT SIDEBAR                                */}
      {/* ========================================================= */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card/95 px-4 py-5 backdrop-blur-md md:flex">
        <Brand />

        <div className="mt-7 flex items-center justify-between px-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>Main Pitwall</span>
          <span className="flex items-center gap-1 text-emerald-500 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>

        <nav aria-label="Primary" className="mt-2 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const isCurrent = active(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="tracking-tight">{label}</span>
                {isCurrent && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/90" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Timing Teaser Card */}
        <div className="mt-auto space-y-3">
          <div className="rounded-xl border border-border/70 bg-background/50 p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
              <span className="flex items-center gap-1 text-primary font-bold">
                <Zap className="h-3 w-3" /> F1 Timing
              </span>
              <span>2026 Season</span>
            </div>
            <p className="text-xs font-semibold text-foreground/90 leading-tight">
              Next: São Paulo Grand Prix
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
              <span>Interlagos</span>
              <span className="text-primary font-bold">Autódromo</span>
            </div>
          </div>

          <div className="rounded-lg bg-muted/40 px-3 py-2 text-[10px] font-mono text-muted-foreground flex items-center justify-between border border-border/40">
            <span>Engine Build</span>
            <span className="font-bold text-foreground">v2.6.0-prod</span>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* GLOBAL HEADER                                             */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2 md:hidden">
            <Brand />
          </div>

          {/* Search bar */}
          <form
            role="search"
            className="relative flex-1 max-w-md hidden sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/explore", search: { q } });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search drivers, telemetries, rumors…"
              aria-label="Search F1 Paddock"
              className="h-9 w-full rounded-xl border border-input bg-card/60 pl-8.5 pr-3 text-xs outline-none transition-all focus:border-primary focus:bg-card focus:ring-1 focus:ring-primary"
            />
          </form>

          {/* Header Right Actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              aria-label={`Notifications, ${unread} unread`}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 text-foreground transition-all hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-mono font-bold text-primary-foreground shadow-sm">
                  {unread}
                </span>
              )}
            </Link>

            <Link
              to="/profile"
              aria-label="Profile and settings"
              className="flex items-center gap-2 rounded-xl border border-border bg-card/80 p-1 pr-2.5 transition-all hover:bg-muted"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary font-bold text-xs text-foreground overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span>{(user?.name ?? "Fan").slice(0, 1).toUpperCase()}</span>
                )}
              </div>
              <span className="text-xs font-bold text-foreground hidden sm:inline">
                {user?.name.split(" ")[0] ?? "Driver"}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN CONTENT VIEW                                         */}
      {/* ========================================================= */}
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-5 md:pb-14 w-full min-w-0">{children}</main>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (>= 48px touch targets)      */}
      {/* ========================================================= */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-t border-border bg-card/95 backdrop-blur-lg md:hidden pb-safe"
      >
        {nav.map(({ to, label, icon: Icon }) => {
          const isCurrent = active(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center min-h-[52px] py-1.5 transition-all",
                isCurrent ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[10px] tracking-tight">{label}</span>
              {isCurrent && (
                <span className="mt-0.5 h-1 w-4 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
