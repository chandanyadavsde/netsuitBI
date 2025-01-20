const { Pool } = require('pg');
require('dotenv').config();

const host= process.env.HOST
const pool = new Pool({
    user: process.env.USER,
    host,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT,
    ...(host !== 'localhost' ? { ssl: { rejectUnauthorized: false } } : {})
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database successfully');
});

pool.on('error', (err) => {
    console.error('Error connecting to PostgreSQL database:', err);
});

module.exports = pool;
