# Faczz Platform — Server-Side API Specifications
**Version:** 2.0.0 (Phase 2 Backend Architecture)  
**Protocol:** REST / JSON over HTTP/2  
**Validation:** Zod Schemas (`src/server/api/types.ts`)  

---

## 1. Standard Response Envelope

All API endpoints return a predictable JSON envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "limit": 20,
    "offset": 0
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "content": ["Post content must be at least 3 characters"]
    }
  }
}
```

---

## 2. API Endpoints Reference

### 2.1 Community Posts API

#### `GET /api/posts`
- **Query Parameters**:
  - `limit` (optional integer, 1 to 50, default `20`)
  - `offset` (optional integer, default `0`)
  - `category` (optional string: `"Paddock Buzz"`, `"Race Debrief"`, `"Hot Take"`, `"Tech Talk"`, `"Meme"`)
  - `team` (optional string, e.g. `"ferrari"`, `"mclaren"`)
- **Status Codes**: `200 OK`, `500 Internal Server Error`.

#### `POST /api/posts`
- **Request Body (Validated via Zod `CreatePostSchema`)**:
  ```json
  {
    "authorId": "u-active-paddock-user",
    "category": "Tech Talk",
    "title": "SF-24 Floor Edge Vortex Analysis",
    "content": "Telemetry indicates Ferrari gains 0.15s through high-speed turns.",
    "tags": ["Ferrari", "Aero", "AustinGP"],
    "teams": ["ferrari"],
    "drivers": ["leclerc"],
    "poll": {
      "question": "Will Ferrari lead race pace?",
      "options": ["Yes, top speed edge", "No, high degradation"]
    }
  }
  ```
- **Status Codes**: `201 Created`, `422 Unprocessable Entity` (validation error), `400 Bad Request`.

#### `GET /api/posts/$id`
- **Retrieves**: Single post record with author profile, poll options, vote counts, and comments.
- **Status Codes**: `200 OK`, `404 Not Found`.

#### `DELETE /api/posts/$id?userId=<requesterId>`
- **Authorization**: Enforces Broken Object-Level Authorization (BOLA) protection. Only the author of the post can delete it.
- **Status Codes**: `200 OK`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`.

---

### 2.2 Comments API

#### `GET /api/posts/$id/comments`
- **Query Parameters**: `limit` (default 25), `offset` (default 0).
- **Status Codes**: `200 OK`, `404 Not Found`.

#### `POST /api/posts/$id/comments`
- **Request Body (Validated via `AddCommentSchema`)**:
  ```json
  {
    "authorId": "u-tifosi-insider",
    "content": "Sector 2 telemetry confirms their corner exit speed."
  }
  ```
- **Status Codes**: `201 Created`, `422 Unprocessable Entity`.

---

### 2.3 Likes & Engagement API

#### `POST /api/posts/$id/like`
- **Request Body (Validated via `LikePostSchema`)**:
  ```json
  {
    "userId": "u-tifosi-insider"
  }
  ```
- **Behavior**: Toggles like state atomically. If previously liked, removes like and decrements counter. If not liked, inserts composite primary key and increments counter. Duplicate likes are physically prevented by database schema.
- **Status Codes**: `200 OK` (returns `{ "liked": true | false }`).

---

### 2.4 Polls & Voting API

#### `POST /api/posts/$id/vote`
- **Request Body (Validated via `PollVoteSchema`)**:
  ```json
  {
    "userId": "u-tifosi-insider",
    "optionId": "opt-post-123-0"
  }
  ```
- **Behavior**: Enforces **1 vote per user per poll** via database unique constraint `(user_id, post_id)`.
- **Status Codes**:
  - `200 OK` (`{ "voted": true }`)
  - `409 Conflict` (Code: `"ALREADY_VOTED"`, message: `"You have already voted in this poll"`)

---

### 2.5 User Profiles API

#### `GET /api/users/$id`
- **Retrieves**: User profile details, followed constructors, driver allegiances, and telemetry activity.
- **Status Codes**: `200 OK`, `404 Not Found`.

#### `PATCH /api/users/$id`
- **Request Body (Validated via `UpdateProfileSchema`)**:
  ```json
  {
    "name": "Charles Insider",
    "handle": "@tifosi_charles",
    "bio": "Tracking Ferrari telemetry upgrades at Maranello."
  }
  ```
- **Status Codes**: `200 OK`, `422 Unprocessable Entity`.
