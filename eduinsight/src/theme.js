// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#60A5FA" }, // blue accent
    secondary: { main: "#A78BFA" }, // violet accent
    background: {
      default: "#0F172A", // deep slate
      paper: "#1E293B",   // slightly lighter cards
    },
    text: {
      primary: "#E2E8F0",
      secondary: "#94A3B8",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    body2: { color: "#CBD5E1" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(8px)",
          background: "linear-gradient(145deg,#1E293B 0%,#0F172A 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        },
      },
    },
  },
});

export default theme;
