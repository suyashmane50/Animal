import express from 'express';
import db from '../models/sql_connection.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const petRouter = express.Router();

// -------------------- MULTER SETUP --------------------
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// -------------------- AUTH MIDDLEWARE --------------------
function authenticateSession(req, res, next) {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
}

// -------------------- ROUTES --------------------

// Get pet page
petRouter.get('/', authenticateSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/pet.html'));
});

// Add new pet
petRouter.post('/add', authenticateSession, upload.single('petAvatar'), async (req, res) => {
    try {
        const { petName, petType, breed, gender, dateOfBirth, age, color, weight } = req.body;
        const ownerId = req.session.userId;
        const avatar_url = req.file ? `/uploads/${req.file.filename}` : null;

        if (!petName || !petType || !gender) {
            return res.status(400).json({ success: false, message: 'Pet name, type, and gender are required' });
        }

        const [result] = await db.query(
            `INSERT INTO pets 
            (owner_id, name, type, breed, gender, dob, age, color, weight, avatar_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [ownerId, petName, petType, breed, gender, dateOfBirth, age, color, weight, avatar_url]
        );

        res.status(201).json({ success: true, message: 'Pet added successfully', petId: result.insertId });
    } catch (err) {
        console.error('❌ Error adding pet:', err);
        res.status(500).json({ success: false, message: 'Failed to add pet', error: err.message });
    }
});

export default petRouter;