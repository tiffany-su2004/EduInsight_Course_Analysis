// -----------------------------------------------------------
// 💬 feedbackController.js — Handles course & instructor feedback
// -----------------------------------------------------------

import pool from "../db/connect.js";

// 🧩 Admin: Add feedback question
export const addFeedbackQuestion = async (req, res) => {
  try {
    const { section, question_text } = req.body;

    if (!section || !question_text) {
      return res.status(400).json({
        success: false,
        message: "Section and question text are required.",
      });
    }

    const result = await pool.query(
      `INSERT INTO feedback_questions (section, question_text, active)
       VALUES ($1, $2, true)
       RETURNING *`,
      [section, question_text]
    );

    res.status(201).json({
      success: true,
      message: "✅ Question added successfully!",
      question: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding feedback question:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding question.",
    });
  }
};


// 🧩 Get feedback questions by section
export const getFeedbackQuestions = async (req, res) => {
  try {
    const { section } = req.params;
    const result = await pool.query(
      `SELECT * FROM feedback_questions WHERE section = $1 AND active = true ORDER BY question_id ASC`,
      [section]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching feedback questions:", err.message);
    res.status(500).json({ message: "Server error fetching questions." });
  }
};



// 🧩 Delete question
export const deleteFeedbackQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM feedback_questions WHERE question_id = $1`, [id]);
    res.json({ message: "🗑️ Question deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting feedback question:", err.message);
    res.status(500).json({ message: "Server error deleting question." });
  }
};

// 🧩 Submit feedback (student)
export const submitFeedback = async (req, res) => {
  const client = await pool.connect();
  try {
    const { student_id, course_id, instructor_name, ratings, course_comment, instructor_comment } =
      req.body;

    if (!student_id || !course_id || !ratings || ratings.length === 0) {
  return res.status(400).json({ message: "Missing required fields." });
    } 


    await client.query("BEGIN");

    for (const { question_id, rating } of ratings) {
      await client.query(
        `INSERT INTO feedback_responses (student_id, course_id, instructor_name, question_id, rating)
         VALUES ($1, $2, $3, $4, $5)`,
        [student_id, course_id, instructor_name, question_id, rating]
      );
    }

    await client.query(
      `INSERT INTO feedback_comments (student_id, course_id, instructor_name, course_comment, instructor_comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [student_id, course_id, instructor_name, course_comment || "", instructor_comment || ""]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "✅ Feedback submitted successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error submitting feedback:", err.message);
    res.status(500).json({ message: "Server error submitting feedback." });
  } finally {
    client.release();
  }
};

// 🧩 Admin: View all feedback
// 🧩 Admin: View all feedback (safer LEFT JOIN version)
export const getAllFeedbackSubmissions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;     // default 50
    const offset = parseInt(req.query.offset) || 0;

    const result = await pool.query(
      `
      SELECT f.response_id, f.student_id, u.full_name AS student_name,
             f.course_id, c.course_name, f.instructor_name,
             f.rating, fq.question_text
      FROM feedback_responses f
      JOIN users u ON f.student_id = u.user_id
      JOIN courses c ON f.course_id = c.course_id
      JOIN feedback_questions fq ON f.question_id = fq.question_id
      ORDER BY f.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    const countResult = await pool.query(`SELECT COUNT(*) FROM feedback_responses`);
    res.json({
      total: parseInt(countResult.rows[0].count),
      limit,
      offset,
      rows: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching feedback submissions:", err.message);
    res.status(500).json({ message: "Server error fetching submissions." });
  }
};



// 🧩 Student: View own feedback submissions
export const getStudentFeedbackSubmissions = async (req, res) => {
  try {
    const { student_id } = req.params;

    if (!student_id) {
      return res.status(400).json({ message: "Student ID required." });
    }

    const result = await pool.query(
      `SELECT f.response_id, f.course_id, c.course_name,
              f.instructor_name, fq.question_text, f.rating, f.created_at
       FROM feedback_responses f
       JOIN courses c ON f.course_id = c.course_id
       JOIN feedback_questions fq ON f.question_id = fq.question_id
       WHERE f.student_id = $1
       ORDER BY f.created_at DESC`,
      [student_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching student feedback:", err.message);
    res.status(500).json({ message: "Server error fetching student feedback." });
  }
};
