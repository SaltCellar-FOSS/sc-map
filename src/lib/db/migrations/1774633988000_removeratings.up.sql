-- Apply migration
BEGIN;
ALTER TABLE visits DROP COLUMN rating;
COMMIT;