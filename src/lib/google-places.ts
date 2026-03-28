interface GooglePlaceResult {
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

export async function getGooglePlaceById(
	placeId: string,
	sessionToken: string | null = null
): Promise<GooglePlaceResult | null> {
	const { PUBLIC_GOOGLE_MAPS_API_KEY: apiKey } = await import('$env/static/public');
	if (!apiKey) return null;

	const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
	if (sessionToken) url.searchParams.set('sessionToken', String(sessionToken));

	const response = await fetch(url, {
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

interface PlacePrediction {
	place: string;
	placeId: string;
	text: {
		text: string;
		matches: unknown[];
	};
	structuredFormat: {
		mainText: { text: string; matches: unknown[] };
		secondaryText?: { text: string; matches: unknown[] };
	};
	types: string[];
}

type AutocompleteResponse = {
	suggestions: { placePrediction: PlacePrediction }[];
};

export type AutocompleteSuggestion = {
	name: string;
	formatted_address?: string;
	google_place_id: string;
};

export async function autocompletePlaces(
	query: string,
	sessionToken: string
): Promise<AutocompleteSuggestion[]> {
	const { PUBLIC_GOOGLE_MAPS_API_KEY: apiKey } = await import('$env/static/public');
	if (!apiKey) return [];
	const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
		method: 'POST',
		body: JSON.stringify({
			input: query,
			sessionToken
		}),
		headers: {
			'X-Goog-Api-Key': apiKey
		}
	});

	const autocompleteResponse: AutocompleteResponse = await res.json();

	return (autocompleteResponse.suggestions ?? []).map<AutocompleteSuggestion>(
		({ placePrediction }) => {
			return {
				name: placePrediction.structuredFormat.mainText.text,
				formatted_address: placePrediction.structuredFormat.secondaryText?.text,
				google_place_id: placePrediction.placeId
			};
		}
	);
}
