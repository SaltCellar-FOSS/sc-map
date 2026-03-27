#!/usr/bin/env bun
import { SQL } from 'bun';

const sqlUrl = process.env.SQL_URL;
if (!sqlUrl) {
	console.error('Error: SQL_URL environment variable is not set');
	process.exit(1);
}

const sql = new SQL({ url: sqlUrl, max: 1 });

// Check command line arguments
const forceMigration = process.argv.includes('--migrate') || process.argv.includes('-m');
const showHelp = process.argv.includes('--help') || process.argv.includes('-h');

// Default to dry run mode for safety
const isDryRun = !forceMigration;

if (showHelp) {
	console.log('Google Places to OSM Migration Script');
	console.log('=====================================');
	console.log('');
	console.log('Usage:');
	console.log('  bun run scripts/migrate-google-to-osm.ts [options]');
	console.log('');
	console.log('Options:');
	console.log('  --migrate, -m     Perform actual migration (makes database changes)');
	console.log('  --help, -h        Show this help message');
	console.log('');
	console.log('Description:');
	console.log('  Migrates saved places with Google Place IDs to OSM Place IDs');
	console.log('  using reverse geocoding and name matching.');
	console.log('');
	console.log('  By default, runs in DRY RUN mode (safe, no changes made).');
	console.log('  Use --migrate to perform actual database updates.');
	console.log('  Only places with ≥70% confidence matches are migrated.');
	console.log('  Failed matches are logged for manual review.');
	console.log('');
	process.exit(0);
}

if (isDryRun) {
	console.log('🔍 DRY RUN MODE - No database changes will be made (default for safety)');
	console.log('Use --migrate to perform actual migration\n');
} else {
	console.log('⚠️  MIGRATION MODE - Database changes will be made!');
	console.log('This will update saved places with OSM IDs.\n');
}

interface SavedPlaceRow {
	id: bigint;
	name: string;
	lat: number;
	lng: number;
	google_place_id: string | null;
	osm_place_id: string | null;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'sc-map-migration/1.0';

interface NominatimPlace {
	osm_type: string;
	osm_id: number;
	display_name: string;
	name: string;
	lat: string;
	lon: string;
}

function buildOsmPlaceId(osmType: string, osmId: number): string {
	return `${osmType[0].toUpperCase()}${osmId}`;
}

async function reverseGeocode(lat: number, lng: number): Promise<NominatimPlace | null> {
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

	return place;
}

function calculateMatchConfidence(savedPlace: SavedPlaceRow, osmPlace: NominatimPlace): number {
	let confidence = 0;

	// Location match (within ~50 meters)
	const distance = Math.sqrt(
		Math.pow(savedPlace.lat - parseFloat(osmPlace.lat), 2) +
		Math.pow(savedPlace.lng - parseFloat(osmPlace.lon), 2)
	);
	if (distance < 0.0005) confidence += 50; // ~50 meters

	// Name similarity
	const savedName = savedPlace.name.toLowerCase();
	const osmName = (osmPlace.name || osmPlace.display_name.split(',')[0]).toLowerCase();
	const nameSimilarity = savedName.includes(osmName) || osmName.includes(savedName);
	if (nameSimilarity) confidence += 40;

	// Exact name match gets bonus
	if (savedName === osmName) confidence += 10;

	return Math.min(confidence, 100);
}

async function migrateGooglePlaces() {
	console.log('Starting Google Places to OSM migration...');

	// Get all places with Google IDs but no OSM IDs
	const placesToMigrate: SavedPlaceRow[] = await sql`
		SELECT id, name, lat, lng, google_place_id, osm_place_id
		FROM saved_places
		WHERE google_place_id IS NOT NULL AND osm_place_id IS NULL
	`;

	console.log(`Found ${placesToMigrate.length} places to migrate`);

	let successCount = 0;
	let failureCount = 0;
	const failures: Array<{ id: bigint; name: string; reason: string }> = [];

	for (const place of placesToMigrate) {
		try {
			console.log(`Processing: ${place.name} (${place.google_place_id})`);

			// Reverse geocode to find OSM equivalent
			const osmPlace = await reverseGeocode(place.lat, place.lng);
			if (!osmPlace) {
				failures.push({ id: place.id, name: place.name, reason: 'Reverse geocoding failed' });
				failureCount++;
				continue;
			}

			// Calculate match confidence
			const confidence = calculateMatchConfidence(place, osmPlace);
			console.log(`  Match found: ${osmPlace.name} (confidence: ${confidence}%)`);

			// Only update if confidence is high enough
			if (confidence >= 70) {
				const osmPlaceId = buildOsmPlaceId(osmPlace.osm_type, osmPlace.osm_id);

				if (isDryRun) {
					console.log(`  ✅ Would update with OSM ID: ${osmPlaceId} (DRY RUN)`);
				} else {
					await sql`
						UPDATE saved_places
						SET osm_place_id = ${osmPlaceId}
						WHERE id = ${place.id}
					`;
					console.log(`  ✅ Updated with OSM ID: ${osmPlaceId}`);
				}
				successCount++;
			} else {
				failures.push({
					id: place.id,
					name: place.name,
					reason: `Low confidence match (${confidence}%)`
				});
				failureCount++;
			}

			// Rate limiting - be nice to Nominatim
			await new Promise(resolve => setTimeout(resolve, 1000));

		} catch (error) {
			console.error(`  ❌ Error processing ${place.name}:`, error);
			failures.push({ id: place.id, name: place.name, reason: String(error) });
			failureCount++;
		}
	}

	console.log('\nMigration completed!');
	console.log(`✅ Successfully migrated: ${successCount}`);
	console.log(`❌ Failed to migrate: ${failureCount}`);

	if (failures.length > 0) {
		console.log('\nFailed migrations:');
		for (const failure of failures) {
			console.log(`  - ${failure.name} (ID: ${failure.id}): ${failure.reason}`);
		}
		console.log('\nThese places should be manually reviewed and updated.');
	}

	await sql.end();
}

migrateGooglePlaces().catch(console.error);