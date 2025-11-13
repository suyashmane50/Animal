import express from 'express';
import path from 'path';
import bcrypt from 'bcrypt';
import db from '../models/sql_connection.js';
import { __dirname } from '../utils/path.js';

const Collectorrouter = express.Router();

// ✅ Serve district head main page
Collectorrouter.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'collector.html'));
});
export default Collectorrouter;