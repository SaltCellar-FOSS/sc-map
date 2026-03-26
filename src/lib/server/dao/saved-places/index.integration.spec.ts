import { sql } from '$lib/db';
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import { SavedPlaceType, type SavedPlaceInsert } from './types';
import {
	SavedPlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError,
	UserNotFoundError,
	SavedPlaceNotFoundError
} from '.';
import { UsersDao } from '$lib/server/dao/users';

describe('Integration', () => {
	let dao: SavedPlacesDao;
	let usersDao: UsersDao;
	let testUserId: bigint;

	beforeEach(async () => {
		dao = new SavedPlacesDao(sql);
		usersDao = new UsersDao(sql);

		const user = await usersDao.insertUser({
			discord_id: 'discord_test_user',
			discord_handle: 'testuser#0001',
			avatar_url: null,
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		});
		testUserId = user.id;
	});

	afterEach(async () => {
		await sql`DELETE FROM saved_places`;
		await sql`DELETE FROM users`;
	});

	describe('SavedPlacesDao', () => {
		const getBaseInsert = () =>
			({
				name: 'Test Restaurant',
				lat: 40.7128,
				lng: -74.006,
				formatted_address: '123 Test St, New York, NY 10001',
				google_place_id: 'test_google_place_id',
				type: 'RESTAURANT',
				submitted_by: testUserId
			}) as SavedPlaceInsert;

		describe('insertSavedPlace', () => {
			describe('success', () => {
				test('inserts a saved place with all fields', async () => {
					const place = await dao.insertSavedPlace(getBaseInsert());
					expect(place.id).toBeDefined();
					expect(place.name).toBe('Test Restaurant');
					expect(place.lat).toBe(40.7128);
					expect(place.lng).toBe(-74.006);
					expect(place.google_place_id).toBe('test_google_place_id');
					expect(place.type).toBe(SavedPlaceType.Restaurant);
					expect(place.submitted_by).toBe(testUserId);
				});

				test('inserts a saved place with BAR type', async () => {
					const place = await dao.insertSavedPlace({
						...getBaseInsert(),
						google_place_id: 'bar_place_id',
						type: SavedPlaceType.Bar
					});
					expect(place.type).toBe(SavedPlaceType.Bar);
				});

				test('inserts a saved place with BAKERY type', async () => {
					const place = await dao.insertSavedPlace({
						...getBaseInsert(),
						google_place_id: 'bakery_place_id',
						type: SavedPlaceType.Bakery
					});
					expect(place.type).toBe(SavedPlaceType.Bakery);
				});
			});

			describe('constraints', () => {
				test('throws DuplicateGooglePlaceIdError on duplicate google_place_id', async () => {
					await dao.insertSavedPlace(getBaseInsert());
					expect(
						dao.insertSavedPlace({ ...getBaseInsert(), name: 'Different Name' })
					).rejects.toBeInstanceOf(DuplicateGooglePlaceIdError);
				});

				test('throws UserNotFoundError when submitted_by references non-existent user', async () => {
					expect(
						dao.insertSavedPlace({ ...getBaseInsert(), submitted_by: 999999n })
					).rejects.toBeInstanceOf(UserNotFoundError);
				});

				test('throws InvalidPlaceTypeError for invalid type', async () => {
					expect(
						dao.insertSavedPlace({ ...getBaseInsert(), type: 'INVALID_TYPE' as SavedPlaceType })
					).rejects.toBeInstanceOf(InvalidPlaceTypeError);
				});
			});
		});

		describe('retrieveSavedPlace', () => {
			test('retrieves an existing saved place', async () => {
				const inserted = await dao.insertSavedPlace(getBaseInsert());
				const retrieved = await dao.retrieveSavedPlace(inserted.id);
				expect(retrieved.id).toBe(inserted.id);
				expect(retrieved.name).toBe('Test Restaurant');
			});

			test('throws SavedPlaceNotFoundError for non-existent place', async () => {
				expect(dao.retrieveSavedPlace(999999n)).rejects.toBeInstanceOf(SavedPlaceNotFoundError);
			});
		});

		describe('listSavedPlaces', () => {
			test('lists all saved places', async () => {
				await dao.insertSavedPlace(getBaseInsert());
				await dao.insertSavedPlace({
					...getBaseInsert(),
					google_place_id: 'second_place_id',
					name: 'Second Place'
				});
				const places = await dao.listSavedPlaces();
				expect(places.length).toBe(2);
			});
		});

		describe('updateSavedPlace', () => {
			describe('success', () => {
				test('updates saved place fields', async () => {
					const place = await dao.insertSavedPlace(getBaseInsert());
					const updated = await dao.updateSavedPlace(place.id, {
						name: 'Updated Name',
						lat: 41.0
					});
					expect(updated.name).toBe('Updated Name');
					expect(updated.lat).toBe(41.0);
				});
			});

			describe('constraints', () => {
				test('throws SavedPlaceNotFoundError when updating non-existent place', async () => {
					expect(dao.updateSavedPlace(999999n, { name: 'Ghost Place' })).rejects.toBeInstanceOf(
						SavedPlaceNotFoundError
					);
				});

				test('throws UserNotFoundError when updating submitted_by to non-existent user', async () => {
					const place = await dao.insertSavedPlace(getBaseInsert());
					expect(dao.updateSavedPlace(place.id, { submitted_by: 999999n })).rejects.toBeInstanceOf(
						UserNotFoundError
					);
				});

				test('throws InvalidPlaceTypeError for invalid type', async () => {
					const place = await dao.insertSavedPlace(getBaseInsert());
					expect(
						dao.updateSavedPlace(place.id, { type: 'INVALID_TYPE' as SavedPlaceType })
					).rejects.toBeInstanceOf(InvalidPlaceTypeError);
				});
			});
		});

		describe('deleteSavedPlace', () => {
			describe('success', () => {
				test('deletes a saved place', async () => {
					const place = await dao.insertSavedPlace(getBaseInsert());
					const deleted = await dao.deleteSavedPlace(place.id);
					expect(deleted.id).toBe(place.id);
					expect(deleted.name).toBe('Test Restaurant');
				});
			});

			describe('constraints', () => {
				test('throws SavedPlaceNotFoundError when deleting non-existent place', async () => {
					expect(dao.deleteSavedPlace(999999n)).rejects.toBeInstanceOf(SavedPlaceNotFoundError);
				});
			});
		});

		describe('searchSavedPlaces', () => {
			test('returns matching saved places by name', async () => {
				await dao.insertSavedPlace(getBaseInsert());
				const places = await dao.searchSavedPlaces('Test');
				expect(places.length).toBe(1);
				expect(places[0].name).toBe('Test Restaurant');
			});

			test('returns multiple matching saved places', async () => {
				await dao.insertSavedPlace(getBaseInsert());
				await dao.insertSavedPlace({
					...getBaseInsert(),
					google_place_id: 'test_place_2',
					name: 'Test Cafe'
				});
				const places = await dao.searchSavedPlaces('Test');
				expect(places.length).toBe(2);
			});

			test('returns empty array when no matches', async () => {
				await dao.insertSavedPlace(getBaseInsert());
				const places = await dao.searchSavedPlaces('NonExistent');
				expect(places).toEqual([]);
			});

			test('searches across all saved places', async () => {
				await dao.insertSavedPlace(getBaseInsert());
				await dao.insertSavedPlace({
					...getBaseInsert(),
					google_place_id: 'pizza_place',
					name: 'Pizza Palace'
				});
				const places = await dao.searchSavedPlaces('Pizza');
				expect(places.length).toBe(1);
				expect(places[0].name).toBe('Pizza Palace');
			});
		});
	});
});
