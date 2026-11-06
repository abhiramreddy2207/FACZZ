# Faczz Platform — Relational Database Architecture (PostgreSQL & Drizzle ORM)
**Version:** 2.0.0 (Phase 2 Backend Architecture)  
**Database Engine:** PostgreSQL 16+ (Neon Serverless Compatible)  
**ORM:** Drizzle ORM (`drizzle-orm` v0.45+)  
**Migration Directory:** `drizzle/`  

---

## 1. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ POSTS : authors
    USERS ||--o{ COMMENTS : writes
    USERS ||--o{ LIKES : casts
    USERS ||--o{ POLL_VOTES : submits
    USERS ||--o{ ACCOUNTS : owns
    USERS ||--o{ SESSIONS : has

    POSTS ||--o{ COMMENTS : contains
    POSTS ||--o{ LIKES : receives
    POSTS ||--o{ POLL_OPTIONS : defines
    POSTS ||--o{ POLL_VOTES : tracks

    POLL_OPTIONS ||--o{ POLL_VOTES : aggregates

    USERS {
        varchar(128) id PK
        varchar(255) email UK
        varchar(100) name
        varchar(60) handle UK
        text avatar_url
        text bio
        varchar(50) fav_team
        varchar(50) fav_driver
        varchar(50) badge
        varchar(100) location
        int followers_count
        int following_count
        timestamp created_at
        timestamp updated_at
    }

    ACCOUNTS {
        varchar(128) id PK
        varchar(128) user_id FK
        varchar(50) provider
        varchar(255) provider_account_id
        text password_hash
        timestamp created_at
    }

    SESSIONS {
        varchar(128) id PK
        varchar(128) user_id FK
        varchar(255) token UK
        timestamp expires_at
        timestamp created_at
    }

    POSTS {
        varchar(128) id PK
        varchar(128) author_id FK
        varchar(50) category
        varchar(200) title
        text content
        text media_url
        jsonb tags
        jsonb teams
        jsonb drivers
        int likes_count
        int reposts_count
        timestamp created_at
        timestamp updated_at
    }

    COMMENTS {
        varchar(128) id PK
        varchar(128) post_id FK
        varchar(128) author_id FK
        text content
        int likes_count
        timestamp created_at
    }

    LIKES {
        varchar(128) user_id PK,FK
        varchar(128) post_id PK,FK
        timestamp created_at
    }

    POLL_OPTIONS {
        varchar(128) id PK
        varchar(128) post_id FK
        varchar(150) text
        int votes_count
    }

    POLL_VOTES {
        varchar(128) id PK
        varchar(128) user_id FK
        varchar(128) post_id FK
        varchar(128) option_id FK
        timestamp created_at
    }
```

---

## 2. Table Specifications & Constraints

### 2.1 `users`
- Stores paddock identity, handles (`@tifosi_data`), and telemetry preferences.
- **Indexes**: Unique on `email`, unique on `handle`.

### 2.2 `accounts` & `sessions`
- Decoupled authentication credentials (Argon2id password hashes) and OAuth provider linkages.
- **Indexes**: Composite unique index on `(provider, provider_account_id)`. Unique on session `token`.

### 2.3 `posts`
- Central table for telemetry commentary, race debriefs, technical discussions, and memes.
- **Foreign Keys**: `author_id` -> `users.id` with `ON DELETE CASCADE`.
- **Indexes**: `posts_author_idx`, `posts_category_idx`, `posts_created_at_idx`.

### 2.4 `comments`
- Relational conversation threads linked to each post.
- **Foreign Keys**: `post_id` -> `posts.id` (`ON DELETE CASCADE`), `author_id` -> `users.id` (`ON DELETE CASCADE`).

### 2.5 `likes`
- **Composite Primary Key**: `(user_id, post_id)` guarantees duplicate likes cannot exist at the database level.
- Toggling is performed via transactional insert/delete with atomic counter updates (`likes_count`).

### 2.6 `poll_options` & `poll_votes`
- **One Vote Per User Per Poll**: Enforced by unique index:
  ```sql
  CREATE UNIQUE INDEX "poll_votes_user_poll_unique" ON "poll_votes" ("user_id", "post_id");
  ```
  Any attempt to cast a second vote on the same poll by the same user will trigger a database constraint violation.

---

## 3. Environment Configuration & Connection Strategy

```bash
# Production (.env.production)
DATABASE_URL="postgres://user:password@ep-green-grass-123.us-east-2.aws.neon.tech/faczz?sslmode=require"

# Local Development / Staging
DATABASE_URL="postgres://postgres:postgres@localhost:5432/faczz_dev"
```

- **Connection Driver**: `@neondatabase/serverless` using HTTP/WebSocket pooling for serverless environments (compatible with Vercel, Nitro, Cloudflare Workers, and standard Node.js).
- **Graceful Offline Fallback**: In environments where `DATABASE_URL` is omitted (e.g., frontend-only unit tests or isolated builds), `PaddockService` transparently routes queries through a seeded in-memory data store, preventing runtime initialization crashes.
