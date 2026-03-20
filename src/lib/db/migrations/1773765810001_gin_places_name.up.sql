DROP INDEX IF EXISTS idx_places_name;
CREATE INDEX idx_places_name ON places USING GIN (to_tsvector('simple', name));
