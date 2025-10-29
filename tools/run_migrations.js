#!/usr/bin/env node
/*
  Run SQL migration files found in database/migrations in alphabetical order
  Usage:
    NODE_ENV=production DATABASE_URL="postgres://user:pass@host:5432/db" node tools/run_migrations.js
  Or set env var PG_URL or pass --db <url>
*/
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function getDbUrl() {
  const argv = process.argv.slice(2);
  const idx = argv.indexOf('--db');
  if (idx >= 0 && argv[idx+1]) return argv[idx+1];
  return process.env.DATABASE_URL || process.env.PG_URL || process.env.PGDATABASE_URL || null;
}

async function main() {
  const dbUrl = getDbUrl();
  if (!dbUrl) {
    console.error('No DATABASE_URL provided. Set env var DATABASE_URL or pass --db <url>');
    process.exit(2);
  }
  const migrationsDir = path.resolve(process.cwd(), 'database', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error('Migrations directory not found:', migrationsDir);
    process.exit(3);
  }
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  if (!files.length) {
    console.log('No migration files found in', migrationsDir);
    return;
  }
  console.log('Migrations to run:', files.join(', '));

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = fs.readFileSync(full, 'utf8');
      console.log('\n=== Running', file, '===');
      try {
        await client.query(sql);
        console.log('Applied', file);
      } catch (err) {
        console.error('Error applying', file, err && err.message ? err.message : err);
        // stop on error
        throw err;
      }
    }
    console.log('\nAll migrations applied successfully.');
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('Migration runner failed:', err && err.message ? err.message : err);
  process.exit(1);
});
