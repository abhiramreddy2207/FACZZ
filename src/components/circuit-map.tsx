import React, { useState } from "react";
import { Gauge, MapPin, Zap, Flag, Timer, ChevronRight, Activity, Crosshair } from "lucide-react";

export type CircuitInfo = {
  name: string;
  circuit: string;
  location: string;
  lengthKm: number;
  turns: number;
  drsZones: number;
  lapRecord: { time: string; driver: string; year: number };
  sectors: {
    s1: { name: string; length: string; record: string; driver: string; desc: string };
    s2: { name: string; length: string; record: string; driver: string; desc: string };
    s3: { name: string; length: string; record: string; driver: string; desc: string };
  };
};

export const INTERLAGOS_CIRCUIT: CircuitInfo = {
  name: "São Paulo Grand Prix",
  circuit: "Autódromo José Carlos Pace",
  location: "Interlagos, São Paulo, Brazil",
  lengthKm: 4.309,
  turns: 15,
  drsZones: 2,
  lapRecord: { time: "1:10.540", driver: "Valtteri Bottas", year: 2018 },
  sectors: {
    s1: {
      name: "Sector 1 (Turns 1 - 3: Senna 'S')",
      length: "1.38 km",
      record: "18.350s",
      driver: "Norris",
      desc: "Downhill braking from 335 km/h into downhill Senna 'S' and Curva do Sol.",
    },
    s2: {
      name: "Sector 2 (Turns 4 - 11: Infield & Lake)",
      length: "1.78 km",
      record: "35.080s",
      driver: "Verstappen",
      desc: "High-speed sweeping infield including Ferradura, Pinheirinho and Bico de Pato.",
    },
    s3: {
      name: "Sector 3 (Turns 12 - 15: Subida dos Boxes)",
      length: "1.15 km",
      record: "16.320s",
      driver: "Russell",
      desc: "Long uphill acceleration curve through Arquibancadas onto the main straight.",
    },
  },
};

export const YAS_MARINA_CIRCUIT: CircuitInfo = {
  name: "Abu Dhabi Grand Prix",
  circuit: "Yas Marina Circuit",
  location: "Yas Island, Abu Dhabi, UAE",
  lengthKm: 5.281,
  turns: 16,
  drsZones: 2,
  lapRecord: { time: "1:26.103", driver: "Max Verstappen", year: 2021 },
  sectors: {
    s1: {
      name: "Sector 1 (Turns 1 - 5)",
      length: "1.42 km",
      record: "17.482s",
      driver: "Verstappen",
      desc: "High-speed sweeping entry into heavy Turn 5 hairpin braking zone.",
    },
    s2: {
      name: "Sector 2 (Turns 6 - 9)",
      length: "2.16 km",
      record: "36.219s",
      driver: "Hamilton",
      desc: "Twin 1.2km full-throttle DRS back straights separated by chicane.",
    },
    s3: {
      name: "Sector 3 (Turns 10 - 16)",
      length: "1.70 km",
      record: "30.114s",
      driver: "Leclerc",
      desc: "Twisty technical marina waterfront complex requiring high rear stability.",
    },
  },
};

export const DEFAULT_CIRCUIT: CircuitInfo = INTERLAGOS_CIRCUIT;

export function CircuitMap({
  circuit = DEFAULT_CIRCUIT,
  selectedSector = null,
  onSelectSector,
}: {
  circuit?: CircuitInfo;
  selectedSector?: "s1" | "s2" | "s3" | null;
  onSelectSector?: (sector: "s1" | "s2" | "s3" | null) => void;
}) {
  const [activeSector, setActiveSector] = useState<"s1" | "s2" | "s3" | null>(selectedSector);
  const [hoverTurn, setHoverTurn] = useState<string | null>(null);

  const isInterlagos =
    circuit.circuit.toLowerCase().includes("interlagos") ||
    circuit.circuit.toLowerCase().includes("carlos pace") ||
    circuit.name.toLowerCase().includes("são paulo") ||
    circuit.name.toLowerCase().includes("sao paulo");

  const handleSectorClick = (s: "s1" | "s2" | "s3") => {
    const next = activeSector === s ? null : s;
    setActiveSector(next);
    onSelectSector?.(next);
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-card via-card to-card/70 p-4 md:p-6 shadow-sm">
      {/* Header & Circuit Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
              Official Track Map & Telemetry Sectors
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg md:text-xl font-black text-foreground">
            {circuit.circuit}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            {circuit.location}
          </p>
        </div>

        {/* Lap record pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl border border-border/80 bg-muted/40 px-3 py-2 font-mono text-xs">
          <Timer className="h-4 w-4 text-amber-400" />
          <div>
            <div className="text-[10px] uppercase text-muted-foreground">Lap Record</div>
            <div className="font-bold text-foreground">
              {circuit.lapRecord.time}{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                ({circuit.lapRecord.driver})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sector Selection Tabs */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveSector(null);
              onSelectSector?.(null);
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              activeSector === null
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Full Circuit
          </button>
          <button
            type="button"
            onClick={() => handleSectorClick("s1")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              activeSector === "s1"
                ? "bg-red-500 text-white shadow-sm"
                : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-red-500" /> S1 ({isInterlagos ? "Senna S" : "Hairpin"})
          </button>
          <button
            type="button"
            onClick={() => handleSectorClick("s2")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              activeSector === "s2"
                ? "bg-cyan-500 text-black shadow-sm"
                : "bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> S2 ({isInterlagos ? "Infield & Lake" : "DRS Straights"})
          </button>
          <button
            type="button"
            onClick={() => handleSectorClick("s3")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold transition-all ${
              activeSector === "s3"
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-purple-400" /> S3 ({isInterlagos ? "Uphill Straight" : "Marina"})
          </button>
        </div>

        {/* DRS indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
            <Zap className="h-3 w-3" /> 2 DRS ZONES
          </span>
          <span className="text-muted-foreground text-[11px] hidden sm:inline">
            Speed Trap: {isInterlagos ? "335 km/h" : "338 km/h"}
          </span>
        </div>
      </div>

      {/* Interactive Circuit SVG Canvas */}
      <div className="relative mt-4 flex items-center justify-center rounded-2xl border border-border/80 bg-neutral-950/80 p-4 md:p-8 overflow-hidden min-h-[300px]">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#26262615_1px,transparent_1px),linear-gradient(to_bottom,#26262615_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <svg
          viewBox="0 0 800 450"
          className="w-full max-w-[720px] h-auto drop-shadow-2xl select-none"
        >
          <defs>
            {/* Glow filters for active sectors */}
            <filter id="glowS1" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.8" />
            </filter>
            <filter id="glowS2" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.8" />
            </filter>
            <filter id="glowS3" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#a855f7" floodOpacity="0.8" />
            </filter>
            <filter id="glowDrs" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#22d3ee" floodOpacity="1" />
            </filter>
          </defs>

          {/* Background Circuit Base Outline */}
          <path
            d={
              isInterlagos
                ? "M 240 360 L 530 360 C 560 360, 580 375, 590 390 C 600 405, 620 405, 635 390 C 650 375, 660 345, 670 310 C 680 270, 680 220, 680 180 L 680 110 C 680 70, 650 50, 610 50 C 570 50, 540 70, 510 90 L 450 135 C 420 155, 385 160, 350 185 C 325 200, 315 220, 320 245 C 325 270, 305 285, 280 270 C 255 255, 235 255, 210 270 C 180 285, 160 300, 140 325 C 120 350, 180 360, 240 360 Z"
                : "M 180 340 L 460 340 C 490 340, 520 320, 530 290 L 580 180 C 600 130, 640 100, 690 100 C 730 100, 750 120, 750 160 L 730 260 C 720 310, 680 350, 630 360 L 520 380 C 470 390, 420 370, 390 340 L 320 280 C 300 260, 270 250, 240 250 L 160 250 C 120 250, 90 220, 90 180 C 90 140, 120 110, 160 110 L 380 110 C 420 110, 440 80, 410 60 C 380 40, 300 40, 240 40 C 160 40, 100 80, 70 140 C 40 200, 50 280, 100 320 Z"
            }
            fill="none"
            stroke="#262626"
            strokeWidth="20"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Sector 1: Red Segment */}
          <path
            d={
              isInterlagos
                ? "M 240 360 L 530 360 C 560 360, 580 375, 590 390 C 600 405, 620 405, 635 390 C 650 375, 660 345, 670 310 C 680 270, 680 220, 680 180"
                : "M 180 340 L 460 340 C 490 340, 520 320, 530 290 L 580 180"
            }
            fill="none"
            stroke="#ef4444"
            strokeWidth={activeSector === "s1" ? "10" : "6"}
            strokeLinecap="round"
            filter={activeSector === "s1" ? "url(#glowS1)" : undefined}
            opacity={activeSector && activeSector !== "s1" ? 0.35 : 1}
            className="cursor-pointer transition-all hover:stroke-width-8"
            onClick={() => handleSectorClick("s1")}
          />

          {/* Sector 2: Cyan Segment */}
          <path
            d={
              isInterlagos
                ? "M 680 180 L 680 110 C 680 70, 650 50, 610 50 C 570 50, 540 70, 510 90 L 450 135 C 420 155, 385 160, 350 185 C 325 200, 315 220, 320 245 C 325 270, 305 285, 280 270"
                : "M 580 180 C 600 130, 640 100, 690 100 C 730 100, 750 120, 750 160 L 730 260 C 720 310, 680 350, 630 360 L 520 380"
            }
            fill="none"
            stroke="#06b6d4"
            strokeWidth={activeSector === "s2" ? "10" : "6"}
            strokeLinecap="round"
            filter={activeSector === "s2" ? "url(#glowS2)" : undefined}
            opacity={activeSector && activeSector !== "s2" ? 0.35 : 1}
            className="cursor-pointer transition-all hover:stroke-width-8"
            onClick={() => handleSectorClick("s2")}
          />

          {/* Sector 3: Purple Segment */}
          <path
            d={
              isInterlagos
                ? "M 280 270 C 255 255, 235 255, 210 270 C 180 285, 160 300, 140 325 C 120 350, 180 360, 240 360"
                : "M 520 380 C 470 390, 420 370, 390 340 L 320 280 C 300 260, 270 250, 240 250 L 160 250 C 120 250, 90 220, 90 180 C 90 140, 120 110, 160 110 L 380 110 C 420 110, 440 80, 410 60 C 380 40, 300 40, 240 40 C 160 40, 100 80, 70 140 C 40 200, 50 280, 100 320 Z L 180 340"
            }
            fill="none"
            stroke="#a855f7"
            strokeWidth={activeSector === "s3" ? "10" : "6"}
            strokeLinecap="round"
            filter={activeSector === "s3" ? "url(#glowS3)" : undefined}
            opacity={activeSector && activeSector !== "s3" ? 0.35 : 1}
            className="cursor-pointer transition-all hover:stroke-width-8"
            onClick={() => handleSectorClick("s3")}
          />

          {/* DRS Zone 1 Marking */}
          <path
            d={isInterlagos ? "M 280 360 L 490 360" : "M 220 340 L 440 340"}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeDasharray="6 4"
            filter="url(#glowDrs)"
          />
          <text
            x={isInterlagos ? "385" : "330"}
            y={isInterlagos ? "385" : "365"}
            fill="#22d3ee"
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            DRS ZONE 1
          </text>

          {/* DRS Zone 2 Marking */}
          <path
            d={isInterlagos ? "M 680 180 L 680 110" : "M 740 180 L 730 250"}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="3"
            strokeDasharray="6 4"
            filter="url(#glowDrs)"
          />
          <text
            x={isInterlagos ? "705" : "765"}
            y={isInterlagos ? "145" : "215"}
            fill="#22d3ee"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="start"
          >
            DRS 2
          </text>

          {/* Start / Finish Line */}
          <line
            x1={isInterlagos ? "240" : "180"}
            y1={isInterlagos ? "346" : "326"}
            x2={isInterlagos ? "240" : "180"}
            y2={isInterlagos ? "374" : "354"}
            stroke="#ffffff"
            strokeWidth="4"
          />
          <text
            x={isInterlagos ? "240" : "180"}
            y={isInterlagos ? "338" : "320"}
            fill="#ffffff"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="900"
            textAnchor="middle"
          >
            START / FINISH
          </text>

          {/* Speed Trap Radar (ST) */}
          <g transform={isInterlagos ? "translate(680, 140)" : "translate(480, 320)"}>
            <circle cx="0" cy="0" r="10" fill="#eab308" fillOpacity="0.2" stroke="#eab308" strokeWidth="2" />
            <text x="0" y="3" fill="#eab308" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ST</text>
            <text x="0" y="22" fill="#eab308" fontSize="9" fontFamily="monospace" textAnchor="middle">{isInterlagos ? "335 km/h" : "338 km/h"}</text>
          </g>

          {/* Key Corner Badges */}
          {(isInterlagos
            ? [
                { id: "T1", x: 550, y: 395, label: "T1 Senna S · 118 km/h" },
                { id: "T3", x: 675, y: 320, label: "T3 Curva do Sol · 225 km/h" },
                { id: "T4", x: 645, y: 65, label: "T4 Descida do Lago · 152 km/h" },
                { id: "T8", x: 440, y: 155, label: "T8 Ferradura · 188 km/h" },
                { id: "T10", x: 300, y: 255, label: "T10 Bico de Pato · 76 km/h" },
                { id: "T12", x: 175, y: 285, label: "T12 Junção · 128 km/h" },
              ]
            : [
                { id: "T1", x: 470, y: 355, label: "T1 · 145 km/h" },
                { id: "T5", x: 585, y: 165, label: "T5 Hairpin · 78 km/h" },
                { id: "T6", x: 670, y: 85, label: "T6 Chicane · 95 km/h" },
                { id: "T9", x: 745, y: 280, label: "T9 Sweeper · 210 km/h" },
                { id: "T11", x: 500, y: 395, label: "T11 Hotel · 112 km/h" },
                { id: "T14", x: 300, y: 270, label: "T14 Left · 128 km/h" },
                { id: "T16", x: 80, y: 170, label: "T16 Final Turn · 185 km/h" },
              ]
          ).map((corner) => (
            <g
              key={corner.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => setHoverTurn(corner.label)}
              onMouseLeave={() => setHoverTurn(null)}
            >
              <circle
                cx={corner.x}
                cy={corner.y}
                r="9"
                fill="#171717"
                stroke="#d4d4d8"
                strokeWidth="1.5"
              />
              <text
                x={corner.x}
                y={corner.y + 3}
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {corner.id}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover corner popup */}
        {hoverTurn && (
          <div className="absolute top-4 left-4 rounded-lg border border-primary/40 bg-card/95 px-3 py-1.5 font-mono text-xs shadow-lg backdrop-blur-md">
            <span className="font-bold text-primary">{hoverTurn}</span>
          </div>
        )}
      </div>

      {/* Sector Details Card */}
      {activeSector && (
        <div className="mt-4 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-full ${
                  activeSector === "s1"
                    ? "bg-red-500"
                    : activeSector === "s2"
                    ? "bg-cyan-400"
                    : "bg-purple-400"
                }`}
              />
              <h3 className="font-bold text-sm text-foreground">
                {circuit.sectors[activeSector].name}
              </h3>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              Length: {circuit.sectors[activeSector].length}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {circuit.sectors[activeSector].desc}
          </p>
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 font-mono text-xs">
            <span className="text-muted-foreground">Sector Benchmark:</span>
            <span className="font-bold text-primary">
              {circuit.sectors[activeSector].record} ({circuit.sectors[activeSector].driver})
            </span>
          </div>
        </div>
      )}

      {/* Circuit Metadata Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase block">Length</span>
          <span className="font-bold text-foreground">{circuit.lengthKm} km</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase block">Turns</span>
          <span className="font-bold text-foreground">{circuit.turns} Corners</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase block">DRS Zones</span>
          <span className="font-bold text-foreground">{circuit.drsZones} Detection Pts</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
          <span className="text-[10px] text-muted-foreground uppercase block">Full Throttle</span>
          <span className="font-bold text-foreground">64% of Lap</span>
        </div>
      </div>
    </div>
  );
}
