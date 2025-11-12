import React from "react";

export default function ComparisonTable({ data }) {
  if (!data?.length) return <div>No comparison data.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Course</th>
            <th>Instructor</th>
            <th>Course★</th>
            <th>Instructor★</th>
            <th>Gap</th>
            <th>Bucket</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td>{r.course_name}</td>
              <td>{r.instructor_name}</td>
              <td>{Number(r.avg_course_rating).toFixed(2)}</td>
              <td>{Number(r.avg_instructor_rating).toFixed(2)}</td>
              <td>{Number(r.gap).toFixed(2)}</td>
              <td>{r.alignment_bucket}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
