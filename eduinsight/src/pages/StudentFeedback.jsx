// -----------------------------------------------------------
// 🧠 StudentFeedback.jsx — Fixed: proper payload + validation
// -----------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Rating,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

function StudentFeedback() {
  const { course_id } = useParams();
  const navigate = useNavigate();
  const [courseQuestions, setCourseQuestions] = useState([]);
  const [instructorQuestions, setInstructorQuestions] = useState([]);
  const [ratings, setRatings] = useState({});
  const [courseComment, setCourseComment] = useState("");
  const [instructorComment, setInstructorComment] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch questions & course info
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const [courseRes, instrRes] = await Promise.all([
          fetch("http://localhost:5000/api/feedback/questions/course", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/feedback/questions/instructor", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        const courseData = await courseRes.json();
        const instrData = await instrRes.json();
        setCourseQuestions(courseData);
        setInstructorQuestions(instrData);
      } catch (err) {
        console.error("❌ Error fetching feedback questions:", err);
      }
    };

    const fetchCourseInfo = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/courses/approved", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const course = data.find((c) => c.course_id === parseInt(course_id));
        if (course) {
          setCourseName(course.course_name);
          setInstructorName(course.instructor_name || "Unknown");
        }
      } catch (err) {
        console.error("❌ Error fetching course:", err);
      }
    };

    fetchQuestions();
    fetchCourseInfo();
  }, [course_id, token]);

  // ✅ Handle star rating changes
  const handleRatingChange = (question_id, value) => {
    setRatings((prev) => ({ ...prev, [question_id]: value }));
  };

  // ✅ Submit feedback safely
  const handleSubmit = async () => {
    const allRatings = [
      ...courseQuestions.map((q) => ({
        question_id: q.question_id,
        rating: ratings[q.question_id] || 0,
      })),
      ...instructorQuestions.map((q) => ({
        question_id: q.question_id,
        rating: ratings[q.question_id] || 0,
      })),
    ].filter((r) => r.rating > 0);

    // 🧩 Build payload with safety checks
    const payload = {
      student_id: storedUser.user_id || storedUser.id, // ✅ fix
      course_id: parseInt(course_id),
      instructor_name: instructorName || "Unknown", // ✅ fix
      ratings: allRatings,
      course_comment: courseComment || "",
      instructor_comment: instructorComment || "",
    };

    // 🧠 Validate before sending
    if (!payload.student_id || !payload.course_id || payload.ratings.length === 0) {
      alert("Please complete all required fields before submitting.");
      return;
    }

    try {
  const res = await fetch("http://localhost:5000/api/feedback/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  alert(data.message || "Feedback submitted!");
  navigate("/student"); // ✅ Go back to correct route
} catch (err) {
  console.error("❌ Error submitting feedback:", err);
  alert("Error submitting feedback. Try again.");
}
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 5, p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Feedback for: {courseName || "Selected Course"}
      </Typography>

      {/* 🟦 Course Feedback */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="primary">
            Course Feedback
          </Typography>
          {courseQuestions.length === 0 ? (
            <Typography>No course questions available.</Typography>
          ) : (
            courseQuestions.map((q) => (
              <Box key={q.question_id} sx={{ mb: 2 }}>
                <Typography>{q.question_text}</Typography>
                <Rating
                  value={ratings[q.question_id] || 0}
                  onChange={(e, value) => handleRatingChange(q.question_id, value)}
                />
              </Box>
            ))
          )}
          <TextField
            label="Additional comments about the course"
            multiline
            fullWidth
            rows={3}
            sx={{ mt: 2 }}
            value={courseComment}
            onChange={(e) => setCourseComment(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* 🟩 Instructor Feedback */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="secondary">
            Instructor Feedback
          </Typography>
          {instructorQuestions.length === 0 ? (
            <Typography>No instructor questions available.</Typography>
          ) : (
            instructorQuestions.map((q) => (
              <Box key={q.question_id} sx={{ mb: 2 }}>
                <Typography>{q.question_text}</Typography>
                <Rating
                  value={ratings[q.question_id] || 0}
                  onChange={(e, value) => handleRatingChange(q.question_id, value)}
                />
              </Box>
            ))
          )}
          <TextField
            label="Additional comments about the instructor"
            multiline
            fullWidth
            rows={3}
            sx={{ mt: 2 }}
            value={instructorComment}
            onChange={(e) => setInstructorComment(e.target.value)}
          />
        </CardContent>
      </Card>

      <Grid container justifyContent="center">
        <Button variant="contained" size="large" onClick={handleSubmit}>
          Submit Feedback
        </Button>
      </Grid>
    </Box>
  );
}

export default StudentFeedback;
