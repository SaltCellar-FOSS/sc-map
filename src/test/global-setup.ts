import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const SEED_SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), 'db-seed.ts');
const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

export default function globalSetup() {
	execSync(`bun ${SEED_SCRIPT}`, {
		input: JSON.stringify({ command: 'seed-users' }),
		cwd: PROJECT_ROOT,
		stdio: ['pipe', 'inherit', 'inherit']
	});
}
