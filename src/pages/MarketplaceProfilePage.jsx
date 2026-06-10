import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { getMarketplaceMe } from "../api";
import ProfileComplete from "./ProfileComplete";
import MarketplaceProfileView from "./MarketplaceProfileView";

const PRIMARY = "#17cf54";

export default function MarketplaceProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = React.useCallback(() => {
    const token = localStorage.getItem("marketplace_token");
    if (!token) return Promise.resolve();
    return getMarketplaceMe()
      .then((res) => {
        if (res?.data) setUser(res.data);
      })
      .catch((err) => setError(err.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("marketplace_token");
    if (!token) {
      navigate("/marketplace", { replace: true });
      return;
    }
    setLoading(true);
    let cancelled = false;
    getMarketplaceMe()
      .then((res) => {
        if (!cancelled && res?.data) setUser(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load profile");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [navigate]);

  // Refetch when we land here after completing profile (same route, so main effect doesn't run again)
  useEffect(() => {
    if (location.state?.fromComplete) {
      fetchUser();
      navigate("/marketplace/profile", { replace: true, state: {} });
    }
  }, [location.state?.fromComplete, fetchUser, navigate]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          minHeight: "100dvh",
          bgcolor: "#f6f8f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress sx={{ color: PRIMARY }} size={48} />
      </Box>
    );
  }

  if (error) {
    navigate("/marketplace/dashboard", { replace: true });
    return null;
  }

  const profileCompleted = user?.profileCompleted === true;
  const backTo = location.state?.from || "/marketplace/dashboard";

  if (profileCompleted) {
    return <MarketplaceProfileView user={user} backTo={backTo} />;
  }

  return <ProfileComplete onProfileCompleted={fetchUser} />;
}
