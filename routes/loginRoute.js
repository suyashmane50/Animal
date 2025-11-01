import express from 'express';
import db from '../models/sql_connection.js';
import path from 'path';
import bcrypt from 'bcrypt';
import { __dirname } from '../utils/path.js';

const loginrouter = express.Router();

// ✅ Serve login page
loginrouter.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// ✅ Handle login
loginrouter.post('/', async (req, res) => {
    try {
        const { mobileNo, password, userType } = req.body;

        if (!mobileNo || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please enter both mobile number and password'
            });
        }

        // ✅ Check user existence
        const [rows] = await db.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNo]);
        if (rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid mobile number or password'
            });
        }

        // ✅ Save session details (🔴 this part is very important)
        req.session.userId = user.id; // 👈 used later to verify login
        req.session.user = {
            id: user.id,
            name: user.full_name,
            mobileNo: user.mobile_number,
            userType: user.user_type
        };

        console.log(`✅ User logged in: ${user.full_name} (ID: ${user.id})`);

        // ✅ Send success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            userType: user.user_type
        });

    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default loginrouter;
