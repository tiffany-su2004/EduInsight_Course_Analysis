// -----------------------------------------------------------
// 👤 userController.js — Admin views & manages users by role
// -----------------------------------------------------------

import pool from "../db/connect.js";

// 🧑‍🎓 Get all students
export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, full_name, email, role, created_at, active
       FROM users
       WHERE LOWER(role) = 'student'
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.status(500).json({ message: "Server error fetching students." });
  }
};

// 👨‍🏫 Get all instructors
export const getAllInstructors = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, full_name, email, role, created_at, active
       FROM users
       WHERE LOWER(role) = 'instructor'
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching instructors:", err.message);
    res.status(500).json({ message: "Server error fetching instructors." });
  }
};

// -----------------------------------------------------------
// 🧩 Admin: Delete or Suspend user accounts
// -----------------------------------------------------------

// ❌ Delete a user (admin only)
export const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    // Verify user exists
    const check = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    await pool.query("DELETE FROM users WHERE user_id = $1", [user_id]);
    res.json({ message: "🗑️ User deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ message: "Server error deleting user." });
  }
};

// 🚫 Suspend or Reactivate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { active } = req.body; // true or false

    const result = await pool.query(
      `UPDATE users SET active = $1 WHERE user_id = $2 RETURNING *`,
      [active, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      message: active
        ? "✅ User reactivated successfully."
        : "🚫 User suspended successfully.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error toggling user status:", err.message);
    res.status(500).json({ message: "Server error updating user status." });
  }
};
