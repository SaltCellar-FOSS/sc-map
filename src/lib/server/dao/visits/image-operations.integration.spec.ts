import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { sql } from '$lib/db';
import { VisitsDao } from './index';

// Note: This test requires a test database to be running
// Run with: SQL_URL=postgres://sc_map:sc_map@localhost:5432/sc_map_test bun test

describe('VisitsDao - Image Operations', () => {
	let visitsDao: VisitsDao;
	let testVisitId: bigint;
	const testUserId: bigint = 1n; // Assume test user exists

	beforeAll(async () => {
		visitsDao = new VisitsDao(sql);

		// Create a test visit for image operations
		const testPlaceId = 1n; // Assume test place exists
		const visit = await visitsDao.insertVisit({
			user_id: testUserId,
			place_id: testPlaceId,
			summary: 'Test visit for image operations',
			visited_at: new Date().toISOString()
		});
		testVisitId = visit.id;
	});

	afterAll(async () => {
		// Clean up test data
		if (testVisitId) {
			await visitsDao.deleteVisit(testVisitId);
		}
	});

	describe('insertVisitPhoto', () => {
		it('should insert a photo URL for a visit', async () => {
			const testUrl = '/images/test-123.jpg';

			await visitsDao.insertVisitPhoto(testVisitId, testUrl);

			// Verify the photo was inserted
			const photos = await visitsDao.listVisitPhotos(testVisitId);
			expect(photos).toContain(testUrl);
		});
	});

	describe('listVisitPhotos', () => {
		it('should list all photos for a visit', async () => {
			const photos = await visitsDao.listVisitPhotos(testVisitId);
			expect(Array.isArray(photos)).toBe(true);
			expect(photos.length).toBeGreaterThan(0);
		});

		it('should return empty array for visit with no photos', async () => {
			// Create another test visit
			const testPlaceId = 1n;
			const emptyVisit = await visitsDao.insertVisit({
				user_id: testUserId,
				place_id: testPlaceId,
				summary: 'Empty visit test',
				visited_at: new Date().toISOString()
			});

			const photos = await visitsDao.listVisitPhotos(emptyVisit.id);
			expect(photos).toEqual([]);

			// Clean up
			await visitsDao.deleteVisit(emptyVisit.id);
		});
	});

	describe('deleteVisitPhoto', () => {
		it('should delete a specific photo from a visit', async () => {
			const testUrl = '/images/test-delete-456.jpg';

			// Insert photo
			await visitsDao.insertVisitPhoto(testVisitId, testUrl);

			// Verify it exists
			let photos = await visitsDao.listVisitPhotos(testVisitId);
			expect(photos).toContain(testUrl);

			// Delete photo
			await visitsDao.deleteVisitPhoto(testVisitId, testUrl);

			// Verify it's gone
			photos = await visitsDao.listVisitPhotos(testVisitId);
			expect(photos).not.toContain(testUrl);
		});
	});
});