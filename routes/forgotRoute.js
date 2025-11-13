import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import db from '../models/sql_connection.js';
import { __dirname } from '../utils/path.js';

const router = express.Router();

// ✅ Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Serve forgot password HTML page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forgot_password.html'));
});

// ✅ 1️⃣ Send Test OTP (no SMS, show on screen)
router.post('/send-reset-otp', async (req, res) => {
  try {
    const { mobile_number } = req.body;

    // Validation
    if (!mobile_number || !/^[6-9]\d{9}$/.test(mobile_number)) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid 10-digit mobile number',
      });
    }

    // Check if user exists
    const [users] = await db.query(
      'SELECT id FROM users WHERE mobile_number = ? AND is_active = TRUE',
      [mobile_number]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Please sign up first. No account found with this number.',
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min expiry

    // Ensure OTP table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS otp_verification (
        mobile_number VARCHAR(15) PRIMARY KEY,
        otp VARCHAR(10),
        expires_at DATETIME,
        is_used BOOLEAN DEFAULT FALSE,
        attempts INT DEFAULT 0
      )
    `);

    // Store OTP in database
    await db.query(
      `INSERT INTO otp_verification (mobile_number, otp, expires_at, is_used, attempts)
       VALUES (?, ?, ?, FALSE, 0)
       ON DUPLICATE KEY UPDATE
       otp = VALUES(otp),
       expires_at = VALUES(expires_at),
       is_used = FALSE,
       attempts = 0`,
      [mobile_number, otp, expiresAt]
    );

    console.log(`✅ Test OTP for ${mobile_number}: ${otp}`);

    // ✅ Show OTP directly in response (for testing)
    res.json({
      success: true,
      message: `Test OTP generated successfully.`,
      otp: otp, // display OTP for test
      expires_in: 600,
    });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OTP. Try again later.',
    });
  }
});

// ✅ 2️⃣ Verify OTP
router.post('/verify-reset-otp', async (req, res) => {
  try {
    const { mobile_number, otp } = req.body;

    const [records] = await db.query(
      `SELECT * FROM otp_verification
       WHERE mobile_number = ? AND otp = ? AND is_used = FALSE
       AND expires_at > NOW() AND attempts < 3`,
      [mobile_number, otp]
    );

    if (records.length === 0) {
      await db.query(
        'UPDATE otp_verification SET attempts = attempts + 1 WHERE mobile_number = ?',
        [mobile_number]
      );
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please try again.',
      });
    }

    await db.query(
      'UPDATE otp_verification SET is_used = TRUE WHERE mobile_number = ? AND otp = ?',
      [mobile_number, otp]
    );

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'OTP verification failed',
    });
  }
});

// ✅ 3️⃣ Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { mobile_number, new_password } = req.body;

    if (!new_password || new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    const [result] = await db.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE mobile_number = ?',
      [hashedPassword, mobile_number]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Please sign up first. No account found with this number.',
      });
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed. Please try again later.',
    });
  }
});

// ✅ 4️⃣ Resend OTP (test)
router.post('/resend-reset-otp', async (req, res) => {
  try {
    const { mobile_number } = req.body;

    if (!mobile_number) {
      return res
        .status(400)
        .json({ success: false, message: 'Mobile number required' });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      `UPDATE otp_verification
       SET otp = ?, expires_at = ?, is_used = FALSE, attempts = 0
       WHERE mobile_number = ?`,
      [otp, expiresAt, mobile_number]
    );

    console.log(`🔄 Resent Test OTP for ${mobile_number}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      otp: otp, // show for testing
      expires_in: 600,
    });
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
    });
  }
});

export default router;
