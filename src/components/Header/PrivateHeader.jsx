import React, { useState, useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
} from "@mui/material";
import {
  Storefront,
  Grass,
  Inventory2,
  Pets,
  School,
  Work,
  Person,
  List as ListIcon,
  AddCircleOutline,
  Logout,
  Menu as MenuIcon,
  NotificationsOutlined,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const PRIMARY = "#13ec13";
const PRIMARY_DARK = "#11d411";
const BG_DARK = "#0d1b0d";

const mainNavItems = [
  { label: "Marketplace", path: "/marketplace/dashboard", icon: <Storefront /> },
  { label: "Farmers Hub", path: "/marketplace/farmers-hub", icon: <Grass /> },
  { label: "Inputs & Feeds", path: "/marketplace/inputs-feeds", icon: <Inventory2 /> },
  { label: "Veterinary Services", path: "/marketplace/veterinary-services", icon: <Pets /> },
  { label: "Training & Events", path: "/marketplace/training-opportunities", icon: <School /> },
  { label: "Job Opportunities", path: "/marketplace/job-opportunities", icon: <Work /> },
];

const ROLES_THAT_CAN_LIST = ["farmer", "input_supplier", "veterinarian", "consultant"];

export default function PrivateHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("marketplace_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const userName = user.fullName || user.email || "User";
  const userRole = user.role || null;
  const profilePhotoUrl = user.profile?.profilePhotoUrl || null;
  const showAddListing = userRole && ROLES_THAT_CAN_LIST.includes(userRole);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleCloseMenu();
    localStorage.removeItem("marketplace_token");
    localStorage.removeItem("marketplace_user");
    navigate("/marketplace");
  };

  const handleNav = (path, options = {}) => {
    setMobileMenuAnchorEl(null);
    navigate(path, options);
  };

  const openMobileMenu = (event) => setMobileMenuAnchorEl(event.currentTarget);
  const closeMobileMenu = () => setMobileMenuAnchorEl(null);

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { label: "My Profile", path: "/marketplace/profile", icon: <Person />, subtitle: "View & edit personal / business details" },
    { label: "My Listings", path: "/marketplace/my-listings", icon: <ListIcon />, subtitle: "Farmers: produce · Suppliers: inputs · Vets: services" },
    ...(showAddListing ? [{ label: "Add Listing", path: "/marketplace/add-listing", icon: <AddCircleOutline />, subtitle: "Quick action" }] : []),
  ];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "rgba(246, 248, 246, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(19, 236, 19, 0.2)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 1.5, md: 2 }, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", minWidth: 0, gap: { md: 1, lg: 2 } }}>
            {/* Logo / Brand */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flex: "0 1 auto",
                minWidth: 0,
                maxWidth: { md: "22%", lg: "26%" },
                cursor: "pointer",
                "&:hover": { opacity: 0.9 },
              }}
              onClick={() => navigate("/marketplace/dashboard")}
            >
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: "clamp(0.5rem, 0.6vw + 0.5rem, 0.95rem)",
                  color: "#228b22",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                }}
              >
                MK Marketplace
              </Typography>
            </Box>

            {/* Main nav (center) - 5 items */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flex: 1,
                minWidth: 0,
                gap: { md: 0.25, lg: 0.5 },
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mainNavItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  startIcon={item.icon}
                  disableRipple
                  size="small"
                  sx={{
                    color: isActive(item.path) ? PRIMARY : "text.primary",
                    fontSize: "clamp(0.7rem, 0.75vw + 0.45rem, 0.85rem)",
                    fontWeight: isActive(item.path) ? 700 : 600,
                    textTransform: "none",
                    px: { md: 1, lg: 1.25 },
                    py: 0.75,
                    borderRadius: 2,
                    "&:focus": { outline: "none" },
                    "&:focus-visible": { outline: "none" },
                    "&:hover": { backgroundColor: "rgba(19, 236, 19, 0.08)", color: PRIMARY },
                    "& .MuiButton-startIcon": { "& > *": { fontSize: "1rem" } },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Right: Notifications + User avatar (desktop) + Mobile menu trigger */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                flexShrink: 0,
                marginLeft: "auto",
              }}
            >
              <IconButton
                size="small"
                aria-label="Notifications"
                sx={{
                  display: { xs: "none", md: "flex" },
                  color: "text.secondary",
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                  "&:hover": { color: PRIMARY, backgroundColor: "rgba(19, 236, 19, 0.08)" },
                }}
              >
                <NotificationsOutlined fontSize="small" />
              </IconButton>

              <Button
                onClick={handleOpenMenu}
                disableRipple
                startIcon={
                  <Avatar
                    src={profilePhotoUrl ? (profilePhotoUrl.startsWith("http") ? profilePhotoUrl : `${import.meta.env.VITE_API_BASE_URL || ""}${profilePhotoUrl}`) : undefined}
                    sx={{ width: 32, height: 32, bgcolor: PRIMARY, fontSize: "0.9rem" }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                }
                endIcon={<Typography component="span" sx={{ fontSize: "0.75em", opacity: 0.8 }}>▼</Typography>}
                sx={{
                  display: { xs: "none", md: "flex" },
                  color: "text.primary",
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                  "&:hover": { backgroundColor: "rgba(19, 236, 19, 0.08)" },
                  "& .MuiButton-startIcon": { marginRight: 1 },
                }}
              >
                {userName.length > 18 ? userName.slice(0, 16) + "…" : userName}
              </Button>

              {/* Mobile menu trigger - far right on small screens */}
              <IconButton
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: "text.primary",
                  "&:focus": { outline: "none" },
                  "&:focus-visible": { outline: "none" },
                }}
                onClick={openMobileMenu}
                aria-controls={mobileMenuAnchorEl ? "hamburger-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(mobileMenuAnchorEl)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User profile dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 280,
            mt: 1.5,
            borderRadius: 2,
            border: "1px solid rgba(19, 236, 19, 0.2)",
            "& .MuiMenuItem-root": { py: 1.25 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography variant="subtitle2" color="text.secondary">
            Signed in as <strong>{user.email}</strong>
          </Typography>
        </Box>
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              handleCloseMenu();
              navigate(item.path, item.path === "/marketplace/profile" ? { state: { from: location.pathname } } : {});
            }}
            sx={{
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: PRIMARY }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              secondary={item.subtitle}
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
              secondaryTypographyProps={{ fontSize: "0.75rem" }}
            />
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: "error.main",
            "&:focus": { outline: "none" },
            "&:focus-visible": { outline: "none" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
      </Menu>

      {/* Hamburger menu: same size as profile dropdown, positioned below header */}
      <Menu
        id="hamburger-menu"
        anchorEl={mobileMenuAnchorEl}
        open={Boolean(mobileMenuAnchorEl)}
        onClose={closeMobileMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 280,
            mt: 1.5,
            borderRadius: 2,
            border: "1px solid rgba(19, 236, 19, 0.2)",
            "& .MuiMenuItem-root": { py: 1.25 },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            Menu
          </Typography>
        </Box>
        {mainNavItems.map((item) => (
          <MenuItem
            key={item.path}
            onClick={() => handleNav(item.path)}
            sx={{
              backgroundColor: isActive(item.path) ? "rgba(19, 236, 19, 0.1)" : "transparent",
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: isActive(item.path) ? PRIMARY : "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ fontWeight: isActive(item.path) ? 700 : 600, fontSize: "0.9rem" }}
            />
          </MenuItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <MenuItem
          onClick={() => handleNav("/marketplace/profile", { state: { from: location.pathname } })}
          sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none" } }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: PRIMARY }}>
            <Person />
          </ListItemIcon>
          <ListItemText primary="My Profile" primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }} />
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMobileMenu();
            handleLogout();
          }}
          sx={{
            color: "error.main",
            "&:focus": { outline: "none" },
            "&:focus-visible": { outline: "none" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "error.main" }}>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
        </MenuItem>
      </Menu>

      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
    </>
  );
}
