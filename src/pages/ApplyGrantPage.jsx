import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Payment, Event as EventIcon } from "@mui/icons-material";
import Swal from "sweetalert2";
import { applyForGrant } from "../api";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const AMBER = "#f59e0b";
const GRANT_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Funding";

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

export default function ApplyGrantPage() {
  const { grantId } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const grant = state?.grant ?? null;

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!grantId || !grant) return;
    setError(null);
    setSubmitting(true);
    try {
      await applyForGrant(grantId, {});
      await Swal.fire({
        icon: "success",
        title: "Application submitted",
        text: "Your grant application has been submitted successfully.",
        confirmButtonText: "OK",
      });
      navigate(-1);
    } catch (err) {
      setError(err.message || "Application failed");
      setSubmitting(false);
    }
  };

  if (!grant) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', py: 4, px: 2 }}>
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography sx={{ mb: 2, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
            Grant not found or link expired. Please choose a grant from the list.
          </Typography>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/marketplace/training-opportunities")}
            sx={{ color: PRIMARY, fontWeight: 600 }}
          >
            Back to Training &amp; Opportunities
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', py: 3, px: 2 }}>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "#000000",
              "&:hover": { bgcolor: "action.hover" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={700} sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
            Apply for funding
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {/* Left: Grant card */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
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
              }}
            >
              <Box sx={{ position: "relative", aspectRatio: "16/10" }}>
                <CardMedia
                  component="div"
                  image={resolveImageUrl(grant.image) || GRANT_PLACEHOLDER}
                  sx={{ height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
                />
                <Chip
                  label={grant.badge || "Funding"}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: AMBER,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.6875rem",
                    letterSpacing: "0.05em",
                  }}
                />
              </Box>
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1, lineHeight: 1.3, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                  {grant.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem", mb: 2, lineHeight: 1.6 }}
                >
                  {grant.description}
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
                  }}
                >
                  {(grant.amount || grant.currency) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Payment sx={{ fontSize: 16, color: AMBER }} />
                      <span>{grant.amount || "See details"}</span>
                    </Box>
                  )}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <EventIcon sx={{ fontSize: 16, color: AMBER }} />
                    <span>{grant.deadlineText || formatDate(grant.deadline) || "Open"}</span>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Right: Application form */}
          <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                Confirm application
              </Typography>
              <Typography variant="body2" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                You are applying for: <strong>{grant.title}</strong>
              </Typography>
              {error && (
                <Typography variant="body2" color="error">
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                fullWidth
                disableRipple
                sx={{
                  mt: 1,
                  py: 1.5,
                  fontWeight: 700,
                  bgcolor: PRIMARY,
                  "&:hover": { bgcolor: `${PRIMARY}E6` },
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              >
                {submitting ? (
                  <>
                    <CircularProgress size={24} sx={{ color: "#fff", mr: 1 }} />
                    Submitting…
                  </>
                ) : (
                  "Submit application"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
