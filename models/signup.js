// database/schema.js
import db from '../models/sql_connection.js';

const createSignupSchema = async () => {
    try {
        // Create users table
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
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
                INDEX idx_taluka (taluka)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);

        // Create OTP verification table
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

        console.log('Signup schema created successfully');
        
    } catch (error) {
        console.error('Error creating signup schema:', error);
        throw error;
    }
};

export const initializeDatabase = async () => {
    try {
        await createSignupSchema();
    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
};

export default {
    createSignupSchema,
    initializeDatabase
};