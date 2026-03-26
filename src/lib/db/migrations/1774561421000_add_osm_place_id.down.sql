BEGIN;
ALTER TABLE saved_places DROP CONSTRAINT saved_places_has_external_id;
ALTER TABLE saved_places DROP COLUMN osm_place_id;
ALTER TABLE saved_places ALTER COLUMN google_place_id SET NOT NULL;
COMMIT;
