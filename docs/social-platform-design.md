# Faczz Paddock — Social Platform Architecture

**Phase 4 Implementation Reference**  
**Author:** Senior Full-Stack Engineer  
**Status:** Implemented & Verified in Production Baseline  

---

## 1. Architecture Overview & Multi-Client Synchronization

Faczz replaces the client-side `localStorage` social state with a persistent, multi-user, relational social platform running on TanStack Start / Nitro and backed by PostgreSQL (via Neon / Drizzle ORM).

```
   ┌──────────────────────────────────────────────┐
   │            Web & Mobile Clients              │
   │  (Web Browser & Android WebAPK / PWA Client) │
   └───────────────────────┬──────────────────────┘
                           │ Authenticated HTTP / Session Cookies
                           ▼
   ┌──────────────────────────────────────────────┐
   │         Nitro Social API Controller          │
   │                                              │
   │  • /api/posts (GET, POST)                    │
   │  • /api/posts/:id (GET, PATCH, DELETE)       │
   │  • /api/posts/:id/comments (GET, POST, DEL)  │
   │  • /api/posts/:id/like (POST)                │
   │  • /api/posts/:id/vote (POST)                │
   │  • /api/users/:id/posts (GET)                │
   └───────────────────────┬──────────────────────┘
                           │
                           ▼
   ┌──────────────────────────────────────────────┐
   │            PaddockService Data Layer         │
   │  - Validates Zod Schemas                     │
   │  - Enforces Author Ownership (BOLA defense)  │
   │  - Executes Atomic Toggles & DB Transactions │
   └───────────────────────┬──────────────────────┘
                           │
                           ▼
   ┌──────────────────────────────────────────────┐
   │             PostgreSQL Database              │
   │   [posts] ──< [comments]                     │
   │     │                                        │
   │     ├──< [likes] (PK: userId + postId)       │
   │     └──< [poll_options] ──< [poll_votes]     │
   │                    (Unique: userId + postId) │
   └──────────────────────────────────────────────┘
```

---

## 2. Feature Specifications

### 2.1 Posts
- **Create**: Authenticated users create posts with title, content (min 3, max 2000 chars), categories (`Paddock Buzz`, `Race Debrief`, `Hot Take`, `Tech Talk`, `Meme`), tags, teams, drivers, media URLs, and optional interactive polls.
- **Edit**: Post authors can edit their owned posts via `PATCH /api/posts/:id`. Attempts by non-authors are blocked with `403 FORBIDDEN`.
- **Delete**: Authors can delete their owned posts via `DELETE /api/posts/:id`. Associated comments, likes, and poll options/votes are cleaned up.
- **Pagination & Filters**: `GET /api/posts` supports `limit`, `offset`, `category`, `team`, and `authorId` parameters.

### 2.2 Comments
- **Create**: Add comments with author attribution (`POST /api/posts/:id/comments`).
- **Validation**: Minimum 1 character, maximum 1000 characters. Empty comments are rejected with `422 VALIDATION_ERROR`.
- **Delete**: Authors can delete their own comments via `DELETE /api/posts/:id/comments?commentId=...`. Non-authors receive `403 FORBIDDEN`.
- **Relational Integrity**: Comments maintain timestamps, author avatars, handles, and team affiliations.

### 2.3 Likes
- **Atomic Toggle**: `POST /api/posts/:id/like` toggles between like and unlike in a single atomic database operation.
- **Accurate Counters**: The post's `likesCount` updates in real time with zero duplicate likes per user (enforced by composite primary key on `[user_id, post_id]`).
- **Optimistic Reconciliation**: The frontend UI updates instantly upon user click and automatically reconciles with the server response if network anomalies occur.

### 2.4 Polls
- **Embedded Polls**: Up to 4 options attached to social posts.
- **Single Vote Enforcement**: Enforced at the database level with a unique index on `[user_id, post_id]`. Repeated vote attempts from the same user return `409 ALREADY_VOTED`.
- **Live Results**: Vote percentages and vote counts calculate accurately based on recorded votes.

### 2.5 Profiles & Cross-Device Sync
- **User Posts Tab**: The redesigned `/profile` page features a dedicated **My Posts** tab displaying all posts authored by the active user.
- **Production Cleanliness**: Sandbox test-persona switchers are restricted to non-production environments (`process.env.NODE_ENV !== "production"`).
- **Web & Mobile Consistency**: Both desktop browsers and Android WebAPK/PWA installations communicate with the same backend API endpoints, ensuring instantaneous multi-device data consistency.

---

## 3. API Route Specifications

| Endpoint | Method | Auth / Ownership | Description | Status Codes |
|---|---|---|---|---|
| `/api/posts` | GET | Public | Paginated posts with filters (`category`, `team`, `authorId`) | `200`, `500` |
| `/api/posts` | POST | Authenticated | Create post with tags, teams, media, and poll | `201`, `422`, `500` |
| `/api/posts/:id` | GET | Public | Fetch single post with author, poll, and comments | `200`, `404` |
| `/api/posts/:id` | PATCH | Author Only | Edit owned post title, content, or media | `200`, `401`, `403`, `404`, `422` |
| `/api/posts/:id` | DELETE | Author Only | Delete owned post and cascade dependencies | `200`, `401`, `403`, `404` |
| `/api/posts/:id/comments` | GET | Public | Paginated comments with author details | `200`, `500` |
| `/api/posts/:id/comments` | POST | Authenticated | Add reply to post | `201`, `422`, `500` |
| `/api/posts/:id/comments` | DELETE | Author Only | Delete owned comment | `200`, `401`, `403`, `404` |
| `/api/posts/:id/like` | POST | Authenticated | Atomic like / unlike toggle | `200`, `422`, `500` |
| `/api/posts/:id/vote` | POST | Authenticated | Vote on poll option (single vote per user) | `200`, `409`, `422` |
| `/api/users/:id/posts` | GET | Public | Get all posts authored by specific user | `200`, `500` |

---

## 4. Test Verification Suite

All social platform capabilities are verified using automated integration tests in `src/test/social.test.ts`:
- **15/15 Phase 4 Social Platform Tests Passing**
- **82/82 Total Project Tests Passing** (`npm test`)
- **TypeScript Static Verification**: 0 errors (`npx tsc --noEmit`)
- **Production Build**: Verified client and SSR bundle generation (`npm run build`)
