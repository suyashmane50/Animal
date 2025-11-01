import db from './sql_connection.js';

export const initializePetTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS pets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      owner_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      breed VARCHAR(100),
      gender ENUM('Male', 'Female', 'Other') NOT NULL,
      dob DATE,
      age VARCHAR(50),
      color VARCHAR(50),
      weight VARCHAR(50),
      avatar_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await db.query(sql);
  console.log("✅ Pets table initialized successfully");
};
