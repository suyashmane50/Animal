import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../models/sql_connection.js'; // your MySQL connection

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to protect routes
function authenticateSession(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/login');
}

// Serve Pet Owner Dashboard page
router.get('/', authenticateSession, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/pet_owner.html'));
});

// Get pet list for logged-in user
router.get('/pets', authenticateSession, async (req, res) => {
  try {
    console.log("Session userId:", req.session.userId); // ✅ check this
    const ownerId = req.session.userId;

    const [pets] = await db.query(
      "SELECT id, owner_id, name, type, breed, gender, dob, age, color, weight, avatar_url FROM pets WHERE owner_id = ?",
      [ownerId]
    );
    res.json({ success: true, pets });
  } catch (error) {
    console.error("Error fetching pets:", error);
    res.status(500).json({ success: false, message: "Error fetching pets" });
  }
});


export default router;
