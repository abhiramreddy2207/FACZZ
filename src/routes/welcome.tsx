import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { teams, drivers, topics, sources, getTeam } from "@/lib/demo-data";
import { setState, getState, type EntityKind } from "@/lib/store";
import { Chip } from "@/components/bits";
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

function Welcome() {
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
  const tog = (k: EntityKind, id: string) => setSel((s) => ({ ...s, [k]: s[k].includes(id) ? s[k].filter((x) => x !== id) : [...s[k], id] }));
  const finish = (skip = false) => {
    const userName = email.split("@")[0] ?? "user";
    setState({ onboarded: true, ...(skip ? {} : { all, ...sel }), ...(signin && email ? { user: { name: userName, email } } : {}) });
    navigate({ to: "/" });
  };
  const count = Object.values(sel).flat().length;
  const Section = ({ title, kind, items }: { title: string; kind: EntityKind; items: { id: string; name: string; color?: string | undefined }[] }) => (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">{title}</h2>
      <div className="flex flex-wrap gap-2">{items.map((i) => <Chip key={i.id} color={i.color} active={sel[kind].includes(i.id)} onClick={() => tog(kind, i.id)}>{i.name}</Chip>)}</div>
    </section>
  );

  return (
    <div className="min-h-screen">
      <div className="relative h-64 overflow-hidden md:h-80">
        <img src={hero} alt="" width={1280} height={720} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-3xl px-5">
          <h1 className="mt-1 text-4xl font-black md:text-5xl">Faczz</h1>
          <p className="mt-2 text-lg font-semibold">Your F1 intel, tuned.</p>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-5 pb-40">
        <p className="text-muted-foreground">Browse without an account. Pick what you follow — it's saved on this device and shapes your Home feed. You can change it any time.</p>
        <div className="mt-6"><Chip active={all} onClick={() => setAll(!all)}>{all && <Check className="h-3.5 w-3.5" />} All F1 / general news</Chip></div>
        <Section title="Teams" kind="teams" items={teams} />
        <Section title="Drivers" kind="drivers" items={drivers.map((d) => ({ id: d.id, name: d.name, color: getTeam(d.teamId)?.color }))} />
        <Section title="Topics" kind="topics" items={topics} />
        <Section title="Publishers" kind="sources" items={sources.filter((s) => s.kind === "publisher")} />
        <Section title="Influencers & creators (demo personas)" kind="sources" items={sources.filter((s) => s.kind === "influencer")} />
        <section className="mt-10 rounded-lg border border-border bg-card p-5">
          <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={signin} onChange={(e) => setSignin(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" /> Optional: demo sign-in</label>
          {signin && <div className="mt-3"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            <p className="mt-2 text-xs text-muted-foreground">Demo sign-in — no account service is connected yet. Your data stays on this device.</p></div>}
        </section>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-4">
          <Button variant="unstyled" onClick={() => finish(true)} className="text-sm font-semibold text-muted-foreground hover:text-foreground">Skip for now</Button>
          <Button variant="unstyled" onClick={() => finish()} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
            Continue{count ? ` · ${count} followed` : ""} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
// Avoid unused import warning for getState in some bundlers
void getState;
