import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  InputAdornment,
  TextField,
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
  WaterDrop,
  LocalFlorist,
  SetMeal,
  Agriculture,
  MedicalServices,
  Pets,
} from "@mui/icons-material";
import VeterinariansMap from "../components/VeterinariansMap/VeterinariansMap";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const TEXT_MUTED = "#4e9767";

const VET_PLACEHOLDER = "https://placehold.co/400x300/f6f8f6/4e9767?text=Vet";

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

const specializationIcons = {
  dairy: WaterDrop,
  poultry: Pets,
  swine: LocalFlorist,
  aquaculture: SetMeal,
  livestock: Agriculture,
  general: MedicalServices,
};

export default function VeterinaryServices() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [veterinarians, setVeterinarians] = useState([]);
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
    fetch(`${base}/api/marketplace/public/veterinarians`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) setVeterinarians(data.data);
        else setVeterinarians([]);
      })
      .catch((err) => { if (!cancelled) setError(err.message || "Failed to load veterinarians"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const searchLower = (search || "").trim().toLowerCase();
  const filteredVets = searchLower === ""
    ? veterinarians
    : veterinarians.filter(
        (v) =>
          (v.fullName && v.fullName.toLowerCase().includes(searchLower)) ||
          (v.profile?.farmOrBusinessName && v.profile.farmOrBusinessName.toLowerCase().includes(searchLower)) ||
          (v.profile?.country && v.profile.country.toLowerCase().includes(searchLower)) ||
          (v.profile?.region && v.profile.region.toLowerCase().includes(searchLower)) ||
          (v.profile?.roleSpecificData?.specialization && String(v.profile.roleSpecificData.specialization).toLowerCase().includes(searchLower))
      );

  const filteredByVerified = verifiedOnly
    ? filteredVets.filter((v) => v.isVerified === true || v.is_verified === true)
    : filteredVets;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#0e1b12", width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
      {/* Header section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2.5,
          px: 1,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.033em",
              color: "text.primary",
              fontSize: { xs: "2rem", md: "2.75rem" },
            }}
          >
            Veterinary Services
          </Typography>
          <Typography sx={{ color: TEXT_MUTED, fontSize: "1.125rem", mt: 1 }}>
            Connect with MK-verified veterinary professionals
          </Typography>
        </Box>
      </Box>

      {/* Search and filters */}
      <Box sx={{ py: 2, px: 1 }}>
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            placeholder="Search veterinarians by specialization, location, or service type"
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
                px: 2,
                py: 1,
                borderRadius: "9999px",
                border: "1px solid",
                borderColor: `${PRIMARY}33`,
                bgcolor: `${PRIMARY}1A`,
                marginLeft: "auto",
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Verified Only
              </Typography>
              <Switch
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: PRIMARY },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: PRIMARY },
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 1, mb: 2 }}>
          {error}
        </Alert>
      )}

      {tabValue === 1 ? (
        <Box sx={{ px: 1, pb: 4 }}>
          <VeterinariansMap veterinarians={filteredByVerified} />
        </Box>
      ) : (
        <Box sx={{ px: 1, pb: 4 }}>
          <Box sx={{ width: "100%" }}>
            <Grid container spacing={3}>
            {loading ? (
              <Grid size={12} sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                <CircularProgress sx={{ color: PRIMARY }} />
              </Grid>
            ) : filteredByVerified.length === 0 ? (
              <Grid size={12} sx={{ py: 6, textAlign: "center" }}>
                <Typography color="text.secondary">
                  {searchLower ? "No matching veterinarians." : "No veterinarians found."}
                </Typography>
              </Grid>
            ) : filteredByVerified.map((vet) => {
              const p = vet.profile || {};
              const locationParts = [p.district, p.region, p.country].filter(Boolean);
              const locationStr = locationParts.length ? locationParts.join(", ") : "—";
              const rsd = p.roleSpecificData && typeof p.roleSpecificData === "object" ? p.roleSpecificData : {};
              const specialization = rsd.specialization || "—";
              const specKey = (specialization !== "—" && String(specialization).toLowerCase().split(/\s+/)[0]) || "general";
              const SpecIcon = specializationIcons[specKey] || MedicalServices;
              const name = p.farmOrBusinessName || vet.fullName || "—";
              const imageUrl = resolveImageUrl(p.profilePhotoUrl) || VET_PLACEHOLDER;
              const verified = vet.isVerified === true || vet.is_verified === true;
              const phone = vet.phone || "";
              const phoneDigits = phone.replace(/\D/g, "");
              const isOwnCard = currentUserId && vet.id === currentUserId;
              const whatsappUrl = !isOwnCard && phoneDigits ? `https://wa.me/${phoneDigits}` : null;
              return (
                <Grid size={{ xs: 12, md: 6, lg: 4 }} key={vet.id}>
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
                    <Box sx={{ position: "relative", aspectRatio: "4/3" }}>
                      <CardMedia
                        component="div"
                        image={imageUrl}
                        sx={{ height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
                      />
                      {verified && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: PRIMARY,
                            color: "#fff",
                            px: 1.5,
                            py: 0.75,
                            borderRadius: "9999px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            boxShadow: 2,
                          }}
                        >
                          <Verified sx={{ fontSize: 16 }} /> MK VERIFIED
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, p: 2.5 }}>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          {name}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <SpecIcon sx={{ fontSize: 18, color: TEXT_MUTED }} />
                          <Typography variant="body2" sx={{ color: TEXT_MUTED, fontWeight: 500 }}>
                            {specialization}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                          <LocationOn sx={{ fontSize: 18, color: "grey.500" }} />
                          <Typography variant="body2" color="text.secondary">
                            {locationStr}
                          </Typography>
                        </Box>
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
                          py: 1.375,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          bgcolor: PRIMARY,
                          "&:hover": { bgcolor: "#15b84a" },
                          "&:focus": { outline: "none" },
                        }}
                      >
                        WhatsApp / Message
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
            </Grid>
          </Box>
        </Box>
      )}
    </Box>
  );
}

