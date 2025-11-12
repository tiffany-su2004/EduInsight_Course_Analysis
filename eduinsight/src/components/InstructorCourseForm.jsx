// -----------------------------------------------------------
// 👨‍🏫 InstructorCourseForm.jsx — Add / Edit / Delete Courses
// -----------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Box, AppBar, Toolbar, Typography, Drawer, List,
  ListItem, ListItemText, Button, Card, CardContent,
  TextField, Grid, Paper, IconButton
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const drawerWidth = 220;

function InstructorCourseForm() {
  const [form, setForm] = useState({
    course_name: "",
    department: "",
    semester: "",
  });
  const [courses, setCourses] = useState([]);
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");

  // 🧩 Fetch instructor’s existing courses
  const fetchMyCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/instructor/my-courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch {
      console.error("⚠️ Failed to load courses");
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  // 🧩 Handle course submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editId
      ? `http://localhost:5000/api/instructor/update-course/${editId}`
      : "http://localhost:5000/api/instructor/add-course";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message);
    setForm({ course_name: "", department: "", semester: "" });
    setEditId(null);
    fetchMyCourses(); // refresh list
  };

  // ✏️ Edit existing course
  const handleEdit = (course) => {
    setForm({
      course_name: course.course_name,
      department: course.department,
      semester: course.semester,
    });
    setEditId(course.course_id);
  };

  // 🗑️ Delete a course
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    const res = await fetch(`http://localhost:5000/api/instructor/delete-course/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(data.message);
    fetchMyCourses();
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth, backgroundColor: "#1976d2", color: "white" },
        }}
      >
        <Toolbar />
        <List>
          <ListItem>
            <ListItemText primary="Manage Courses" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#f9f9f9", p: 3 }}>
        {/* Top App Bar */}
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
              Instructor Dashboard — Manage Courses
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

        {/* Form Section */}
        <Card sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {editId ? "Edit Course" : "Submit New Course"}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Course Name"
                    fullWidth
                    value={form.course_name}
                    onChange={(e) =>
                      setForm({ ...form, course_name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Department"
                    fullWidth
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Semester"
                    fullWidth
                    value={form.semester}
                    onChange={(e) =>
                      setForm({ ...form, semester: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                sx={{ mt: 2 }}
                type="submit"
              >
                {editId ? "Update Course" : "Submit for Approval"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Courses List Section */}
        <Paper sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
          <Typography variant="h6" gutterBottom>
            My Submitted Courses
          </Typography>
          {courses.map((c) => (
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
                      c.status === "approved"
                        ? "green"
                        : c.status === "rejected"
                        ? "red"
                        : "gray",
                  }}
                >
                  Status: {c.status}
                </Typography>
              </Box>

              {/* Edit & Delete Buttons */}
              <Box>
                <IconButton
                  color="primary"
                  onClick={() => handleEdit(c)}
                  sx={{ mr: 1 }}
                >
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
          ))}
        </Paper>
      </Box>
    </Box>
  );
}

export default InstructorCourseForm;
