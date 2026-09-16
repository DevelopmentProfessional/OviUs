// Runs schema.sql and seed.sql against the configured database.
const fs = require('fs');
const path = require('path');
const { pool } = require('../db/pool');

async function run() {
    const schemaPath = path.join(__dirname, '..', '..', '..', 'db', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', '..', 'db', 'seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    const client = await pool.connect();
    try {
        console.log('Applying schema...');
        await client.query(schemaSql);
        console.log('Applying seed data...');
        await client.query(seedSql);
        console.log('Database initialized successfully.');
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
