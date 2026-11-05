import { useState } from "react";
import { drivers, teams } from "@/lib/demo-data";
import { sessionRows } from "@/lib/session-data";
import { Chip } from "./bits";

export function DataComparison({ headToHead, season }: { headToHead: boolean; season: string }) {
  const [mode, setMode] = useState<"Drivers" | "Teams">("Drivers");
  const [a, setA] = useState("norris"), [b, setB] = useState("verstappen");
  const [ta, setTa] = useState("mclaren"), [tb, setTb] = useState("ferrari");
  const da = drivers.find((d) => d.id === a), db = drivers.find((d) => d.id === b);
  if (!da || !db) return null;
  const pair = mode === "Drivers" ? [da.name, db.name] : [teams.find((t) => t.id === ta)?.name, teams.find((t) => t.id === tb)?.name];
  const selected = mode === "Drivers" ? [a, b] : [ta, tb];
  const values = headToHead ? ["Qualifying", "Race"].map((label) => {
    const wins = [0, 0];
    for (let round = 1; round <= 20; round++) {
      const rows = sessionRows(label === "Race" ? "race" : "quali", `Round ${round}`, season);
      const positions = selected.map((id) => rows.find((r) => mode === "Drivers" ? r.driver === id : r.team === id)?.pos ?? 23);
      if (positions[0] !== positions[1]) wins[positions[0] < positions[1] ? 0 : 1]++;
    }
    return { label: `${label} wins (20 sample rounds)`, a: wins[0], b: wins[1] };
  }) : (["wins", "podiums", "poles", "starts"] as const).map((key) => ({ label: key, a: mode === "Drivers" ? da[key] : drivers.filter((d) => d.teamId === ta).reduce((sum, d) => sum + d[key], 0), b: mode === "Drivers" ? db[key] : drivers.filter((d) => d.teamId === tb).reduce((sum, d) => sum + d[key], 0) }));
  return <section className="mt-6 border-y border-border py-5">
    <h2 className="mb-3 font-bold">{headToHead ? "Head-to-head comparison" : "Career comparison"}</h2>
    <div className="mb-3 flex gap-2">{(["Drivers", "Teams"] as const).map((v) => <Chip key={v} active={mode === v} onClick={() => setMode(v)}>{v}</Chip>)}</div>
    <div className="mb-4 grid grid-cols-2 gap-2">{[0, 1].map((i) => <select key={i} aria-label={`${mode === "Drivers" ? "Driver" : "Team"} ${i === 0 ? "A" : "B"}`} className="h-10 min-w-0 rounded-lg border border-input bg-card px-2 text-sm" value={selected[i]} onChange={(e) => mode === "Drivers" ? (i === 0 ? setA : setB)(e.target.value) : (i === 0 ? setTa : setTb)(e.target.value)}>{(mode === "Drivers" ? drivers : teams).map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select>)}</div>
    <p className="mb-3 text-xs text-muted-foreground">{pair.join(" vs ")} · illustrative sample values</p>
    {values.map((v) => <div key={v.label} className="mb-3"><div className="mb-1 flex justify-between gap-2 text-xs font-mono"><span>{v.a}</span><span className="text-center capitalize text-muted-foreground">{v.label}</span><span>{v.b}</span></div><div className="flex h-2 overflow-hidden rounded-full bg-muted"><div className="bg-primary" style={{ width: `${v.a / (v.a + v.b || 1) * 100}%` }} /><div className="flex-1 bg-foreground/60" /></div></div>)}
  </section>;
}