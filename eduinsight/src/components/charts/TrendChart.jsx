import React, { useMemo } from "react";
import "../../components/charts/ChartSetup";
import { Line } from "react-chartjs-2";

function sortSemesters(a, b) {
  // Basic sort: null last, then lexicographic
  if (a.semester === null) return 1;
  if (b.semester === null) return -1;
  return String(a.semester).localeCompare(String(b.semester));
}

// --- Lightweight linear regression on indices 1..n ---
function forecastNextLinear(y) {
  const n = y.length;
  if (n === 0) return null;
  if (n === 1) return y[0]; // degenerate case: project flat

  // x = 1..n
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1;
    const yi = Number(y[i]);
    sumX += x;
    sumY += yi;
    sumXY += x * yi;
    sumX2 += x * x;
  }
  const denom = n * sumX2 - sumX * sumX;
  const a = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom; // slope
  const b = (sumY - a * sumX) / n; // intercept
  const nextX = n + 1;
  return a * nextX + b;
}

export default function TrendChart({ data }) {
  const { labels, ratings, predictedNext } = useMemo(() => {
    const sorted = (data || []).slice().sort(sortSemesters);
    const labels = sorted.map((d) => d.semester ?? "Unassigned");
    const ratings = sorted.map((d) => Number(d.avg_semester_rating)).map((v) =>
      isFinite(v) ? v : null
    );

    // Guard: remove nulls for forecasting math but keep original order for display
    const dense = ratings.filter((v) => v !== null && !Number.isNaN(v));
    const predictedNext = dense.length ? forecastNextLinear(dense) : null;

    return { labels, ratings, predictedNext };
  }, [data]);

  // Extend axis with the "Next" placeholder
  const extendedLabels = [...labels, "Next"];

  // Dataset 1: Actuals (last point has no value for the extra "Next" label)
  const actualsData = [...ratings, null];

  // Dataset 2: Forecast (nulls until last two points, then last actual → predicted)
  const forecastData = new Array(Math.max(ratings.length - 1, 0)).fill(null);
  if (ratings.length > 0) {
    const lastActual = ratings[ratings.length - 1];
    forecastData.push(lastActual);
    forecastData.push(
      predictedNext !== null ? Math.max(0, Math.min(5, predictedNext)) : null
    );
  } else {
    // no actuals; just a null placeholder for "Next"
    forecastData.push(null);
  }

  const chartData = {
    labels: extendedLabels,
    datasets: [
      {
        label: "Avg Rating by Semester",
        data: actualsData,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: "Forecast (next semester)",
        data: forecastData,
        tension: 0.3,
        borderWidth: 2,
        borderDash: [6, 6],
        pointRadius: 3,
        // subtle styling: semi-transparent stroke & points
        borderColor: "rgba(59,130,246,0.55)", // Tailwind's blue-500, 55% alpha
        pointBackgroundColor: "rgba(59,130,246,0.55)",
        pointBorderColor: "rgba(59,130,246,0.55)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (ctx.datasetIndex === 1 && ctx.parsed.y != null) {
              return `Forecast: ${ctx.parsed.y.toFixed(2)}`;
            }
            if (ctx.parsed.y != null) {
              return `Actual: ${ctx.parsed.y.toFixed(2)}`;
              }
            return "";
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1 },
      },
    },
    spanGaps: true, // connect forecast segment cleanly
  };

  return <Line data={chartData} options={options} />;
}
