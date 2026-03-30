import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { test as base } from '@playwright/test';
import type { SavedPlaceInsert, SavedPlace } from '$lib/schemas/saved-place';
import type { VisitInsert, Visit } from '$lib/schemas/visit';

const SEED_SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../db-seed.ts');
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function runSeed(command: string, data?: Record<string, unknown>): string {
	return execSync(`bun ${SEED_SCRIPT}`, {
		input: JSON.stringify({ command, data }),
		cwd: PROJECT_ROOT,
		encoding: 'utf8',
		stdio: ['pipe', 'pipe', 'inherit']
	});
}

interface DbFixture {
	seedPlace(insert: SavedPlaceInsert): Promise<SavedPlace>;
	seedVisit(insert: VisitInsert): Promise<Visit>;
}

export const test = base.extend<{ db: DbFixture }>({
	db: async (_, use) => {
		runSeed('truncate-places');

		await use({
			seedPlace: async (insert) => {
				const raw = JSON.parse(
					runSeed('seed-place', {
						...insert,
						submitted_by: String(insert.submitted_by)
					})
				);
				return { ...raw, id: BigInt(raw.id), submitted_by: BigInt(raw.submitted_by) };
			},
			seedVisit: async (insert) => {
				const raw = JSON.parse(
					runSeed('seed-visit', {
						...insert,
						user_id: String(insert.user_id),
						place_id: String(insert.place_id),
						visited_at: insert.visited_at.toString()
					})
				);
				return {
					...raw,
					id: BigInt(raw.id),
					user_id: BigInt(raw.user_id),
					place_id: BigInt(raw.place_id)
				};
			}
		});
	}
});
