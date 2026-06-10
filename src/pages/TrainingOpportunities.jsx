import React, { useState, useEffect } from "react";
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
  Link,
  CircularProgress,
} from "@mui/material";
import {
  Search,
  LocationOn,
  CalendarToday,
  Payment,
  Event as EventIcon,
} from "@mui/icons-material";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const TEXT_MUTED = "#4e9767";
const AMBER = "#f59e0b";

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

const TRAINING_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Training";
const GRANT_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Funding";

export default function TrainingOpportunities() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [trainings, setTrainings] = useState([]);
  const [grants, setGrants] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const base = getBaseUrl();
    let cancelled = false;
    setLoading(true);
    setError(null);
    const isAll = filterActive === "all";
    const isFunding = filterActive === "funding";
    const isTraining = filterActive === "training";
    const isWorkshop = filterActive === "workshop";
    const isFieldDay = filterActive === "field-day";
    const isSeminar = filterActive === "seminar";

    if (isAll) {
      Promise.all([
        fetch(`${base}/api/training-events/public?limit=3`).then((r) => r.json()),
        fetch(`${base}/api/grants/public?limit=2`).then((r) => r.json()),
      ])
        .then(([trainRes, grantRes]) => {
          if (cancelled) return;
          if (trainRes.success && trainRes.data) setTrainings(Array.isArray(trainRes.data) ? trainRes.data : []);
          if (grantRes.success && grantRes.data) setGrants(Array.isArray(grantRes.data) ? grantRes.data : []);
        })
        .catch((err) => { if (!cancelled) setError(err.message || "Failed to load content"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else if (isFunding) {
      fetch(`${base}/api/grants/public?limit=2`)
        .then((r) => r.json())
        .then((grantRes) => {
          if (cancelled) return;
          setTrainings([]);
          if (grantRes.success && grantRes.data) setGrants(Array.isArray(grantRes.data) ? grantRes.data : []);
          else setGrants([]);
        })
        .catch((err) => { if (!cancelled) setError(err.message || "Failed to load content"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else if (isTraining || isWorkshop || isFieldDay || isSeminar) {
      const type = isTraining
        ? "Training"
        : isWorkshop
          ? "Workshop"
          : isFieldDay
            ? "Field day"
            : "Seminar";
      fetch(`${base}/api/training-events/public?type=${encodeURIComponent(type)}&limit=3`)
        .then((r) => r.json())
        .then((trainRes) => {
          if (cancelled) return;
          if (trainRes.success && trainRes.data) setTrainings(Array.isArray(trainRes.data) ? trainRes.data : []);
          else setTrainings([]);
          setGrants([]);
        })
        .catch((err) => { if (!cancelled) setError(err.message || "Failed to load content"); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [filterActive]);

  const searchLower = (search || "").trim().toLowerCase();
  const filteredTrainings =
    searchLower === ""
      ? trainings
      : trainings.filter(
          (t) =>
            (t.title && t.title.toLowerCase().includes(searchLower)) ||
            (t.description && t.description.toLowerCase().includes(searchLower)) ||
            (t.location && t.location.toLowerCase().includes(searchLower))
        );
  const filteredGrants =
    searchLower === ""
      ? grants
      : grants.filter(
          (g) =>
            (g.title && g.title.toLowerCase().includes(searchLower)) ||
            (g.description && g.description.toLowerCase().includes(searchLower))
        );

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
      .catch(() => { if (!cancelled) setPartners([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', py: 5, px: 1 }}>
      <Box sx={{ width: "100%" }}>
        {/* Header */}
        <Box
          component="header"
          sx={{
            mb: 5,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: "-0.033em",
                color: "#000000",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                fontSize: { xs: "2rem", md: "2.75rem" },
              }}
            >
              Trainings, Workshops & Events
            </Typography>
            <Typography
              sx={{
                color: "#000000",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                fontSize: "1.125rem",
                mt: 1.5,
                maxWidth: 672,
              }}
            >
              Discover upcoming trainings, workshops, field days, and seminars—plus funding opportunities to grow your agribusiness.
            </Typography>
          </Box>

          {/* Map view (same placement style as Job Opportunities) */}
          <Button
            variant="outlined"
            startIcon={<LocationOn sx={{ color: "grey.400" }} />}
            onClick={() => navigate("/marketplace/training-opportunities/map")}
            sx={{
              borderRadius: "9999px",
              borderColor: "divider",
              color: "#000000",
              fontFamily: '"Calibri Light", Calibri, sans-serif',
              textTransform: "none",
              fontWeight: 600,
              px: 2.5,
              py: 1.25,
              "&:hover": { borderColor: PRIMARY, bgcolor: "rgba(23, 207, 84, 0.08)" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
              whiteSpace: "nowrap",
            }}
          >
            Map view
          </Button>
        </Box>

        {/* Search & Filters */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mb: 6 }}>
          <TextField
            fullWidth
            placeholder="Search trainings, events, or opportunities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: TEXT_MUTED }} />
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
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#000000",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                mr: 0.5,
              }}
            >
              Filter by:
            </Typography>
            {[
              { key: "all", label: "All Events" },
              { key: "training", label: "Training" },
              { key: "workshop", label: "Workshop" },
              { key: "field-day", label: "Field day" },
              { key: "seminar", label: "Seminar" },
              { key: "funding", label: "Funding" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant={filterActive === key ? "contained" : "outlined"}
                size="small"
                onClick={() => setFilterActive(key)}
                sx={{
                  borderRadius: "9999px",
                  px: 2.5,
                  py: 1.25,
                  fontWeight: 500,
                  bgcolor: filterActive === key ? PRIMARY : "transparent",
                  color: filterActive === key ? "#fff" : "#000000",
                  borderColor: filterActive === key ? PRIMARY : "divider",
                  boxShadow: filterActive === key ? 1 : 0,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: filterActive === key ? PRIMARY : "action.hover",
                    borderColor: PRIMARY,
                  },
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
              >
                {label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Upcoming events – shown for All + event types */}
        {(filterActive === "all" ||
          filterActive === "training" ||
          filterActive === "workshop" ||
          filterActive === "field-day" ||
          filterActive === "seminar") && (
        <Box component="section" sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2,
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.01em", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
              {filterActive === "training"
                ? "Trainings"
                : filterActive === "workshop"
                  ? "Workshops"
                  : filterActive === "field-day"
                    ? "Field days"
                    : filterActive === "seminar"
                      ? "Seminars"
                      : "Upcoming Events"}
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/marketplace/training-opportunities/trainings")}
              sx={{
                color: PRIMARY,
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
            >
              View all
            </Link>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PRIMARY }} />
            </Box>
          ) : error ? (
            <Typography sx={{ py: 3, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>{error}</Typography>
          ) : filteredTrainings.length === 0 ? (
            <Typography sx={{ py: 4, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
              {searchLower
                ? "No matching events."
                : `No ${
                    filterActive === "training"
                      ? "training"
                      : filterActive === "workshop"
                        ? "workshop"
                        : filterActive === "field-day"
                          ? "field day"
                          : filterActive === "seminar"
                            ? "seminar"
                            : "event"
                  } listings at the moment.`}
            </Typography>
          ) : (
          <Grid container spacing={3}>
            {filteredTrainings.slice(0, 3).map((item) => (
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
                    <Typography
                      variant="body2"
                      sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem", mb: 2, lineHeight: 1.6 }}
                    >
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
        )}

        {/* Funding & Grants – shown for All, Funding */}
        {(filterActive === "all" || filterActive === "funding") && (
        <Box component="section" sx={{ mb: 6 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderColor: "divider",
              pb: 2,
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: "-0.01em", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
              Funding & Grants
            </Typography>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/marketplace/training-opportunities/grants")}
              sx={{
                color: PRIMARY,
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
            >
              View all
            </Link>
          </Box>
          {loading && filterActive === "funding" ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PRIMARY }} />
            </Box>
          ) : (
          <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
            {filteredGrants.length === 0 ? (
              <Grid size={12}>
                <Typography sx={{ py: 4, textAlign: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
                  {searchLower ? "No matching grants." : "No funding or grants available at the moment."}
                </Typography>
              </Grid>
            ) : filteredGrants.slice(0, 2).map((item) => (
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
        )}

        {/* Partners (from backend) */}
        {partners.length > 0 && (
        <Box
          component="section"
          sx={{
            py: 5,
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
