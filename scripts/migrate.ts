import { SQL } from 'bun';
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const sqlUrl = process.env.SQL_URL;
if (!sqlUrl) {
	console.error('Error: SQL_URL environment variable is not set');
	process.exit(1);
}

const sql = new SQL({ url: sqlUrl, max: 1 });
const migrationsDir = join(import.meta.dir, '../src/lib/db/migrations');

await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
        filename   TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
`;

const migrations = readdirSync(migrationsDir)
	.filter((f) => f.endsWith('.up.sql'))
	.sort();

if (migrations.length === 0) {
	console.log('No migrations found.');
	process.exit(0);
}

let applied = 0;
for (const filename of migrations) {
	const [{ count }] = await sql`
        SELECT COUNT(*)::int AS count FROM schema_migrations WHERE filename = ${filename}
    `;
	if (count > 0) {
		console.log(`Skipping (already applied): ${filename}`);
		continue;
	}

	console.log(`Applying: ${filename}`);
	const migrationSQL = readFileSync(join(migrationsDir, filename), 'utf-8');
	await sql.unsafe(migrationSQL);
	await sql`INSERT INTO schema_migrations (filename) VALUES (${filename})`;
	applied++;
}

console.log(`Done. Applied ${applied} migration(s).`);
await sql.end();
