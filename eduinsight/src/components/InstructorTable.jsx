import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Paper } from "@mui/material";

export default function InstructorTable({ token }) {
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/instructors", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInstructors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching instructors:", err);
        setInstructors([]);
      }
    };
    fetchInstructors();
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
          {instructors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>No instructors found.</TableCell>
            </TableRow>
          ) : (
            instructors.map((i) => (
              <TableRow key={i.user_id}>
                <TableCell>{i.full_name}</TableCell>
                <TableCell>{i.email}</TableCell>
                <TableCell>{i.role}</TableCell>
                <TableCell>{new Date(i.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}
