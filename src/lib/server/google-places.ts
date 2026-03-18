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

interface NewPlaceResult {
	id: string;
	displayName: { text: string; languageCode: string };
	formattedAddress: string;
	location: { latitude: number; longitude: number };
	types: string[];
}

interface NewPlacesResponse {
	places: NewPlaceResult[];
}

export async function getGooglePlaceById(placeId: string): Promise<GooglePlaceResult | null> {
	const apiKey = process.env.PUBLIC_GOOGLE_MAPS_API_KEY;
	if (!apiKey) return null;

	const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
		headers: {
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types'
		}
	});

	if (!response.ok) return null;

	const p: NewPlaceResult = await response.json();
	return {
		place_id: p.id,
		name: p.displayName.text,
		formatted_address: p.formattedAddress,
		geometry: { location: { lat: p.location.latitude, lng: p.location.longitude } },
		types: p.types
	};
}

export async function searchGooglePlaces(
	query: string,
	includedType?: string
): Promise<GooglePlaceResult[]> {
	const apiKey = process.env.PUBLIC_GOOGLE_MAPS_API_KEY;
	if (!apiKey) {
		return [];
	}

	const body: Record<string, unknown> = { textQuery: query };
	if (includedType) {
		body.includedType = includedType;
	}

	const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Goog-Api-Key': apiKey,
			'X-Goog-FieldMask':
				'places.id,places.displayName,places.formattedAddress,places.location,places.types'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		return [];
	}

	const data: NewPlacesResponse = await response.json();
	return (data.places ?? []).map((p) => ({
		place_id: p.id,
		name: p.displayName.text,
		formatted_address: p.formattedAddress,
		geometry: {
			location: {
				lat: p.location.latitude,
				lng: p.location.longitude
			}
		},
		types: p.types
	}));
}
