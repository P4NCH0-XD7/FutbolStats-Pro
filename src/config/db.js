const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@localhost:5432/futbol_db';
const useSsl = process.env.DATABASE_SSL === 'true' || process.env.PGSSLMODE === 'require';

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
  console.log('Conexion exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de Postgres', err);
});

module.exports = pool;
