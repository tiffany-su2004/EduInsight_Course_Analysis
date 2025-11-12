import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Page imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import StudentFeedback from "./pages/StudentFeedback";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

function App() {
  return (
    <Router>
      {/* Temporary nav for quick access during dev */}
      <nav style={{ padding: 10, background: "#f0f0f0" }}>
        <Link to="/login" style={{ margin: 10 }}>Login</Link>
        <Link to="/register" style={{ margin: 10 }}>Register</Link>
        <Link to="/student" style={{ margin: 10 }}>Student</Link>
        <Link to="/instructor" style={{ margin: 10 }}>Instructor</Link>
        <Link to="/admin" style={{ margin: 10 }}>Admin</Link>
        <Link to="/admin/analytics" style={{ margin: 10 }}>Analytics</Link>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/feedback/:course_id" element={<StudentFeedback />} />
        <Route path="/instructor" element={<InstructorDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
