import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  InputAdornment,
  TextField,
  Chip,
  Switch,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  Verified,
  LocationOn,
  Chat,
} from "@mui/icons-material";
import FarmersMap from "../components/FarmersMap/FarmersMap";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const INPUT_BG = "#e7f3eb";
const TEXT_MUTED = "#4e9767";

const FARMER_PLACEHOLDER = "https://placehold.co/400x250/f6f8f6/4e9767?text=Farm";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = getBaseUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
};

const PRIMARY_ACTIVITY_LABELS = {
  crop: "Crop farming",
  livestock: "Livestock",
  mixed: "Mixed farming",
  aquaculture: "Aquaculture",
  agro_processing: "Agro-processing",
  other: "Other",
};

const SCALE_LABELS = {
  small: "Small scale",
  medium: "Medium scale",
  large: "Large scale",
  commercial: "Commercial",
  industrial: "Industrial",
};

const AVAILABILITY_DISPLAY = {
  available: { label: "AVAILABLE", color: "success" },
  pre_order_only: { label: "PRE-ORDER ONLY", color: "warning" },
  unavailable: { label: "UNAVAILABLE", color: "default" },
};

export default function FarmersHub() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUserId = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("marketplace_user") || "{}");
      return u.id || null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const base = getBaseUrl();
    setLoading(true);
    setError(null);
    fetch(`${base}/api/marketplace/public/farmers`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) setFarmers(data.data);
        else setFarmers([]);
      })
      .catch((err) => { if (!cancelled) setError(err.message || "Failed to load farmers"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const searchLower = (search || "").trim().toLowerCase();
  const filteredFarmers = searchLower === ""
    ? farmers
    : farmers.filter(
        (f) =>
          (f.fullName && f.fullName.toLowerCase().includes(searchLower)) ||
          (f.profile?.farmOrBusinessName && f.profile.farmOrBusinessName.toLowerCase().includes(searchLower)) ||
          (f.profile?.country && f.profile.country.toLowerCase().includes(searchLower)) ||
          (f.profile?.region && f.profile.region.toLowerCase().includes(searchLower)) ||
          (Array.isArray(f.profile?.produces) && f.profile.produces.some((p) => String(p).toLowerCase().includes(searchLower)))
      );

  const filteredByVerified = verifiedOnly
    ? filteredFarmers.filter((f) => f.isVerified === true || f.is_verified === true)
    : filteredFarmers;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#0e1b12", pt: 2.5, pb: 5, px: 1, width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
      <Box sx={{ width: "100%" }}>
        {/* Page Heading */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              color: "text.primary",
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            Farmers & Producers Hub
          </Typography>
          <Typography sx={{ color: TEXT_MUTED, fontSize: "1.125rem", mt: 0.5 }}>
            Discover verified farmers by product and location
          </Typography>
        </Box>

        {/* Search and Filter Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: BORDER_LIGHT,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            placeholder="Search farmers by product or location"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: TEXT_MUTED }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: INPUT_BG,
                borderRadius: 2,
                "& fieldset": { border: "none" },
                height: 48,
              },
            }}
            sx={{ mb: 2 }}
          />
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, v) => setTabValue(v)}
              sx={{
                minHeight: 40,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
                "& .Mui-selected": { color: PRIMARY },
                "& .MuiTabs-indicator": { bgcolor: PRIMARY },
              }}
            >
              <Tab label="List" icon={<Search />} iconPosition="start" />
              <Tab label="Location" icon={<LocationOn />} iconPosition="start" />
            </Tabs>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                px: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: BORDER_LIGHT,
                bgcolor: "#f8fcf9",
                marginLeft: "auto",
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                Verified Farmers
              </Typography>
              <Switch
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: PRIMARY },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PRIMARY },
                }}
              />
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tabValue === 1 ? (
          <Box sx={{ mb: 3 }}>
            <FarmersMap farmers={filteredByVerified} />
          </Box>
        ) : (
        /* Farmer Cards Grid */
        <Grid container spacing={3} sx={{ pb: 2 }}>
          {loading ? (
            <Grid size={12} sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PRIMARY }} />
            </Grid>
          ) : filteredByVerified.length === 0 ? (
            <Grid size={12} sx={{ py: 6, textAlign: "center" }}>
              <Typography color="text.secondary">
                {searchLower ? "No matching farmers." : "No farmers found."}
              </Typography>
            </Grid>
          ) : filteredByVerified.map((farmer) => {
            const p = farmer.profile || {};
            const locationParts = [p.district, p.region, p.country].filter(Boolean);
            const locationStr = locationParts.length ? locationParts.join(", ") : "—";
            const farmType = p.primaryActivity ? (PRIMARY_ACTIVITY_LABELS[p.primaryActivity] || p.primaryActivity) : (p.scaleOfOperation ? (SCALE_LABELS[p.scaleOfOperation] || p.scaleOfOperation) : "—");
            const avail = p.availability ? (AVAILABILITY_DISPLAY[p.availability] || { label: p.availability, color: "default" }) : { label: "—", color: "default" };
            const tags = Array.isArray(p.produces) ? p.produces : [];
            const verified = farmer.isVerified === true || farmer.is_verified === true;
            const name = p.farmOrBusinessName || farmer.fullName || "—";
            const imageUrl = resolveImageUrl(p.profilePhotoUrl) || FARMER_PLACEHOLDER;
            const phone = farmer.phone || "";
            const phoneDigits = phone.replace(/\D/g, "");
            const isOwnCard = currentUserId && farmer.id === currentUserId;
            const whatsappUrl = !isOwnCard && phoneDigits ? `https://wa.me/${phoneDigits}` : null;
            return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={farmer.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: BORDER_LIGHT,
                  "&:hover": { boxShadow: 4 },
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <Box sx={{ position: "relative", aspectRatio: "16/10" }}>
                  <CardMedia
                    component="div"
                    image={imageUrl}
                    sx={{
                      height: "100%",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  {verified && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        bgcolor: PRIMARY,
                        color: "#fff",
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        boxShadow: 2,
                      }}
                    >
                      <Verified sx={{ fontSize: 16 }} /> MK-VERIFIED
                    </Box>
                  )}
                </Box>
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {name}
                    </Typography>
                    <Chip
                      label={avail.label}
                      size="small"
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        height: 22,
                        bgcolor: avail.color === "warning" ? "#fef3c7" : INPUT_BG,
                        color: avail.color === "warning" ? "#d97706" : PRIMARY,
                        border: "1px solid",
                        borderColor: avail.color === "warning" ? "rgba(217,119,6,0.2)" : `${PRIMARY}33`,
                      }}
                    />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: TEXT_MUTED, fontSize: "0.875rem", mb: 1.5 }}>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <span>{locationStr}</span>
                  </Box>
                  <Typography variant="body2" sx={{ color: TEXT_MUTED, mb: 1.5 }}>
                    Farm Type: <Typography component="span" fontWeight={600} color="text.primary">{farmType}</Typography>
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{
                          fontSize: "0.75rem",
                          height: 24,
                          bgcolor: "#f8fcf9",
                          border: "1px solid",
                          borderColor: BORDER_LIGHT,
                        }}
                      />
                    ))}
                  </Box>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Chat />}
                    disableRipple
                    component={whatsappUrl ? "a" : "button"}
                    href={whatsappUrl || undefined}
                    target={whatsappUrl ? "_blank" : undefined}
                    rel={whatsappUrl ? "noopener noreferrer" : undefined}
                    disabled={!whatsappUrl}
                    sx={{
                      mt: "auto",
                      py: 1.5,
                      fontWeight: 700,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#14b348" },
                      "&:focus": { outline: "none" },
                    }}
                  >
                    Contact on WhatsApp
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
          })}
        </Grid>
        )}
      </Box>
    </Box>
  );
}
