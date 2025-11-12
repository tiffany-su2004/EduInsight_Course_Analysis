import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";

export default function StudentTable({ token }) {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching students:", err);
        setStudents([]);
      }
    };
    fetchStudents();
  }, [token]);

  return (
    <Paper sx={{ p: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><b>Full Name</b></TableCell>
            <TableCell><b>Email</b></TableCell>
            <TableCell><b>Role</b></TableCell>
            <TableCell><b>Registered At</b></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No students found.</TableCell>
            </TableRow>
          ) : (
            students.map((s) => (
              <TableRow key={s.user_id}>
                <TableCell>{s.full_name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.role}</TableCell>
                <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
