-- Drop indexes for visits table
DROP INDEX IF EXISTS idx_visits_user_id;
DROP INDEX IF EXISTS idx_visits_place_id;
DROP INDEX IF EXISTS idx_visits_visited_at;

-- Drop index for visit_photos table
DROP INDEX IF EXISTS idx_visit_photos_visit_id;

-- Drop indexes for saved_places table
DROP INDEX IF EXISTS idx_saved_places_type;
DROP INDEX IF EXISTS idx_saved_places_submitted_by;

-- Drop composite indexes
DROP INDEX IF EXISTS idx_saved_places_type_created;
DROP INDEX IF EXISTS idx_visits_place_visited;
