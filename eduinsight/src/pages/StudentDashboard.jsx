// -----------------------------------------------------------
// 🎓 StudentDashboard.jsx — Approved Courses + View My Submissions
// -----------------------------------------------------------
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 220;

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false); // ✅ toggles between course view and submissions
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user"));

  // 🧠 Fetch Approved Courses
  const fetchApprovedCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/approved", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching approved courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Fetch My Feedback Submissions
  const fetchMyFeedback = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const studentId = user?.user_id || user?.id;

      if (!studentId) {
        console.error("⚠️ No student ID found in localStorage");
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/feedback/submissions/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setMyFeedback(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching my feedback:", err);
      setMyFeedback([]);
    }
  };

  useEffect(() => {
    fetchApprovedCourses();
  }, []);

  const handleViewSubmissions = () => {
    if (!showFeedback) {
      fetchMyFeedback();
    }
    setShowFeedback((prev) => !prev);
  };

  if (loading) {
    return (
      <Typography sx={{ textAlign: "center", mt: 5 }}>
        Loading approved courses...
      </Typography>
    );
  }

  // -----------------------------------------------------------
  // 🧱 LAYOUT
  // -----------------------------------------------------------
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#1976d2",
            color: "white",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem>
            <ListItemText primary="Approved Courses" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3 }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            backgroundColor: "#1565c0",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Student Dashboard
            </Typography>
            <Button
              color="inherit"
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* Header + Toggle Button */}
        <Box
          sx={{
            mt: 3,
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {showFeedback
              ? "My Submitted Feedback"
              : "Available Approved Courses"}
          </Typography>
          <Button
            variant="contained"
            color={showFeedback ? "secondary" : "primary"}
            onClick={handleViewSubmissions}
          >
            {showFeedback ? "Back to Courses" : "View My Submissions"}
          </Button>
        </Box>

        {/* ✅ View 1: Approved Courses */}
        {!showFeedback && (
          <Box>
            {courses.length === 0 ? (
              <Typography>No approved courses available yet.</Typography>
            ) : (
              <Grid container spacing={2}>
                {courses.map((course) => (
                  <Grid item xs={12} md={6} lg={4} key={course.course_id}>
                    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                      <CardContent>
                        <Typography variant="h6">
                          {course.course_name}
                        </Typography>
                        <Typography variant="body2">
                          Instructor: {course.instructor_name}
                        </Typography>
                        <Typography variant="body2">
                          Department: {course.department || "—"}
                        </Typography>
                        <Typography variant="body2">
                          Semester: {course.semester || "—"}
                        </Typography>

                        <Button
                          variant="contained"
                          sx={{ mt: 2 }}
                          color="primary"
                          onClick={() => {
                            const token = localStorage.getItem("token");
                            if (!token) {
                              alert("Session expired. Please log in again.");
                              navigate("/");
                              return;
                            }
                            navigate(`/student/feedback/${course.course_id}`);
                          }}
                        >
                          Give Feedback
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* ✅ View 2: My Submissions */}
        {showFeedback && (
          <Box>
            <Paper sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Course</b></TableCell>
                    <TableCell><b>Instructor</b></TableCell>
                    <TableCell><b>Question</b></TableCell>
                    <TableCell><b>Rating</b></TableCell>
                    <TableCell><b>Date</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myFeedback.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        No feedback submitted yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    myFeedback.map((f, i) => (
                      <TableRow key={i}>
                        <TableCell>{f.course_name}</TableCell>
                        <TableCell>{f.instructor_name}</TableCell>
                        <TableCell>{f.question_text}</TableCell>
                        <TableCell>{f.rating}</TableCell>
                        <TableCell>
                          {new Date(f.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default StudentDashboard;
