// -----------------------------------------------------------
// 🎓 courseController.js — Course submission + approval flow
// -----------------------------------------------------------

import pool from "../db/connect.js";

// -----------------------------------------------------------
// 🧩 Instructor adds a new course (auto Pending, from JWT)
// -----------------------------------------------------------
export const addCourse = async (req, res) => {
  try {
    const instructorName =
      req.user?.full_name || req.user?.name || req.user?.email;

    const { course_name, department, semester } = req.body;

    if (!course_name || !instructorName) {
      console.log("🚨 Missing fields:", { course_name, instructorName, user: req.user });
      return res
        .status(400)
        .json({ message: "Course name or instructor missing." });
    }

    const result = await pool.query(
      `INSERT INTO courses (course_name, instructor_name, department, semester, status)
       VALUES ($1, $2, $3, $4, 'Pending')
       RETURNING *`,
      [course_name, instructorName, department || null, semester || null]
    );

    res.status(201).json({
      message: "✅ Course submitted for approval!",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding course:", err.message);
    res.status(500).json({ message: "Server error adding course." });
  }
};

// -----------------------------------------------------------
// 🧩 Instructor: view their own submitted courses + statuses
// -----------------------------------------------------------
export const getInstructorCourses = async (req, res) => {
  try {
    const instructor_name =
      req.user?.full_name || req.user?.name || req.user?.email;

    if (!instructor_name) {
      return res.status(400).json({ message: "Instructor name missing in token." });
    }

    const result = await pool.query(
      `SELECT course_id, course_name, department, semester, status
       FROM courses
       WHERE LOWER(instructor_name) = LOWER($1)
       ORDER BY course_id DESC`,
      [instructor_name]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching instructor courses:", err.message);
    res
      .status(500)
      .json({ message: "Server error fetching instructor courses." });
  }
};

// -----------------------------------------------------------
// 🧩 Instructor: Update their own course
// -----------------------------------------------------------
export const updateInstructorCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { course_name, department, semester } = req.body;
    const instructor_name = req.user?.full_name || req.user?.email;

    // Verify ownership
    const existing = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1 AND LOWER(instructor_name) = LOWER($2)`,
      [course_id, instructor_name]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to edit this course." });
    }

    // Update course details
    const result = await pool.query(
      `UPDATE courses 
       SET course_name = $1, department = $2, semester = $3
       WHERE course_id = $4
       RETURNING *`,
      [course_name, department, semester, course_id]
    );

    res.json({
      message: "✅ Course updated successfully!",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating course:", err.message);
    res.status(500).json({ message: "Server error updating course." });
  }
};

// -----------------------------------------------------------
// 🧩 Instructor: Delete their own course
// -----------------------------------------------------------
export const deleteInstructorCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const instructor_name = req.user?.full_name || req.user?.email;

    // Verify ownership
    const check = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1 AND LOWER(instructor_name) = LOWER($2)`,
      [course_id, instructor_name]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ message: "Unauthorized to delete this course." });
    }

    await pool.query(`DELETE FROM courses WHERE course_id = $1`, [course_id]);
    res.json({ message: "🗑️ Course deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting course:", err.message);
    res.status(500).json({ message: "Server error deleting course." });
  }
};

// -----------------------------------------------------------
// 🧩 Admin: View pending courses for approval
// -----------------------------------------------------------
export const getPendingCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM courses WHERE status = 'Pending' ORDER BY course_id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching pending courses:", err.message);
    res.status(500).json({ message: "Server error fetching pending courses." });
  }
};

// -----------------------------------------------------------
// 🧩 Admin: Approve or reject a course
// -----------------------------------------------------------
export const updateCourseStatus = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const result = await pool.query(
      `UPDATE courses SET status = $1 WHERE course_id = $2 RETURNING *`,
      [status, course_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Course not found." });
    }

    res.json({
      message: `✅ Course ${status.toLowerCase()} successfully.`,
      course: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating course status:", err.message);
    res.status(500).json({ message: "Server error updating course status." });
  }
};

// -----------------------------------------------------------
// 🧩 Admin: View all courses (Pending + Approved + Rejected)
// -----------------------------------------------------------
export const getAllCoursesForAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
          course_id,
          course_name,
          instructor_name,
          department,
          semester,
          COALESCE(status, 'Pending') AS status
       FROM courses
       ORDER BY course_id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching all courses:", err.message);
    res.status(500).json({ message: "Server error fetching all courses." });
  }
};

// -----------------------------------------------------------
// 🧩 Students: Fetch only approved courses
// -----------------------------------------------------------
export const getApprovedCourses = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT course_id, course_name, instructor_name, department, semester
       FROM courses WHERE status = 'Approved'
       ORDER BY course_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching approved courses:", err.message);
    res.status(500).json({ message: "Server error fetching approved courses." });
  }
};
