import express from 'express';
import db from '../models/sql_connection.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { __dirname } from '../utils/path.js';

const loginrouter = express.Router();

// Serve login page
loginrouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

loginrouter.post('/', async (req, res) => {
  try {
    const { mobileNo, password, userType } = req.body;
    console.log("🟢 Login Request:", { mobileNo, userType });

    if (!mobileNo || !password || !userType) {
      return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    const userTables = {
      'pet-owner': {
        table: 'users',
        mobileField: 'mobile_number',
        passwordField: 'password',
        nameField: 'full_name'
      },
      'doctor': {
        table: 'doctors',
        mobileField: 'mobile_number',
        passwordField: 'password',
        nameField: 'full_name'
      },
      'district-head': {
        table: 'users',
        mobileField: 'mobile_number',
        passwordField: 'password',
        nameField: 'full_name'
      },
      'collector': {
        table: 'users',
        mobileField: 'mobile_number',
        passwordField: 'password',
        nameField: 'full_name'
      },
    };

    const tableInfo = userTables[userType];
    if (!tableInfo) return res.status(400).json({ success: false, message: 'Invalid user type' });

    const { table, mobileField, passwordField, nameField } = tableInfo;

    const [rows] = await db.query(`SELECT * FROM ${table} WHERE ${mobileField} = ?`, [mobileNo]);
    if (rows.length === 0) return res.status(400).json({ success: false, message: 'User not found' });

    const user = rows[0];
    const passwordValid = user[passwordField]?.startsWith('$2b$')
      ? await bcrypt.compare(password, user[passwordField])
      : password === user[passwordField];

    if (!passwordValid) return res.status(400).json({ success: false, message: 'Incorrect password' });

    // ✅ Store session properly
    req.session.userId = user.id;
    req.session.userType = userType;
    req.session.userName = user[nameField];
    console.log(`✅ ${userType} logged in: ${user[nameField]}`);

    res.json({ success: true, userType });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default loginrouter;
