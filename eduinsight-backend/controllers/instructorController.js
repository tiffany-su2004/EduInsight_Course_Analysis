// -----------------------------------------------------------
// 🎓 instructorController.js — Instructor course & analytics logic
// -----------------------------------------------------------
import pool from "../db/connect.js";


// ===========================================================
// 🧩 1️⃣ Add new course (status: pending until admin approves)
// ===========================================================
export const addCourseByInstructor = async (req, res) => {
  try {
    const { course_name, department, semester } = req.body;
    const instructor_id = req.user?.user_id;
    const instructor_name = req.user?.full_name;

    if (!course_name || !department || !semester)
      return res.status(400).json({ message: "All fields are required." });

    // Instructor submits course proposal (pending approval)
    const result = await pool.query(
      `INSERT INTO courses (course_name, instructor_id, instructor_name, department, semester, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [course_name, instructor_id, instructor_name, department, semester]
    );

    res.status(201).json({
      message: "✅ Course submitted for admin approval.",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding course:", err.message);
    res.status(500).json({ message: "Server error while adding course." });
  }
};


// ===========================================================
// ✏️ 2️⃣ Update existing course (auto visible to admin changes)
// ===========================================================
export const updateCourseByInstructor = async (req, res) => {
  try {
    const { course_id } = req.params;
    const { course_name, department, semester } = req.body;
    const instructor_id = req.user.user_id;

    // Verify ownership (instructor can only edit their own courses)
    const check = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1 AND instructor_id = $2`,
      [course_id, instructor_id]
    );
    if (check.rows.length === 0)
      return res.status(403).json({ message: "Access denied. Not your course." });

    // When instructor edits, status resets to pending (re-approval needed)
    const result = await pool.query(
      `UPDATE courses 
       SET course_name = $1,
           department = $2,
           semester = $3,
           status = 'pending'
       WHERE course_id = $4
       RETURNING *`,
      [course_name, department, semester, course_id]
    );

    res.json({
      message: "✏️ Course updated successfully (awaiting admin approval).",
      course: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating course:", err.message);
    res.status(500).json({ message: "Server error while updating course." });
  }
};


// ===========================================================
// 🗑️ 3️⃣ Delete course (removes from system & admin view)
// ===========================================================
export const deleteCourseByInstructor = async (req, res) => {
  try {
    const { course_id } = req.params;
    const instructor_id = req.user.user_id;

    // Ensure instructor owns the course
    const check = await pool.query(
      `SELECT * FROM courses WHERE course_id = $1 AND instructor_id = $2`,
      [course_id, instructor_id]
    );
    if (check.rows.length === 0)
      return res.status(403).json({ message: "You cannot delete this course." });

    await pool.query(`DELETE FROM courses WHERE course_id = $1`, [course_id]);

    res.json({ message: "🗑️ Course deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting course:", err.message);
    res.status(500).json({ message: "Server error while deleting course." });
  }
};


// ===========================================================
// 📜 4️⃣ Get instructor’s own courses (all statuses)
// ===========================================================
export const getInstructorCourses = async (req, res) => {
  try {
    const instructor_id = req.user.user_id;

    const result = await pool.query(
      `SELECT * FROM courses 
       WHERE instructor_id = $1
       ORDER BY course_id DESC`,
      [instructor_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching instructor courses:", err.message);
    res.status(500).json({ message: "Server error while fetching courses." });
  }
};


// ===========================================================
// 📊 5️⃣ Instructor Analytics (feedback data for approved courses)
// ===========================================================
export const getInstructorAnalytics = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // 1️⃣ Get all approved courses for this instructor
    const courseResult = await pool.query(
      `SELECT course_id, course_name, department, semester
       FROM courses 
       WHERE instructor_id = $1 AND status = 'approved'`,
      [instructorId]
    );

    const courses = courseResult.rows;

    if (courses.length === 0)
      return res.json({
        instructor_id: instructorId,
        total_courses: 0,
        courses: [],
        message: "No approved courses yet.",
      });

    // 2️⃣ Calculate feedback stats for each course
    const analytics = await Promise.all(
      courses.map(async (course) => {
        const fbResult = await pool.query(
          `SELECT 
             ROUND(AVG(rating)::numeric, 2) AS avg_rating,
             COUNT(*) AS feedback_count,
             COUNT(CASE WHEN rating = 5 THEN 1 END) AS r5,
             COUNT(CASE WHEN rating = 4 THEN 1 END) AS r4,
             COUNT(CASE WHEN rating = 3 THEN 1 END) AS r3,
             COUNT(CASE WHEN rating = 2 THEN 1 END) AS r2,
             COUNT(CASE WHEN rating = 1 THEN 1 END) AS r1
           FROM feedback
           WHERE course_id = $1`,
          [course.course_id]
        );

        const fb = fbResult.rows[0];

        return {
          ...course,
          avg_rating: fb.avg_rating || 0,
          feedback_count: fb.feedback_count || 0,
          rating_distribution: {
            5: fb.r5 || 0,
            4: fb.r4 || 0,
            3: fb.r3 || 0,
            2: fb.r2 || 0,
            1: fb.r1 || 0,
          },
        };
      })
    );

    res.json({
      instructor_id: instructorId,
      total_courses: courses.length,
      courses: analytics,
    });
  } catch (err) {
    console.error("❌ Instructor analytics error:", err.message);
    res.status(500).json({ message: "Server error fetching instructor analytics." });
  }
};
