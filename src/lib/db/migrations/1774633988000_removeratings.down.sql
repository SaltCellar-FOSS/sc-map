-- Revert migration
BEGIN;
ALTER TABLE visits ADD COLUMN rating SMALLINT;
COMMIT;