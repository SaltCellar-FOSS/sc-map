-- Revert migration
BEGIN;
UPDATE saved_places
    SET type = 'RESTAURANT'
    WHERE type IN ('DELI', 'FOOD_TRUCK', 'DESSERT', 'OTHER_DESTINATION');

ALTER TABLE saved_places
    DROP CONSTRAINT IF EXISTS saved_places_type_check;

ALTER TABLE saved_places
    ADD CONSTRAINT saved_places_type_check
        CHECK (type IN ('RESTAURANT', 'BAR', 'BAKERY'));
COMMIT;
