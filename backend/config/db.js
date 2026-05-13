const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'Carlos15',
  database: process.env.DB_NAME     || 'nova_salud',
  waitForConnections: true,
  connectionLimit:    10,
  charset: 'utf8mb4'
});

//Verificar conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('Conectado a MySQL - Base de datos: saludplus');
    conn.release();
  })
  .catch(err => {
    console.error('Error conectando a MySQL:', err.message);
  });

module.exports = pool;
