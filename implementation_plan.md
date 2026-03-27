# Implementation Plan

## Overview
Validate what happens when launching the Salt Cellar venue map application to staging with existing Google Maps data. The application was originally designed to use Google Places API but has been migrated to use OpenStreetMap Nominatim. However, the database contains seed data with Google Place IDs, creating potential compatibility issues that need to be identified and resolved.

## Types
No new type definitions are required. The existing `SavedPlace` schema already supports both `google_place_id` and `osm_place_id` fields with proper validation.

## Files
### Files to be analyzed:
- `src/routes/map/+page.ts` - Data loading and indexing logic
- `src/routes/map/+page.svelte` - Search result handling and place selection
- `src/lib/components/PlaceMap.svelte` - Map marker and place interaction logic
- `src/lib/place-search.ts` - Current search implementation using OSM
- `src/lib/db/seed/seed_austin_places.sql` - Seed data with Google Place IDs

### Files to be modified:
- `src/routes/map/+page.ts` - Fix data indexing to handle mixed Google/OSM IDs
- `src/routes/map/+page.svelte` - Update search result matching logic
- `src/lib/components/PlaceMap.svelte` - Update place selection to handle legacy Google Places
- `src/lib/schemas/place.ts` - Enhance ID resolution logic

## Functions
### New functions:
- `findSavedPlaceByExternalId(externalId: string): SavedPlace | null` in place utilities
- `normalizePlaceIdForLookup(place: Place): string` in place schema utilities

### Modified functions:
- `load` function in `src/routes/map/+page.ts` - Update saved places indexing
- `fetchAutocompleteResults` in `src/routes/map/+page.svelte` - Fix search result matching
- `handlePlaceSelected` in `src/lib/components/PlaceMap.svelte` - Support both ID types

## Classes
No new or modified classes required. The existing DAO and component classes can handle the changes through function modifications.

## Dependencies
No new dependencies required. All fixes can be implemented with existing libraries and APIs.

## Testing
### Test scenarios to validate:
1. **Data Loading**: Verify saved places with Google Place IDs are properly indexed and displayed
2. **Search Functionality**: Ensure search results correctly identify existing saved places regardless of ID type
3. **Place Selection**: Test clicking on map markers and search results for places with Google Place IDs
4. **Visit Management**: Confirm adding visits to existing Google Places works correctly
5. **Mixed Data**: Test interaction between OSM-sourced and Google-sourced places

### Test files to create/modify:
- Integration tests for mixed data source handling
- Unit tests for ID resolution functions

## Implementation Order
1. **Analyze current data indexing logic** - Understand how saved places are currently indexed
2. **Implement improved ID resolution** - Create utility functions for consistent ID handling
3. **Fix data loading and indexing** - Update map page load function to properly index mixed data
4. **Update search result matching** - Fix autocomplete to recognize existing places by any ID type
5. **Update place selection logic** - Ensure map interactions work with legacy Google Places
6. **Test end-to-end functionality** - Validate all scenarios work correctly
7. **Security review** - Ensure Google API key is not exposed unnecessarily