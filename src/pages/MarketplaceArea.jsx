import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";

const sectionTitles = {
  dashboard: "Marketplace Dashboard",
  "farmers-hub": "Farmers Hub",
  "inputs-feeds": "Inputs & Feeds",
  "veterinary-services": "Veterinary Services",
  "training-opportunities": "Training & Events",
  "job-opportunities": "Job Opportunities",
  profile: "My Profile",
  "my-listings": "My Listings",
  listings: "All Listings",
  "add-listing": "Add Listing",
  messages: "Messages",
  settings: "Account Settings",
  help: "Help & Support",
};

export default function MarketplaceArea() {
  const location = useLocation();
  const path = location.pathname.replace(/^\/marketplace\/?/, "") || "dashboard";
  const section = path.split("/")[0];
  const title = sectionTitles[section] || "Marketplace";
  const isDashboard = section === "dashboard";

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: 4 },
        py: 4,
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
        {title}
      </Typography>
      {isDashboard ? (
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={480}>
          Welcome to the marketplace. Use the menu above to explore Farmers Hub, Inputs &amp; Feeds, Veterinary Services, and Training &amp; Opportunities. Open your profile from the avatar menu.
        </Typography>
      ) : (
        <Typography variant="body1" color="text.secondary">
          This section is under development. You’re signed in to the marketplace.
        </Typography>
      )}
    </Box>
  );
}
