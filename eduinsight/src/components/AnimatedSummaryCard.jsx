// -----------------------------------------------------------
// 📊 AnimatedSummaryCard.jsx — Animated KPI cards for dashboard
// -----------------------------------------------------------

import React from "react";
import { Card, Typography } from "@mui/material";
import { motion } from "framer-motion";
import CountUp from "react-countup";

export default function AnimatedSummaryCard({ title, value, color, suffix = "" }) {
  const isNumeric = !isNaN(parseFloat(value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        sx={{
          background: "#111827",
          borderRadius: 3,
          p: 2,
          boxShadow: "0px 3px 6px rgba(0,0,0,0.3)",
          borderTop: `3px solid ${color}`,
        }}
      >
        <Typography sx={{ fontSize: 14, color: "#94a3b8" }}>{title}</Typography>
        <Typography sx={{ fontSize: 32, fontWeight: 700, color, mt: 1 }}>
          {isNumeric ? <CountUp end={parseFloat(value)} duration={1.6} decimals={2} /> : value}
          {suffix}
        </Typography>
      </Card>
    </motion.div>
  );
}
