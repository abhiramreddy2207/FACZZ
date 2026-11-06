import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { teams, drivers, topics, sources, getTeam } from "@/lib/demo-data";
import { setState, getState, type EntityKind } from "@/lib/store";
import { Chip } from "@/components/bits";
import { cn } from "@/lib/utils";
const hero = "/race-hero.svg";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [
    { title: "Welcome — Faczz" },
    { name: "description", content: "Pick your teams, drivers, topics and sources to personalise your F1 feed." },
    { property: "og:title", content: "Welcome to Faczz" },
    { property: "og:description", content: "Set up your personalised F1 news and data feed." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Welcome,
});

export function Welcome() {
  const navigate = useNavigate();
  const [all, setAll] = useState(true);
  const [sel, setSel] = useState<Record<EntityKind, string[]>>({ teams: [], drivers: [], topics: [], sources: [] });
  const [signin, setSignin] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const saved = getState();
    setAll(saved.all);
    setSel({ teams: saved.teams, drivers: saved.drivers, topics: saved.topics, sources: saved.sources });
  }, []);

  const tog = (k: EntityKind, id: string) =>
    setSel((s) => ({ ...s, [k]: s[k].includes(id) ? s[k].filter((x) => x !== id) : [...s[k], id] }));

  const finish = (skip = false) => {
    const userName = email.split("@")[0] || "user";
    const userAccount = signin && email ? {
      id: `u-${Date.now()}`,
      name: userName,
      handle: `@${userName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`,
      email,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      followersCount: 1,
      followingCount: 3,
    } : undefined;
    setState({ onboarded: true, ...(skip ? {} : { all, ...sel }), ...(userAccount ? { user: userAccount } : {}) });
    navigate({ to: "/" });
  };

  const count = Object.values(sel).flat().length;

  const Section = ({
    title,
    kind,
    items,
  }: {
    title: string;
    kind: EntityKind;
    items: { id: string; name: string; color?: string | undefined }[];
  }) => (
    <section className="mt-8 space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-1 w-3 rounded-full bg-primary" />
        <h2 className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => {
          const isSelected = sel[kind].includes(i.id);
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => tog(kind, i.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all border",
                isSelected
                  ? "bg-foreground text-background border-foreground shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/60"
              )}
            >
              {i.color && (
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ background: i.color }}
                  aria-hidden
                />
              )}
              <span>{i.name}</span>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Hero Banner with Motorsport Gradients */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card via-card/80 to-background py-14 px-5">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="relative mx-auto max-w-3xl space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            FIA Formula 1 Paddock Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground font-display">
            Tune Your Pitwall
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl">
            Select your constructors, drivers, and technical intel channels. Your custom telemetry stream and community feed are tuned in real time.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-36 pt-6">
        {/* All F1 toggle button */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-foreground">Global Paddock Stream</h3>
            <p className="text-xs text-muted-foreground">Receive updates for all 10 constructors and 20 drivers</p>
          </div>
          <button
            type="button"
            onClick={() => setAll(!all)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
              all
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-muted text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {all && <Check className="h-3.5 w-3.5" />}
            <span>All F1 News</span>
          </button>
        </div>

        <Section title="Constructors & Works Teams" kind="teams" items={teams} />

        <Section
          title="F1 Drivers"
          kind="drivers"
          items={drivers.map((d) => ({
            id: d.id,
            name: d.name,
            color: getTeam(d.teamId)?.color,
          }))}
        />

        <Section title="Technical Topics & Analysis" kind="topics" items={topics} />

        <Section
          title="Verified Motorsport Publishers"
          kind="sources"
          items={sources.filter((s) => s.kind === "publisher")}
        />

        <Section
          title="Paddock Creators & Tech Analysts"
          kind="sources"
          items={sources.filter((s) => s.kind === "influencer")}
        />
      </div>

      {/* Sticky Bottom Action Dock */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3.5">
          <Button
            variant="unstyled"
            type="button"
            onClick={() => finish(true)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground px-3 py-2"
          >
            Skip Setup
          </Button>

          <Button
            variant="unstyled"
            type="button"
            onClick={() => finish()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-[1.02]"
          >
            <span>Enter Paddock</span>
            {count > 0 && <span className="opacity-90">({count} tuned)</span>}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
// Avoid unused import warning for getState in some bundlers
void getState;
