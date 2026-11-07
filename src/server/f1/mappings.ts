import { drivers, teams, getDriver, getTeam } from "@/lib/demo-data";

/**
 * Maps Ergast/Jolpica driver IDs (e.g., 'max_verstappen', 'leclerc') to Faczz catalog IDs.
 */
export const ERGAST_DRIVER_MAP: Record<string, string> = {
  max_verstappen: "verstappen",
  verstappen: "verstappen",
  norris: "norris",
  leclerc: "leclerc",
  piastri: "piastri",
  sainz: "sainz",
  russell: "russell",
  hamilton: "hamilton",
  perez: "perez",
  alonso: "alonso",
  gasly: "gasly",
  hulkenberg: "hulkenberg",
  stroll: "stroll",
  ocon: "ocon",
  albon: "albon",
  bearman: "bearman",
  colapinto: "colapinto",
  lawson: "lawson",
  hadjar: "hadjar",
  antonelli: "antonelli",
  bortoleto: "bortoleto",
  lindblad: "lindblad",
  bottas: "bottas",
  tsunoda: "tsunoda",
  yuki_tsunoda: "tsunoda",
  zhou: "zhou",
  guanyu_zhou: "zhou",
  magnussen: "magnussen",
  kevin_magnussen: "magnussen",
  sargeant: "sargeant",
  logan_sargeant: "sargeant",
  ricciardo: "ricciardo",
  daniel_ricciardo: "ricciardo",
};

/**
 * Maps Ergast/Jolpica constructor IDs (e.g., 'red_bull', 'aston_martin') to Faczz catalog IDs.
 */
export const ERGAST_CONSTRUCTOR_MAP: Record<string, string> = {
  mclaren: "mclaren",
  ferrari: "ferrari",
  red_bull: "redbull",
  redbull: "redbull",
  mercedes: "mercedes",
  aston_martin: "aston",
  aston: "aston",
  alpine: "alpine",
  haas: "haas",
  rb: "rb",
  racing_bulls: "rb",
  alphatauri: "rb",
  toro_rosso: "rb",
  williams: "williams",
  sauber: "audi",
  audi: "audi",
  kick_sauber: "audi",
  cadillac: "cadillac",
};

/**
 * Normalizes an external driverId to a Faczz driver ID with fallback lookup by code or family name.
 */
export function normalizeDriverId(externalId: string, code?: string, familyName?: string): string {
  const normalized = externalId.toLowerCase().trim();
  if (ERGAST_DRIVER_MAP[normalized]) {
    return ERGAST_DRIVER_MAP[normalized]!;
  }

  // Lookup by driver code (e.g. 'VER', 'NOR')
  if (code) {
    const matchByCode = drivers.find((d) => d.code.toUpperCase() === code.toUpperCase());
    if (matchByCode) return matchByCode.id;
  }

  // Lookup by family name
  if (familyName) {
    const fn = familyName.toLowerCase();
    const matchByName = drivers.find((d) => d.name.toLowerCase().includes(fn));
    if (matchByName) return matchByName.id;
  }

  return normalized;
}

/**
 * Normalizes an external constructorId to a Faczz team ID.
 */
export function normalizeConstructorId(externalId: string, name?: string): string {
  const normalized = externalId.toLowerCase().trim();
  if (ERGAST_CONSTRUCTOR_MAP[normalized]) {
    return ERGAST_CONSTRUCTOR_MAP[normalized]!;
  }

  if (name) {
    const match = teams.find((t) => t.name.toLowerCase().includes(name.toLowerCase()));
    if (match) return match.id;
  }

  return normalized;
}
