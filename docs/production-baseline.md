# Faczz Platform — Baseline Verification Report
**Date:** November 2026 | **Environment:** macOS / Node.js 22 / Java 24 / Android SDK 36.1.0  
**Active Branch:** `faczz-production`  
**Base Commit:** `1c52584d296211204fcc0f3eafdf542181dc71ef`  
**Backup Archive:** `/tmp/faczz_backup_phase0.tar.gz` (656 KB)  

---

## 1. Git State & Branch Preparation

- **Original Branch**: `main` (synchronized with `origin/main` at commit `1c52584`).
- **Feature Branch Created**: `faczz-production` (switched via `git checkout -b faczz-production`).
- **Backup Verification**: Clean tarball archive created at `/tmp/faczz_backup_phase0.tar.gz`, containing all untracked files (`android/`, `public/sw.js`, `public/downloads/`, social components) excluding `node_modules` and build caches.
- **Uncommitted User Changes**: Preserved intact without stash or reset.

---

## 2. Test & Build Baseline Suite

### 2.1 Dependency Tree Verification
- Package manager: `npm` (with `package-lock.json` and `overrides: { "rolldown": "1.2.1" }`).
- Core libraries verified: React 19.2.0, TanStack Router 1.170.41, TanStack Start 1.168.60, Tailwind CSS 4.2.1, Nitro 3.0.260603-beta.

### 2.2 TypeScript Type Checking (`npx tsc --noEmit`)
- **Exit Code**: `2` (5 Baseline Errors Recorded)
- **Status**: Recorded without automated mutation of code:
  1. `src/components/social-post-composer.tsx:62`: TS2379 (`exactOptionalPropertyTypes: true` on `title` / `poll`).
  2. `src/lib/store.ts:331`: TS2375 (`exactOptionalPropertyTypes: true` on `avatar`).
  3. `src/lib/store.ts:446`: TS2375 (`exactOptionalPropertyTypes: true` on `avatar`).
  4. `src/routes/profile.tsx:249`: TS2379 (`exactOptionalPropertyTypes: true` on `avatar`).
  5. `src/routes/welcome.tsx:36`: TS2345 (Partial `user` missing properties of `UserAccount`).

### 2.3 Unit & Routing Test Execution (`npm test`)
- **Command**: `vitest run`
- **Exit Code**: `0` (Success)
- **Results**:
  - `src/test/data-rules.test.ts`: **24/24 tests passed** (Deterministic session rules, controls, preference boundaries).
  - `src/test/app-routing.test.tsx`: **13/13 tests passed** (Route matching verification for all 13 core paths).
  - Total: **37 passed / 37 total (100%)** in 1.32s.

### 2.4 Production Web Build (`npm run build`)
- **Command**: `vite build`
- **Exit Code**: `0` (Success)
- **Client Build**: Transformed 2,317 modules into `.output/public/assets/` (styles 103 KB / 16.48 kB gzip; index bundle 355 KB / 113 kB gzip).
- **SSR Server Build**: Generated Nitro server entry `.output/server/index.mjs` and server manifests.
- **Preview Compatibility**: Verified ready for `npx vite preview`.

### 2.5 Android Native Build (`./android/build-apk.sh`)
- **Command**: Toolchain direct compile via Android SDK Build-Tools 36.1.0 (`aapt2`, `javac`, `d8`, `zipalign`, `apksigner`).
- **Exit Code**: `0` (Success)
- **Output Artifact**: `public/downloads/faczz-v2.6.0.apk` (25,457 bytes).
- **Signature Schemes**:
  - v1 scheme (JAR signing): **true**
  - v2 scheme (APK Signature Scheme v2): **true**
  - v3 scheme (APK Signature Scheme v3): **true**
- **Badging Verification**:
  - Package: `com.faczz.app`, Version Code: `26`, Version Name: `2.6.0`.
  - SDK: `minSdkVersion="21"` (Android 5.0+), `targetSdkVersion="34"` (Android 14).
