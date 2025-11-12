// -----------------------------------------------------------
// 🧑‍💼 adminController.js — handles admin-related operations
// -----------------------------------------------------------
import pool from "../db/connect.js";

// 1️⃣ Get all students (basic list)
export const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        user_id,
        full_name,
        email,
        role,
        created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students:", err.message);
    res.status(500).json({ message: "Server error fetching students." });
  }
};

// 2️⃣ Get all instructors (basic list)
export const getAllInstructors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        user_id,
        full_name,
        email,
        role,
        created_at
      FROM users
      WHERE role = 'instructor'
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching instructors:", err.message);
    res.status(500).json({ message: "Server error fetching instructors." });
  }
};

// 3️⃣ Get all students *with their feedbacks*
export const getAllStudentsWithFeedback = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'feedback_id', f.feedback_id,
              'course_id', f.course_id,
              'course_name', c.course_name,
              'rating', f.rating,
              'comment', f.comment
            )
          ) FILTER (WHERE f.feedback_id IS NOT NULL),
          '[]'
        ) AS feedbacks
      FROM users u
      LEFT JOIN feedback f ON u.user_id = f.student_id
      LEFT JOIN courses c ON f.course_id = c.course_id
      WHERE u.role = 'student'
      GROUP BY u.user_id, u.full_name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC;
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching students + feedback:", err.message);
    res.status(500).json({ message: "Server error fetching student feedbacks." });
  }
};
