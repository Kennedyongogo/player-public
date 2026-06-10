import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack,
  Person,
  Email,
  Phone,
  Public,
  Translate,
  Business,
  Grass,
  Badge,
  CalendarToday,
  LocationOn,
  Verified,
  MedicalServices,
  School,
  ShoppingCart,
} from "@mui/icons-material";
import Footer from "../components/Footer/Footer";
import LocationMap from "../components/LocationMap/LocationMap";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";

const ROLE_LABELS = {
  farmer: "Farmer / Producer",
  buyer: "Buyer / Consumer",
  input_supplier: "Input Supplier",
  veterinarian: "Veterinarian",
  consultant: "Consultant / Trainer",
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

const AVAILABILITY_LABELS = {
  available: "Available",
  pre_order_only: "Pre-order Only",
  unavailable: "Unavailable",
};

function getBaseUrl() {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
}

// Show phone without leading zero in national number (e.g. "+254 0798757460" -> "+254 798757460")
function normalizePhoneForDisplay(phone) {
  if (phone == null || typeof phone !== "string") return phone;
  const trimmed = phone.trim();
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) return trimmed.replace(/^0+/, "") || trimmed;
  const code = trimmed.slice(0, spaceIdx);
  const rest = trimmed.slice(spaceIdx + 1).replace(/^0+/, "");
  return rest ? `${code} ${rest}` : code;
}

function InfoRow({ icon, label, value, showIfZero = false }) {
  if (!showIfZero && (value == null || value === "")) return null;
  if (showIfZero && (value == null || value === "" || value === undefined)) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
      <Box sx={{ color: PRIMARY, mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.125rem" }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.3125rem" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: `${PRIMARY}08`,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Box sx={{ color: PRIMARY }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.5rem" }}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ p: 2 }}>{children}</CardContent>
    </Card>
  );
}

// Support both camelCase and snake_case from API
function getProfileValue(profile, camelKey) {
  const snake = camelKey.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
  return profile[camelKey] ?? profile[snake];
}

export default function MarketplaceProfileView({ user: data, backTo = "/marketplace/dashboard" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || backTo;

  const user = data || {};
  const profile = user.profile || {};
  const baseUrl = getBaseUrl();
  const profilePhoto = getProfileValue(profile, "profilePhotoUrl");
  const photoUrl = profilePhoto
    ? `${baseUrl}${profilePhoto.startsWith("/") ? "" : "/"}${profilePhoto}`
    : null;

  const country = getProfileValue(profile, "country");
  const region = getProfileValue(profile, "region");
  const district = getProfileValue(profile, "district");
  const locationParts = [country, region, district].filter(Boolean);
  const locationStr = locationParts.length ? locationParts.join(", ") : null;

  const producesRaw = getProfileValue(profile, "produces");
  const producesArr = Array.isArray(producesRaw) ? producesRaw : [];
  const roleSpecificRaw = getProfileValue(profile, "roleSpecificData");
  const roleSpecific = roleSpecificRaw && typeof roleSpecificRaw === "object" ? roleSpecificRaw : {};

  const primaryActivity = getProfileValue(profile, "primaryActivity");
  const scaleOfOperation = getProfileValue(profile, "scaleOfOperation");
  const farmOrBusinessName = getProfileValue(profile, "farmOrBusinessName");
  const bio = getProfileValue(profile, "bio");
  const preferredLanguage = getProfileValue(profile, "preferredLanguage");
  const latitudeRaw = getProfileValue(profile, "latitude");
  const longitudeRaw = getProfileValue(profile, "longitude");
  // Convert to numbers, handling string or number inputs
  const latitude = latitudeRaw != null && latitudeRaw !== "" ? parseFloat(latitudeRaw) : null;
  const longitude = longitudeRaw != null && longitudeRaw !== "" ? parseFloat(longitudeRaw) : null;
  const availability = getProfileValue(profile, "availability");
  const isVerified = user.isVerified || user.is_verified || false;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: BG_LIGHT,
        color: "#000000",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
        pt: 1.5,
        pb: 1.5,
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "100%", boxSizing: "border-box", pt: 1.5, pb: 0.75, minWidth: 0, flex: 1 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(from)}
          disableRipple
          sx={{
            mb: 0.75,
            color: "#000000",
            fontSize: "1.125rem",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": { color: PRIMARY },
            "&:focus": { outline: "none", boxShadow: "none" },
            "&:focus-visible": { outline: "none", boxShadow: "none" },
          }}
        >
          Back
        </Button>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            mb: 3,
            mx: 0.75,
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${PRIMARY}22 0%, ${PRIMARY}08 100%)`,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", mb: 2 }}>
              {photoUrl ? (
                <Box
                  component="img"
                  src={photoUrl}
                  alt={user.fullName || "Profile"}
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }}
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid white",
                    boxShadow: 2,
                  }}
                />
              ) : null}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  bgcolor: `${PRIMARY}30`,
                  color: PRIMARY,
                  display: photoUrl ? "none" : "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "3px solid white",
                  boxShadow: 2,
                }}
              >
                <Typography variant="h3" fontWeight={700} sx={{ fontSize: "2.25rem" }}>
                  {(user.fullName || "?").charAt(0).toUpperCase()}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center", mb: 1 }}>
              <Chip
                label={ROLE_LABELS[user.role] || user.role || "—"}
                size="medium"
                sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 600 }}
              />
              {isVerified && (
                <Chip
                  icon={<Verified sx={{ color: "#fff !important" }} />}
                  label="MK Verified"
                  size="medium"
                  sx={{ bgcolor: PRIMARY, color: "#fff", fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.875rem", mb: 0.5 }}>
              {user.fullName || "—"}
            </Typography>
            <Chip
              label={user.status === "active" ? "Active" : user.status}
              size="small"
              variant="outlined"
              color={user.status === "active" ? "success" : "default"}
              sx={{ mb: 1 }}
            />
            {farmOrBusinessName && (
              <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center", color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.3125rem" }}>
                <Business fontSize="small" /> {farmOrBusinessName}
              </Typography>
            )}
            <Button
              variant="outlined"
              size="medium"
              onClick={() => navigate("/profile/complete", { state: { from: "/marketplace/profile", edit: true } })}
              disableRipple
              sx={{
                mt: 2,
                borderColor: PRIMARY,
                color: PRIMARY,
                fontWeight: 600,
                fontSize: "1.125rem",
                textTransform: "none",
                "&:hover": { borderColor: PRIMARY, bgcolor: `${PRIMARY}14` },
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
            >
              Edit profile
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={2} sx={{ minWidth: 0, px: 0.75 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Contact & location" icon={<Person />}>
              <InfoRow icon={<Email fontSize="small" />} label="Email" value={user.email} />
              <InfoRow icon={<Phone fontSize="small" />} label="Phone" value={normalizePhoneForDisplay(user.phone)} />
              <InfoRow icon={<Public fontSize="small" />} label="Location" value={locationStr} />
              {(latitude != null || longitude != null) && (
                <InfoRow
                  icon={<LocationOn fontSize="small" />}
                  label="Coordinates (Latitude, Longitude)"
                  value={
                    latitude != null && longitude != null
                      ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}`
                      : latitude != null
                        ? `Lat: ${Number(latitude).toFixed(6)}`
                        : longitude != null
                          ? `Lng: ${Number(longitude).toFixed(6)}`
                          : null
                  }
                  showIfZero={true}
                />
              )}
              <InfoRow icon={<Translate fontSize="small" />} label="Preferred language" value={preferredLanguage} />
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SectionCard title="Role & activity" icon={<Badge />}>
              {user.role === "farmer" && (
                <>
                  <InfoRow
                    icon={<Grass fontSize="small" />}
                    label="Primary activity"
                    value={primaryActivity ? PRIMARY_ACTIVITY_LABELS[primaryActivity] || primaryActivity : null}
                  />
                  <InfoRow
                    icon={<Grass fontSize="small" />}
                    label="Scale of operation"
                    value={scaleOfOperation ? SCALE_LABELS[scaleOfOperation] || scaleOfOperation : null}
                  />
                  {availability && (
                    <InfoRow
                      icon={<CalendarToday fontSize="small" />}
                      label="Availability"
                      value={AVAILABILITY_LABELS[availability] || availability}
                    />
                  )}
                  {producesArr.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.125rem" }}>
                        Produces
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {producesArr.map((p, i) => (
                          <Chip key={i} label={p} size="medium" sx={{ bgcolor: `${PRIMARY}14`, color: "#000000", fontSize: "0.9375rem" }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <InfoRow
                    icon={<Business fontSize="small" />}
                    label="Farm or business name"
                    value={farmOrBusinessName}
                  />
                </>
              )}
              {user.role === "veterinarian" && (
                <>
                  {roleSpecific.businessName && (
                    <InfoRow
                      icon={<Business fontSize="small" />}
                      label="Practice/Business Name"
                      value={roleSpecific.businessName}
                    />
                  )}
                  {roleSpecific.specialization && (
                    <InfoRow
                      icon={<MedicalServices fontSize="small" />}
                      label="Specialization"
                      value={roleSpecific.specialization}
                    />
                  )}
                  {roleSpecific.servicesOffered && (
                    <InfoRow
                      icon={<MedicalServices fontSize="small" />}
                      label="Services Offered"
                      value={roleSpecific.servicesOffered}
                    />
                  )}
                  {roleSpecific.coverageArea && (
                    <InfoRow
                      icon={<Public fontSize="small" />}
                      label="Coverage Area"
                      value={roleSpecific.coverageArea}
                    />
                  )}
                </>
              )}
              {user.role === "buyer" && (
                <>
                  {roleSpecific.businessName && (
                    <InfoRow
                      icon={<Business fontSize="small" />}
                      label="Business Name"
                      value={roleSpecific.businessName}
                    />
                  )}
                  {roleSpecific.whatTheyBuy && Array.isArray(roleSpecific.whatTheyBuy) && roleSpecific.whatTheyBuy.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.125rem" }}>
                        What You Buy
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {roleSpecific.whatTheyBuy.map((item, i) => (
                          <Chip key={i} label={item} size="medium" sx={{ bgcolor: `${PRIMARY}14`, color: "#000000", fontSize: "0.9375rem" }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {roleSpecific.coverageArea && (
                    <InfoRow
                      icon={<Public fontSize="small" />}
                      label="Coverage Area"
                      value={roleSpecific.coverageArea}
                    />
                  )}
                </>
              )}
              {user.role === "input_supplier" && (
                <>
                  {roleSpecific.businessName && (
                    <InfoRow
                      icon={<Business fontSize="small" />}
                      label="Business Name"
                      value={roleSpecific.businessName}
                    />
                  )}
                  {roleSpecific.productsSupplied && Array.isArray(roleSpecific.productsSupplied) && roleSpecific.productsSupplied.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.125rem" }}>
                        Products Supplied
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
                        {roleSpecific.productsSupplied.map((item, i) => (
                          <Chip key={i} label={item} size="medium" sx={{ bgcolor: `${PRIMARY}14`, color: "#000000", fontSize: "0.9375rem" }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {roleSpecific.coverageArea && (
                    <InfoRow
                      icon={<Public fontSize="small" />}
                      label="Coverage Area"
                      value={roleSpecific.coverageArea}
                    />
                  )}
                </>
              )}
              {user.role === "consultant" && (
                <>
                  {roleSpecific.businessName && (
                    <InfoRow
                      icon={<Business fontSize="small" />}
                      label="Business Name"
                      value={roleSpecific.businessName}
                    />
                  )}
                  {roleSpecific.specialization && (
                    <InfoRow
                      icon={<School fontSize="small" />}
                      label="Specialization"
                      value={roleSpecific.specialization}
                    />
                  )}
                  {roleSpecific.servicesOffered && (
                    <InfoRow
                      icon={<School fontSize="small" />}
                      label="Services Offered"
                      value={roleSpecific.servicesOffered}
                    />
                  )}
                  {roleSpecific.coverageArea && (
                    <InfoRow
                      icon={<Public fontSize="small" />}
                      label="Coverage Area"
                      value={roleSpecific.coverageArea}
                    />
                  )}
                </>
              )}
            </SectionCard>
          </Grid>
          {(bio || user.createdAt) && (
            <Grid size={{ xs: 12 }}>
              <SectionCard title="About" icon={<CalendarToday />}>
                {bio && (
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: user.createdAt ? 2 : 0, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.3125rem" }}>
                    {bio}
                  </Typography>
                )}
                {user.createdAt && (
                  <Typography variant="caption" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1.125rem" }}>
                    Member since {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </Typography>
                )}
              </SectionCard>
            </Grid>
          )}
        </Grid>

        {/* Full-width map section */}
        {latitude != null && longitude != null && (
          <Box sx={{ width: "100%", maxWidth: "100vw", mt: 3, px: 0, mx: 0 }}>
            <LocationMap latitude={latitude} longitude={longitude} height="400px" />
          </Box>
        )}
      </Box>
      <Footer />
    </Box>
  );
}
