// -----------------------------------------------------------
// 📊 QuestionBreakdown.jsx — Analytics by Question
// -----------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchIcon from "@mui/icons-material/Search";

function QuestionBreakdown() {
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/analytics/questions`);
        const data = await res.json();
        setRows(
          data.map((q, idx) => ({
            id: idx + 1,
            section: q.section,
            question_text: q.question_text,
            avg_rating: Number(q.avg_rating).toFixed(2),
            responses: q.n,
          }))
        );
      } catch (err) {
        console.error("Error fetching question breakdown:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [API_BASE]);

  const filteredRows = rows.filter((r) =>
    r.question_text.toLowerCase().includes(query.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "question_text",
      headerName: "Question Text",
      flex: 1,
      minWidth: 300,
    },
    {
      field: "section",
      headerName: "Section",
      width: 120,
      renderCell: (params) => (
        <strong
          style={{
            color: params.value === "course" ? "#1565c0" : "#2e7d32",
            textTransform: "capitalize",
          }}
        >
          {params.value}
        </strong>
      ),
    },
    {
      field: "avg_rating",
      headerName: "Avg Rating ⭐",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "responses",
      headerName: "Responses 🧮",
      width: 150,
      align: "center",
      headerAlign: "center",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          mt: 6,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" gutterBottom>
        📋 Question Breakdown Analytics
      </Typography>
      <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search question text..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8, 15, 30]}
              sx={{
                borderRadius: 2,
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#e3f2fd",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}

export default QuestionBreakdown;
// End of QuestionBreakdown.jsx