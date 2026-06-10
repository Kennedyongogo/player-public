import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ThemeProvider, CssBaseline, LinearProgress, Box, Typography, CircularProgress } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { theme } from "./theme";
import "./App.css";
import React, { useState, useEffect, Suspense, lazy } from "react";
import PublicHeader from "./components/Header/PublicHeader";
import PrivateHeader from "./components/Header/PrivateHeader";
import MarketplaceGate from "./components/MarketplaceGate";
import Footer from "./components/Footer/Footer";
import Chatbot from "./components/Chatbot/Chatbot";

// Lazy load components
const Home = lazy(() => import("./pages/Home"));
const TeamMemberDetail = lazy(() => import("./pages/TeamMemberDetail"));
const Team = lazy(() => import("./pages/Team"));
const Staff = lazy(() => import("./pages/Staff"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Projects = lazy(() => import("./pages/Projects"));
const BookConsultation = lazy(() => import("./pages/BookConsultation"));
const MarketplaceLogin = lazy(() => import("./pages/MarketplaceLogin"));
const ProfileComplete = lazy(() => import("./pages/ProfileComplete"));
const MarketplaceArea = lazy(() => import("./pages/MarketplaceArea"));
const MarketplaceDashboard = lazy(() => import("./pages/MarketplaceDashboard"));
const FarmersHub = lazy(() => import("./pages/FarmersHub"));
const InputsFeeds = lazy(() => import("./pages/InputsFeeds"));
const VeterinaryServices = lazy(() => import("./pages/VeterinaryServices.jsx"));
const TrainingOpportunities = lazy(() => import("./pages/TrainingOpportunities"));
const TrainingOpportunitiesMapPage = lazy(() => import("./pages/TrainingOpportunitiesMapPage"));
const JobOpportunities = lazy(() => import("./pages/JobOpportunities"));
const JobOpportunitiesMapPage = lazy(() => import("./pages/JobOpportunitiesMapPage"));
const ViewAllTrainings = lazy(() => import("./pages/ViewAllTrainings"));
const ViewAllGrants = lazy(() => import("./pages/ViewAllGrants"));
const RegisterEventPage = lazy(() => import("./pages/RegisterEventPage"));
const ApplyGrantPage = lazy(() => import("./pages/ApplyGrantPage"));
const MarketplaceProfilePage = lazy(() => import("./pages/MarketplaceProfilePage"));
const ListingsPage = lazy(() => import("./pages/ListingsPage"));
const AddListingPage = lazy(() => import("./pages/AddListingPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PrivateRoute({ user, children }) {
  // if (!user) {
  //   return <Navigate to="/login" replace />;
  // }
  return children;
}

function AppLayout() {
  const location = useLocation();
  const hideHeader = location.pathname === "/marketplace" || location.pathname === "/profile/complete";
  const isMarketplaceArea = location.pathname.startsWith("/marketplace/");
  const isMarketplaceLoggedIn =
    typeof localStorage !== "undefined" && !!localStorage.getItem("marketplace_token");
  const showPrivateHeader = !hideHeader && isMarketplaceArea && isMarketplaceLoggedIn;

  return (
    <>
      <ScrollToTop />
      {!hideHeader && showPrivateHeader && <PrivateHeader />}
      {!hideHeader && !showPrivateHeader && <PublicHeader />}
      <Box
        component="main"
        sx={{
          ...(hideHeader && {
            minHeight: "100vh",
            minHeight: "100dvh",
            width: "100%",
            bgcolor: "#f6f8f6",
            flex: 1,
          }),
        }}
      >
        <Suspense
          fallback={
            <Box
              sx={{
                position: "fixed",
                top: "72px", // Below header
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "#f6f8f6",
                background:
                  "linear-gradient(135deg, rgba(246, 248, 246, 0.98) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(232, 245, 232, 0.95) 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1399,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 20% 80%, rgba(19, 236, 19, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.06) 0%, transparent 50%)",
                  zIndex: -1,
                },
              }}
            >
              <Box sx={{ mb: 3, position: "relative", zIndex: 1, textAlign: "center" }}>
                {/* Plant icon */}
                <Box
                  sx={{
                    fontSize: "4rem",
                    mb: 2,
                    animation: "bounce 2s ease-in-out infinite",
                    lineHeight: 1,
                    filter: "drop-shadow(0 0 12px rgba(19, 236, 19, 0.4))",
                  }}
                >
                  🌱
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: "#0d1b0d",
                    mb: 1,
                    textAlign: "center",
                    fontSize: { xs: "1.6rem", md: "2rem" },
                  }}
                >
                  MK Agribusiness Consultancy
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#13ec13",
                    textAlign: "center",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: "1rem", md: "1.2rem" },
                  }}
                >
                  Growing sustainable futures
                </Typography>

                {/* Animated progress dots */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                  {[0, 1, 2].map((index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: "#13ec13",
                        animation: `pulse 1.5s ease-in-out infinite ${index * 0.2}s`,
                        boxShadow: "0 0 10px rgba(19, 236, 19, 0.4)",
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  color: "#0d1b0d",
                  textAlign: "center",
                  fontWeight: 500,
                  position: "relative",
                  zIndex: 1,
                  mb: 2,
                  fontSize: "1.1rem",
                }}
              >
                Preparing your experience...
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#000000",
                  textAlign: "center",
                  fontWeight: 400,
                  position: "relative",
                  zIndex: 1,
                  opacity: 0.85,
                  maxWidth: "320px",
                  mx: "auto",
                }}
              >
                Loading services, projects, and expert agribusiness insights
              </Typography>
            </Box>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route
              path="/"
              element={
                <Home />
              }
            />
            <Route
              path="/team"
              element={
                <>
                  <Team />
                  <Footer />
                </>
              }
            />
            <Route
              path="/team/:id"
              element={
                <>
                  <TeamMemberDetail />
                  <Footer />
                </>
              }
            />
            <Route
              path="/staff"
              element={
                <>
                  <Staff />
                  <Footer />
                </>
              }
            />
            <Route
              path="/book-consultation"
              element={
                <>
                  <BookConsultation />
                  <Footer />
                </>
              }
            />
            <Route
              path="/reviews"
              element={
                <>
                  <Reviews />
                  <Footer />
                </>
              }
            />
            <Route
              path="/blog"
              element={
                <>
                  <Blog />
                  <Footer />
                </>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <>
                  <BlogDetail />
                  <Footer />
                </>
              }
            />
            <Route
              path="/services"
              element={
                <>
                  <Services />
                  <Footer />
                </>
              }
            />
            <Route
              path="/service/:slug"
              element={
                <>
                  <ServiceDetail />
                  <Footer />
                </>
              }
            />
            <Route
              path="/projects"
              element={
                <>
                  <Projects />
                  <Footer />
                </>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <>
                  <PrivacyPolicy />
                  <Footer />
                </>
              }
            />
            <Route
              path="/terms-of-use"
              element={
                <>
                  <TermsOfUse />
                  <Footer />
                </>
              }
            />
            <Route path="/marketplace" element={<MarketplaceLogin />} />
            <Route
              path="/marketplace/dashboard"
              element={
                <MarketplaceGate>
                  <>
                    <MarketplaceDashboard />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/farmers-hub"
              element={
                <MarketplaceGate>
                  <>
                    <FarmersHub />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/inputs-feeds"
              element={
                <MarketplaceGate>
                  <>
                    <InputsFeeds />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/veterinary-services"
              element={
                <MarketplaceGate>
                  <>
                    <VeterinaryServices />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities"
              element={
                <MarketplaceGate>
                  <>
                    <TrainingOpportunities />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/job-opportunities"
              element={
                <MarketplaceGate>
                  <>
                    <JobOpportunities />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/job-opportunities/map"
              element={
                <MarketplaceGate>
                  <>
                    <JobOpportunitiesMapPage />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities/map"
              element={
                <MarketplaceGate>
                  <>
                    <TrainingOpportunitiesMapPage />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities/trainings"
              element={
                <MarketplaceGate>
                  <>
                    <ViewAllTrainings />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities/register/:eventId"
              element={
                <MarketplaceGate>
                  <>
                    <RegisterEventPage />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities/grants"
              element={
                <MarketplaceGate>
                  <>
                    <ViewAllGrants />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/training-opportunities/grants/apply/:grantId"
              element={
                <MarketplaceGate>
                  <>
                    <ApplyGrantPage />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/profile"
              element={
                <MarketplaceGate>
                  <MarketplaceProfilePage />
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/my-listings"
              element={
                <MarketplaceGate>
                  <ListingsPage />
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/listings"
              element={
                <MarketplaceGate>
                  <ListingsPage />
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/add-listing"
              element={
                <MarketplaceGate>
                  <AddListingPage />
                </MarketplaceGate>
              }
            />
            <Route
              path="/marketplace/*"
              element={
                <MarketplaceGate>
                  <>
                    <MarketplaceArea />
                    <Footer />
                  </>
                </MarketplaceGate>
              }
            />
            <Route path="/profile/complete" element={<ProfileComplete />} />
          </Routes>
        </Suspense>
      </Box>
        <Chatbot />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <Router style={{ margin: 0, padding: 0 }}>
          <AppLayout />
        </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

// Global styles for loading animations
const styles = `
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
