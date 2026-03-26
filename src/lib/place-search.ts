const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'sc-map/1.0';

export interface PlaceSearchResult {
	osm_place_id: string;
	name: string;
	formatted_address: string;
	lat: number;
	lng: number;
}

interface NominatimPlace {
	osm_type: string;
	osm_id: number;
	display_name: string;
	name: string;
	lat: string;
	lon: string;
	address?: Record<string, string>;
}

function buildOsmPlaceId(osmType: string, osmId: number): string {
	return `${osmType[0].toUpperCase()}${osmId}`;
}

function buildFormattedAddress(place: NominatimPlace): string {
	if (!place.address) return place.display_name;
	const { house_number, road, city, town, village, state, country } = place.address;
	const street = [house_number, road].filter(Boolean).join(' ');
	const locality = city ?? town ?? village ?? '';
	return [street, locality, state, country].filter(Boolean).join(', ');
}

function toPlaceSearchResult(place: NominatimPlace): PlaceSearchResult {
	return {
		osm_place_id: buildOsmPlaceId(place.osm_type, place.osm_id),
		name: place.name || place.display_name.split(',')[0],
		formatted_address: buildFormattedAddress(place),
		lat: parseFloat(place.lat),
		lng: parseFloat(place.lon)
	};
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
	const url = new URL(`${NOMINATIM_BASE}/search`);
	url.searchParams.set('q', query);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('limit', '10');
	url.searchParams.set('addressdetails', '1');

	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) return [];

	const places: NominatimPlace[] = await res.json();
	return places.filter((p) => p.name).map(toPlaceSearchResult);
}

export async function getPlaceById(osmPlaceId: string): Promise<PlaceSearchResult | null> {
	const url = new URL(`${NOMINATIM_BASE}/lookup`);
	url.searchParams.set('osm_ids', osmPlaceId);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('addressdetails', '1');

	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) return null;

	const places: NominatimPlace[] = await res.json();
	const place = places[0];
	if (!place) return null;

	return toPlaceSearchResult(place);
}

export async function reverseGeocode(lat: number, lng: number): Promise<PlaceSearchResult | null> {
	const url = new URL(`${NOMINATIM_BASE}/reverse`);
	url.searchParams.set('lat', String(lat));
	url.searchParams.set('lon', String(lng));
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('zoom', '18');
	url.searchParams.set('addressdetails', '1');

	const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
	if (!res.ok) return null;

	const place: NominatimPlace & { error?: string } = await res.json();
	if (place.error || !place.osm_id) return null;

	return toPlaceSearchResult(place);
}
