BEGIN;
DROP INDEX IF EXISTS idx_places_name;
CREATE INDEX idx_places_name ON places (name);
COMMIT;
