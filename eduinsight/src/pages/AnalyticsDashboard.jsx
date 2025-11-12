import React, { useEffect, useState } from "react";
import { Container, Grid, Card, CardContent, Typography } from "@mui/material";
import {
  getCourseAnalytics,
  getInstructorAnalytics,
  getComparisonAnalytics,
  getDepartmentAnalytics,
  getTrendAnalytics,
} from "../api/analyticsAPI";

import CourseChart from "../components/charts/CourseChart";
import InstructorChart from "../components/charts/InstructorChart";
import DepartmentChart from "../components/charts/DepartmentChart";
import TrendChart from "../components/charts/TrendChart";
import ComparisonTable from "../components/charts/ComparisonTable";

export default function AnalyticsDashboard() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async function load() {
      try {
        const [
          courseRes,
          instrRes,
          compareRes,
          deptRes,
          trendRes,
        ] = await Promise.all([
          getCourseAnalytics(),
          getInstructorAnalytics(),
          getComparisonAnalytics(),
          getDepartmentAnalytics(),
          getTrendAnalytics(),
        ]);

        setCourses(courseRes.data || []);
        setInstructors(instrRes.data || []);
        setComparison(compareRes.data || []);
        setDepartments(deptRes.data || []);
        setTrends(trendRes.data || []);
      } catch (e) {
        console.error("Analytics load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Container sx={{ py: 4 }}><Typography>Loading analytics…</Typography></Container>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Analytics</Typography>

      <Grid container spacing={3}>
        {/* Course */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Course Ratings</Typography>
            <CourseChart data={courses} />
          </CardContent></Card>
        </Grid>

        {/* Instructor */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Instructor Ratings</Typography>
            <InstructorChart data={instructors} />
          </CardContent></Card>
        </Grid>

        {/* Department */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Department Averages</Typography>
            <DepartmentChart data={departments} />
          </CardContent></Card>
        </Grid>

        {/* Trend */}
        <Grid item xs={12} md={6}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Semester Trend</Typography>
            <TrendChart data={trends} />
          </CardContent></Card>
        </Grid>

        {/* Comparison table */}
        <Grid item xs={12}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Course vs Instructor Alignment</Typography>
            <ComparisonTable data={comparison} />
          </CardContent></Card>
        </Grid>
      </Grid>
    </Container>
  );
}
