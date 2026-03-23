import { sql } from '$lib/db';
import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import type { VisitInsert } from './types';
import { VisitsDao, InvalidRatingError, VisitNotFoundError } from '.';
import { UsersDao } from '$lib/dao/users';
import { SavedPlacesDao } from '$lib/dao/saved-places';

describe('Integration', () => {
	let visitsDao: VisitsDao;
	let usersDao: UsersDao;
	let placesDao: SavedPlacesDao;
	let testUserId: bigint;
	let testPlaceId: bigint;

	beforeEach(async () => {
		visitsDao = new VisitsDao(sql);
		usersDao = new UsersDao(sql);
		placesDao = new SavedPlacesDao(sql);

		const user = await usersDao.insertUser({
			discord_id: 'discord_test_user',
			discord_handle: 'testuser#0001',
			avatar_url: null,
			google_id: null,
			has_lifetime_access: false,
			is_current_server_member: true
		});
		testUserId = user.id;

		const place = await placesDao.insertSavedPlace({
			name: 'Test Restaurant',
			lat: 40.7128,
			lng: -74.006,
			formatted_address: '123 Test St, New York, NY 10001',
			google_place_id: 'test_google_place_id',
			type: 'RESTAURANT',
			submitted_by: testUserId
		});
		testPlaceId = place.id;
	});

	afterEach(async () => {
		await sql`DELETE FROM visits`;
		await sql`DELETE FROM saved_places`;
		await sql`DELETE FROM users`;
	});

	describe('VisitsDao', () => {
		const getBaseInsert = () => {
			const insert = {
				user_id: testUserId,
				place_id: testPlaceId,
				summary: 'Great food!',
				rating: 4,
				visited_at: '2024-01-01'
			};
			return insert as unknown as VisitInsert;
		};

		describe('insertVisit', () => {
			describe('success', () => {
				test('inserts a visit with all fields', async () => {
					const visit = await visitsDao.insertVisit(getBaseInsert());
					expect(visit.id).toBeDefined();
					expect(visit.user_id).toBe(testUserId);
					expect(visit.place_id).toBe(testPlaceId);
					expect(visit.summary).toBe('Great food!');
					expect(visit.rating).toBe(4);
				});

				test('inserts a visit with null rating', async () => {
					const visit = await visitsDao.insertVisit({
						...getBaseInsert(),
						rating: null
					});
					expect(visit.rating).toBeNull();
				});
			});

			describe('constraints', () => {
				test('throws InvalidRatingError for rating below 1', async () => {
					expect(visitsDao.insertVisit({ ...getBaseInsert(), rating: 0 })).rejects.toBeInstanceOf(
						InvalidRatingError
					);
				});

				test('throws InvalidRatingError for rating above 5', async () => {
					expect(visitsDao.insertVisit({ ...getBaseInsert(), rating: 6 })).rejects.toBeInstanceOf(
						InvalidRatingError
					);
				});
			});
		});

		describe('retrieveVisit', () => {
			test('retrieves an existing visit', async () => {
				const inserted = await visitsDao.insertVisit(getBaseInsert());
				const retrieved = await visitsDao.retrieveVisit(inserted.id);
				expect(retrieved.id).toBe(inserted.id);
				expect(retrieved.summary).toBe('Great food!');
			});

			test('throws VisitNotFoundError for non-existent visit', async () => {
				expect(visitsDao.retrieveVisit(999999n)).rejects.toBeInstanceOf(VisitNotFoundError);
			});
		});

		describe('listVisits', () => {
			test('lists all visits', async () => {
				await visitsDao.insertVisit(getBaseInsert());
				await visitsDao.insertVisit({
					...getBaseInsert(),
					summary: 'Second visit',
					place_id: testPlaceId
				});
				const visits = await visitsDao.listVisits();
				expect(visits.length).toBe(2);
			});
		});

		describe('listVisitsByUser', () => {
			test('lists visits for a specific user', async () => {
				await visitsDao.insertVisit(getBaseInsert());
				const otherUser = await usersDao.insertUser({
					discord_id: 'discord_other',
					discord_handle: 'other#0002',
					avatar_url: null,
					google_id: null,
					has_lifetime_access: false,
					is_current_server_member: false
				});
				await visitsDao.insertVisit({
					...getBaseInsert(),
					user_id: otherUser.id,
					summary: 'Other user visit'
				});
				const visits = await visitsDao.listVisitsByUser(testUserId);
				expect(visits.length).toBe(1);
				expect(visits[0].summary).toBe('Great food!');
			});
		});

		describe('listVisitsByPlace', () => {
			test('lists visits for a specific place', async () => {
				await visitsDao.insertVisit(getBaseInsert());
				const otherPlace = await placesDao.insertSavedPlace({
					name: 'Other Place',
					lat: 40.0,
					lng: -73.0,
					formatted_address: '456 Other St, New York, NY 10002',
					google_place_id: 'other_place_id',
					type: 'BAR',
					submitted_by: testUserId
				});
				await visitsDao.insertVisit({
					...getBaseInsert(),
					place_id: otherPlace.id,
					summary: 'Other place visit'
				});
				const visits = await visitsDao.listVisitsByPlace(testPlaceId);
				expect(visits.length).toBe(1);
				expect(visits[0].summary).toBe('Great food!');
			});
		});

		describe('updateVisit', () => {
			describe('success', () => {
				test('updates visit fields', async () => {
					const visit = await visitsDao.insertVisit(getBaseInsert());
					const updated = await visitsDao.updateVisit(visit.id, {
						summary: 'Updated summary',
						rating: 5
					});
					expect(updated.summary).toBe('Updated summary');
					expect(updated.rating).toBe(5);
				});
			});

			describe('constraints', () => {
				test('throws VisitNotFoundError when updating non-existent visit', async () => {
					expect(visitsDao.updateVisit(999999n, { summary: 'Ghost visit' })).rejects.toBeInstanceOf(
						VisitNotFoundError
					);
				});

				test('throws InvalidRatingError for invalid rating', async () => {
					const visit = await visitsDao.insertVisit(getBaseInsert());
					expect(visitsDao.updateVisit(visit.id, { rating: 0 })).rejects.toBeInstanceOf(
						InvalidRatingError
					);
				});
			});
		});

		describe('deleteVisit', () => {
			describe('success', () => {
				test('deletes a visit', async () => {
					const visit = await visitsDao.insertVisit(getBaseInsert());
					const deleted = await visitsDao.deleteVisit(visit.id);
					expect(deleted.id).toBe(visit.id);
					expect(deleted.summary).toBe('Great food!');
				});
			});

			describe('constraints', () => {
				test('throws VisitNotFoundError when deleting non-existent visit', async () => {
					expect(visitsDao.deleteVisit(999999n)).rejects.toBeInstanceOf(VisitNotFoundError);
				});
			});
		});
	});
});
