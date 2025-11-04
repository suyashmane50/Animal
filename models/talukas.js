import db from './sql_connection.js';

export const initializeRegionTables = async () => {
  try {
    // ✅ District table (ID = 2-letter code)
    await db.query(`
      CREATE TABLE IF NOT EXISTS districts (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);

    // ✅ Taluka table (uses district_id as VARCHAR)
    await db.query(`
      CREATE TABLE IF NOT EXISTS talukas (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        district_id VARCHAR(10),
        FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
      )
    `);

    // ✅ Village table (uses taluka_id as VARCHAR)
   await db.query(`
  CREATE TABLE IF NOT EXISTS villages (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    taluka_id VARCHAR(10),
    FOREIGN KEY (taluka_id) REFERENCES talukas(id) ON DELETE CASCADE
  )
`);


    console.log("✅ District, Taluka, and Village tables initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing region tables:", error);
  }
};
