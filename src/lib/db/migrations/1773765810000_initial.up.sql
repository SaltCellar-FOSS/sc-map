-- Apply migration
BEGIN;
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

CREATE TABLE visit_photos (
    id         BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    visit_id   BIGINT NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMIT;