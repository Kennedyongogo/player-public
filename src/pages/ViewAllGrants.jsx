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
import { ArrowBack, Payment, Event as EventIcon } from "@mui/icons-material";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const AMBER = "#f59e0b";
const GRANT_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Funding";

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

export default function ViewAllGrants() {
  const navigate = useNavigate();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = getBaseUrl();
    fetch(`${base}/api/grants/public`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setGrants(data.data);
        else setGrants([]);
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
              All funding & grants
            </Typography>
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : error ? (
          <Typography sx={{ py: 4, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>{error}</Typography>
        ) : grants.length === 0 ? (
          <Typography sx={{ py: 6, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
            No funding or grants available at the moment.
          </Typography>
        ) : (
          <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
            {grants.map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.id} sx={{ display: "flex" }}>
                <Card
                  elevation={0}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { boxShadow: 4 },
                    transition: "box-shadow 0.2s ease",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "33.333%" },
                      minHeight: { xs: 160, sm: "auto" },
                      flexShrink: 0,
                    }}
                  >
                    <CardMedia
                      component="div"
                      image={resolveImageUrl(item.image) || GRANT_PLACEHOLDER}
                      sx={{
                        height: { xs: 160, sm: "100%" },
                        minHeight: { sm: 200 },
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5, minWidth: 0 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1, flexShrink: 0 }}>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                        {item.title}
                      </Typography>
                      <Chip
                        label={item.badge || "Funding"}
                        size="small"
                        sx={{
                          bgcolor: AMBER,
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.625rem",
                          letterSpacing: "0.1em",
                          height: 22,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000000",
                        fontFamily: '"Calibri Light", Calibri, sans-serif',
                        fontSize: "1.05rem",
                        mb: 2,
                        lineHeight: 1.6,
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.description}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        flexWrap: "wrap",
                        color: "#000000",
                        fontFamily: '"Calibri Light", Calibri, sans-serif',
                        fontSize: "0.75rem",
                        mb: 2,
                        flexShrink: 0,
                      }}
                    >
                      {(item.amount || item.currency) && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Payment sx={{ fontSize: 18, color: AMBER }} />
                          <span>{item.amount || "See details"}</span>
                        </Box>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <EventIcon sx={{ fontSize: 18, color: AMBER }} />
                        <span>{item.deadlineText || formatDate(item.deadline) || "Open"}</span>
                      </Box>
                    </Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      disableRipple
                      onClick={() => navigate("/marketplace/training-opportunities/grants/apply/" + item.id, { state: { grant: item } })}
                      sx={{
                        mt: "auto",
                        py: 1.25,
                        fontWeight: 700,
                        borderWidth: 2,
                        borderColor: PRIMARY,
                        color: PRIMARY,
                        "&:hover": { borderWidth: 2, borderColor: PRIMARY, bgcolor: PRIMARY, color: "#fff" },
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                      }}
                    >
                      Apply for Funding
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
