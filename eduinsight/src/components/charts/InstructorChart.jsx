import React from "react";
import "../../components/charts/ChartSetup";
import { Bar } from "react-chartjs-2";

export default function InstructorChart({ data }) {
  const labels = data?.map(d => d.instructor_name) || [];
  const ratings = data?.map(d => Number(d.avg_instructor_rating)) || [];

  const chartData = {
    labels,
    datasets: [
      { label: "Avg Instructor Rating", data: ratings },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
  };

  return <Bar data={chartData} options={options} />;
}
