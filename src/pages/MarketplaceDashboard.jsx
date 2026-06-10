import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
} from "@mui/material";
import {
  Storefront,
  Groups,
  Inventory2,
  MedicalServices,
  School,
  Person,
  ListAlt,
  AddCircle,
  AccountCircle,
  ViewList,
} from "@mui/icons-material";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";

const cards = [
  {
    id: "marketplace",
    title: "Agribusiness Marketplace",
    icon: <Storefront sx={{ color: PRIMARY, fontSize: 28 }} />,
    description:
      "Trade high-quality produce with verified buyers and sellers across the region. Transparent pricing and secure logistics.",
    buttonLabel: "Explore Marketplace",
    path: "/marketplace/dashboard",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDi3mp6C62zZEzuTNrfLBBdAbqnZjaE62F8NDyst3xVlcYNUarLZqRfdKbvqGmxcBH9Lp7wvrnleqDK6Y42toR5Jk1QJEMenYMkof_5X2F8YFD7C3HI8_MTcYu002klTmxphUCfAS3tBGIrTwqby3rAbTDqiUima5xCIEnymt-yql-DNYOEzkMjU2Qe01vFaisZ455oqlBClk19_CisCcK2XcLKtnNdbXlR1uG_kDLb-sQdbJ1OWeSYsev9ayMCsV0pZcycGd5AYTSr",
  },
  {
    id: "farmers-hub",
    title: "Farmers & Producers Hub",
    icon: <Groups sx={{ color: PRIMARY, fontSize: 28 }} />,
    description:
      "Connect with industry leaders, join producer cooperatives, and share insights to grow your agribusiness network.",
    buttonLabel: "Enter Hub",
    path: "/marketplace/farmers-hub",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuChJeSEwdfXCB7k7cls13UUO5NOdpVYl5rODGJ2p39E9lJ5FoPo-gEgNLxXAEwMrSb9nCqiOgIsuExnvTmcpB5dRP256xlxCbzU-mVnLsa9TkerZQcdwavUZQB8AT7pGrJMP_7wujxPVsgxhdYfAHupb9LOy9CU1f9eojOMQN4JToSyiXGvZi_zIlSjrb5s6cShq4v83xo3Ub55QOoDxMyYjAv-QKk-08GtMV42099IWTJO2hOehXtz0ObWateu82XclGJefmtTt32v",
  },
  {
    id: "inputs",
    title: "Inputs & Feeds",
    icon: <Inventory2 sx={{ color: PRIMARY, fontSize: 28 }} />,
    description:
      "Procure premium seeds, organic fertilizers, and nutritional livestock feeds directly from certified manufacturers.",
    buttonLabel: "Shop Inputs",
    path: "/marketplace/inputs-feeds",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkU7IEXuDIQ_IWHK7m-4mru-7ZsjYJjBvsGn2CUju6un1CXx9jodnCQ18yD57ZaHxHUy7v46GttndRtczVg_gsSURB-V1JU77HOx7QbkDCUOjUbS-LtkkbNrsEsNShCUHS5ZqBwpUObuuhLF7W5_eBb9XzatIaQxnSLJHVI9PN5bkZ1wC2_-kijJYxMfBJWVnjyDr2rnMm6EedNTRSwGUuTGke1kTcYLD836SQ1JkXJH63QSh1agxBdY12bR10vcjh9dt5HOdPzMNS",
  },
  {
    id: "veterinary",
    title: "Veterinary Services",
    icon: <MedicalServices sx={{ color: PRIMARY, fontSize: 28 }} />,
    description:
      "Access on-demand animal healthcare, vaccinations, and specialist consultations for your livestock.",
    buttonLabel: "Find a Vet",
    path: "/marketplace/veterinary-services",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2XXU0chiInJwa-1CDjnR7a2CDdiAJCUY3tX3RqGC45ZmYgX0rT_q_KGyEhs1_dvcrrOr2wmPQTvpY-n0Kfdy3p5lea5NCRefVscZI9tjwJjL1cc39gnmiqbRGBN4pa0uLUaa-thLPKmnmzgHTRznFydR-IXK-0YJy33xEa1HyE5AG5_O6yYSx_j1bUI7Q2RMZ0jdFTW973QmYUwQAxBx83TWJPAYw4QhBSVpPzeHK9s_8ds8sRUk0oP34acm59sTf3Kiw0m2Kt8E6",
  },
  {
    id: "training",
    title: "Training & Opportunities",
    icon: <School sx={{ color: PRIMARY, fontSize: 28 }} />,
    description:
      "Empower your agribusiness through specialized workshops, government grants, and modern farming technology certifications.",
    buttonLabel: "View Opportunities",
    path: "/marketplace/training-opportunities",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZUcbK3O-4vSH5DXBXrXfEclgOjouZc4xu27dO-8Lb_2p05gsZAsdckef0pi509UVvkos4N2QZ41Br7uc9uuoQ_1GlSdB2-leuySZnnrVIkloCxH7VPLuIMVAR856-LASkOfEy2bkE94alKrUYBeJL3iwBrvOmhPDaSV-DcKHjO1cWMoIIyAlxxyf9zJ0dwvFtP2kK1K9Uo9_CKUho1p-4fD-hJHFspCgTPr-H8wExRKayccfjJuMnxT259dHesArwJo7_irvl69DH",
  },
];

const quickActions = [
  { label: "My Listings", icon: <ListAlt />, path: "/marketplace/my-listings" },
  { label: "All Listings", icon: <ViewList />, path: "/marketplace/listings" },
  {
    label: "Add New Listing",
    icon: <AddCircle />,
    path: "/marketplace/add-listing",
  },
  {
    label: "View Profile",
    icon: <AccountCircle />,
    path: "/marketplace/profile",
  },
];

export default function MarketplaceDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const goToProfile = () =>
    navigate("/marketplace/profile", { state: { from: location.pathname } });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: BG_LIGHT,
        color: "#0e1b12",
        pt: 5,
        pb: 0,
        px: 1,
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
      }}
    >
      <Box sx={{ width: "100%" }}>
        {/* Hero */}
        <Box
          sx={{
            py: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Box>
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
              Welcome back 👋
            </Typography>
            <Typography
              sx={{
                color: PRIMARY,
                fontSize: "1.125rem",
                fontWeight: 500,
                mt: 1,
                maxWidth: { xs: 540, md: "none" },
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              Empowering Farmers, Transforming Agribusiness. Professional
              digital marketplace for agriculture professionals.
            </Typography>
          </Box>
        </Box>

        {/* Cards grid: first row 3 cards, second row 2 cards */}
        <Grid container spacing={3} sx={{ pb: 3 }}>
          {cards.map((item, index) => (
            <Grid
              size={{ xs: 12, sm: index < 3 ? 4 : 6, md: index < 3 ? 4 : 6 }}
              key={item.id}
            >
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
                  "&:hover": { boxShadow: 6 },
                  transition: "box-shadow 0.2s ease",
                }}
              >
                <CardMedia
                  component="div"
                  image={item.image}
                  sx={{
                    height: 224,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardContent
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    p: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    {item.icon}
                    <Typography variant="h6" fontWeight={700}>
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      mb: 2,
                      lineHeight: 1.6,
                      fontSize: "1rem",
                      color: "#000000",
                      fontFamily: '"Calibri", "Calibri Light", sans-serif',
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(item.path)}
                    disableRipple
                    sx={{
                      borderColor: PRIMARY,
                      color: PRIMARY,
                      fontWeight: 700,
                      py: 1.25,
                      "&:hover": {
                        borderColor: PRIMARY,
                        bgcolor: `${PRIMARY}14`,
                        color: PRIMARY,
                      },
                      "&:focus": { outline: "none" },
                    }}
                  >
                    {item.buttonLabel}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ pb: 4 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, px: 0.5 }}>
            Quick Actions
          </Typography>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              justifyContent: { xs: "flex-start", md: "space-between" },
            }}
          >
            {quickActions.map((action) => (
              <Box
                key={action.path}
                component="button"
                onClick={() =>
                  action.path === "/marketplace/profile"
                    ? goToProfile()
                    : navigate(action.path)
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: "#000",
                  fontWeight: 500,
                  flex: { xs: "0 0 auto", md: 1 },
                  minWidth: 0,
                  "&:hover": {
                    bgcolor: "action.hover",
                    color: "#000",
                    "& > div:first-of-type": {
                      bgcolor: PRIMARY,
                      color: "#fff",
                    },
                  },
                  "&:focus": { outline: "none" },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: `${PRIMARY}14`,
                    color: PRIMARY,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {React.cloneElement(action.icon, { sx: { fontSize: 22 } })}
                </Box>
                <span>{action.label}</span>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
