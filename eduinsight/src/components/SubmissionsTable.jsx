import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
} from "@mui/material";

function SubmissionsTable() {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:5000/api/feedback/my-feedback", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setFeedbackList(data))
      .catch(() => console.log("⚠️ Failed to fetch feedback"));
  }, []);

  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        My Submissions
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Comment</TableCell>
            <TableCell>Submitted At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {feedbackList.map((item) => (
            <TableRow key={item.feedback_id}>
              <TableCell>{item.course_name}</TableCell>
              <TableCell>{item.rating}</TableCell>
              <TableCell>{item.comment}</TableCell>
              <TableCell>{new Date(item.submitted_at).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default SubmissionsTable;
