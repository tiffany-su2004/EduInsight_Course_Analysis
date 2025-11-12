// -----------------------------------------------------------
// 🏛️ DepartmentAnalyticsCard.jsx — adaptive visualization for department averages
// -----------------------------------------------------------

import React from "react";
import { Typography, Box } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function DepartmentAnalyticsCard({ data }) {
  // 🎯 Handle completely missing data
  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          height: 250,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0b1220",
          borderRadius: 3,
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 16, mb: 1 }}>📉 No Department Data</Typography>
        <Typography sx={{ fontSize: 13, maxWidth: 250 }}>
          Not enough departmental data for visualization.
        </Typography>
      </Box>
    );
  }

  // 💡 Calculate global average for display
  const avgRating =
    data.reduce((sum, d) => sum + Number(d.avg_department_rating || 0), 0) /
    (data.length || 1);

  // 🧱 Case 1: 1–2 departments → show bar chart + numeric summary
  if (data.length < 3) {
    return (
      <Box sx={{ height: 250, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 5]} />
            <YAxis
              type="category"
              dataKey="department"
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              width={80}
            />
            <Tooltip />
            <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
            <Bar
              dataKey="avg_department_rating"
              fill="#3B82F6"
              name="Avg Rating"
              barSize={25}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Overlay summary metric */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 15,
            background: "rgba(17,24,39,0.8)",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              color: "#E2E8F0",
              fontSize: 12,
              fontWeight: 600,
              textAlign: "right",
            }}
          >
            Avg Dept Rating: {avgRating.toFixed(2)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // 🧱 Case 2: 3+ departments → PieChart with legends
  return (
    <Box sx={{ height: 250, position: "relative" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="avg_department_rating"
            nameKey="department"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>

      {/* Overlay metric */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          right: 15,
          background: "rgba(17,24,39,0.8)",
          px: 1.5,
          py: 0.5,
          borderRadius: 2,
        }}
      >
        <Typography
          sx={{
            color: "#E2E8F0",
            fontSize: 12,
            fontWeight: 600,
            textAlign: "right",
          }}
        >
          Avg Dept Rating: {avgRating.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
}
