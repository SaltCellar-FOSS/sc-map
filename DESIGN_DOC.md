# Salt Cellar Venue Map — Design Document

**Version 0.1 · Draft**

---

## Table of Contents

1. [Overview](#1-overview)
2. [Access & Authentication](#2-access--authentication)
3. [Feature Specifications](#3-feature-specifications)
4. [Data Model](#4-data-model)
5. [Decisions & Future Work](#5-decisions--future-work)

---

## 1. Overview

Salt Cellar is a private, Discord-gated web application that lets members of the Salt Cellar Discord server discover, submit, and review food & drink venues. The map experience is modeled after Google Maps but scoped exclusively to restaurants, bars, and bakeries relevant to the community.

### 1.1 Goals

- Give Discord members a shared, living map of community-vetted venues.
- Keep access tightly coupled to Discord membership, with a graceful upgrade path for long-standing members.
- Provide a lightweight, polished UI that mirrors the ergonomics of Google Maps.

### 1.2 Non-Goals

- Full parity with Google Maps (routing, Street View, business hours, etc.).
- Public / anonymous access.
- Mobile native app (web-responsive is sufficient for v1).

---

## 2. Access & Authentication

Access is governed by Discord membership. Two tiers exist:

| Tier              | Condition                                   | Behavior                                                                                    |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Server Member** | Active member of the Discord server         | Can log in as long as membership is current. Losing membership revokes access.              |
| **Goated**        | Held the "Goated" Discord role at any point | Granted `has_lifetime_access = true` permanently. Can log in even after leaving the server. |

### 2.1 Discord OAuth Flow

1. User clicks "Sign in with Discord."
2. On successful OAuth callback, the server checks:
   - Is the user a member of the Salt Cellar guild? If not, deny access.
   - Does the user have the "Goated" role? If yes, set `has_lifetime_access = true`.
3. Store `discord_id`, `discord_handle`, and `is_current_server_member`.
4. Issue a session token and redirect to the map.

### 2.2 Membership Re-verification

To keep `is_current_server_member` fresh without hammering the Discord API, verification happens:

- **On every login** — always re-check role and membership status.
- **Periodically via a background job** — poll every 72 hours to catch users who have left the server between logins.

At 72-hour intervals the app makes one Discord API call per non-lifetime user to check guild membership and role. This keeps the call volume low while ensuring access is revoked within three days of a user leaving the server.

### 2.3 Google Account Linking

A signed-in user can optionally link a Google account. This provides a fallback login method in the event they delete their Discord account.

- Linking is initiated from a user settings page.
- Google sign-in is only permitted for users who already have an existing app account (no new-account creation via Google).
- Access rules remain identical — a linked Google account inherits the same access tier as the Discord account.

---

## 3. Feature Specifications

### 3.1 View Map

The primary screen. Modeled after Google Maps but limited to Salt Cellar-relevant functionality.

#### Map Display

- Renders all approved venues as map markers.
- Marker style varies by venue type:
  - **Restaurants** — fork & knife icon
  - **Bars** — martini glass icon
  - **Bakeries** — bread loaf icon
- Default viewport centers on the user's geolocation.

#### Filters

- Sidebar or top-bar filter chips for venue type (Restaurant, Bar, Bakery).
- Multiple types can be selected simultaneously.
- Future consideration: filter by submitter.

#### Venue Drawer

Clicking a marker opens a left-side drawer (Google Maps-style) containing:

| Field                | Details                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| Place name           | As returned by the Google Places API                                                                        |
| Venue type           | Restaurant / Bar / Bakery badge                                                                             |
| Average rating       | Mean of all rated visits, displayed as a star score (e.g. ★ 3.8). Hidden if no visits have a rating.        |
| Date first submitted | Formatted as "Month DD, YYYY"                                                                               |
| Visit list           | Reverse chronological; each entry shows date, submitter Discord handle, optional photos, and a text summary |

### 3.2 Submit Place

Any authenticated user can submit a new venue. A Google Places lookup assists with discovery and pre-fills location data.

#### Form Fields

- **Google Place search** (autocomplete) — populates name, lat/lng, and `google_place_id` automatically.
- **Venue type** — dropdown: Restaurant, Bar, Bakery.
- **Visit date** — date picker, defaults to today.
- **Visit summary** — required text area.
- **Photos** — optional multi-file upload (stored separately in `visit_photos`).
- **Rating** — optional 1–5 star selector.

#### Behavior

- If `google_place_id` already exists in the `places` table, the submission is treated as a new visit on the existing place (not a duplicate place).
- Otherwise, a new `place` row and a new `visit` row are created atomically.
- Submitted venues appear on the map immediately after save.

> **Note:** The first submission of a place doubles as the first visit. The `submitted_by` column on `places` records who created the place entry, separate from the visit author.

### 3.3 Edit Visit

Any authenticated member may edit their submitted visits.

- Editable fields: visit date, summary, rating, photos.
- `updated_at` is refreshed on save.

### 3.4 Delete Visit

Any authenticated member may delete their own visits.

- Hard delete (row removed from `visits`; associated `visit_photos` rows cascade-delete).
- If deleting a visit would leave a place with zero visits, delete the place.

### 3.5 Search

A unified search bar will exist in the map header.
The search bar will perform a search of all the submitted places in the database.

SQL schema. All timestamps are stored in UTC (`TIMESTAMPTZ`).

### 4.1 `users`

```sql
CREATE TABLE users (
    id                       BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    discord_id               TEXT UNIQUE,
    discord_handle           TEXT,
    google_id                TEXT UNIQUE,
    has_lifetime_access      BOOLEAN NOT NULL DEFAULT FALSE,
    is_current_server_member BOOLEAN NOT NULL DEFAULT FALSE,
    last_checked_at          TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_has_identity
        CHECK (discord_id IS NOT NULL OR google_id IS NOT NULL)
);
```

Key design notes:

- A user must have at least one identity (Discord or Google) — enforced by the `CHECK` constraint.
- `has_lifetime_access` is set to `TRUE` at first login if the Goated role is detected, and is never revoked.
- `last_checked_at` tracks when we last polled Discord for membership/role status.

### 4.2 `places`

```sql
CREATE TABLE places (
    id              BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name            TEXT NOT NULL,
    lat             FLOAT8 NOT NULL,
    lng             FLOAT8 NOT NULL,
    google_place_id TEXT UNIQUE NOT NULL,
    type            TEXT NOT NULL,
    submitted_by    BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT places_type_check
        CHECK (type IN ('RESTAURANT', 'BAR', 'BAKERY'))
);
```

### 4.3 `visits`

```sql
CREATE TABLE visits (
    id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    place_id   BIGINT NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
    summary    TEXT NOT NULL,
    rating     SMALLINT,
    visited_at DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT visits_rating_check
        CHECK (rating BETWEEN 1 AND 5)
);
```

### 4.4 `visit_photos`

```sql
CREATE TABLE visit_photos (
    id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    visit_id   BIGINT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4.5 Entity Relationship Summary

| From     | Cardinality | To             | Notes          |
| -------- | ----------- | -------------- | -------------- |
| `users`  | 1 → many    | `places`       | `submitted_by` |
| `users`  | 1 → many    | `visits`       | `user_id`      |
| `places` | 1 → many    | `visits`       | `place_id`     |
| `visits` | 1 → many    | `visit_photos` | CASCADE delete |

---

## 5. Decisions & Future Work

### 5.1 Resolved Decisions

| Topic                        | Decision                                                                                                                                               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Polling interval**         | Check Discord membership every 72 hours via background job, plus on every login.                                                                       |
| **Photo storage**            | Cloudflare R2 — lowest cost at small scale, S3-compatible API, no egress fees. The `url` column in `visit_photos` is backend-agnostic if this changes. |
| **Place deletion**           | Hard delete, admin-only, out of scope for v1. No `is_deleted` flag needed.                                                                             |
| **Rating aggregation**       | Show average rating on the venue drawer. Hidden if no rated visits exist.                                                                              |
| **Place editing**            | Any authenticated member can edit any place's metadata (name, type). No ownership restriction.                                                         |
| **Search**                   | In scope for v1. Client-side substring match on place name. Composes with type filters.                                                                |
| **Filter by rating**         | Not in scope — average rating is visible in the drawer but not a filter axis.                                                                          |
| **Multiple Discord servers** | Out of scope. Single-guild assumption throughout.                                                                                                      |

### 5.2 Remaining Open Questions

| Question                      | Notes                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Filter by submitter**       | Could be useful as the dataset grows. Defer to v2.                                                                                         |
| **Place deletion by members** | Currently admin-only. Should members be able to nominate a place for deletion if it has no visits?                                         |
| **Goated role re-check**      | `has_lifetime_access` is set on first login and never revoked. Should there be any mechanism to manually revoke it (e.g., admin override)? |
