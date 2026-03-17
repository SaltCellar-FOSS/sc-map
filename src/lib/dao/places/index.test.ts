import { SQL } from 'bun';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { Place, PlaceInsert } from './types';
import {
	PlacesDao,
	DuplicateGooglePlaceIdError,
	InvalidPlaceTypeError,
	UserNotFoundError,
	PlaceNotFoundError
} from '.';

const testSQL = new SQL(process.env.TEST_SQL_URL!);

async function createTestUser({ discordId = '123', discordHandle = 'testuser' } = {}) {
	const [user] = await testSQL`
		INSERT INTO users (discord_id, discord_handle)
		VALUES (${discordId}, ${discordHandle})
		RETURNING *`;
	return user;
}

describe('PlacesDao', () => {
	let placesDao: PlacesDao;
	let user: unknown & { id: bigint };
	beforeEach(async () => {
		placesDao = new PlacesDao(testSQL);
		user = await createTestUser();
	});

	describe('retrievePlace', () => {
		let placeId: bigint;

		beforeEach(async () => {
			const [place] = await testSQL`
				INSERT INTO places (name, lat, lng, google_place_id, type, submitted_by)
				VALUES
					('Place One', 40.7128, -74.006, 'gid001', 'RESTAURANT', ${user.id})
				RETURNING *`;

			placeId = place.id;
		})

		test('successfully retrieves a Place', async () => {
			const place = await placesDao.retrievePlace(placeId);

			expect(place.name).toEqual('Place One');
		})

		test('throws PlaceNotFoundError when place does not exist', async () => {
			expect(placesDao.retrievePlace(BigInt(999999))).rejects.toBeInstanceOf(PlaceNotFoundError);
		})
	})


	describe('insertPlace', () => {
		let placeInsert: PlaceInsert;

		beforeEach(() => {
			placeInsert = {
				name: 'Test Bakery',
				lat: 40.7128,
				lng: -74.006,
				google_place_id: 'abc123',
				type: 'BAKERY',
				submitted_by: user.id
			};
		})

		test('inserts and returns a place', async () => {
			const place = await placesDao.insertPlace(placeInsert);

			expect(place.id).toBeDefined();
			expect(place.name).toBe('Test Bakery');
			expect(place.google_place_id).toBe('abc123');
			expect(place.type).toBe('BAKERY');
			expect(place.submitted_by).toBe(user.id);
		});

		test('throws DuplicateGooglePlaceIdError on duplicate google_place_id', async () => {
			await placesDao.insertPlace(placeInsert);
			expect(placesDao.insertPlace(placeInsert)).rejects.toBeInstanceOf(
				DuplicateGooglePlaceIdError
			);
		});

		test('throws InvalidPlaceTypeError on invalid type', async () => {
			expect(
				placesDao.insertPlace({ ...placeInsert, type: 'INVALID' as 'BAKERY' })
			).rejects.toBeInstanceOf(InvalidPlaceTypeError);
		});

		test('throws UserNotFoundError when submitted_by user does not exist', async () => {
			expect(
				placesDao.insertPlace({ ...placeInsert, submitted_by: BigInt(999999) })
			).rejects.toBeInstanceOf(UserNotFoundError);
		});
	});

	describe('listPlaces', () => {
		beforeEach(async () => {
			await testSQL`
				INSERT INTO places (name, lat, lng, google_place_id, type, submitted_by)
				VALUES
					('Place One', 40.7128, -74.006, 'gid001', 'RESTAURANT', ${user.id}),
					('Place Two', 34.0522, -118.2437, 'gid002', 'BAR', ${user.id}),
					('Place Three', 41.8781, -87.6298, 'gid003', 'BAKERY', ${user.id})`;
		})
		test('lists all places', async () => {
			const places = await placesDao.listPlaces();
			expect(places).toHaveLength(3);
		})
	})

	describe('deletePlace', () => {
		let placeToDeleteId: bigint;
		beforeEach(async () => {
			const [place] = await testSQL`
				INSERT INTO places (name, lat, lng, google_place_id, type, submitted_by)
				VALUES
					('Place One', 40.7128, -74.006, 'gid001', 'RESTAURANT', ${user.id})
				RETURNING *`;
			placeToDeleteId = place.id;
		})

		test('deletes place', async () => {
			const deleted = await placesDao.deletePlace(placeToDeleteId);
			expect(deleted.id).toBe(placeToDeleteId);
		})

		test('throws PlaceNotFoundError when place does not exist', async () => {
			expect(placesDao.deletePlace(BigInt(999999))).rejects.toBeInstanceOf(PlaceNotFoundError);
		})
	})

	describe('updatePlace', () => {
		let place: Place;

		beforeEach(async () => {
			[place] = await testSQL`
				INSERT INTO places (name, lat, lng, google_place_id, type, submitted_by)
				VALUES
					('Place One', 40.7128, -74.006, 'gid001', 'RESTAURANT', ${user.id})
				RETURNING *`;
		})

		test('updates place', async () => {
			const updated = await placesDao.updatePlace(place.id, { name: 'Test Name' })

			expect(updated.name).toEqual('Test Name');
		})

		test('throws PlaceNotFoundError when place does not exist', async () => {
			expect(placesDao.updatePlace(BigInt(999999), { name: 'Ghost' })).rejects.toBeInstanceOf(PlaceNotFoundError);
		})

		test('throws InvalidPlaceTypeError on invalid type', async () => {
			expect(
				placesDao.updatePlace(place.id, { type: 'INVALID' as 'BAKERY' })
			).rejects.toBeInstanceOf(InvalidPlaceTypeError);
		})

		test('throws UserNotFoundError when submitted_by user does not exist', async () => {
			expect(
				placesDao.updatePlace(place.id, { submitted_by: BigInt(999999) })
			).rejects.toBeInstanceOf(UserNotFoundError);
		})
	})
});
