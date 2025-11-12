// -----------------------------------------------------------
// 🧠 connect.js — PostgreSQL connection setup using ES Modules
// -----------------------------------------------------------

import pkg from "pg";      // pg library in ES Module mode
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// Create a new PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// ✅ Export the pool correctly for ES Modules
export default pool;
