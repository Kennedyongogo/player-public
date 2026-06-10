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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Switch,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Search, Verified, Chat, Send, SupportAgent, LocationOn } from "@mui/icons-material";
import Swal from "sweetalert2";
import SuppliersMap from "../components/SuppliersMap/SuppliersMap";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const INPUT_BG = "#e7f3eb";
const TEXT_MUTED = "#4e9767";
const PANEL_BG = "#eef8f1";
const WHATSAPP = "#25D366";
const SUPPLIER_PLACEHOLDER = "https://placehold.co/400x300/f6f8f6/4e9767?text=Supplier";

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

export default function InputsFeeds() {
  const [search, setSearch] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animalType, setAnimalType] = useState("poultry");
  const [productionStage, setProductionStage] = useState("starter");
  const [budget, setBudget] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("KES");
  const [ingredients, setIngredients] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

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
    fetch(`${base}/api/marketplace/public/input-suppliers`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) setSuppliers(data.data);
        else setSuppliers([]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load suppliers");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const searchLower = (search || "").trim().toLowerCase();
  const filteredBySearch = searchLower === ""
    ? suppliers
    : suppliers.filter(
        (s) =>
          (s.fullName && s.fullName.toLowerCase().includes(searchLower)) ||
          (s.profile?.farmOrBusinessName && s.profile.farmOrBusinessName.toLowerCase().includes(searchLower)) ||
          (s.profile?.country && s.profile.country.toLowerCase().includes(searchLower)) ||
          (s.profile?.region && s.profile.region.toLowerCase().includes(searchLower)) ||
          (s.profile?.roleSpecificData?.productsSupplied && String(s.profile.roleSpecificData.productsSupplied).toLowerCase().includes(searchLower)) ||
          (s.profile?.roleSpecificData?.coverageArea && String(s.profile.roleSpecificData.coverageArea).toLowerCase().includes(searchLower))
      );

  const filteredByVerified = verifiedOnly
    ? filteredBySearch.filter((s) => s.isVerified === true || s.is_verified === true)
    : filteredBySearch;

  const handleFormulationSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const base = getBaseUrl();
      const token = typeof localStorage !== "undefined" ? localStorage.getItem("marketplace_token") : null;
      const res = await fetch(`${base}/api/marketplace/public/feed-formulation-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          animalType: animalType || "poultry",
          productionStage: productionStage || "starter",
          budget:
            budget != null && String(budget).trim() !== ""
              ? `${String(budget).trim()} ${budgetCurrency}`
              : undefined,
          preferredIngredients: ingredients != null && String(ingredients).trim() !== "" ? String(ingredients).trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        await Swal.fire({
          icon: "error",
          title: "Request failed",
          text: data.message || "Could not submit your request. Please try again.",
        });
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "Request sent",
        text: "Your feed formulation request has been submitted. Our team will review it within 24 hours.",
      });
      setBudget("");
      setIngredients("");
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: BG_LIGHT, color: "#0e1b12", pt: 2.5, pb: 5, px: 1, width: "100%", maxWidth: "100vw", boxSizing: "border-box" }}>
      <Box sx={{ width: "100%" }}>
        {/* Page Heading */}
        <Box component="header" sx={{ mb: 2.5 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              lineHeight: 1.2,
              letterSpacing: "-0.033em",
              color: "text.primary",
              fontSize: { xs: "2rem", md: "2.25rem" },
            }}
          >
            Inputs & Feeds
          </Typography>
          <Typography
            sx={{
              color: TEXT_MUTED,
              fontSize: "1.125rem",
              mt: 1.5,
              maxWidth: 672,
            }}
          >
            Find quality agricultural inputs and request expert feed formulations from verified partners.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Left: Suppliers */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Search & Filters */}
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
                placeholder="Search feeds, seeds, fertilizers..."
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
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
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
            </Paper>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {tabValue === 1 ? (
              <Box sx={{ mb: 3 }}>
                <SuppliersMap suppliers={filteredByVerified} />
              </Box>
            ) : (
              /* Verified Suppliers Grid */
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: "1.375rem",
                    letterSpacing: "-0.015em",
                    mb: 2,
                  }}
                >
                  Verified Suppliers
                </Typography>
                <Grid container spacing={2}>
                  {loading ? (
                    <Grid size={12} sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                      <CircularProgress sx={{ color: PRIMARY }} />
                    </Grid>
                  ) : filteredByVerified.length === 0 ? (
                    <Grid size={12} sx={{ py: 6, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        {searchLower ? "No matching suppliers." : "No suppliers found."}
                      </Typography>
                    </Grid>
                  ) : (
                    filteredByVerified.map((supplier) => {
                      const p = supplier.profile || {};
                      const rsd = p.roleSpecificData && typeof p.roleSpecificData === "object" ? p.roleSpecificData : {};
                      const name = p.farmOrBusinessName || supplier.fullName || "—";
                      const productsStr = rsd.productsSupplied ? String(rsd.productsSupplied).trim() : "";
                      const locationParts = [p.region, p.country].filter(Boolean);
                      const locationStr = locationParts.length ? locationParts.join(", ") : "";
                      const subtitle = [productsStr, locationStr].filter(Boolean).join(" • ") || "—";
                      const tags = productsStr ? productsStr.split(/[,;]/).map((t) => t.trim()).filter(Boolean) : [];
                      const verified = supplier.isVerified === true || supplier.is_verified === true;
                      const imageUrl = resolveImageUrl(p.profilePhotoUrl) || SUPPLIER_PLACEHOLDER;
                      const phone = supplier.phone || "";
                      const phoneDigits = phone.replace(/\D/g, "");
                      const isOwnCard = currentUserId && supplier.id === currentUserId;
                      const whatsappUrl = !isOwnCard && phoneDigits ? `https://wa.me/${phoneDigits}` : null;
                      return (
                        <Grid size={{ xs: 12, md: 6 }} key={supplier.id}>
                          <Card
                            elevation={0}
                            sx={{
                              height: "100%",
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: BORDER_LIGHT,
                              "&:hover": { boxShadow: 4 },
                              transition: "box-shadow 0.2s ease",
                            }}
                          >
                            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
                              <Box sx={{ display: "flex", gap: 2 }}>
                                <Box
                                  sx={{
                                    width: 96,
                                    height: 96,
                                    borderRadius: 2,
                                    bgcolor: "grey.200",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                  }}
                                >
                                  <CardMedia
                                    component="div"
                                    image={imageUrl}
                                    sx={{ width: "100%", height: "100%", backgroundSize: "cover", backgroundPosition: "center" }}
                                  />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0, py: 0.5 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, flexWrap: "wrap" }}>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: "1.125rem" }}>
                                      {name}
                                    </Typography>
                                    {verified && (
                                      <Chip
                                        size="small"
                                        icon={<Verified sx={{ fontSize: 16 }} />}
                                        label="MK Verified"
                                        sx={{
                                          height: 24,
                                          fontSize: "0.8125rem",
                                          fontWeight: 600,
                                          bgcolor: `${PRIMARY}1A`,
                                          color: PRIMARY,
                                          "& .MuiChip-icon": { color: "inherit" },
                                        }}
                                      />
                                    )}
                                  </Box>
                                  <Typography variant="body2" sx={{ color: TEXT_MUTED, fontWeight: 500, mb: 1, fontSize: "1rem" }}>
                                    {subtitle}
                                  </Typography>
                                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                    {tags.slice(0, 6).map((tag) => (
                                      <Chip
                                        key={tag}
                                        label={tag}
                                        size="small"
                                        sx={{
                                          height: 24,
                                          fontSize: "0.8125rem",
                                          bgcolor: BG_LIGHT,
                                          color: TEXT_MUTED,
                                          border: "none",
                                        }}
                                      />
                                    ))}
                                  </Box>
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
                                  py: 1.25,
                                  fontWeight: 600,
                                  fontSize: "0.875rem",
                                  bgcolor: WHATSAPP,
                                  "&:hover": { bgcolor: "#1da851" },
                                  "&:focus": { outline: "none" },
                                }}
                              >
                                Contact on WhatsApp
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              </Box>
            )}
          </Grid>

          {/* Right: Custom Feed Formulation Panel */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ position: { lg: "sticky" }, top: { lg: 32 }, display: "flex", flexDirection: "column", gap: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: `${PRIMARY}33`,
                  bgcolor: PANEL_BG,
                  overflow: "hidden",
                  position: "relative",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -48,
                    right: -48,
                    width: 128,
                    height: 128,
                    borderRadius: "50%",
                    bgcolor: `${PRIMARY}1A`,
                    filter: "blur(40px)",
                  },
                }}
              >
                <Box sx={{ position: "relative", fontFamily: '"Calibri", "Calibri Light", sans-serif', color: "#000000" }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: "1.25rem", color: "#000000", fontFamily: "inherit" }}>
                    Custom Feed Formulation
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#000000", mb: 3, fontSize: "1rem", fontFamily: "inherit" }}>
                    Can't find what you need? Request a tailored formulation from our certified animal nutritionists.
                  </Typography>
                  <Box component="form" onSubmit={handleFormulationSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", fontFamily: "inherit", "&.Mui-focused": { color: "#000000" } }}>
                        Animal Type
                      </InputLabel>
                      <Select
                        value={animalType}
                        label="Animal Type"
                        onChange={(e) => setAnimalType(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          "& fieldset": { border: "none" },
                          "& .MuiSelect-select": { fontSize: "1rem", color: "#000000", fontFamily: "inherit" },
                        }}
                      >
                        <MenuItem value="poultry" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Poultry (Broilers/Layers)</MenuItem>
                        <MenuItem value="cattle" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Cattle (Dairy/Beef)</MenuItem>
                        <MenuItem value="pig" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Pig (Swine)</MenuItem>
                        <MenuItem value="aqua" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Aqua (Fish Feed)</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", fontFamily: "inherit", "&.Mui-focused": { color: "#000000" } }}>
                        Production Stage
                      </InputLabel>
                      <Select
                        value={productionStage}
                        label="Production Stage"
                        onChange={(e) => setProductionStage(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          "& fieldset": { border: "none" },
                          "& .MuiSelect-select": { fontSize: "1rem", color: "#000000", fontFamily: "inherit" },
                        }}
                      >
                        <MenuItem value="starter" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Starter</MenuItem>
                        <MenuItem value="grower" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Grower</MenuItem>
                        <MenuItem value="finisher" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Finisher</MenuItem>
                        <MenuItem value="breeder" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Breeder</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl size="small" fullWidth>
                      <InputLabel sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", fontFamily: "inherit", "&.Mui-focused": { color: "#000000" } }}>
                        Budget currency
                      </InputLabel>
                      <Select
                        value={budgetCurrency}
                        label="Budget currency"
                        onChange={(e) => setBudgetCurrency(e.target.value)}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          "& fieldset": { border: "none" },
                          "& .MuiSelect-select": { fontSize: "1rem", color: "#000000", fontFamily: "inherit" },
                        }}
                      >
                        <MenuItem value="KES" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>Kenya Shillings (KES)</MenuItem>
                        <MenuItem value="USD" sx={{ fontFamily: "inherit", fontSize: "1rem" }}>US Dollars (USD)</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      size="small"
                      fullWidth
                      label={budgetCurrency === "KES" ? "Estimated Budget (KES)" : "Estimated Budget (USD)"}
                      placeholder={budgetCurrency === "KES" ? "e.g. 50,000" : "e.g. 500"}
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          "& fieldset": { border: "none" },
                          fontSize: "1rem",
                          color: "#000000",
                          fontFamily: '"Calibri", "Calibri Light", sans-serif',
                          "&::placeholder": { color: "#000000", opacity: 0.7 },
                        },
                      }}
                      InputLabelProps={{
                        sx: { fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", fontFamily: "inherit", "&.Mui-focused": { color: "#000000" } },
                      }}
                    />
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={3}
                      label="Preferred Ingredients"
                      placeholder="e.g. Soya meal, Maize bran, Fish meal..."
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          bgcolor: "background.paper",
                          "& fieldset": { border: "none" },
                          fontSize: "1rem",
                          color: "#000000",
                          fontFamily: '"Calibri", "Calibri Light", sans-serif',
                          "&::placeholder": { color: "#000000", opacity: 0.7 },
                        },
                      }}
                      InputLabelProps={{
                        sx: { fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#000000", fontFamily: "inherit", "&.Mui-focused": { color: "#000000" } },
                      }}
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      startIcon={<Send />}
                      disableRipple
                      disabled={formSubmitting}
                      sx={{
                        mt: 1,
                        py: 1.5,
                        fontWeight: 700,
                        bgcolor: PRIMARY,
                        color: "#0e1b12",
                        boxShadow: `0 4px 14px ${PRIMARY}33`,
                        "&:hover": { bgcolor: `${PRIMARY}E6` },
                        "&:focus": { outline: "none" },
                      }}
                    >
                      {formSubmitting ? "Sending…" : "Request Expert Formulation"}
                    </Button>
                  </Box>
                </Box>
              </Paper>

              {/* Trust Badge */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: BORDER_LIGHT,
                  bgcolor: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  fontFamily: '"Calibri", "Calibri Light", sans-serif',
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    bgcolor: `${PRIMARY}1A`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SupportAgent sx={{ color: PRIMARY, fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#000000", fontSize: "1rem" }}>
                    Expert Consultation
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000000", fontSize: "0.9375rem" }}>
                    All requests are reviewed within 24 hours.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
