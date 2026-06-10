import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Search, LocationOn, WorkOutline, Map as MapIcon, OpenInNew } from "@mui/icons-material";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";

const JOB_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Opportunity";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return path.startsWith("/") ? path : `/${path}`;
};

const TYPE_FILTERS = [
  { key: "all", label: "All" },
  { key: "Job", label: "Jobs" },
  { key: "Internship", label: "Internships" },
  { key: "Attachment", label: "Attachments" },
];

export default function JobOpportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [items, setItems] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = getBaseUrl();
    let cancelled = false;
    setLoading(true);
    setError(null);

    const qs = new URLSearchParams();
    if (filterActive !== "all") qs.set("type", filterActive);

    fetch(`${base}/api/job-opportunities/public?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) setItems(data.data);
        else setItems([]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load job opportunities");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filterActive]);

  useEffect(() => {
    const base = getBaseUrl();
    let cancelled = false;
    fetch(`${base}/api/partners/public`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) setPartners(res.data);
        else setPartners([]);
      })
      .catch(() => {
        if (!cancelled) setPartners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const searchLower = useMemo(() => (search || "").trim().toLowerCase(), [search]);
  const filtered = useMemo(() => {
    if (!searchLower) return items;
    return items.filter(
      (o) =>
        (o.title && o.title.toLowerCase().includes(searchLower)) ||
        (o.description && o.description.toLowerCase().includes(searchLower)) ||
        (o.location && o.location.toLowerCase().includes(searchLower))
    );
  }, [items, searchLower]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', py: 5, px: 1 }}>
      <Box sx={{ width: "100%" }}>
        <Box component="header" sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.03em", fontSize: { xs: "2rem", md: "2.75rem" } }}>
                Job Opportunities
              </Typography>
              <Typography sx={{ color: "#000000", fontSize: "1.125rem", maxWidth: 720 }}>
                Browse available jobs, internships, and attachments.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<MapIcon />}
              onClick={() => navigate("/marketplace/job-opportunities/map")}
              sx={{
                borderRadius: "9999px",
                borderColor: "divider",
                color: "#000000",
                textTransform: "none",
                fontWeight: 600,
                px: 2.5,
                py: 1.25,
                "&:hover": { borderColor: PRIMARY, bgcolor: "rgba(23, 207, 84, 0.08)" },
                "&:focus": { outline: "none" },
                "&:focus-visible": { outline: "none" },
              }}
            >
              Map view
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search job opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "rgba(0,0,0,0.5)" }} />
                </InputAdornment>
              ),
              sx: {
                height: 56,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                "& fieldset": { border: "1px solid", borderColor: "divider" },
              },
            }}
          />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
            {TYPE_FILTERS.map(({ key, label }) => (
              <Button
                key={key}
                variant={filterActive === key ? "contained" : "outlined"}
                size="small"
                onClick={() => setFilterActive(key)}
                sx={{
                  borderRadius: "9999px",
                  px: 2.5,
                  py: 1.25,
                  fontWeight: 600,
                  bgcolor: filterActive === key ? PRIMARY : "transparent",
                  color: filterActive === key ? "#fff" : "#000000",
                  borderColor: filterActive === key ? PRIMARY : "divider",
                  textTransform: "none",
                  "&:hover": { bgcolor: filterActive === key ? PRIMARY : "action.hover", borderColor: PRIMARY },
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress sx={{ color: PRIMARY }} />
          </Box>
        ) : error ? (
          <Typography sx={{ py: 3, color: "#000000" }}>{error}</Typography>
        ) : filtered.length === 0 ? (
          <Typography sx={{ py: 6, textAlign: "center", color: "#000000" }}>
            {searchLower ? "No matching opportunities." : "No job opportunities at the moment."}
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((item) => (
              <Grid key={item.id} size={{ xs: 12, md: 6, lg: 4 }}>
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
                      image={resolveImageUrl(item.image) || JOB_PLACEHOLDER}
                      sx={{ height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
                    />
                    <Chip
                      label={item.type || "Opportunity"}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        bgcolor: PRIMARY,
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.6875rem",
                        letterSpacing: "0.05em",
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1, lineHeight: 1.3 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#000000", fontSize: "1.05rem", mb: 2, lineHeight: 1.6 }}>
                      {item.description || "—"}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mb: 2 }}>
                      {item.location && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: PRIMARY }} />
                          <Typography variant="caption" sx={{ color: "#000000" }}>
                            {item.location}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <WorkOutline sx={{ fontSize: 16, color: PRIMARY }} />
                        <Typography variant="caption" sx={{ color: "#000000" }}>
                          {item.type || "Opportunity"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: "auto", display: "flex", gap: 1 }}>
                      {(item.applyUrl || item.attachmentUrl) ? (
                        <Button
                          fullWidth
                          variant="contained"
                          endIcon={<OpenInNew />}
                          onClick={() => window.open(item.applyUrl || item.attachmentUrl, "_blank", "noopener,noreferrer")}
                          sx={{
                            py: 1.25,
                            fontWeight: 800,
                            bgcolor: PRIMARY,
                            "&:hover": { bgcolor: `${PRIMARY}E6` },
                            "&:focus": { outline: "none" },
                            "&:focus-visible": { outline: "none" },
                          }}
                        >
                          {item.type === "Attachment" ? "Open Attachment" : "Apply / View"}
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          sx={{
                            py: 1.25,
                            fontWeight: 800,
                            borderWidth: 2,
                            borderColor: PRIMARY,
                            color: PRIMARY,
                            "&:hover": { borderWidth: 2, borderColor: PRIMARY, bgcolor: PRIMARY, color: "#fff" },
                            "&:focus": { outline: "none" },
                            "&:focus-visible": { outline: "none" },
                          }}
                        >
                          Details
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Partners (from backend) */}
        {partners.length > 0 && (
          <Box
            component="section"
            sx={{
              py: 5,
              mt: 4,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#000000",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                mb: 4,
              }}
            >
              In Collaboration With
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                opacity: 0.7,
                "&:hover": { opacity: 1 },
                transition: "opacity 0.2s ease",
              }}
            >
              {partners.map((p) => (
                <Box
                  key={p.id}
                  component={p.websiteUrl ? "a" : "div"}
                  href={p.websiteUrl || undefined}
                  target={p.websiteUrl ? "_blank" : undefined}
                  rel={p.websiteUrl ? "noopener noreferrer" : undefined}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": p.websiteUrl ? { opacity: 0.85 } : {},
                  }}
                >
                  {p.logo ? (
                    <Box
                      component="img"
                      src={resolveImageUrl(p.logo)}
                      alt={p.logoAltText || p.name}
                      sx={{
                        maxHeight: 40,
                        maxWidth: 120,
                        height: "auto",
                        width: "auto",
                        objectFit: "contain",
                        verticalAlign: "middle",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "grey.300",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "grey.600",
                      }}
                    >
                      {p.initial || (p.name && p.name.charAt(0)) || "?"}
                    </Box>
                  )}
                  <Typography variant="h6" fontWeight={700} sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                    {p.name}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

