# Faczz Platform — Technical Debt Catalog
**Document Version:** 1.0.0 (Phase 0 Baseline)  
**Branch:** `faczz-production`  
**Base Commit:** `1c52584d296211204fcc0f3eafdf542181dc71ef`  

---

## 1. Technical Debt Matrix

| Category | Debt Item | Risk / Impact | Estimated Effort |
| :--- | :--- | :--- | :--- |
| **Architecture** | **No Server Database** | All social data and user accounts are local; no cross-user interaction | High (Phase 1-2) |
| **Security** | **Client Mock Auth** | Passwords discarded on submit; no session cookies, JWTs, or verification | High (Phase 2) |
| **Security** | **Broken Authorization (BOLA)** | Any client can delete any post/comment without author checks | Medium (Phase 2) |
| **Mobile** | **Ephemeral Release Keystore** | `build-apk.sh` generates a new keystore per run, breaking APK upgradeability | Low (Phase 1) |
| **Mobile** | **WebView File Access Risk** | `setAllowFileAccess(true)` + open deep linking intent allows arbitrary file reads | Low (Phase 1) |
| **Mobile** | **Hardcoded IP Addresses** | `192.168.29.195:8080` hardcoded in `MainActivity.java` and `profile.tsx` | Low (Phase 1) |
| **Type Safety** | **5 Baseline TS Errors** | `exactOptionalPropertyTypes: true` mismatches on `avatar`, `title`, and `poll` | Low (Phase 1) |
| **Testing** | **Zero Integration / E2E Tests**| Only route string matching is tested; no component or API verification | Medium (Phase 3) |
| **PWA** | **Incomplete Asset Caching** | Service Worker only caches 6 files; misses JS/CSS chunks needed for offline | Medium (Phase 3) |
| **Accessibility**| **Non-Standard Profile Tabs** | Raw `<button>` tabs lack ARIA roles (`tab`, `tablist`) and arrow navigation | Low (Phase 2) |

---

## 2. Detailed Technical Debt Analysis

### 2.1 Persistence & Architecture Debt
Currently, `src/lib/store.ts` uses `localStorage` key `"paddock-intel:v1"`.
- **Silent Storage Quota Failures**: `setState` wraps `localStorage.setItem` in a silent `catch {}`. When user posts, comments, and images exceed the 5MB quota, changes fail to persist without informing the user.
- **Cross-Tab Race Conditions**: There is no `window.addEventListener("storage", ...)` synchronization. Opening two tabs causes mutations in one tab to be lost or overwritten by the other.
- **No Multi-User Federation**: The platform looks like a social media application but operates as a single-device sandboxed playground.

### 2.2 Security & Authentication Debt
- **Simulated Auth Engine**: In `src/routes/profile.tsx`, `handleAuthSubmit` accepts any email and password and creates an in-memory session. Passwords are never hashed, stored, or verified.
- **Missing CSRF & Rate Limiting**: The server routes in `src/routes/api/` (`/api/live-feed`, `/api/download-apk`) have no rate limiting, allowing unbounded RSS requests and server CPU spikes.

### 2.3 Android Native Wrapper Debt
- **Signature Incompatibility on Updates**: Because `android/build-apk.sh` generates a new keystore on each run in `/tmp`, every generated APK has a unique RSA key fingerprint. Upgrading an installed APK requires users to uninstall the old app and lose all local data.
- **Arbitrary Intent Hijacking**: `MainActivity.java` passes unvalidated intent URIs directly to `mWebView.loadUrl()`, exposing the `AndroidBridge` interface to arbitrary external pages.
- **Hardcoded Local Network Endpoints**: `http://192.168.29.195:8080/` is hardcoded in `MainActivity.java` as `DEFAULT_URL`.

### 2.4 TypeScript & Build Hygiene
The codebase enables `exactOptionalPropertyTypes: true` in `tsconfig.json`. When optional properties like `avatar?: string` are passed `undefined`, TypeScript throws TS2375/TS2379 errors unless explicitly typed as `string | undefined` or omitted using object spread syntax.
