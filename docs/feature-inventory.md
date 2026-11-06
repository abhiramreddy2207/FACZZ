# Faczz Platform — Feature Inventory & Survival Matrix
**Document Version:** 1.0.0 (Phase 0 Baseline)  
**Branch:** `faczz-production`  
**Base Commit:** `1c52584d296211204fcc0f3eafdf542181dc71ef`  

---

## 1. Complete Feature Inventory

| ID | Feature Name | Route / Component | Current Implementation | Data Source / Storage |
| :--- | :--- | :--- | :--- | :--- |
| **F-01** | **Onboarding Wizard** | `/welcome` | Category, team, and driver selector; skip or finish | `localStorage` (`onboarded: true`) |
| **F-02** | **Hero Race Card** | `/` (`src/components/race-card.tsx`) | Weekend countdown, circuit details, session schedule, weather | `demo-data.ts` (`raceWeekend`) |
| **F-03** | **Live Standings** | `/` (`src/routes/index.tsx`) | Driver & Team Championship standings widget | Live Jolpica API + Fallback |
| **F-04** | **Paddock News Feed** | `/` (`src/components/feed-card.tsx`) | Filterable multi-source feed (BBC, Autosport, Official F1) | `/api/live-feed` RSS |
| **F-05** | **Media Embeds** | `feed-card.tsx` | In-card player for YouTube (nocookie), TikTok, Instagram, X | Regex URL parser in `live-feed.ts` |
| **F-06** | **Community Social Post Composer**| `src/components/social-post-composer.tsx` | Category tagging, team selector, image URL attachment, polls | `createSocialPost` in `store.ts` |
| **F-07** | **Social Post Card & Actions** | `src/components/social-post-card.tsx` | Like counter, repost toggle, share action, bookmark | `store.ts` (`likes`, `reposts`) |
| **F-08** | **Interactive Comment Thread** | `social-post-card.tsx` | Inline reply submission, comment list, like counter | `store.ts` (`comments`) |
| **F-09** | **Interactive Polls** | `social-post-card.tsx` | Multi-choice voting with animated percentage bars | `store.ts` (`pollVotes`) |
| **F-10** | **Race Center** | `/race` | Comprehensive weekend schedule, practice/qualifying tabs | `demo-data.ts` |
| **F-11** | **Race Pace Explorer** | `src/components/race-pace-explorer.tsx` | Interactive lap-time scatter/line charts, stint filter | Recharts + `data-catalog.ts` |
| **F-12** | **16 Telemetry Data Catalogs** | `/data`, `/data/$slug` | Speed traps, sector times, tyre degradation, track DNA, etc. | `src/lib/data-catalog.ts` |
| **F-13** | **Driver Profiles** | `/driver/$id` | Bio, points, telemetry breakdown, recent race results | `demo-data.ts` + `data-catalog.ts` |
| **F-14** | **Constructor Profiles** | `/team/$id` | Team color styling, technical specs, car development | `demo-data.ts` + `data-catalog.ts` |
| **F-15** | **AI Paddock Scout** | `src/components/ai-paddock-scout.tsx` | Intel reports filterable by rumor, tech, news, telemetry | `src/lib/ai-scout.ts` |
| **F-16** | **Saved & Collections** | `/saved` | Bookmarks organized into custom user research folders | `store.ts` (`bookmarks`, `collections`) |
| **F-17** | **Notification Feed** | `/notifications` | Categorized alerts (race start, results, breaking) | `store.ts` (`readNotifs`, `alerts`) |
| **F-18** | **Profile Hub & Editor** | `/profile` | Hero card, avatar preview, bio/team editor | `store.ts` (`user`) |
| **F-19** | **1-Click Test Personas** | `/profile` | Switch between 4 pre-configured persona accounts | `store.ts` (`loginUser`) |
| **F-20** | **User Memory Import/Export** | `/profile` | Full JSON export and restore of all local state | `exportUserMemory` in `store.ts` |
| **F-21** | **Android App Download** | `/profile`, `/api/download-apk` | Sideload APK download with MIME headers | Binary APK streaming |
| **F-22** | **PWA WebAPK Installation** | PWA Manifest + `sw.js` | 1-Tap home-screen install on mobile Chrome/Safari | Google Play Services WebAPK |

---

## 2. Features That MUST Survive the Redesign

The following features represent core user value and **MUST NOT be removed, broken, or degraded** during production modernization:

1. **The Complete 16 Telemetry Data Catalog Destinations**:
   - `track-dna`, `speed-trap`, `sector-matrix`, `tyre-degradation`, `corner-speeds`, `gear-shifts`, `braking-zones`, `throttle-trace`, `pitstop-efficiency`, `overtake-zones`, `aero-drag`, `qualifying-gaps`, `race-pace-sim`, `power-unit-mileage`, `ers-deployment`, `safety-car-impact`.
   - Data controls (tyre compound selectors, driver comparisons) must remain functional and change the actual charts/tables per `AGENTS.md`.
2. **Interactive Race Pace Explorer**:
   - Stint-by-stint telemetry filtering, driver toggles, outlier elimination.
3. **Paddock News Feed & Media Embeds**:
   - Multi-source RSS aggregation with fallback, YouTube nocookie, X, and Instagram embed support.
4. **Social Community Layer**:
   - Creating posts with categories ("Paddock Buzz", "Race Debrief", "Hot Take", "Tech Talk", "Meme").
   - Attaching polls with real-time percentage recalculation.
   - Comment threads, likes, reposts, and bookmarks.
5. **AI Paddock Scout**:
   - Curated F1 technical regulation and rumor intelligence reports with source citations.
6. **Customizable Fan Personalization**:
   - Favorite team dynamic theme color accents (Ferrari red, McLaren papaya, Mercedes teal, Red Bull navy).
   - Saved bookmarks and custom collections.
7. **PWA Standalone & Android Native Support**:
   - Offline service worker caching.
   - Valid signed APK generation and AndroidBridge integration (haptics, sharing, native toasts).
