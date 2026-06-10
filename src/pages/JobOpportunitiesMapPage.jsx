import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import JobOpportunitiesMap from "../components/JobOpportunitiesMap/JobOpportunitiesMap";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

export default function JobOpportunitiesMapPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getBaseUrl();
    fetch(`${base}/api/job-opportunities/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setItems(data.data);
        else setItems([]);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: BG_LIGHT, color: "#0e1b12", pt: 2, pb: "2px", px: { xs: 1, sm: 2 } }}>
      <Box sx={{ width: "100%", maxWidth: "100vw" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <IconButton
            onClick={() => navigate("/marketplace/job-opportunities")}
            sx={{
              color: "text.primary",
              "&:hover": { bgcolor: "action.hover" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            }}
            aria-label="Back to Job Opportunities"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: "-0.01em", color: "text.primary" }}>
            Opportunity locations
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : (
          <Box sx={{ width: "100%" }}>
            <JobOpportunitiesMap opportunities={items} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

