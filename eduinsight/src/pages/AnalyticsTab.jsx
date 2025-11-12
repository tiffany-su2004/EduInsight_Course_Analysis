/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { exportDashboardToPDF } from "../utils/exportReport";
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  Line,            // for forecast line
  ComposedChart,   // to combine bar + line
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  getCourseAnalytics,
  getInstructorAnalytics,
  getComparisonAnalytics,
  getTrendAnalytics,
} from "../api/analyticsAPI";

// 🎨 Color palette
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// 🧠 Helper to shorten long text (e.g., course names)
const shorten = (text, max = 12) => {
  if (!text) return "";
  return text.length > max ? text.substring(0, max) + "…" : text;
};

// 🧩 Instructor color by performance
const getInstructorColor = (rating) => {
  if (rating >= 4.2) return "#10B981"; // green – high performer
  if (rating >= 3.9) return "#FACC15"; // yellow – average
  return "#EF4444"; // red – low
};

export default function AnalyticsTab({ token }) {
  const [loading, setLoading] = useState(true);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [error, setError] = useState(null);

  const [courseData, setCourseData] = useState([]);
  const [instructorData, setInstructorData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");

  // 🔄 Fetch all analytics data on load
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [course, instructor, compare, trend] = await Promise.all([
          getCourseAnalytics(),
          getInstructorAnalytics(),
          getComparisonAnalytics(),
          getTrendAnalytics(),
        ]);
        setCourseData(course.data);
        setInstructorData(instructor.data);
        setComparisonData(compare.data);
        setTrendData(trend.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const safeNum = (v, d = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  const fmtPct = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "0.0%";
    return (n >= 0 ? "+" : "") + (n * 100).toFixed(1) + "%";
  };

  // Options
  const semesterOptions = useMemo(() => {
    const semesters = new Set(courseData.map((c) => c.semester).filter(Boolean));
    return ["All", ...Array.from(semesters)];
  }, [courseData]);

  const courseOptions = useMemo(() => {
    const filtered = courseData.filter(
      (c) => selectedSemester === "All" || c.semester === selectedSemester
    );
    return ["All", ...Array.from(new Set(filtered.map((c) => c.course_name)))];
  }, [courseData, selectedSemester]);

  // Filters
  const filteredCourses = useMemo(
    () =>
      courseData.filter(
        (c) => selectedSemester === "All" || c.semester === selectedSemester
      ),
    [courseData, selectedSemester]
  );

  const filteredComparison = useMemo(
    () =>
      comparisonData.filter((c) =>
        filteredCourses.some((fc) => fc.course_id === c.course_id)
      ),
    [comparisonData, filteredCourses]
  );

  const selectedComparison = useMemo(() => {
    if (selectedCourse === "All") return filteredComparison;
    return filteredComparison.filter((c) => c.course_name === selectedCourse);
  }, [filteredComparison, selectedCourse]);

  // 🧮 Summary KPIs
  const avgCourse =
    filteredCourses.reduce((s, c) => s + safeNum(c.avg_course_rating), 0) /
    (filteredCourses.length || 1);
  const avgInstructor =
    instructorData.reduce((s, i) => s + safeNum(i.avg_instructor_rating), 0) /
    (instructorData.length || 1);
  const gap = Math.abs(avgInstructor - avgCourse) / 5;
  const totalResponses = filteredCourses.reduce((s, c) => s + safeNum(c.total_responses), 0);

  // =============================
  // 🤖 AI Insight Generator
  // =============================
  const insightText = useMemo(() => {
    if (!trendData || trendData.length < 2)
      return "Not enough data to generate insights yet.";

    const validTrends = trendData.filter(
      (t) => t.semester && typeof t.semester === "string"
    );
    if (validTrends.length < 2)
      return "Not enough valid trend data to generate insights.";

    const sorted = [...validTrends].sort((a, b) =>
      a.semester.localeCompare(b.semester)
    );
    const prev = sorted[sorted.length - 2];
    const curr = sorted[sorted.length - 1];
    const delta = safeNum(curr.avg_semester_rating) - safeNum(prev.avg_semester_rating);

    let trendSentence = "";
    if (delta > 0.05)
      trendSentence = `Overall student satisfaction improved by ${(delta * 100).toFixed(1)}% since ${prev.semester}.`;
    else if (delta < -0.05)
      trendSentence = `Satisfaction decreased by ${Math.abs(delta * 100).toFixed(1)}% since ${prev.semester}.`;
    else
      trendSentence = `Satisfaction remained stable compared to ${prev.semester}.`;

    const diff = avgInstructor - avgCourse;
    let alignmentSentence = "";
    if (diff > 0.1)
      alignmentSentence = "Instructors are rated noticeably higher than their courses, suggesting strong teaching quality.";
    else if (diff < -0.1)
      alignmentSentence = "Courses outperform instructor ratings, indicating possible delivery or engagement gaps.";
    else
      alignmentSentence = "Instructor and course ratings are well aligned, reflecting consistent satisfaction.";

    return `${trendSentence} ${alignmentSentence}`;
  }, [trendData, avgCourse, avgInstructor]);

  // =============================
  // 🔮 Predictive Forecast (OLS)
  // =============================
  const forecastSummary = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;

    const rows = trendData
      .filter((t) => t.semester && Number.isFinite(safeNum(t.avg_semester_rating)))
      .map((t, idx) => ({ ...t, _x: idx, _y: safeNum(t.avg_semester_rating) }))
      .sort((a, b) => a._x - b._x);

    if (rows.length < 2) return null;

    const n = rows.length;
    const sumX = rows.reduce((s, r) => s + r._x, 0);
    const sumY = rows.reduce((s, r) => s + r._y, 0);
    const sumXY = rows.reduce((s, r) => s + r._x * r._y, 0);
    const sumX2 = rows.reduce((s, r) => s + r._x * r._x, 0);
    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;

    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    const last = rows[rows.length - 1];
    const nextX = last._x + 1;

    let forecast = intercept + slope * nextX;
    forecast = Math.max(0, Math.min(5, forecast));

    const delta = forecast - last._y;
    const pct = last._y !== 0 ? delta / last._y : 0;

    const dir =
      Math.abs(delta) < 0.02 ? "remain roughly stable" : delta > 0 ? "increase" : "decrease";

    const sentence = `Predicted next semester satisfaction: ${forecast.toFixed(
      2
    )} (${fmtPct(pct)} vs last semester). Based on recent trend, ratings are expected to ${dir}.`;

    return { forecast, sentence };
  }, [trendData]);

  // For chart: add a forecast-only row (line) while keeping your bars intact
  const trendDataWithForecast = useMemo(() => {
    if (!trendData || trendData.length < 2) return trendData;
    if (!forecastSummary) return trendData;

    return [
      ...trendData,
      { semester: "Next Semester (Forecast)", forecast: forecastSummary.forecast },
    ];
  }, [trendData, forecastSummary]);

  // =============================
  // Render
  // =============================
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );

  const alignmentBuckets = filteredComparison.reduce((acc, c) => {
    acc[c.alignment_bucket] = (acc[c.alignment_bucket] || 0) + 1;
    return acc;
  }, {});

  // 🏆 Top Courses & Instructors
  const topCourses = [...filteredCourses]
    .sort((a, b) => b.avg_course_rating - a.avg_course_rating)
    .slice(0, 5)
    .map((c) => ({ ...c, short_name: shorten(c.course_name) }));

  const lowCourses = [...filteredCourses]
    .sort((a, b) => a.avg_course_rating - b.avg_course_rating)
    .slice(0, 5)
    .map((c) => ({ ...c, short_name: shorten(c.course_name) }));

  const topInstructors = [...instructorData]
    .sort((a, b) => b.avg_instructor_rating - a.avg_instructor_rating)
    .slice(0, 5);

  const instructorsWithColor = topInstructors.map((i) => ({
    ...i,
    color: getInstructorColor(i.avg_instructor_rating),
  }));

  return (
    <Box id="analytics-dashboard" sx={{ p: 3, color: "#E2E8F0" }}>
      {/* Main Title */}
      <Typography variant="h5" gutterBottom color="#93C5FD">
        📊 Computer Science Course Analytics Dashboard
      </Typography>

      {/* 📄 Download Report Bar with Loader */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="subtitle2" sx={{ color: "#9CA3AF" }}>
          All analytics reflect courses under the Computer Science department (SCI).
        </Typography>

        <button
          onClick={async () => {
            setLoadingPDF(true);
            await exportDashboardToPDF("analytics-dashboard", "EduInsight_SCI_Report");
            setTimeout(() => setLoadingPDF(false), 1200);
          }}
          disabled={loadingPDF}
          style={{
            backgroundColor: loadingPDF ? "#1E40AF" : "#3B82F6",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background 0.2s ease",
          }}
        >
          {loadingPDF ? "⏳ Generating..." : "📄 Download Report"}
        </button>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 2, borderBottom: "1px solid #1e293b", pb: 2 }}>
        <Stack direction="row" spacing={3}>
          <FilterSelect
            label="Semester"
            value={selectedSemester}
            options={semesterOptions}
            onChange={(val) => {
              setSelectedSemester(val);
              setSelectedCourse("All");
            }}
          />
          <FilterSelect
            label="Course"
            value={selectedCourse}
            options={courseOptions}
            onChange={(val) => setSelectedCourse(val)}
          />
        </Stack>
      </Box>

      {/* KPI Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <SummaryCard title="Avg Course Rating" value={avgCourse.toFixed(2)} color="#3B82F6" />
        <SummaryCard title="Avg Instructor Rating" value={avgInstructor.toFixed(2)} color="#10B981" />
        <SummaryCard title="Satisfaction Gap" value={`${(gap * 100).toFixed(1)}%`} color="#F59E0B" />
        <SummaryCard title="Total Responses" value={totalResponses} color="#8B5CF6" />
      </Grid>

      {/* 🤖 Smart AI-Style Insight Summary */}
      <Card
        sx={{
          background: "#111827",
          borderRadius: 3,
          p: 2.5,
          mb: 4,
          boxShadow: "0px 4px 10px rgba(0,0,0,0.4)",
          border: "1px solid #1e293b",
        }}
      >
        <Typography variant="h6" sx={{ color: "#93C5FD", mb: 1 }}>
          🤖 AI Insight Summary
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "#E2E8F0", lineHeight: 1.6, fontSize: "1rem", fontWeight: 400 }}
        >
          {insightText} {forecastSummary ? forecastSummary.sentence : null}
        </Typography>
      </Card>

      {/* Alignment Summary */}
      <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap" }}>
        {Object.entries(alignmentBuckets).map(([k, v]) => (
          <Chip
            key={k}
            label={`${k}: ${v}`}
            color={
              k.includes("Both High")
                ? "success"
                : k.includes("Both Low")
                ? "error"
                : k.includes("Instructor High")
                ? "info"
                : "warning"
            }
          />
        ))}
      </Stack>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Semester Trend */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard title="Semester Trend">
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={trendDataWithForecast} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <XAxis dataKey="semester" interval="preserveStartEnd" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <Bar dataKey="avg_semester_rating" fill="#F59E0B" name="Avg Rating by Semester" />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#60A5FA"
                  strokeDasharray="6 6"
                  dot={{ r: 4, fill: "#60A5FA" }}
                  name="Forecast (Next Semester)"
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
            {forecastSummary ? (
              <Typography
                variant="caption"
                sx={{ color: "#93C5FD", mt: 1, textAlign: "center", display: "block", fontStyle: "italic" }}
              >
                Predicted next semester satisfaction: {forecastSummary.forecast.toFixed(2)}
              </Typography>
            ) : null}
          </AnalyticsCard>
        </Grid>

        {/* 👨‍🏫 Instructor Overview — Always-Visible Color Key */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard title="Instructor Performance Overview (Top 5)">
            <Typography variant="body2" sx={{ mb: 0.5, color: "#9CA3AF" }}>
              Based on aggregated student feedback across all SCI courses.
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "#cbd5e1",
                mb: 1.5,
                background: "#1e293b",
                p: 0.8,
                borderRadius: 1,
                border: "1px solid #334155",
                textAlign: "center",
              }}
            >
              <strong>Color Key:</strong> 🟩 High ≥ 4.2  |  🟨 Average 3.9 – 4.19  |  🟥 Needs Attention &lt; 3.9
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={instructorsWithColor} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="instructor_name" tick={{ fill: "#cbd5e1", fontSize: 12 }} width={120} />
                <Tooltip />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <Bar dataKey="avg_instructor_rating" name="Avg Rating">
                  {instructorsWithColor.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Grid>

        {/* Course vs Instructor Comparison */}
        <Grid item xs={12}>
          <AnalyticsCard
            title={selectedCourse === "All" ? "Course vs Instructor Comparison" : `Satisfaction Comparison — ${selectedCourse}`}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={selectedComparison.slice(0, 10)} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                <XAxis dataKey="short_name" tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} iconType="circle" />
                <Bar dataKey="avg_course_rating" fill="#3B82F6" name="Course Rating" />
                <Bar dataKey="avg_instructor_rating" fill="#10B981" name="Instructor Rating" />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Grid>

        {/* Top & Low Courses */}
        <Grid item xs={12} md={6}>
          <AnalyticsCard title="Top Performing Courses">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={topCourses} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="short_name" tick={{ fill: "#cbd5e1", fontSize: 12 }} width={100} />
                <Tooltip />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <Bar dataKey="avg_course_rating" fill="#10B981" name="Avg Rating" />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalyticsCard title="Low Satisfaction Alerts">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={lowCourses} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="short_name" tick={{ fill: "#cbd5e1", fontSize: 12 }} width={100} />
                <Tooltip />
                <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
                <Bar dataKey="avg_course_rating" fill="#EF4444" name="Avg Rating" />
              </BarChart>
            </ResponsiveContainer>
          </AnalyticsCard>
        </Grid>
      </Grid>
    </Box>
  );
}

// 💡 Reusable UI components
function AnalyticsCard({ title, children }) {
  return (
    <Card sx={{ background: "#0b1220", borderRadius: 3, boxShadow: "0px 3px 8px rgba(0,0,0,0.3)", p: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: "#E2E8F0", fontWeight: 600 }} gutterBottom>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <Grid item xs={12} sm={6} md={3}>
      <Card sx={{ background: "#0f172a", borderRadius: 3, p: 2, boxShadow: "0px 3px 6px rgba(0,0,0,0.3)" }}>
        <Typography sx={{ fontSize: 14, color: "#94a3b8" }}>{title}</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 700, color }}>{value}</Typography>
      </Card>
    </Grid>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <FormControl sx={{ minWidth: 180 }}>
      <InputLabel sx={{ color: "#93C5FD" }}>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        sx={{
          color: "#E2E8F0",
          background: "#1e293b",
          ".MuiOutlinedInput-notchedOutline": { borderColor: "#334155" },
        }}
      >
        {options.map((opt, i) => (
          <MenuItem key={i} value={opt}>
            {opt || "Unassigned"}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
