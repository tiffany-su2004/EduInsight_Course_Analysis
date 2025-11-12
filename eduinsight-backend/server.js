// ----------------------------------------------
// 🧠 SERVER.JS — Main Entry Point of the Backend
// ----------------------------------------------

// 1️⃣ Import dependencies
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg"; // for PostgreSQL connection

// ✨ Add this near the top (below other imports)
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";




// 2️⃣ Load environment variables from .env file
dotenv.config();

// 3️⃣ Create a new Express app instance
const app = express();

// 4️⃣ Enable essential middleware
app.use(cors());             // allows frontend (React) to access backend APIs
app.use(express.json());     // parses JSON request bodies
app.use("/api/auth", authRoutes); // Use authentication routes
app.use("/api/protected", protectedRoutes); // Use protected routes
app.use("/api/feedback", feedbackRoutes); // Use feedback routes
app.use("/api/courses", courseRoutes); // Use course routes
app.use("/api/users", userRoutes); // Use user management routes
app.use("/api/admin", adminRoutes); // Use admin routes
app.use("/api/analytics", analyticsRoutes); // Use analytics routes



// 5️⃣ PostgreSQL setup using environment variables
const { Pool } = pkg;
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// 6️⃣ Basic test route to confirm server is running
app.get("/", (req, res) => {
  res.send("🚀 EduInsight backend is running!");
});

// 7️⃣ Route to test database connection
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error("❌ Database connection error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 8️⃣ Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
