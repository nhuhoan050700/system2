/**
 * Run a migration file against DATABASE_URL (no psql required).
 * Usage: node run-migration.js [migration-file]
 * Example: node run-migration.js migrations/003_generate_queue_number_arr.sql
 * With Railway: railway run npm run migrate
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const migrationFile = process.argv[2] || 'migrations/003_generate_queue_number_arr.sql';
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('DATABASE_URL is not set. Set it or use: railway run npm run migrate');
  process.exit(1);
}

const sqlPath = path.resolve(__dirname, migrationFile);
if (!fs.existsSync(sqlPath)) {
  console.error('File not found:', sqlPath);
  process.exit(1);
}

const sql = fs.readFileSync(sqlPath, 'utf8');

async function run() {
  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration ran successfully:', migrationFile);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
