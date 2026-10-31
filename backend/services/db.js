const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables de entorno del archivo .env

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('connect', () => {
  console.log('⚡ Conectado a la base de datos PostgreSQL (Neon) exitosamente');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};