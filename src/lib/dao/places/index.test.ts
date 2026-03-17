import type { SQL } from 'bun';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { PlaceInsert } from './types';
import {
	PlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError,
	UserNotFoundError,
	PlaceNotFoundError
} from '.';

const placeRow = {
	id: 1n,
	name: 'Test Bakery',
	lat: 40.7128,
	lng: -74.006,
	google_place_id: 'abc123',
	type: 'BAKERY',
	submitted_by: 42n,
	created_at: new Date('2024-01-01'),
};

function createMockSQL(rows: unknown[] = []): SQL {
	return function (strings: unknown): unknown {
		if (Array.isArray(strings) && 'raw' in (strings as object)) {
			return Promise.resolve(rows);
		}
		return strings;
	} as unknown as SQL;
}

function createErrorSQL(errno: string): SQL {
	return function (strings: unknown): unknown {
		if (Array.isArray(strings) && 'raw' in (strings as object)) {
			return Promise.reject(Object.assign(new Error('db error'), { errno }));
		}
		return strings;
	} as unknown as SQL;
}

const placeInsert: PlaceInsert = {
	name: 'Test Bakery',
	lat: 40.7128,
	lng: -74.006,
	google_place_id: 'abc123',
	type: 'BAKERY',
	submitted_by: 42n,
};

describe('PlacesDao', () => {
	describe('retrievePlace', () => {
		describe('success', () => {
			let dao: PlacesDao;
			beforeEach(() => {
				dao = new PlacesDao(createMockSQL([placeRow]));
			});

			test('retrieves a Place', async () => {
				const place = await dao.retrievePlace(1n);
				expect(place.name).toEqual('Test Bakery');
			});
		});

		describe('errors', () => {
			test('throws PlaceNotFoundError when place does not exist', async () => {
				const dao = new PlacesDao(createMockSQL([]));
				expect(dao.retrievePlace(1n)).rejects.toBeInstanceOf(PlaceNotFoundError);
			});
		});
	});

	describe('insertPlace', () => {
		describe('success', () => {
			let dao: PlacesDao;
			beforeEach(() => {
				dao = new PlacesDao(createMockSQL([placeRow]));
			});

			test('inserts and returns a place', async () => {
				const place = await dao.insertPlace(placeInsert);
				expect(place.id).toBeDefined();
				expect(place.name).toBe('Test Bakery');
				expect(place.google_place_id).toBe('abc123');
				expect(place.type).toBe('BAKERY');
				expect(place.submitted_by).toBe(42n);
			});
		});

		describe('errors', () => {
			test('throws DuplicateGooglePlaceIdError on duplicate google_place_id', async () => {
				const dao = new PlacesDao(createErrorSQL('23505'));
				expect(dao.insertPlace(placeInsert)).rejects.toBeInstanceOf(DuplicateGooglePlaceIdError);
			});

			test('throws InvalidPlaceTypeError on invalid type', async () => {
				const dao = new PlacesDao(createErrorSQL('23514'));
				expect(
					dao.insertPlace({ ...placeInsert, type: 'INVALID' as 'BAKERY' })
				).rejects.toBeInstanceOf(InvalidPlaceTypeError);
			});

			test('throws UserNotFoundError when submitted_by user does not exist', async () => {
				const dao = new PlacesDao(createErrorSQL('23503'));
				expect(
					dao.insertPlace({ ...placeInsert, submitted_by: BigInt(999999) })
				).rejects.toBeInstanceOf(UserNotFoundError);
			});
		});
	});

	describe('listPlaces', () => {
		describe('success', () => {
			let dao: PlacesDao;
			beforeEach(() => {
				dao = new PlacesDao(createMockSQL([
					{ ...placeRow, id: 1n, google_place_id: 'gid001' },
					{ ...placeRow, id: 2n, google_place_id: 'gid002' },
					{ ...placeRow, id: 3n, google_place_id: 'gid003' },
				]));
			});

			test('lists all places', async () => {
				const places = await dao.listPlaces();
				expect(places).toHaveLength(3);
			});
		});
	});

	describe('deletePlace', () => {
		describe('success', () => {
			let dao: PlacesDao;
			beforeEach(() => {
				dao = new PlacesDao(createMockSQL([placeRow]));
			});

			test('deletes place', async () => {
				const deleted = await dao.deletePlace(1n);
				expect(deleted.id).toBe(1n);
			});
		});

		describe('errors', () => {
			test('throws PlaceNotFoundError when place does not exist', async () => {
				const dao = new PlacesDao(createMockSQL([]));
				expect(dao.deletePlace(1n)).rejects.toBeInstanceOf(PlaceNotFoundError);
			});
		});
	});

	describe('updatePlace', () => {
		describe('success', () => {
			let dao: PlacesDao;
			beforeEach(() => {
				dao = new PlacesDao(createMockSQL([{ ...placeRow, name: 'Test Name' }]));
			});

			test('updates place', async () => {
				const updated = await dao.updatePlace(1n, { name: 'Test Name' });
				expect(updated.name).toEqual('Test Name');
			});
		});

		describe('errors', () => {
			test('throws PlaceNotFoundError when place does not exist', async () => {
				const dao = new PlacesDao(createMockSQL([]));
				expect(dao.updatePlace(1n, { name: 'Ghost' })).rejects.toBeInstanceOf(PlaceNotFoundError);
			});

			test('throws InvalidPlaceTypeError on invalid type', async () => {
				const dao = new PlacesDao(createErrorSQL('23514'));
				expect(
					dao.updatePlace(1n, { type: 'INVALID' as 'BAKERY' })
				).rejects.toBeInstanceOf(InvalidPlaceTypeError);
			});

			test('throws UserNotFoundError when submitted_by user does not exist', async () => {
				const dao = new PlacesDao(createErrorSQL('23503'));
				expect(
					dao.updatePlace(1n, { submitted_by: BigInt(999999) })
				).rejects.toBeInstanceOf(UserNotFoundError);
			});
		});
	});
});
