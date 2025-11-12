// -----------------------------------------------------------
// 📊 analyticsController.js — Handles all feedback analytics
// -----------------------------------------------------------
import pool from "../db/connect.js";

// 1️⃣ Course Analytics — Average rating for each course
export const getCourseAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT
        c.course_id,
        c.course_name,
        c.department,
        c.semester,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_course_rating,
        COUNT(f.rating) AS total_responses
      FROM feedback_responses f
      JOIN feedback_questions q ON f.question_id = q.question_id
      JOIN courses c ON f.course_id = c.course_id
      WHERE q.section = 'course'
      GROUP BY c.course_id, c.course_name, c.department, c.semester
      ORDER BY avg_course_rating DESC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total_courses: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching course analytics:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching course analytics.",
    });
  }
};

// 2️⃣ Instructor Analytics — Average rating per instructor
export const getInstructorAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT
        f.instructor_name,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_instructor_rating,
        COUNT(f.rating)                  AS total_responses
      FROM feedback_responses f
      JOIN feedback_questions q ON f.question_id = q.question_id
      WHERE q.section = 'instructor'
      GROUP BY f.instructor_name
      ORDER BY avg_instructor_rating DESC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total_instructors: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching instructor analytics:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching instructor analytics.",
    });
  }
};

// 3️⃣ Course vs Instructor Alignment (Gap Analysis)
export const getComparisonAnalytics = async (req, res) => {
  try {
    const query = `
      WITH course_side AS (
        SELECT
          c.course_id,
          c.course_name,
          ROUND(AVG(f.rating)::numeric, 2) AS avg_course_rating
        FROM feedback_responses f
        JOIN feedback_questions q ON f.question_id = q.question_id
        JOIN courses c ON f.course_id = c.course_id
        WHERE q.section = 'course'
        GROUP BY c.course_id, c.course_name
      ),
      instructor_side AS (
        SELECT
          c.course_id,
          c.course_name,
          f.instructor_name,
          ROUND(AVG(f.rating)::numeric, 2) AS avg_instructor_rating
        FROM feedback_responses f
        JOIN feedback_questions q ON f.question_id = q.question_id
        JOIN courses c ON f.course_id = c.course_id
        WHERE q.section = 'instructor'
        GROUP BY c.course_id, c.course_name, f.instructor_name
      )
      SELECT
        i.course_id,
        i.course_name,
        i.instructor_name,
        c.avg_course_rating,
        i.avg_instructor_rating,
        ROUND(ABS(c.avg_course_rating - i.avg_instructor_rating)::numeric, 2) AS gap,
        CASE
          WHEN c.avg_course_rating >= 4.0 AND i.avg_instructor_rating >= 4.0 THEN 'Both High'
          WHEN c.avg_course_rating >= 4.0 AND i.avg_instructor_rating < 4.0 THEN 'Course High, Instructor Low'
          WHEN c.avg_course_rating < 4.0 AND i.avg_instructor_rating >= 4.0 THEN 'Course Low, Instructor High'
          ELSE 'Both Low'
        END AS alignment_bucket
      FROM instructor_side i
      JOIN course_side c USING (course_id, course_name)
      ORDER BY gap DESC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total_pairs: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching course-instructor comparison:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching comparison analytics.",
    });
  }
};

// 4️⃣ Department Analytics — Average rating by department
export const getDepartmentAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT
        c.department,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_department_rating,
        COUNT(f.rating)                  AS total_responses
      FROM feedback_responses f
      JOIN feedback_questions q ON f.question_id = q.question_id
      JOIN courses c             ON f.course_id   = c.course_id
      WHERE q.section = 'course' OR q.section = 'instructor'
      GROUP BY c.department
      ORDER BY avg_department_rating DESC;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total_departments: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching department analytics:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching department analytics.",
    });
  }
};

// 5️⃣ Semester Trend Analytics — Ratings trend by semester
export const getTrendAnalytics = async (req, res) => {
  try {
    const query = `
      SELECT
        c.semester,
        ROUND(AVG(f.rating)::numeric, 2) AS avg_semester_rating,
        COUNT(f.rating)                  AS total_responses
      FROM feedback_responses f
      JOIN feedback_questions q ON f.question_id = q.question_id
      JOIN courses c             ON f.course_id   = c.course_id
      WHERE q.section = 'course' OR q.section = 'instructor'
      GROUP BY c.semester
      ORDER BY c.semester;
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      total_semesters: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching trend analytics:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching trend analytics.",
    });
  }
};
