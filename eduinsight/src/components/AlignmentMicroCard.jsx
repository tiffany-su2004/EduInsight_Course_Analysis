// -----------------------------------------------------------
// 🎚️ AlignmentMicroCard.jsx — compact bar comparison for top courses
// -----------------------------------------------------------

import React from "react";
import { Card, Typography, LinearProgress, Box } from "@mui/material";

export default function AlignmentMicroCard({
  course,
  courseRating,
  instructorRating,
}) {
  // Normalize to 0–100 scale
  const cVal = (parseFloat(courseRating) / 5) * 100;
  const iVal = (parseFloat(instructorRating) / 5) * 100;
  const gap = Math.abs(cVal - iVal);

  let color;
  if (gap < 5) color = "#10B981"; // aligned
  else if (gap < 12) color = "#FBBF24"; // mild misalignment
  else color = "#EF4444"; // big gap

  return (
    <Card
      sx={{
        background: "#111827",
        borderRadius: 2,
        p: 2,
        boxShadow: "0 3px 6px rgba(0,0,0,0.3)",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <Typography sx={{ color: "#E2E8F0", fontWeight: 600, fontSize: 15 }}>
        {course}
      </Typography>

      <Box sx={{ mt: 1 }}>
        <Typography sx={{ color: "#94a3b8", fontSize: 12 }}>Course Rating</Typography>
        <LinearProgress
          variant="determinate"
          value={cVal}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "#1e293b",
            "& .MuiLinearProgress-bar": { backgroundColor: "#3B82F6" },
          }}
        />

        <Typography sx={{ color: "#94a3b8", fontSize: 12, mt: 1 }}>
          Instructor Rating
        </Typography>
        <LinearProgress
          variant="determinate"
          value={iVal}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: "#1e293b",
            "& .MuiLinearProgress-bar": { backgroundColor: "#10B981" },
          }}
        />
      </Box>

      <Typography sx={{ mt: 1, color, fontSize: 13 }}>
        Gap : {gap.toFixed(1)}%
      </Typography>
    </Card>
  );
}
