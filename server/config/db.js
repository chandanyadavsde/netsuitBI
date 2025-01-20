const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
    // ssl: {
    //     rejectUnauthorized: false, // Allow self-signed certificates
    //   },
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database successfully');
});

pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
});

module.exports = pool;
