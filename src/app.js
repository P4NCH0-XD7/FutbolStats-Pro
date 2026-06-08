const express = require('express');
const pool = require('./config/db');

const app = express();
app.use(express.json());

let databaseReady;

async function initializeDatabase() {
  if (!databaseReady) {
    databaseReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS equipos (
          id SERIAL PRIMARY KEY,
          nombre VARCHAR(50) NOT NULL,
          puntos INT DEFAULT 0,
          diferencia_goles INT DEFAULT 0
        );
      `);

      await pool.query(`
        INSERT INTO equipos (nombre, puntos, diferencia_goles)
        SELECT 'ITP F.C.', 9, 5
        WHERE NOT EXISTS (
          SELECT 1 FROM equipos WHERE nombre = 'ITP F.C.'
        );
      `);
    })();
  }

  return databaseReady;
}

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'UP', database: 'CONNECTED' });
  } catch (error) {
    res.status(500).json({ status: 'DOWN', error: error.message });
  }
});

app.get('/api/posiciones', async (req, res) => {
  try {
    await initializeDatabase();
    const result = await pool.query('SELECT * FROM equipos ORDER BY puntos DESC, diferencia_goles DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la tabla de posiciones' });
  }
});

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en el puerto ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('No se pudo inicializar la base de datos', error);
      process.exit(1);
    });
}

module.exports = app;
