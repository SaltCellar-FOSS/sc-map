BEGIN;
ALTER TABLE saved_places ALTER COLUMN google_place_id DROP NOT NULL;
ALTER TABLE saved_places ADD COLUMN osm_place_id TEXT UNIQUE;
ALTER TABLE saved_places ADD CONSTRAINT saved_places_has_external_id
    CHECK (google_place_id IS NOT NULL OR osm_place_id IS NOT NULL);
COMMIT;
