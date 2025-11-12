// -----------------------------------------------------------
// 🧩 authController.js — Handles user registration & login
// -----------------------------------------------------------

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db/connect.js";

// 🔑 Environment secret
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// -----------------------------------------------------------
// 🔹 Register a new user (Student / Instructor / Admin)
// -----------------------------------------------------------
export const registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!email || !password || !role || !full_name) {
      return res.status(400).json({ message: "Please fill all required fields." });
    }

    const allowedRoles = ["student", "instructor", "admin"];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING user_id, full_name, email, role`,
      [full_name, email, hashedPassword, role.toLowerCase()]
    );

    res.status(201).json({
      message: "✅ Registration successful!",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// -----------------------------------------------------------
// 🔹 Login user
// -----------------------------------------------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // Find user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found." });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password." });

    // ✅ Generate JWT with full_name and role
    const token = jwt.sign(
      {
        user_id: user.user_id,
        full_name: user.full_name, // critical for instructor linking
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
};
