const { Pool } = require('pg');
require('dotenv').config();

// ERROR 1 (INFRAESTRUCTURA): El string de conexión usa 'localhost' en lugar del nombre 
// del servicio de Docker ('db_futbol'). Esto hará que falle DENTRO del contenedor del backend.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:password123@db_futbol:5432/futbol_db';

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('connect', () => {
  console.log('⚡ Conexión exitosa a la base de datos PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de Postgres', err);
});
// Inicializar base de datos con tabla si no existe (Especial para Render)
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS equipos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        puntos INT DEFAULT 0,
        diferencia_goles INT DEFAULT 0
      );
    `);
    
    // Poblamos la BD solo si está vacía
    const result = await pool.query('SELECT COUNT(*) FROM equipos');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO equipos (nombre, puntos, diferencia_goles) VALUES 
        ('ITP F.C.', 9, 5),
        ('Los Galacticos', 7, 3),
        ('Real Madrid', 6, 2),
        ('Deportivo Pasto', 3, -1);
      `);
      console.log('✅ Base de datos poblada con equipos iniciales.');
    }
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error.message);
  }
};

initDB();

module.exports = pool;