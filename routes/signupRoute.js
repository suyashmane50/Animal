import express from 'express';
import db from '../models/sql_connection.js';
import path from 'path';
import bcrypt from 'bcrypt';
import { __dirname } from '../utils/path.js';

const signuprouter = express.Router();

// Serve signup page
signuprouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

// 📩 Send OTP
signuprouter.post('/send-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const mobileRegex = /^[6-9]\d{9}$/;

    if (!mobileRegex.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const [existingUser] = await db.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'Mobile number already registered' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      `INSERT INTO otp_verification (mobile_number, otp, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
      [mobileNumber, otp, otpExpiry]
    );

    console.log(`📲 OTP for ${mobileNumber}: ${otp}`); // remove in production
    res.status(200).json({ success: true, message: 'OTP sent successfully', otp });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

// 🔐 Verify OTP
signuprouter.post('/verify-otp', async (req, res) => {
  try {
    const { mobileNumber, otp } = req.body;

    const [otpRecord] = await db.query(
      'SELECT * FROM otp_verification WHERE mobile_number = ? AND otp = ? AND expires_at > NOW()',
      [mobileNumber, otp]
    );

    if (otpRecord.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await db.query('UPDATE otp_verification SET is_used = 1 WHERE mobile_number = ? AND otp = ?', [mobileNumber, otp]);
    res.status(200).json({ success: true, message: 'Mobile number verified successfully', verified: true });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// 🔁 Resend OTP
signuprouter.post('/resend-otp', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    await db.query(
      'UPDATE otp_verification SET otp = ?, expires_at = ?, is_used = 0 WHERE mobile_number = ?',
      [otp, otpExpiry, mobileNumber]
    );

    console.log(`🔁 New OTP for ${mobileNumber}: ${otp}`);
    res.status(200).json({ success: true, message: 'OTP resent successfully', otp });
  } catch (err) {
    console.error('Error resending OTP:', err);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
});

// 🧾 Create user
signuprouter.post('/create', async (req, res) => {
  try {
    console.log("📩 Received signup data:", req.body);

    const { userType, fullName, mobileNumber, password, confirmPassword, taluka, village, agreeToTerms } = req.body;

    if (!fullName || !mobileNumber || !password || !confirmPassword || !userType || !taluka || !village || agreeToTerms !== true) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // ✅ Verify mobile
    const [verifiedMobile] = await db.query(
      'SELECT * FROM otp_verification WHERE mobile_number = ? AND is_used = 1',
      [mobileNumber]
    );
    if (verifiedMobile.length === 0) {
      return res.status(400).json({ success: false, message: 'Mobile number not verified' });
    }

    // ✅ Check if user already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // ✅ Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Fetch taluka code (like KU)
    const [talukaResult] = await db.query('SELECT code FROM talukas WHERE name = ?', [taluka]);
    if (talukaResult.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid taluka' });
    }
    const talukaCode = talukaResult[0].code;

    // 🆕 Get village ID
    const [villageResult] = await db.query('SELECT id FROM villages WHERE name = ?', [village]);
    if (villageResult.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid village' });
    }
    const villageId = villageResult[0].id;

    // ✅ Find next user number in this village
    const [lastUser] = await db.query('SELECT COUNT(*) AS count FROM users WHERE village = ?', [village]);
    const nextUserNumber = lastUser[0].count + 1;

    // 🆕 Generate user code (e.g., KU-12-62)
    const userCode = `${talukaCode}-${villageId}-${nextUserNumber}`;

    // ✅ Insert user
    await db.query(
      `INSERT INTO users (full_name, mobile_number, password, user_type, taluka, village, user_code, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [fullName, mobileNumber, hashedPassword, userType, taluka, village, userCode]
    );

    // ✅ Cleanup OTP
    await db.query('DELETE FROM otp_verification WHERE mobile_number = ?', [mobileNumber]);

    console.log("✅ User created with code:", userCode);
    res.status(201).json({ success: true, message: 'Account created successfully', userCode });
  } catch (err) {
    console.error('❌ Error creating user:', err);
    res.status(500).json({ success: false, message: 'Failed to create account' });
  }
});

// 📞 Check mobile availability
signuprouter.post('/check-mobile', async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const [existingUser] = await db.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);

    res.status(200).json({
      available: existingUser.length === 0,
      message: existingUser.length > 0 ? 'Mobile number already registered' : 'Mobile number available'
    });
  } catch (err) {
    console.error('Error checking mobile:', err);
    res.status(500).json({ available: false, message: 'Error checking mobile number' });
  }
});

// 🆕 Get districts dynamically
signuprouter.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query('SELECT id, name FROM districts ORDER BY name');
    res.status(200).json({ success: true, districts });
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ success: false, message: 'Failed to load districts' });
  }
});

// 🆕 Get talukas by district_id
signuprouter.get('/talukas/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const [talukas] = await db.query('SELECT id, name, code FROM talukas WHERE district_id = ?', [districtId]);
    res.status(200).json({ success: true, talukas });
  } catch (err) {
    console.error('Error fetching talukas:', err);
    res.status(500).json({ success: false, message: 'Failed to load talukas' });
  }
});

// 🆕 Get villages by taluka_id
signuprouter.get('/villages/:talukaId', async (req, res) => {
  try {
    const { talukaId } = req.params;
    const [villages] = await db.query('SELECT id, name FROM villages WHERE taluka_id = ?', [talukaId]);
    res.status(200).json({ success: true, villages });
  } catch (err) {
    console.error('Error fetching villages:', err);
    res.status(500).json({ success: false, message: 'Failed to load villages' });
  }
});

export default signuprouter;
