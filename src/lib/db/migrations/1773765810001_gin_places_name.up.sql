DROP INDEX IF EXISTS idx_saved_places_name;
CREATE INDEX idx_saved_places_name ON saved_places USING GIN (to_tsvector('simple', name));
