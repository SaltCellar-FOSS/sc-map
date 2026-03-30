/**
 * Bun-native DB seeding script. Invoked via execSync from Node.js test infrastructure.
 * Reads a JSON command from stdin, executes it against the DB, and writes the result to stdout.
 */
import 'dotenv/config';
import { SQL } from 'bun';
import { Temporal } from '@js-temporal/polyfill';
import { UsersDao } from '$lib/server/dao/users';
import { SavedPlacesDao } from '$lib/server/dao/saved-places';
import { VisitsDao } from '$lib/server/dao/visits';
import { TEST_USERS } from './fixtures/users';

const sql = new SQL({ url: process.env.SQL_URL! });

const input = await Bun.stdin.text();
const { command, data } = JSON.parse(input) as { command: string; data?: Record<string, unknown> };

if (command === 'seed-users') {
	await sql.unsafe('TRUNCATE users RESTART IDENTITY CASCADE');
	const usersDao = new UsersDao(sql);
	for (const u of TEST_USERS) {
		await usersDao.insertUser({
			discord_id: `test-discord-${u.id}`,
			discord_handle: `testuser${u.id}`,
			avatar_url: null,
			google_id: null,
			has_lifetime_access: u.has_lifetime_access,
			is_current_server_member: u.is_current_server_member
		});
	}
	process.stdout.write(JSON.stringify({ ok: true }));
} else if (command === 'truncate-places') {
	await sql.unsafe('TRUNCATE saved_places RESTART IDENTITY CASCADE');
	process.stdout.write(JSON.stringify({ ok: true }));
} else if (command === 'seed-place') {
	const placesDao = new SavedPlacesDao(sql);
	const place = await placesDao.insertSavedPlace({
		name: String(data!.name),
		lat: Number(data!.lat),
		lng: Number(data!.lng),
		formatted_address: String(data!.formatted_address),
		google_place_id: String(data!.google_place_id),
		type: String(data!.type) as Parameters<typeof placesDao.insertSavedPlace>[0]['type'],
		submitted_by: BigInt(data!.submitted_by as string)
	});
	process.stdout.write(
		JSON.stringify({ ...place, id: String(place.id), submitted_by: String(place.submitted_by) })
	);
} else if (command === 'seed-visit') {
	const visitsDao = new VisitsDao(sql);
	const visit = await visitsDao.insertVisit({
		user_id: BigInt(data!.user_id as string),
		place_id: BigInt(data!.place_id as string),
		summary: String(data!.summary),
		visited_at: Temporal.PlainDate.from(String(data!.visited_at))
	});
	process.stdout.write(
		JSON.stringify({
			...visit,
			id: String(visit.id),
			user_id: String(visit.user_id),
			place_id: String(visit.place_id)
		})
	);
} else {
	process.stderr.write(`Unknown command: ${command}\n`);
	process.exit(1);
}
