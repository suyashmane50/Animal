// models/doctor.js
import db from './sql_connection.js';

export const initializeDoctorTables = async () => {
  try {
    // Create doctors table
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_code VARCHAR(30) UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        taluka VARCHAR(100) NOT NULL,
        status ENUM('active', 'on_leave', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create doctor_villages table
    await db.query(`
      CREATE TABLE IF NOT EXISTS doctor_villages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        doctor_id INT NOT NULL,
        village_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Doctor tables initialized successfully.');
  } catch (err) {
    console.error('❌ Error initializing doctor tables:', err);
  }
};
