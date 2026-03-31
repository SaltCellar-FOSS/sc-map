import type { SavedPlace } from './schemas/saved-place';

export const getGoogleMapsUrl = (place: SavedPlace) =>
	`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}&query_place_id=${place.google_place_id}`;

export const getAppleMapsUrl = (place: SavedPlace) =>
	`https://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.name)}`;
