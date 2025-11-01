// models/sql_connection.js
import mysql from 'mysql2/promise'; // must use /promise

// Create a pool (no .connect() needed)
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Suyash@123',
  database: 'animal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
