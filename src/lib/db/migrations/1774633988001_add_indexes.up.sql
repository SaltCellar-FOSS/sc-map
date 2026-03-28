-- Indexes for visits table
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_place_id ON visits(place_id);
CREATE INDEX idx_visits_visited_at ON visits(visited_at DESC);

-- Index for visit_photos table
CREATE INDEX idx_visit_photos_visit_id ON visit_photos(visit_id);

-- Indexes for saved_places table
CREATE INDEX idx_saved_places_type ON saved_places(type);
CREATE INDEX idx_saved_places_submitted_by ON saved_places(submitted_by);

-- Composite indexes for common queries
CREATE INDEX idx_saved_places_type_created ON saved_places(type, created_at DESC);
CREATE INDEX idx_visits_place_visited ON visits(place_id, visited_at DESC);
