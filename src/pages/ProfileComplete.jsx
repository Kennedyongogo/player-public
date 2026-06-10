import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, PersonPin, Public, Translate, Business, Grass, ShoppingCart, Build, Pets, School, AddPhotoAlternate, Phone as PhoneIcon, Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from "sweetalert2";
import { completeMarketplaceProfile, uploadMarketplaceProfilePhoto, getMarketplaceMe } from "../api";
import Footer from "../components/Footer/Footer";
import LocationMapPicker from "../components/LocationMapPicker/LocationMapPicker";

function getBaseUrl() {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
}

const PRIMARY = "#11d452";
const PRIMARY_DARK = "#0ea33d";
const BG_LIGHT = "#f6f8f6";
const BG_DARK = "#102216";

const ROLES = [
  { value: "farmer", label: "Farmer / Producer", icon: <Grass /> },
  { value: "buyer", label: "Buyer / Consumer", icon: <ShoppingCart /> },
  { value: "input_supplier", label: "Input Supplier", icon: <Build /> },
  { value: "veterinarian", label: "Veterinarian", icon: <Pets /> },
  { value: "consultant", label: "Consultant / Trainer", icon: <School /> },
];

const PRIMARY_ACTIVITIES = [
  { value: "crop", label: "Crop farming" },
  { value: "livestock", label: "Livestock" },
  { value: "mixed", label: "Mixed farming" },
  { value: "aquaculture", label: "Aquaculture" },
  { value: "agro_processing", label: "Agro-processing" },
  { value: "other", label: "Other" },
];

const SCALES = [
  { value: "small", label: "Small scale" },
  { value: "medium", label: "Medium scale" },
  { value: "large", label: "Large scale" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

// Country codes for phone (saved value will be e.g. "+254 700 123 456")
const PHONE_COUNTRY_CODES = [
  { code: "+254", label: "+254 (KE)" },
  { code: "+255", label: "+255 (TZ)" },
  { code: "+256", label: "+256 (UG)" },
  { code: "+250", label: "+250 (RW)" },
  { code: "+257", label: "+257 (BI)" },
  { code: "+251", label: "+251 (ET)" },
  { code: "+252", label: "+252 (SO)" },
  { code: "+253", label: "+253 (DJ)" },
  { code: "+258", label: "+258 (MZ)" },
  { code: "+260", label: "+260 (ZM)" },
  { code: "+263", label: "+263 (ZW)" },
  { code: "+234", label: "+234 (NG)" },
  { code: "+27", label: "+27 (ZA)" },
  { code: "+1", label: "+1" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+86", label: "+86 (CN)" },
  { code: "+33", label: "+33 (FR)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+61", label: "+61 (AU)" },
];

function parsePhoneWithCountryCode(phoneStr) {
  if (!phoneStr || typeof phoneStr !== "string") return { code: "+254", number: "" };
  const trimmed = phoneStr.trim();
  if (!trimmed) return { code: "+254", number: "" };
  // Match longest code from start (e.g. +254 before +25)
  const sorted = [...PHONE_COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
  for (const { code } of sorted) {
    if (trimmed.startsWith(code)) {
      let rest = trimmed.slice(code.length).trim().replace(/^0+/, "");
      return { code, number: rest };
    }
  }
  return { code: "+254", number: trimmed.replace(/^0+/, "") };
}

// Strip leading zero from national number so we save e.g. "+254 798757460" not "+254 0798757460"
function normalizePhoneNumberForSave(countryCode, number) {
  const num = (number || "").trim().replace(/^0+/, "") || "";
  return num ? `${countryCode} ${num}` : undefined;
}

const DEFAULT_BACK = "/marketplace/dashboard";

export default function ProfileComplete({ onProfileCompleted } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const backTo = location.state?.from || DEFAULT_BACK;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("+254");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [district, setDistrict] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [primaryActivity, setPrimaryActivity] = useState("");
  const [produces, setProduces] = useState("");
  const [scaleOfOperation, setScaleOfOperation] = useState("");
  const [farmOrBusinessName, setFarmOrBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [roleSpecificData, setRoleSpecificData] = useState({});
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(!!location.state?.edit);
  const profilePhotoInputRef = React.useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("marketplace_token");
    if (!token) {
      navigate("/marketplace", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (location.state?.edit) return;
    try {
      const saved = localStorage.getItem("marketplace_user");
      if (saved) {
        const u = JSON.parse(saved);
        if (u.fullName && !fullName) setFullName(u.fullName);
        if (u.email && !email) setEmail(u.email);
      }
    } catch (_) {}
  }, []);

  // Pre-fill form when editing (same component for view → edit)
  useEffect(() => {
    if (!location.state?.edit) return;
    let cancelled = false;
    getMarketplaceMe()
      .then((res) => {
        if (cancelled || !res?.data) return;
        const u = res.data;
        const p = u.profile || {};
        const baseUrl = getBaseUrl();
        const photoUrl = p.profilePhotoUrl ?? p.profile_photo_url;
        setFullName(u.fullName ?? u.full_name ?? "");
        setEmail(u.email ?? "");
        setRole(u.role || "");
        const { code, number } = parsePhoneWithCountryCode(u.phone || "");
        setPhoneCountryCode(code);
        setPhoneNumber(number);
        setCountry(p.country ?? "");
        setRegion(p.region ?? "");
        setDistrict(p.district ?? "");
        setLatitude(p.latitude?.toString() ?? "");
        setLongitude(p.longitude?.toString() ?? "");
        setPreferredLanguage(p.preferredLanguage ?? p.preferred_language ?? "");
        if (photoUrl) {
          setProfilePhotoUrl(photoUrl);
          setProfilePhotoPreview(photoUrl.startsWith("http") ? photoUrl : `${baseUrl}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`);
        }
        setPrimaryActivity(p.primaryActivity ?? p.primary_activity ?? "");
        setProduces(Array.isArray(p.produces) ? p.produces.join(", ") : "");
        setScaleOfOperation(p.scaleOfOperation ?? p.scale_of_operation ?? "");
        setFarmOrBusinessName(p.farmOrBusinessName ?? p.farm_or_business_name ?? "");
        setBio(p.bio ?? "");
        setAvailability(p.availability ?? "");
        const rsd = p.roleSpecificData ?? p.role_specific_data;
        if (rsd && typeof rsd === "object") {
          const parsed = { ...rsd };
          if (Array.isArray(parsed.whatTheyBuy)) parsed.whatTheyBuy = parsed.whatTheyBuy.join(", ");
          if (Array.isArray(parsed.productsSupplied)) parsed.productsSupplied = parsed.productsSupplied.join(", ");
          setRoleSpecificData(parsed);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });
    return () => { cancelled = true; };
  }, [location.state?.edit]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setRoleSpecificData({});
  };

  const handleProfilePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (e.g. JPG, PNG).");
      return;
    }
    setError("");
    setUploadingPhoto(true);
    try {
      const data = await uploadMarketplaceProfilePhoto(file);
      if (data.profilePhotoUrl) {
        setProfilePhotoUrl(data.profilePhotoUrl);
        setProfilePhotoPreview(URL.createObjectURL(file));
      }
    } catch (err) {
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select your role.");
      return;
    }
    if (!profilePhotoUrl) {
      setError("A profile picture is required for identity verification.");
      return;
    }
    setLoading(true);
    try {
      if (newPassword.trim() || confirmPassword) {
        if (!newPassword.trim()) {
          setError("Enter a new password.");
          return;
        }
        if (newPassword.length < 6) {
          setError("New password must be at least 6 characters.");
          return;
        }
        if (newPassword !== confirmPassword) {
          setError("New password and confirm password do not match.");
          return;
        }
        if (!currentPassword.trim()) {
          setError("Current password is required to change password.");
          return;
        }
      }

      const body = {
        role,
        profilePhotoUrl,
        ...(fullName.trim() && { fullName: fullName.trim() }),
        ...(email.trim() && { email: email.trim().toLowerCase() }),
        phone: normalizePhoneNumberForSave(phoneCountryCode, phoneNumber),
        country: country.trim() || undefined,
        region: region.trim() || undefined,
        district: district.trim() || undefined,
        latitude: latitude.trim() || undefined,
        longitude: longitude.trim() || undefined,
        preferredLanguage: preferredLanguage.trim() || undefined,
      };
      if (newPassword.trim()) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      if (role === "farmer") {
        body.primaryActivity = primaryActivity || undefined;
        body.produces = produces ? produces.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
        body.scaleOfOperation = scaleOfOperation || undefined;
        body.farmOrBusinessName = farmOrBusinessName.trim() || undefined;
        body.bio = bio.trim() || undefined;
        body.availability = availability || undefined;
      } else if (["buyer", "input_supplier", "veterinarian", "consultant"].includes(role)) {
        const data = { ...roleSpecificData };
        if (data.whatTheyBuy && typeof data.whatTheyBuy === "string") {
          data.whatTheyBuy = data.whatTheyBuy.split(",").map((s) => s.trim()).filter(Boolean);
        }
        if (data.productsSupplied && typeof data.productsSupplied === "string") {
          data.productsSupplied = data.productsSupplied.split(",").map((s) => s.trim()).filter(Boolean);
        }
        const cleaned = Object.fromEntries(
          Object.entries(data).filter(([, v]) => v != null && v !== "" && (typeof v !== "object" || (Array.isArray(v) && v.length > 0)))
        );
        if (Object.keys(cleaned).length) body.roleSpecificData = cleaned;
      }
      await completeMarketplaceProfile(body);
      const user = JSON.parse(localStorage.getItem("marketplace_user") || "{}");
      localStorage.setItem("marketplace_user", JSON.stringify({ ...user, profileCompleted: true, role }));
      Swal.fire({ icon: "success", title: "Profile completed!", timer: 1500, showConfirmButton: false });
      if (typeof onProfileCompleted === "function") {
        await onProfileCompleted();
      }
      navigate("/marketplace/profile", { replace: true, state: { fromComplete: true } });
    } catch (err) {
      setError(err.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: BG_LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress sx={{ color: PRIMARY }} size={48} />
      </Box>
    );
  }

  return (
    <>
    <Box
      sx={{
        minHeight: "100dvh",
        bgcolor: BG_LIGHT,
        pt: 2.5,
        pb: 1.5,
        px: 0.75,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(backTo)}
        disableRipple
        sx={{
          alignSelf: "flex-start",
          mb: 0.75,
          color: "#000000",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1.05rem",
          "&:hover": { color: PRIMARY },
          "&:focus": { outline: "none" },
          "&:focus-visible": { outline: "none" },
        }}
      >
        Back
      </Button>

      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "100%",
          flex: 1,
          p: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "rgba(19, 212, 82, 0.2)",
          boxShadow: "0 25px 50px -12px rgba(6, 78, 59, 0.08)",
          boxSizing: "border-box",
          minWidth: 0,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "#000000", fontSize: "1.5rem" }}>
          Complete your profile
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: "#000000", fontSize: "1.05rem" }}>
          Choose your role and add a few details so we can tailor your experience.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
            "& .MuiOutlinedInput-input": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
            "& .MuiSelect-select": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
            "& .MuiFormHelperText-root": { color: "#000000", fontSize: "0.95rem" },
          }}
        >
          {/* 1. Profile picture first, centered in card */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#000000", fontSize: "1.1rem" }}>
              Profile picture <Typography component="span" color="error">*</Typography>
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: "#000000", fontSize: "1.05rem" }}>
              Required for identity verification.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Box
                onClick={() => profilePhotoInputRef.current?.click()}
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: "50%",
                  border: "2px dashed",
                  borderColor: profilePhotoUrl ? "success.main" : "divider",
                  bgcolor: profilePhotoPreview ? "transparent" : "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover": { borderColor: PRIMARY, bgcolor: "action.selected" },
                }}
              >
                {profilePhotoPreview ? (
                  <Box component="img" src={profilePhotoPreview} alt="Profile" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : uploadingPhoto ? (
                  <CircularProgress size={32} sx={{ color: PRIMARY }} />
                ) : (
                  <AddPhotoAlternate sx={{ fontSize: 40, color: "#000000" }} />
                )}
              </Box>
              <input
                ref={profilePhotoInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleProfilePhotoChange}
              />
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled={uploadingPhoto}
                onClick={() => profilePhotoInputRef.current?.click()}
                sx={{
                textTransform: "none",
                borderColor: PRIMARY,
                color: PRIMARY,
                "&:hover": { borderColor: PRIMARY_DARK, bgcolor: "rgba(17, 212, 82, 0.08)" },
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
              >
                {profilePhotoUrl ? "Change photo" : "Upload photo"}
              </Button>
              {profilePhotoUrl && (
                <Typography variant="caption" sx={{ color: "#000000", fontSize: "0.95rem" }}>
                  Photo added
                </Typography>
              )}
            </Box>
          </Box>

          {/* 2. Role input below */}
          <FormControl fullWidth required sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiSelect-select": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" } }}>
            <InputLabel id="role-label">User role</InputLabel>
            <Select
              labelId="role-label"
              label="User role"
              value={role}
              onChange={(e) => handleRoleChange(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ mr: 1 }}>
                  <PersonPin sx={{ color: "action.active" }} />
                </InputAdornment>
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { "&:focus-within": { borderColor: PRIMARY } },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
              }}
            >
              {ROLES.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {r.icon}
                    {r.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Full name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="e.g. you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
          />

          <Box sx={{ display: "flex", gap: 1, alignItems: "stretch", flexWrap: "wrap" }}>
            <FormControl sx={{ minWidth: 130 }} size="medium">
              <InputLabel id="phone-code-label">Country code</InputLabel>
              <Select
                labelId="phone-code-label"
                label="Country code"
                value={phoneCountryCode}
                onChange={(e) => setPhoneCountryCode(e.target.value)}
                sx={{
                  "& .MuiSelect-select": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
                }}
              >
                {PHONE_COUNTRY_CODES.map(({ code, label }) => (
                  <MenuItem key={code} value={code}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Phone"
              placeholder="e.g. 700 123 456"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "action.active" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
                minWidth: 180,
                "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
                "& .MuiOutlinedInput-input": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" },
                "& label.Mui-focused": { color: PRIMARY },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY },
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Country"
            placeholder="e.g. Tanzania"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Public sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY }, "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
          />
          <TextField
            fullWidth
            label="Region / County"
            placeholder="e.g. Arusha"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
          />
          <TextField
            fullWidth
            label="District (optional)"
            placeholder="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
          />

          {/* Location Map Picker */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: "#000000", fontSize: "1.1rem" }}>
              Set your location on the map (optional)
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: "#000000", fontSize: "1.05rem" }}>
              Click on the map or search for your location to set your coordinates. This helps us connect you with nearby opportunities.
            </Typography>
            <LocationMapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Latitude (X)"
                value={latitude || ""}
                placeholder="Click on map to set"
                InputProps={{ readOnly: true }}
                helperText={latitude ? "Location set ✓" : "Set via map"}
                sx={{
                  "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" },
                  "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1rem" },
                  "& .MuiFormHelperText-root": { color: "#000000", fontSize: "0.95rem" },
                  "& label.Mui-focused": { color: PRIMARY },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: latitude ? "rgba(17, 212, 82, 0.05)" : "transparent",
                    "& fieldset": {
                      borderColor: latitude ? PRIMARY : undefined,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                size="small"
                label="Longitude (Y)"
                value={longitude || ""}
                placeholder="Click on map to set"
                InputProps={{ readOnly: true }}
                helperText={longitude ? "Location set ✓" : "Set via map"}
                sx={{
                  "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" },
                  "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1rem" },
                  "& .MuiFormHelperText-root": { color: "#000000", fontSize: "0.95rem" },
                  "& label.Mui-focused": { color: PRIMARY },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: longitude ? "rgba(17, 212, 82, 0.05)" : "transparent",
                    "& fieldset": {
                      borderColor: longitude ? PRIMARY : undefined,
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Preferred language"
            placeholder="e.g. English, Swahili"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Translate sx={{ color: "action.active" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
          />

          {location.state?.edit && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Change password (optional)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#000000", fontSize: "1.05rem" }}>
                Leave blank to keep your current password.
              </Typography>
              <TextField
                fullWidth
                label="Current password"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password to set a new one"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        edge="end"
                        size="small"
                        disableRipple
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="New password"
                type={showNewPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        edge="end"
                        size="small"
                        disableRipple
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        size="small"
                        disableRipple
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiInputLabel-root": { color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.05rem" }, "& .MuiOutlinedInput-input": { color: "#000000", fontSize: "1.05rem" }, "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          {role === "farmer" && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Farming details (optional)
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Primary activity</InputLabel>
                <Select
                  label="Primary activity"
                  value={primaryActivity}
                  onChange={(e) => setPrimaryActivity(e.target.value)}
                  sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
                >
                  {PRIMARY_ACTIVITIES.map((a) => (
                    <MenuItem key={a.value} value={a.value}>
                      {a.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="What you produce (comma-separated)"
                placeholder="e.g. maize, beans, poultry"
                value={produces}
                onChange={(e) => setProduces(e.target.value)}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <FormControl fullWidth>
                <InputLabel>Scale of operation</InputLabel>
                <Select
                  label="Scale of operation"
                  value={scaleOfOperation}
                  onChange={(e) => setScaleOfOperation(e.target.value)}
                  sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
                >
                  {SCALES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  label="Availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  sx={{ "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: PRIMARY } }}
                >
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="pre_order_only">Pre-order Only</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Farm or business name (optional)"
                placeholder="Name"
                value={farmOrBusinessName}
                onChange={(e) => setFarmOrBusinessName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Short bio (optional)"
                placeholder="Tell us about your farm or business"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          {role === "buyer" && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Buyer details (optional)
              </Typography>
              <TextField
                fullWidth
                label="Business name"
                placeholder="Your business or trading name"
                value={roleSpecificData.businessName ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, businessName: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="What you buy (comma-separated)"
                placeholder="e.g. maize, beans, livestock"
                value={roleSpecificData.whatTheyBuy ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, whatTheyBuy: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Coverage area"
                placeholder="e.g. East Africa, Tanzania"
                value={roleSpecificData.coverageArea ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, coverageArea: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          {role === "input_supplier" && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Supplier details (optional)
              </Typography>
              <TextField
                fullWidth
                label="Business name"
                placeholder="Your company or business name"
                value={roleSpecificData.businessName ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, businessName: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Products supplied (comma-separated)"
                placeholder="e.g. seeds, fertilizers, feeds"
                value={roleSpecificData.productsSupplied ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, productsSupplied: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Coverage area"
                placeholder="e.g. East Africa, Tanzania"
                value={roleSpecificData.coverageArea ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, coverageArea: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          {role === "veterinarian" && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Veterinary details (optional)
              </Typography>
              <TextField
                fullWidth
                label="Business / practice name"
                placeholder="Your practice or business name"
                value={roleSpecificData.businessName ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, businessName: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Specialization"
                placeholder="e.g. livestock, poultry, wildlife"
                value={roleSpecificData.specialization ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, specialization: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Services offered"
                placeholder="e.g. vaccinations, consultations, emergency care"
                value={roleSpecificData.servicesOffered ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, servicesOffered: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Coverage area"
                placeholder="e.g. Arusha region, Tanzania"
                value={roleSpecificData.coverageArea ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, coverageArea: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          {role === "consultant" && (
            <>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1, color: "#000000", fontSize: "1.1rem" }}>
                Consultant details (optional)
              </Typography>
              <TextField
                fullWidth
                label="Business name"
                placeholder="Your consultancy or business name"
                value={roleSpecificData.businessName ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, businessName: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business sx={{ color: "action.active" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Specialization"
                placeholder="e.g. agronomy, livestock management, marketing"
                value={roleSpecificData.specialization ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, specialization: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Services offered"
                placeholder="e.g. training, advisory, project design"
                value={roleSpecificData.servicesOffered ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, servicesOffered: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
              <TextField
                fullWidth
                label="Coverage area"
                placeholder="e.g. East Africa, Tanzania"
                value={roleSpecificData.coverageArea ?? ""}
                onChange={(e) => setRoleSpecificData((p) => ({ ...p, coverageArea: e.target.value }))}
                sx={{ "& label.Mui-focused": { color: PRIMARY } }}
              />
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            disableRipple
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: "1.1rem",
              fontFamily: '"Calibri Light", Calibri, sans-serif',
              bgcolor: PRIMARY,
              color: BG_DARK,
              textTransform: "none",
              "&:hover": { bgcolor: PRIMARY_DARK },
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          >
            {loading ? <CircularProgress size={24} sx={{ color: BG_DARK }} /> : "Save and continue"}
          </Button>
        </Box>
      </Paper>
    </Box>
    <Footer />
    </>
  );
}
