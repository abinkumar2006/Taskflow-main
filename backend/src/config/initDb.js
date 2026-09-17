/**
 * Small helper script to apply db/schema.sql to the configured database.
 * Usage: npm run db:init
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { pool } = require('./db');

async function init() {
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Database schema applied successfully.');
  } catch (err) {
    console.error('❌ Failed to apply schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();
