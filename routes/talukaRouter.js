import express from "express";
import db from "../models/sql_connection.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// ✅ Serve the main HTML file
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/taluka.html"));
});

// ✅ Get all districts
router.get("/districts", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM districts");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching districts" });
  }
});

// ✅ Add a new district
// ✅ Add a new district
router.post("/districts", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "District name required" });

  try {
    // Generate first two uppercase letters as district ID
    const districtId = name.substring(0, 2).toUpperCase();

    // Check for duplicates
    const [existing] = await db.query("SELECT id FROM districts WHERE id = ?", [districtId]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "District code already exists" });
    }

    // Insert with custom ID
    await db.query("INSERT INTO districts (id, name) VALUES (?, ?)", [districtId, name]);
    res.json({ message: "District added successfully" });
  } catch (err) {
    console.error("Error adding district:", err);
    res.status(500).json({ message: "Error adding district" });
  }
});


// ✅ Get all talukas (joined with district name)
router.get("/talukas", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.name, d.name AS district_name
      FROM talukas t
      LEFT JOIN districts d ON t.district_id = d.id
      ORDER BY t.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching talukas:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Add a new taluka
router.post("/talukas", async (req, res) => {
  const { name, district_id } = req.body;
  if (!name || !district_id)
    return res.status(400).json({ success: false, message: "Taluka name and district ID required" });

  try {
    // Generate first two uppercase letters as ID
    const talukaId = name.substring(0, 2).toUpperCase();

    // Check if this ID already exists (to avoid duplicates)
    const [existing] = await db.query("SELECT id FROM talukas WHERE id = ?", [talukaId]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Taluka code already exists" });
    }

    // Insert using our generated ID
    await db.query("INSERT INTO talukas (id, name, district_id) VALUES (?, ?, ?)", [talukaId, name, district_id]);
    res.json({ success: true, message: "Taluka added successfully" });
  } catch (err) {
    console.error("❌ Error adding taluka:", err);
    res.status(500).json({ success: false, message: "Error adding taluka" });
  }
});


// ✅ Get all villages (joined with taluka and district)
router.get("/villages", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT v.*, t.name AS taluka_name, d.name AS district_name
      FROM villages v
      JOIN talukas t ON v.taluka_id = t.id
      JOIN districts d ON t.district_id = d.id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({success: true,  message: "Error fetching villages" });
  }
});

// ✅ Add a new village
// ✅ Add a new village
router.post("/villages", async (req, res) => {
  const { name, taluka_id } = req.body;
  if (!name || !taluka_id)
    return res.status(400).json({ success: false, message: "Village name and taluka ID required" });

  try {
    // ✅ Find the latest village ID for this taluka
    const [lastVillage] = await db.query(
      "SELECT id FROM villages WHERE taluka_id = ? ORDER BY id DESC LIMIT 1",
      [taluka_id]
    );

    // Extract the numeric part (e.g., KA-3 → 3)
    let nextNumber = 1;
    if (lastVillage.length > 0) {
      const lastId = lastVillage[0].id;
      const numPart = parseInt(lastId.split('-')[1]) || 0;
      nextNumber = numPart + 1;
    }

    // ✅ Create new village ID (like KA-1, DO-2)
    const newVillageId = `${taluka_id}-${nextNumber}`;

    // ✅ Insert village with generated ID
    await db.query("INSERT INTO villages (id, name, taluka_id) VALUES (?, ?, ?)", [
      newVillageId,
      name.trim(),
      taluka_id,
    ]);

    res.status(201).json({ success: true, message: "Village added successfully", id: newVillageId });
  } catch (err) {
    console.error("Error adding village:", err);
    res.status(500).json({ success: false, message: "Server error while adding village" });
  }
});




export default router;
