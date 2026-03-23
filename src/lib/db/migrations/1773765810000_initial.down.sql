-- Revert migration
BEGIN;
DROP TABLE IF EXISTS visit_photos;
DROP TABLE IF EXISTS visits;
DROP INDEX IF EXISTS idx_saved_places_name;
DROP TABLE IF EXISTS saved_places;
DROP TABLE IF EXISTS users;
COMMIT;
