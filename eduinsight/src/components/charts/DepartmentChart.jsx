import React from "react";
import "../../components/charts/ChartSetup";
import { Pie } from "react-chartjs-2";

export default function DepartmentChart({ data }) {
  const labels = data?.map(d => d.department ?? "Unassigned") || [];
  const ratings = data?.map(d => Number(d.avg_department_rating)) || [];

  const chartData = {
    labels,
    datasets: [{ label: "Avg by Dept", data: ratings }],
  };

  return <Pie data={chartData} />;
}
