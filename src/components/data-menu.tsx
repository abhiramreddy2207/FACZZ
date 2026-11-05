import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bomb,
  CalendarDays,
  ChartNoAxesColumn,
  Cog,
  ContactRound,
  Crown,
  Dna,
  Flame,
  Home,
  MapPin,
  Radio,
  Swords,
  Timer,
  Trophy,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { datasets } from "@/lib/data-catalog";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  Home,
  "Live Timing": Radio,
  Schedule: MapPin,
  Results: CalendarDays,
  "Driver Standings": Trophy,
  "Constructor Standings": Crown,
  Drivers: ContactRound,
  Teams: UsersRound,
  "Driver Stats": ChartNoAxesColumn,
  "Head To Head": Swords,
  Consistency: Activity,
  "Race Pace": Flame,
  "Pit Stops": Timer,
  "Tech Updates": Wrench,
  "Used Elements": Cog,
  "Destructors Championship": Bomb,
  "Track DNA": Dna,
};

export function DataMenu() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav aria-label="Data menu" className="no-scrollbar mb-6 overflow-x-auto border-b border-border bg-card">
      <div className="flex min-w-max items-stretch gap-1 px-1 py-2">
        <Link
          to="/data"
          aria-current={path === "/data" ? "page" : undefined}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
            path === "/data" ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Home className="h-4 w-4 shrink-0" aria-hidden />
          Home
        </Link>
        {datasets.map((dataset) => {
          const Icon = icons[dataset.label] ?? BarChart3;
          const active = path === `/data/${dataset.slug}`;
          return (
            <Link
              key={dataset.slug}
              to="/data/$slug"
              params={{ slug: dataset.slug }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
                active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{dataset.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
