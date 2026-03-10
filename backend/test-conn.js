require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Connection failed:', err.message);
    } else {
        console.log('Connection successful:', res.rows);
    }
    pool.end();
});
