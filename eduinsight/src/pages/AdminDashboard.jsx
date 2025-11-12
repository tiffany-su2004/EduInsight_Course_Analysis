// -----------------------------------------------------------
// 🧑‍💼 AdminDashboard.jsx — Manage Courses, Users & Analytics
// -----------------------------------------------------------

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import QuestionBreakdown from "./QuestionBreakdown";
import AnalyticsTab from "./AnalyticsTab"; // ✅ New import

// --- Icons ---
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import BarChartIcon from "@mui/icons-material/BarChart";
import FeedbackIcon from "@mui/icons-material/Feedback";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

// --- MUI Components ---
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
} from "@mui/material";

const drawerWidth = 220;

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [courseFilter, setCourseFilter] = useState("Pending");
  const [allCourses, setAllCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);

  // 🔧 pagination for Submissions
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalRows, setTotalRows] = useState(0); // ✅ missing state (fixes ESLint error)

  const [newQuestion, setNewQuestion] = useState({
    section: "course",
    text: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) window.location.href = "/";
  }, [token]);

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchAllCourses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/courses/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAllCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching all courses:", err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/instructors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setInstructors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching instructors:", err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const [courseRes, instructorRes] = await Promise.all([
        fetch("http://localhost:5000/api/feedback/questions/course", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/feedback/questions/instructor", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const courseData = await courseRes.json();
      const instructorData = await instructorRes.json();
      setQuestions([...courseData, ...instructorData]);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  // 🔎 Submissions (paginated)
  const fetchFeedbackSubmissions = async (pageNum = 0) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/feedback/submissions?limit=${pageSize}&offset=${pageNum * pageSize}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setFeedbackData(data.rows || []);
      setTotalRows(data.total || 0); // ✅ now defined
    } catch (err) {
      console.error("Error fetching feedback submissions:", err);
    }
  };

  // ---------------- ACTIONS ----------------
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    await fetch(`http://localhost:5000/api/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchStudents();
    fetchInstructors();
  };

  const handleToggleUserStatus = async (userId, newStatus) => {
    await fetch(`http://localhost:5000/api/users/${userId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ active: newStatus }),
    });
    fetchStudents();
    fetchInstructors();
  };

  const handleStatusUpdate = async (course_id, newStatus) => {
    await fetch(`http://localhost:5000/api/courses/status/${course_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchAllCourses();
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim()) {
      alert("Please enter a question.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/feedback/questions/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: newQuestion.section,
          question_text: newQuestion.text,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setNewQuestion({ section: "course", text: "" });
        fetchQuestions();
      } else {
        alert("⚠️ " + data.message);
      }
    } catch (err) {
      console.error("Error adding question:", err);
      alert("❌ Server error adding question.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await fetch(`http://localhost:5000/api/feedback/questions/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchQuestions();
  };

  useEffect(() => {
    switch (activeTab) {
      case "courses":
        fetchAllCourses();
        break;
      case "students":
        fetchStudents();
        break;
      case "instructors":
        fetchInstructors();
        break;
      case "feedback":
        fetchQuestions();
        break;
      case "submissions":
        // reset to page 0 whenever tab opens
        setPage(0);
        fetchFeedbackSubmissions(0);
        break;
      default:
        break;
    }
  }, [activeTab]);

  const filteredCourses = allCourses.filter((c) => c.status === courseFilter);

  // -------------------------------------------------
  // RENDER SECTION
  // -------------------------------------------------
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            background: "linear-gradient(180deg, #1e293b, #0f172a)",
            color: "#E2E8F0",
          },
        }}
      >
        <Toolbar />
        <List>
          <ListItem button onClick={() => setActiveTab("courses")}>
            <SchoolIcon sx={{ mr: 2 }} /> <ListItemText primary="Courses" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("students")}>
            <GroupIcon sx={{ mr: 2 }} /> <ListItemText primary="Students" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("instructors")}>
            <GroupIcon sx={{ mr: 2 }} /> <ListItemText primary="Instructors" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("feedback")}>
            <FeedbackIcon sx={{ mr: 2 }} /> <ListItemText primary="Feedback" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("submissions")}>
            <BarChartIcon sx={{ mr: 2 }} /> <ListItemText primary="Submissions" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("analytics")}>
            <BarChartIcon sx={{ mr: 2 }} /> <ListItemText primary="Analytics" />
          </ListItem>
          <ListItem button onClick={() => setActiveTab("questionsBreakdown")}>
            <QuestionAnswerIcon sx={{ mr: 2 }} />{" "}
            <ListItemText primary="Question Breakdown" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "#0f172a", p: 3 }}>
        {/* Navbar */}
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
            background: "rgba(15,23,42,0.9)",
            backdropFilter: "blur(8px)",
            color: "#93C5FD",
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Admin Dashboard
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

        {/* Tab content */}
        {activeTab === "courses" && (
          <CoursesTab
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            filteredCourses={filteredCourses}
            handleStatusUpdate={handleStatusUpdate}
          />
        )}

        {activeTab === "students" && (
          <UsersTab
            title="Students"
            users={students}
            handleDeleteUser={handleDeleteUser}
            handleToggleUserStatus={handleToggleUserStatus}
          />
        )}

        {activeTab === "instructors" && (
          <UsersTab
            title="Instructors"
            users={instructors}
            handleDeleteUser={handleDeleteUser}
            handleToggleUserStatus={handleToggleUserStatus}
          />
        )}

        {activeTab === "feedback" && (
          <FeedbackQuestionsTab
            questions={questions}
            newQuestion={newQuestion}
            setNewQuestion={setNewQuestion}
            handleAddQuestion={handleAddQuestion}
            handleDeleteQuestion={handleDeleteQuestion}
          />
        )}

        {activeTab === "submissions" && (
          <>
            <SubmissionsTab feedbackData={feedbackData} />
            {/* lightweight pager — keeps your existing SubmissionsTab unchanged */}
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                disabled={page === 0}
                onClick={() => {
                  const newPage = Math.max(0, page - 1);
                  setPage(newPage);
                  fetchFeedbackSubmissions(newPage);
                }}
              >
                Prev
              </Button>
              <Typography sx={{ color: "#93C5FD", alignSelf: "center" }}>
                Page {page + 1} / {Math.max(1, Math.ceil(totalRows / pageSize))}
              </Typography>
              <Button
                variant="outlined"
                disabled={(page + 1) * pageSize >= totalRows}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  fetchFeedbackSubmissions(newPage);
                }}
              >
                Next
              </Button>
            </Box>
          </>
        )}

        {activeTab === "analytics" && <AnalyticsTab token={token} />}
        {activeTab === "questionsBreakdown" && <QuestionBreakdown />}
      </Box>
    </Box>
  );
}

// ---------------------------------------------------
// SUBCOMPONENTS (simplified and clean)
// ---------------------------------------------------

function CoursesTab({ courseFilter, setCourseFilter, filteredCourses, handleStatusUpdate }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom color="#93C5FD">
        Course Approvals & History
      </Typography>
      <Tabs
        value={courseFilter}
        onChange={(e, v) => setCourseFilter(v)}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 3 }}
      >
        <Tab value="Pending" label="Pending" />
        <Tab value="Approved" label="Approved" />
        <Tab value="Rejected" label="Rejected" />
      </Tabs>
      <Grid container spacing={2}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.course_id}>
            <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, background: "#1e293b" }}>
              <CardContent>
                <Typography variant="h6" color="#E2E8F0">
                  {course.course_name}
                </Typography>
                <Typography variant="body2" color="gray">
                  Instructor: {course.instructor_name}
                </Typography>
                <Typography variant="body2" color="gray">
                  Dept: {course.department}
                </Typography>
                {course.status === "Pending" && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{ mr: 1 }}
                      onClick={() => handleStatusUpdate(course.course_id, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleStatusUpdate(course.course_id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function UsersTab({ title, users, handleDeleteUser, handleToggleUserStatus }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom color="#93C5FD">
        {title}
      </Typography>
      <Paper sx={{ p: 2, background: "#1e293b" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#93C5FD" }}>Name</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Email</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Role</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.user_id}>
                <TableCell sx={{ color: "#E2E8F0" }}>{u.full_name}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{u.email}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{u.role}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mr: 1 }}
                    onClick={() => handleDeleteUser(u.user_id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outlined"
                    color={u.active ? "warning" : "success"}
                    onClick={() => handleToggleUserStatus(u.user_id, !u.active)}
                  >
                    {u.active ? "Suspend" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function FeedbackQuestionsTab({ questions, newQuestion, setNewQuestion, handleAddQuestion, handleDeleteQuestion }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom color="#93C5FD">
        Feedback Question Management
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Question"
          fullWidth
          value={newQuestion.text}
          onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
        />
        <TextField
          select
          label="Section"
          value={newQuestion.section}
          onChange={(e) => setNewQuestion({ ...newQuestion, section: e.target.value })}
          SelectProps={{ native: true }}
          sx={{ width: 150 }}
        >
          <option value="course">Course</option>
          <option value="instructor">Instructor</option>
        </TextField>
        <Button variant="contained" onClick={handleAddQuestion}>
          Add
        </Button>
      </Box>
      <Grid container spacing={2}>
        {questions.map((q) => (
          <Grid item xs={12} md={6} key={q.question_id}>
            <Card sx={{ p: 2, background: "#1e293b" }}>
              <Typography color="#E2E8F0">{q.question_text}</Typography>
              <Typography variant="body2" color="gray">
                Section: {q.section}
              </Typography>
              <Button
                variant="outlined"
                color="error"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => handleDeleteQuestion(q.question_id)}
              >
                Delete
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function SubmissionsTab({ feedbackData }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom color="#93C5FD">
        Feedback Submissions Overview
      </Typography>
      <Paper sx={{ p: 2, background: "#1e293b" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#93C5FD" }}>Student</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Course</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Instructor</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Question</TableCell>
              <TableCell sx={{ color: "#93C5FD" }}>Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbackData.map((f, i) => (
              <TableRow key={i}>
                <TableCell sx={{ color: "#E2E8F0" }}>{f.student_name}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{f.course_name}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{f.instructor_name}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{f.question_text}</TableCell>
                <TableCell sx={{ color: "#E2E8F0" }}>{f.rating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

export default AdminDashboard;
// End of AdminDashboard.jsx
