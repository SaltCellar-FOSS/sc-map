-- Apply migration
BEGIN;
ALTER TABLE saved_places
    DROP CONSTRAINT IF EXISTS saved_places_type_check;

ALTER TABLE saved_places
    ADD CONSTRAINT saved_places_type_check
        CHECK (type IN ('RESTAURANT', 'BAR', 'BAKERY', 'DELI', 'FOOD_TRUCK', 'DESSERT', 'OTHER_DESTINATION'));
COMMIT;
