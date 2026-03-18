export interface GooglePlaceResult {
	place_id: string;
	name: string;
	formatted_address: string;
	geometry: {
		location: {
			lat: number;
			lng: number;
		};
	};
	types: string[];
}

interface GooglePlacesResponse {
	results: GooglePlaceResult[];
	status: string;
}

export async function searchGooglePlaces(query: string): Promise<GooglePlaceResult[]> {
	const apiKey = process.env.PUBLIC_GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		return [];
	}

	const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
	url.searchParams.set('query', query);
	url.searchParams.set('key', apiKey);

	const response = await fetch(url.toString());
	if (!response.ok) {
		return [];
	}

	const data: GooglePlacesResponse = await response.json();
	return data.results ?? [];
}
