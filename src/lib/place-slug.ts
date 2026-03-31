import type { SavedPlace } from './schemas/saved-place';

export function slugifyPlace(place: SavedPlace): string {
	const slug = place.name
		.toLowerCase()
		.replace(/[^a-z0-9 ]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
	return `${place.id}-${slug}`;
}

export function parsePlaceId(param: string): bigint | null {
	const m = param.match(/^(\d+)/);
	if (!m) return null;
	try {
		return BigInt(m[1]);
	} catch {
		return null;
	}
}
