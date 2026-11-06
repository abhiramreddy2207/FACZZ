# Faczz Platform — Motorsport Design System (Design Tokens & UI Specification)
**Version:** 2.0.0 (Phase 1 Redesign)  
**Target:** Web (Desktop, Tablet, Mobile) & Android Native PWA  

---

## 1. Design Philosophy: High-Performance Motorsport

The visual identity of Faczz is engineered around the precision, contrast, and telemetry data density of Formula 1 pit walls, telemetry monitors, and modern motorsport analytics suites (inspired by F1 Timing, AWS Sagemaker telemetry, and Motec i2 Pro).

### Core Principles
1. **Precision & Data Density**: Clean tabular numbers, monospace telemetry values, sharp badges, and micro-metrics that avoid unnecessary fluff.
2. **Deep Carbon & Pit-Lane Dark**: High-contrast, fatigue-free dark mode palette with true charcoal/carbon bases (`#0d0f12`, `#13171e`) and dark graphite card surfaces (`#1a1f29`).
3. **Selective High-Intensity Accents**:
   - **FIA Championship Red**: `#e10600` / `#ef4444` for primary actions, live session indicators, and pole position.
   - **Track Gold**: `#eab308` for fastest laps, trophies, and championship leaders.
   - **DRS / Telemetry Cyan**: `#06b6d4` for aero traces, speed traps, and sector delta.
   - **Optimal Sector Green**: `#10b981` for personal best sectors, tyre freshness, and positive trends.
   - **Authentic Constructor Palette**: McLaren papaya (`#ff8000`), Ferrari red (`#e80020`), Red Bull navy/red (`#3671c6`), Mercedes silver/teal (`#27f4d2`), Aston Martin racing green (`#229971`), etc.
4. **Strong Typography Hierarchy**:
   - **Headings & Display**: `Archivo`, bold uppercase tracking for race titles, driver numbers, and section headers.
   - **Interface & Prose**: `IBM Plex Sans` for readability, commentary, and news articles.
   - **Data & Telemetry**: `JetBrains Mono` for lap times, delta splits, gear changes, rpm, and speeds.
5. **Ergonomic Touch Targets**:
   - Mobile buttons and navigation pills strictly maintain `>= 44px` height with tactile haptic feedback on Android.

---

## 2. Color Palette & Semantic Tokens

```css
/* Core Carbon Backgrounds */
--bg-paddock:      oklch(0.12 0.01 260); /* #0d0f14 - deepest base */
--bg-surface:      oklch(0.16 0.015 255); /* #131720 - cards and modals */
--bg-surface-elev: oklch(0.20 0.02 250); /* #1a202c - dropdowns and hover */
--border-subtle:   oklch(0.25 0.02 250); /* #262e3d - crisp dividers */
--border-focus:    oklch(0.60 0.22 25);  /* Racing Red outline */

/* Text & Contrast Hierarchy */
--text-primary:    oklch(0.96 0.005 260); /* Crisp near-white */
--text-secondary:  oklch(0.72 0.02 250);  /* Soft graphite for labels */
--text-muted:      oklch(0.50 0.02 250);  /* Dimmed telemetry labels */

/* Telemetry Status Colors */
--telemetry-purple: oklch(0.65 0.25 310); /* Fastest Overall Lap / Purple Sector */
--telemetry-green:  oklch(0.72 0.20 150); /* Personal Best Sector */
--telemetry-yellow: oklch(0.80 0.18 90);  /* Standard Sector / Caution */
--telemetry-red:    oklch(0.60 0.24 25);  /* Red Flag / Hard Tyre / Critical */
```

---

## 3. Component Architecture & Standards

### 3.1 Paddock Stat & Telemetry Indicator
- **Layout**: Micro-label in uppercase tracking (10px `JetBrains Mono`), followed by high-contrast numeric value (16px to 28px bold), with optional delta split or unit indicator (`km/h`, `s`, `pts`).

### 3.2 Live Session Countdown & Status Pill
- Features a pulsing live indicator badge (`bg-red-500 animate-pulse` for Live, `bg-amber-500` for Upcoming, `bg-emerald-500` for Official Results).

### 3.3 Community Social Post Card
- Author header with verified F1 badges, team pill, timestamp, category tag (`Paddock Buzz`, `Hot Take`, `Tech Talk`).
- Rich media container with strict aspect-ratio enforcement (`aspect-video` for footage, rounded-xl container).
- Interactive poll with animated percentage fill and vote counts.
- Action bar with counters: Like (Heart), Repost (Repeat), Comments (MessageSquare), Share (ExternalLink/Clipboard), and Bookmark.

### 3.4 Telemetry Charts
- High-contrast Recharts container with `strokeDasharray="3 3"` dark gridlines (`#262e3d`).
- Custom tooltip with dark surface, border, driver avatar, and precise millisecond timing.

---

## 4. Accessibility & Mobile Standards
1. All tab components use WAI-ARIA `role="tablist"`, `role="tab"`, `aria-selected`, and keyboard arrow navigation.
2. Minimum color contrast meets WCAG AA 4.5:1 ratio across all text elements.
3. Mobile bottom navigation bar is fixed, blurred with backdrop-filter, and padded for Android system gesture bars (`pb-safe`).
