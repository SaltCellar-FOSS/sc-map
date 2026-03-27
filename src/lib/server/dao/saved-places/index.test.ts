import { beforeEach, describe, expect, test } from 'bun:test';
import { SavedPlaceType, type SavedPlaceInsert } from './types';
import {
	SavedPlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError,
	UserNotFoundError,
	SavedPlaceNotFoundError
} from '.';
import { createMockSQL, createErrorSQL } from '../mock';

const placeRow = {
	id: 1n,
	name: 'Test Bakery',
	lat: 40.7128,
	lng: -74.006,
	formatted_address: '123 Test St, New York, NY 10001',
	google_place_id: 'abc123',
	type: 'BAKERY',
	submitted_by: 42n,
	created_at: new Date('2024-01-01')
};

const placeInsert: SavedPlaceInsert = {
	name: 'Test Bakery',
	lat: 40.7128,
	lng: -74.006,
	formatted_address: '123 Test St, New York, NY 10001',
	google_place_id: 'abc123',
	type: SavedPlaceType.Bakery,
	submitted_by: 42n
};

describe('SavedPlacesDao', () => {
	describe('retrieveSavedPlace', () => {
		describe('success', () => {
			let dao: SavedPlacesDao;
			beforeEach(() => {
				dao = new SavedPlacesDao(createMockSQL([placeRow]));
			});

			test('retrieves a SavedPlace', async () => {
				const place = await dao.retrieveSavedPlace(1n);
				expect(place.name).toEqual('Test Bakery');
			});
		});

		describe('errors', () => {
			test('throws SavedPlaceNotFoundError when place does not exist', async () => {
				const dao = new SavedPlacesDao(createMockSQL([]));
				expect(dao.retrieveSavedPlace(1n)).rejects.toBeInstanceOf(SavedPlaceNotFoundError);
			});
		});
	});

	describe('insertSavedPlace', () => {
		describe('success', () => {
			let dao: SavedPlacesDao;
			beforeEach(() => {
				dao = new SavedPlacesDao(createMockSQL([placeRow]));
			});

			test('inserts and returns a saved place', async () => {
				const place = await dao.insertSavedPlace(placeInsert);
				expect(place.id).toBeDefined();
				expect(place.name).toBe('Test Bakery');
				expect(place.google_place_id).toBe('abc123');
				expect(place.type).toBe(SavedPlaceType.Bakery);
				expect(place.submitted_by).toBe(42n);
			});
		});

		describe('errors', () => {
			test('throws DuplicateGooglePlaceIdError on duplicate google_place_id', async () => {
				const dao = new SavedPlacesDao(createErrorSQL('23505'));
				expect(dao.insertSavedPlace(placeInsert)).rejects.toBeInstanceOf(
					DuplicateGooglePlaceIdError
				);
			});

			test('throws InvalidPlaceTypeError on invalid type', async () => {
				const dao = new SavedPlacesDao(createErrorSQL('23514'));
				expect(
					dao.insertSavedPlace({ ...placeInsert, type: 'INVALID' as SavedPlaceType })
				).rejects.toBeInstanceOf(InvalidPlaceTypeError);
			});

			test('throws UserNotFoundError when submitted_by user does not exist', async () => {
				const dao = new SavedPlacesDao(createErrorSQL('23503'));
				expect(
					dao.insertSavedPlace({ ...placeInsert, submitted_by: BigInt(999999) })
				).rejects.toBeInstanceOf(UserNotFoundError);
			});
		});
	});

	describe('listSavedPlaces', () => {
		describe('success', () => {
			let dao: SavedPlacesDao;
			beforeEach(() => {
				dao = new SavedPlacesDao(
					createMockSQL([
						{ ...placeRow, id: 1n, google_place_id: 'gid001' },
						{ ...placeRow, id: 2n, google_place_id: 'gid002' },
						{ ...placeRow, id: 3n, google_place_id: 'gid003' }
					])
				);
			});

			test('lists all saved places', async () => {
				const places = await dao.listSavedPlaces();
				expect(places).toHaveLength(3);
			});
		});
	});

	describe('deleteSavedPlace', () => {
		describe('success', () => {
			let dao: SavedPlacesDao;
			beforeEach(() => {
				dao = new SavedPlacesDao(createMockSQL([placeRow]));
			});

			test('deletes saved place', async () => {
				const deleted = await dao.deleteSavedPlace(1n);
				expect(deleted.id).toBe(1n);
			});
		});

		describe('errors', () => {
			test('throws SavedPlaceNotFoundError when place does not exist', async () => {
				const dao = new SavedPlacesDao(createMockSQL([]));
				expect(dao.deleteSavedPlace(1n)).rejects.toBeInstanceOf(SavedPlaceNotFoundError);
			});
		});
	});

	describe('countPins', () => {
		test('returns the count as a number', async () => {
			const dao = new SavedPlacesDao(createMockSQL([{ count: '275' }]));
			const count = await dao.countPins();
			expect(count).toBe(275);
		});

		test('returns 0 when there are no saved places', async () => {
			const dao = new SavedPlacesDao(createMockSQL([{ count: '0' }]));
			const count = await dao.countPins();
			expect(count).toBe(0);
		});
	});

	describe('updateSavedPlace', () => {
		describe('success', () => {
			let dao: SavedPlacesDao;
			beforeEach(() => {
				dao = new SavedPlacesDao(createMockSQL([{ ...placeRow, name: 'Test Name' }]));
			});

			test('updates saved place', async () => {
				const updated = await dao.updateSavedPlace(1n, { name: 'Test Name' });
				expect(updated.name).toEqual('Test Name');
			});
		});

		describe('errors', () => {
			test('throws SavedPlaceNotFoundError when place does not exist', async () => {
				const dao = new SavedPlacesDao(createMockSQL([]));
				expect(dao.updateSavedPlace(1n, { name: 'Ghost' })).rejects.toBeInstanceOf(
					SavedPlaceNotFoundError
				);
			});

			test('throws InvalidPlaceTypeError on invalid type', async () => {
				const dao = new SavedPlacesDao(createErrorSQL('23514'));
				expect(
					dao.updateSavedPlace(1n, { type: 'INVALID' as SavedPlaceType })
				).rejects.toBeInstanceOf(InvalidPlaceTypeError);
			});

			test('throws UserNotFoundError when submitted_by user does not exist', async () => {
				const dao = new SavedPlacesDao(createErrorSQL('23503'));
				expect(dao.updateSavedPlace(1n, { submitted_by: BigInt(999999) })).rejects.toBeInstanceOf(
					UserNotFoundError
				);
			});
		});
	});
});
