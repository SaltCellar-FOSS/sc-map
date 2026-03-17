import { sql } from '$lib/db';
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import type { PlaceInsert } from './types';
import {
	PlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError,
	UserNotFoundError,
	PlaceNotFoundError
} from '.';
import { UsersDao } from '$lib/dao/users';

describe('Integration', () => {
	let dao: PlacesDao;
	let usersDao: UsersDao;
	let testUserId: bigint;

	beforeEach(async () => {
		dao = new PlacesDao(sql);
		usersDao = new UsersDao(sql);

		const user = await usersDao.insertUser({
			discord_id: 'discord_test_user',
			discord_handle: 'testuser#0001',
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		});
		testUserId = user.id;
	});

	afterEach(async () => {
		await sql`DELETE FROM places`;
		await sql`DELETE FROM users`;
	});

	describe('PlacesDao', () => {
		const getBaseInsert = () =>
			({
				name: 'Test Restaurant',
				lat: 40.7128,
				lng: -74.006,
				google_place_id: 'test_google_place_id',
				type: 'RESTAURANT',
				submitted_by: testUserId
			}) as PlaceInsert;

		describe('insertPlace', () => {
			describe('success', () => {
				test('inserts a place with all fields', async () => {
					const place = await dao.insertPlace(getBaseInsert());
					expect(place.id).toBeDefined();
					expect(place.name).toBe('Test Restaurant');
					expect(place.lat).toBe(40.7128);
					expect(place.lng).toBe(-74.006);
					expect(place.google_place_id).toBe('test_google_place_id');
					expect(place.type).toBe('RESTAURANT');
					expect(place.submitted_by).toBe(testUserId);
				});

				test('inserts a place with BAR type', async () => {
					const place = await dao.insertPlace({
						...getBaseInsert(),
						google_place_id: 'bar_place_id',
						type: 'BAR'
					});
					expect(place.type).toBe('BAR');
				});

				test('inserts a place with BAKERY type', async () => {
					const place = await dao.insertPlace({
						...getBaseInsert(),
						google_place_id: 'bakery_place_id',
						type: 'BAKERY'
					});
					expect(place.type).toBe('BAKERY');
				});
			});

			describe('constraints', () => {
				test('throws DuplicateGooglePlaceIdError on duplicate google_place_id', async () => {
					await dao.insertPlace(getBaseInsert());
					expect(
						dao.insertPlace({ ...getBaseInsert(), name: 'Different Name' })
					).rejects.toBeInstanceOf(DuplicateGooglePlaceIdError);
				});

				test('throws UserNotFoundError when submitted_by references non-existent user', async () => {
					expect(
						dao.insertPlace({ ...getBaseInsert(), submitted_by: 999999n })
					).rejects.toBeInstanceOf(UserNotFoundError);
				});

				test('throws InvalidPlaceTypeError for invalid type', async () => {
					expect(
						dao.insertPlace({ ...getBaseInsert(), type: 'INVALID_TYPE' as 'RESTAURANT' })
					).rejects.toBeInstanceOf(InvalidPlaceTypeError);
				});
			});
		});

		describe('retrievePlace', () => {
			test('retrieves an existing place', async () => {
				const inserted = await dao.insertPlace(getBaseInsert());
				const retrieved = await dao.retrievePlace(inserted.id);
				expect(retrieved.id).toBe(inserted.id);
				expect(retrieved.name).toBe('Test Restaurant');
			});

			test('throws PlaceNotFoundError for non-existent place', async () => {
				expect(dao.retrievePlace(999999n)).rejects.toBeInstanceOf(PlaceNotFoundError);
			});
		});

		describe('listPlaces', () => {
			test('lists all places', async () => {
				await dao.insertPlace(getBaseInsert());
				await dao.insertPlace({
					...getBaseInsert(),
					google_place_id: 'second_place_id',
					name: 'Second Place'
				});
				const places = await dao.listPlaces();
				expect(places.length).toBe(2);
			});
		});

		describe('updatePlace', () => {
			describe('success', () => {
				test('updates place fields', async () => {
					const place = await dao.insertPlace(getBaseInsert());
					const updated = await dao.updatePlace(place.id, {
						name: 'Updated Name',
						lat: 41.0
					});
					expect(updated.name).toBe('Updated Name');
					expect(updated.lat).toBe(41.0);
				});
			});

			describe('constraints', () => {
				test('throws PlaceNotFoundError when updating non-existent place', async () => {
					expect(dao.updatePlace(999999n, { name: 'Ghost Place' })).rejects.toBeInstanceOf(
						PlaceNotFoundError
					);
				});

				test('throws UserNotFoundError when updating submitted_by to non-existent user', async () => {
					const place = await dao.insertPlace(getBaseInsert());
					expect(dao.updatePlace(place.id, { submitted_by: 999999n })).rejects.toBeInstanceOf(
						UserNotFoundError
					);
				});

				test('throws InvalidPlaceTypeError for invalid type', async () => {
					const place = await dao.insertPlace(getBaseInsert());
					expect(
						dao.updatePlace(place.id, { type: 'INVALID_TYPE' as 'RESTAURANT' })
					).rejects.toBeInstanceOf(InvalidPlaceTypeError);
				});
			});
		});

		describe('deletePlace', () => {
			describe('success', () => {
				test('deletes a place', async () => {
					const place = await dao.insertPlace(getBaseInsert());
					const deleted = await dao.deletePlace(place.id);
					expect(deleted.id).toBe(place.id);
					expect(deleted.name).toBe('Test Restaurant');
				});
			});

			describe('constraints', () => {
				test('throws PlaceNotFoundError when deleting non-existent place', async () => {
					expect(dao.deletePlace(999999n)).rejects.toBeInstanceOf(PlaceNotFoundError);
				});
			});
		});
	});
});
