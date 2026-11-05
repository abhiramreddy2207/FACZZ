import { useSyncExternalStore } from "react";

export type EntityKind = "teams" | "drivers" | "topics" | "sources";
export type Bookmark = { id: string; type: "story" | "post" | "dataset"; title: string; href: string; collectionId: string | null; savedAt: string };
export type Collection = { id: string; name: string };
export type AlertKey = "practice" | "qualifying" | "sprint" | "race" | "results" | "penalties" | "breaking";

export type State = {
  onboarded: boolean;
  all: boolean;
  teams: string[]; drivers: string[]; topics: string[]; sources: string[];
  theme: "light" | "dark" | "system";
  homeEmphasis: "balanced" | "race" | "feed";
  raceMode: "auto" | "next" | "live" | "results";
  bookmarks: Bookmark[];
  collections: Collection[];
  readNotifs: string[]; clearedNotifs: string[];
  alerts: Record<AlertKey, boolean>;
  alertLead: 15 | 30 | 60;
  favNews: boolean;
  eventNotifs: boolean;
  user: { name: string; email: string } | null;
  privacy: { personalize: boolean; analytics: boolean; autoplay: boolean };
};

export const defaults: State = {
  onboarded: false, all: true, teams: [], drivers: [], topics: [], sources: [],
  theme: "system", homeEmphasis: "balanced", raceMode: "auto",
  bookmarks: [], collections: [{ id: "c-brazil", name: "Brazil GP research" }],
  readNotifs: [], clearedNotifs: [],
  alerts: { practice: false, qualifying: true, sprint: true, race: true, results: true, penalties: false, breaking: true },
  alertLead: 30, favNews: true, eventNotifs: false, user: null,
  privacy: { personalize: true, analytics: false, autoplay: true },
};

const KEY = "paddock-intel:v1";
let state: State = defaults;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...defaults, ...JSON.parse(raw) }; } catch { /* ignore */ }
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  load();
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function getState() { load(); return state; }

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(getState()),
    () => sel(defaults),
  );
}

export function toggleFollow(kind: EntityKind, id: string) {
  setState((s) => {
    const list = s[kind];
    return { [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as Partial<State>;
  });
}

export function toggleBookmark(b: Omit<Bookmark, "collectionId" | "savedAt">) {
  setState((s) => s.bookmarks.some((x) => x.id === b.id)
    ? { bookmarks: s.bookmarks.filter((x) => x.id !== b.id) }
    : { bookmarks: [{ ...b, collectionId: null, savedAt: new Date().toISOString() }, ...s.bookmarks] });
}

export function applyTheme(theme: State["theme"]) {
  if (typeof window === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}
