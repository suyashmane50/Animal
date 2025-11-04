// database/schema.js
import db from '../models/sql_connection.js';

const createSignupSchema = async () => {
  try {
    // 🧱 Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_code VARCHAR(30) UNIQUE,                    -- 👈 Added for IDs like KU-12-62
        full_name VARCHAR(255) NOT NULL,
        mobile_number VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        user_type ENUM('patient', 'doctor', 'admin', 'staff') DEFAULT 'patient',
        taluka VARCHAR(100) NOT NULL,
        village VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_mobile_number (mobile_number),
        INDEX idx_taluka (taluka),
        INDEX idx_user_code (user_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 🔐 Create OTP verification table
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_verification (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mobile_number VARCHAR(15) NOT NULL,
        otp VARCHAR(10) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_mobile_number (mobile_number),
        INDEX idx_expires_at (expires_at),
        INDEX idx_otp_mobile (otp, mobile_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Signup schema created successfully');
    
  } catch (error) {
    console.error('❌ Error creating signup schema:', error);
    throw error;
  }
};

// 🆕 Ensure taluka code column and populate codes
const ensureTalukaCodeColumn = async () => {
  try {
    // 1️⃣ Add column only if not exists
    await db.query(`
      ALTER TABLE talukas 
      ADD COLUMN IF NOT EXISTS code VARCHAR(5)
    `);

    // 2️⃣ Populate code for known talukas (safe even if already filled)
    await db.query(`
      UPDATE talukas 
      SET code = CASE 
        WHEN name LIKE 'Dodamarg%' THEN 'DO'
        WHEN name LIKE 'Sawantwadi%' THEN 'SA'
        WHEN name LIKE 'Vengurla%' THEN 'VE'
        WHEN name LIKE 'Kudal%' THEN 'KU'
        WHEN name LIKE 'Malwan%' THEN 'MA'
        WHEN name LIKE 'Kankavli%' THEN 'KA'
        WHEN name LIKE 'Devgad%' THEN 'DE'
        WHEN name LIKE 'Vaibhavwadi%' THEN 'VA'
        ELSE LEFT(UPPER(name), 2)
      END
      WHERE code IS NULL OR code = ''
    `);

    console.log('✅ Taluka code column ensured and populated');
  } catch (error) {
    console.error('❌ Error ensuring taluka codes:', error);
  }
};

// Initialize everything
export const initializeDatabase = async () => {
  try {
    await createSignupSchema();
    await ensureTalukaCodeColumn();   // 👈 Added this
  } catch (error) {
    console.error('🚨 Failed to initialize database:', error);
  }
};

export default {
  createSignupSchema,
  initializeDatabase
};
