import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, LocationOn, CalendarToday } from "@mui/icons-material";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const TRAINING_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Training";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

export default function ViewAllTrainings() {
  const navigate = useNavigate();
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = getBaseUrl();
    fetch(`${base}/api/training-events/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setTrainings(data.data);
        else setTrainings([]);
      })
      .catch((err) => setError(err.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', py: 2, px: 1 }}>
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/marketplace/training-opportunities")}
              sx={{
                color: "#000000",
                "&:hover": { bgcolor: "action.hover" },
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none" },
              }}
              aria-label="Back to Training & Opportunities"
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.01em", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
              All workshops & training
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : error ? (
          <Typography sx={{ py: 4, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>{error}</Typography>
        ) : trainings.length === 0 ? (
          <Typography sx={{ py: 6, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
            No training or workshop events at the moment.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {trainings.map((item) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={item.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { boxShadow: 4 },
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <Box sx={{ position: "relative", aspectRatio: "16/10" }}>
                    <CardMedia
                      component="div"
                      image={resolveImageUrl(item.image) || TRAINING_PLACEHOLDER}
                      sx={{ height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
                    />
                    <Chip
                      label={item.type || "Event"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: PRIMARY,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.6875rem",
                        letterSpacing: "0.05em",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem", mb: 2, lineHeight: 1.6 }}>
                      {item.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                        color: "#000000",
                        fontFamily: '"Calibri Light", Calibri, sans-serif',
                        fontSize: "0.75rem",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: PRIMARY }} />
                        <span>{formatDate(item.date)}</span>
                      </Box>
                      {item.location && (
                        <>
                          <span>•</span>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: PRIMARY }} />
                            <span>{item.location}</span>
                          </Box>
                        </>
                      )}
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      disableRipple
                      onClick={() => navigate(`/marketplace/training-opportunities/register/${item.id}`, { state: { event: item } })}
                      sx={{
                        mt: "auto",
                        py: 1.5,
                        fontWeight: 700,
                        bgcolor: PRIMARY,
                        "&:hover": { bgcolor: `${PRIMARY}E6` },
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                      }}
                    >
                      Register Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
