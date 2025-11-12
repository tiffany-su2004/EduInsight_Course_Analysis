import React from "react";
import "../../components/charts/ChartSetup";
import { Bar } from "react-chartjs-2";

export default function CourseChart({ data }) {
  const labels = data?.map(d => d.course_name) || [];
  const ratings = data?.map(d => Number(d.avg_course_rating)) || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: "Avg Course Rating",
        data: ratings,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" }, tooltip: { enabled: true } },
    scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
  };

  return <Bar data={chartData} options={options} />;
}
