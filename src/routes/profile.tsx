import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { setState, useStore, type AlertKey } from "@/lib/store";
import { getTeam, getDriver, getTopic, getSource } from "@/lib/demo-data";
import { PageHeader, Chip, FollowButton } from "@/components/bits";
import type { ReactNode } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profile & Settings — Faczz" },
    { name: "description", content: "Theme, follows, alerts and privacy preferences." },
    { property: "og:title", content: "Profile & Settings — Faczz" },
    { property: "og:description", content: "Manage follows, alerts and theme." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Profile,
});

const Card = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="min-w-0 border-t border-border py-5"><h2 className="mb-3 font-bold">{title}</h2>{children}</section>
);
const Toggle = ({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) => (
  <label className="flex items-center justify-between gap-3 py-1.5 text-sm"><span>{label}</span>
    <Button variant="unstyled" type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${on ? "left-5" : "left-0.5"}`} /></Button></label>
);
const ALERTS: [AlertKey, string][] = [["practice", "Practice"], ["qualifying", "Qualifying"], ["sprint", "Sprint"], ["race", "Race start"], ["results", "Results"], ["penalties", "Penalties"], ["breaking", "Breaking news"]];

function Profile() {
  const s = useStore((x) => x);
  const [email, setEmail] = useState("");
  const [perm, setPerm] = useState<string | null>(null);
  const follows = [
    ...s.teams.map((id) => ({ k: "teams" as const, id, n: getTeam(id)?.name })),
    ...s.drivers.map((id) => ({ k: "drivers" as const, id, n: getDriver(id)?.name })),
    ...s.topics.map((id) => ({ k: "topics" as const, id, n: getTopic(id)?.name })),
    ...s.sources.map((id) => ({ k: "sources" as const, id, n: getSource(id)?.name })),
  ];
  const enableEvents = async (v: boolean) => {
    if (!v) { setState({ eventNotifs: false }); return; }
    if (typeof Notification === "undefined") { setPerm("unavailable in this browser"); return; }
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      setState({ eventNotifs: result === "granted" });
    } catch { setPerm("unavailable in this browser"); setState({ eventNotifs: false }); }
  };
  return (
    <div>
      <PageHeader eyebrow="Account" title="Profile & Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Account">
          {s.user ? <div className="flex items-center justify-between"><p className="text-sm">Signed in as <b>{s.user.email}</b> (demo)</p><Button variant="unstyled" onClick={() => setState({ user: null })} className="text-sm font-semibold text-primary">Sign out</Button></div> : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setState({ user: { name: email.split("@")[0], email } }); }} className="flex gap-2">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" />
              <Button variant="unstyled" className="rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">Sign in</Button></form>)}
          <p className="mt-2 text-xs text-muted-foreground">Optional demo sign-in. No account service connected; preferences are stored on this device.</p>
        </Card>
        <Card title="Theme">
          <div className="flex flex-wrap gap-2">{([["light", "Light", Sun], ["dark", "Dark", Moon], ["system", "System", Monitor]] as const).map(([v, l, I]) =>
            <Chip key={v} active={s.theme === v} onClick={() => setState({ theme: v })}><I className="h-4 w-4" /> {l}</Chip>)}</div>
        </Card>
        <Card title={`Following (${follows.length})`}>
          {follows.length ? <ul className="space-y-2">{follows.map((f) => <li key={f.k + f.id} className="flex items-center justify-between text-sm"><span>{f.n} <span className="text-xs text-muted-foreground">· {f.k}</span></span><FollowButton kind={f.k} id={f.id} size="sm" /></li>)}</ul> : <p className="text-sm text-muted-foreground">Nothing followed yet.</p>}
          <div className="mt-3 flex gap-4 text-sm font-semibold text-primary"><Link to="/explore">Find more</Link><Link to="/welcome">Redo setup</Link></div>
        </Card>
        <Card title="Saved views & collections">
          <p className="text-sm">{s.bookmarks.length} saved items · {s.collections.length} collections</p>
          <ul className="mt-2 text-sm text-muted-foreground">{s.collections.map((c) => <li key={c.id}>• {c.name}</li>)}</ul>
          <Link to="/saved" className="mt-2 inline-block text-sm font-semibold text-primary">Open Saved →</Link>
        </Card>
        <Card title="Notifications">
          <Toggle label="Event notifications on this device" on={s.eventNotifs} set={enableEvents} />
          <p className="mb-3 text-xs text-muted-foreground">We only ask your browser for permission when you switch this on. Alerts in this prototype are demo; no push service is connected.{perm && ` Browser permission: ${perm}.`}</p>
          {ALERTS.map(([k, l]) => <Toggle key={k} label={l} on={s.alerts[k]} set={(v) => setState({ alerts: { ...s.alerts, [k]: v } })} />)}
          <p className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Remind me before sessions</p>
          <div className="flex gap-2">{([15, 30, 60] as const).map((m) => <Chip key={m} active={s.alertLead === m} onClick={() => setState({ alertLead: m })}>{m} min</Chip>)}</div>
          <div className="mt-3"><Toggle label="Favourite team & driver news alerts" on={s.favNews} set={(v) => setState({ favNews: v })} /></div>
        </Card>
        <Card title="Privacy & preferences">
          <Toggle label="Personalise feed order" on={s.privacy.personalize} set={(v) => setState({ privacy: { ...s.privacy, personalize: v } })} />
          <Toggle label="Autoplay muted video when visible" on={s.privacy.autoplay} set={(v) => setState({ privacy: { ...s.privacy, autoplay: v } })} />
          <Toggle label="Share anonymous usage analytics" on={s.privacy.analytics} set={(v) => setState({ privacy: { ...s.privacy, analytics: v } })} />
          <Button variant="unstyled" onClick={() => { localStorage.removeItem("paddock-intel:v1"); location.href = "/welcome"; }} className="mt-3 text-sm font-semibold text-destructive">Reset all local data</Button>
        </Card>
      </div>
    </div>
  );
}
