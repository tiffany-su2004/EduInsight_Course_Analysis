// -----------------------------------------------------------
// 👨‍🏫 InstructorDashboard.jsx — Manage Courses + Analytics
// -----------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem,
  ListItemText, Button, Card, CardContent, TextField, Grid,
  Paper, IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const drawerWidth = 220;

function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [form, setForm] = useState({ course_name: "", department: "", semester: "" });
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // 🧠 Fetch instructor's submitted courses
  const fetchCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setCourses(data);
      else {
        console.error("⚠️ Unexpected backend response:", data);
        setCourses([]);
      }
    } catch (err) {
      console.error("❌ Error fetching instructor courses:", err);
      setCourses([]);
    }
  };

  // 📊 Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/instructor/analytics/${storedUser.user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setAnalytics(json);
    } catch (err) {
      console.error("⚠️ Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "courses") fetchCourses();
    if (activeTab === "analytics") fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 🧩 Add or Update Course
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      course_name: form.course_name,
      department: form.department,
      semester: form.semester,
    };

    const url = editId
      ? `http://localhost:5000/api/courses/update/${editId}`
      : "http://localhost:5000/api/courses/add";
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      alert(data.message);
      setForm({ course_name: "", department: "", semester: "" });
      setEditId(null);
      fetchCourses();
    } catch (err) {
      console.error("❌ Error submitting course:", err);
    }
  };

  // ✏️ Edit Course
  const handleEdit = (course) => {
    setForm({
      course_name: course.course_name,
      department: course.department,
      semester: course.semester,
    });
    setEditId(course.course_id);
  };

  // 🗑 Delete Course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/courses/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      alert(data.message);
      fetchCourses();
    } catch (err) {
      console.error("❌ Error deleting course:", err);
    }
  };

  if (loading && activeTab === "analytics") {
    return <Typography sx={{ mt: 5, textAlign: "center" }}>Loading...</Typography>;
  }

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
          <ListItem button onClick={() => setActiveTab("courses")}>
            <ListItemText primary="Manage Courses" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("analytics")}>
            <ListItemText primary="Course Analytics" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
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
              Instructor Dashboard
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

        {/* TAB 1: Manage Courses */}
        {activeTab === "courses" && (
          <>
            {/* Add / Update Course Form */}
            <Card sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {editId ? "Edit Course" : "Submit New Course"}
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Course Name *"
                        fullWidth
                        required
                        value={form.course_name}
                        onChange={(e) =>
                          setForm({ ...form, course_name: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Department *"
                        fullWidth
                        required
                        value={form.department}
                        onChange={(e) =>
                          setForm({ ...form, department: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Semester *"
                        fullWidth
                        required
                        value={form.semester}
                        onChange={(e) =>
                          setForm({ ...form, semester: e.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                  <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                    {editId ? "Update Course" : "Submit for Approval"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Submitted Courses */}
            <Paper sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Submitted Courses
              </Typography>

              {courses.length === 0 ? (
                <Typography sx={{ textAlign: "center", mt: 2 }}>
                  No courses submitted yet.
                </Typography>
              ) : (
                courses.map((c) => (
                  <Box
                    key={c.course_id}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">{c.course_name}</Typography>
                      <Typography variant="body2">Dept: {c.department}</Typography>
                      <Typography variant="body2">Sem: {c.semester}</Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            c.status === "Approved"
                              ? "green"
                              : c.status === "Rejected"
                              ? "red"
                              : "orange",
                          fontWeight: 600,
                        }}
                      >
                        Status: {c.status || "Pending"}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton color="primary" onClick={() => handleEdit(c)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(c.course_id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </Box>
                ))
              )}
            </Paper>
          </>
        )}

        {/* TAB 2: Analytics */}
        {activeTab === "analytics" && (
          <>
            {!analytics || analytics.courses?.length === 0 ? (
              <Typography sx={{ textAlign: "center", mt: 5 }}>
                No analytics data available yet.
              </Typography>
            ) : (
              analytics.courses.map((course) => (
                <Card key={course.course_id} sx={{ mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6">{course.course_name}</Typography>
                    <Typography variant="body2">
                      Avg Rating: {course.avg_rating} ({course.feedback_count} feedbacks)
                    </Typography>
                    <Bar
                      data={{
                        labels: ["⭐1", "⭐2", "⭐3", "⭐4", "⭐5"],
                        datasets: [
                          {
                            label: "Ratings",
                            data: [
                              course.rating_distribution[1],
                              course.rating_distribution[2],
                              course.rating_distribution[3],
                              course.rating_distribution[4],
                              course.rating_distribution[5],
                            ],
                            backgroundColor: "#1976d2",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                      }}
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}
      </Box>
    </Box>
  );
}

export default InstructorDashboard;
