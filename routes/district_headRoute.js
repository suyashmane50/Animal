import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import db from '../models/sql_connection.js';
import { __dirname } from '../utils/path.js';

const router = express.Router();

// ✅ Serve district head main page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'district_head.html'));
});

// ✅ Fetch all doctors
router.get('/doctors', async (req, res) => {
  try {
    const [doctors] = await db.query('SELECT * FROM doctors ORDER BY id DESC');

    for (const doctor of doctors) {
      const [villages] = await db.query(
        'SELECT village_name FROM doctor_villages WHERE doctor_id = ?',
        [doctor.id]
      );
      doctor.villages = villages.map(v => v.village_name);
    }

    res.json({ success: true, doctors });
  } catch (err) {
    console.error('❌ Error fetching doctors:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching doctors' });
  }
});

// ✅ Add new doctor
router.post('/add', async (req, res) => {
  try {
    const { full_name, mobile_number, password, district, taluka, villages } = req.body;
    if (!full_name || !mobile_number || !password || !district || !taluka)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctorCode = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result] = await db.query(
      'INSERT INTO doctors (doctor_code, full_name, mobile_number, password, district, taluka) VALUES (?, ?, ?, ?, ?, ?)',
      [doctorCode, full_name, mobile_number, hashedPassword, district, taluka]
    );

    const doctorId = result.insertId;

    if (villages && villages.length > 0) {
      for (const v of villages) {
        await db.query('INSERT INTO doctor_villages (doctor_id, village_name) VALUES (?, ?)', [doctorId, v]);
      }
    }

    res.json({ success: true, message: 'Doctor added successfully!' });
  } catch (err) {
    console.error('❌ Error adding doctor:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Delete doctor
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM doctors WHERE id = ?', [id]);
    res.json({ success: true, message: 'Doctor deleted successfully!' });
  } catch (err) {
    console.error('❌ Error deleting doctor:', err.message);
    res.status(500).json({ success: false, message: 'Error deleting doctor' });
  }
});

// ✅ Update doctor safely (preserve password if not changed)
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, mobile_number, password, district, taluka, villages } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM doctors WHERE mobile_number = ? AND id != ?',
      [mobile_number, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Mobile number already exists!' });
    }

    const [rows] = await db.query('SELECT password FROM doctors WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Doctor not found!' });

    let finalPassword = rows[0].password;
    if (password && password.trim()) finalPassword = await bcrypt.hash(password, 10);

    await db.query(
      `UPDATE doctors SET full_name=?, mobile_number=?, password=?, district=?, taluka=? WHERE id=?`,
      [full_name, mobile_number, finalPassword, district, taluka, id]
    );

    await db.query('DELETE FROM doctor_villages WHERE doctor_id=?', [id]);
    if (villages && villages.length > 0) {
      for (const v of villages) {
        await db.query('INSERT INTO doctor_villages (doctor_id, village_name) VALUES (?, ?)', [id, v]);
      }
    }

    res.json({ success: true, message: 'Doctor updated successfully!' });
  } catch (err) {
    console.error('❌ Error updating doctor:', err.message);
    res.status(500).json({ success: false, message: 'Error updating doctor' });
  }
});


// 🌍 ✅ Region Routes (copied from signupRoute.js)
router.get('/districts', async (req, res) => {
  try {
    const [districts] = await db.query('SELECT id, name FROM districts ORDER BY name');
    res.json({ success: true, districts });
  } catch (err) {
    console.error('Error fetching districts:', err);
    res.status(500).json({ success: false, message: 'Error fetching districts' });
  }
});

router.get('/talukas/:districtId', async (req, res) => {
  try {
    const { districtId } = req.params;
    const [talukas] = await db.query('SELECT id, name FROM talukas WHERE district_id = ?', [districtId]);
    res.json({ success: true, talukas });
  } catch (err) {
    console.error('Error fetching talukas:', err);
    res.status(500).json({ success: false, message: 'Error fetching talukas' });
  }
});

router.get('/villages/:talukaId', async (req, res) => {
  try {
    const { talukaId } = req.params;
    const [villages] = await db.query('SELECT id, name FROM villages WHERE taluka_id = ?', [talukaId]);
    res.json({ success: true, villages });
  } catch (err) {
    console.error('Error fetching villages:', err);
    res.status(500).json({ success: false, message: 'Error fetching villages' });
  }
});
// ✅ Dashboard stats route
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [[{ total_doctors }]] = await db.query('SELECT COUNT(*) AS total_doctors FROM doctors');
    const [[{ total_villages }]] = await db.query('SELECT COUNT(*) AS total_villages FROM villages');
    const [[{ total_talukas }]] = await db.query('SELECT COUNT(*) AS total_talukas FROM talukas');

    res.json({
      success: true,
      total_doctors,
      villages_covered: total_villages,
      monthly_vaccinations: Math.floor(Math.random() * 1000),
      coverage_rate: `${Math.floor(Math.random() * 100)}%`
    });
  } catch (err) {
    console.error('❌ Error fetching dashboard stats:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});


export default router;
