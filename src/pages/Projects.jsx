import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Chip,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  TrendingUp,
  Groups,
  KeyboardDoubleArrowUp,
  LocationOn,
  Close,
  Send,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { postContact } from "../api";
import CharityMap from "../components/Home/CharityMap";
import { ViewModule, Map as MapIcon } from "@mui/icons-material";

const MotionBox = motion(Box);

const categories = [
  "All Projects",
  "Waste Management",
  "Dairy Value Chain",
  "Ag-Tech",
  "Irrigation",
  "Other",
];

const buildProjectImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/${path}`;
};

const PROJECT_PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80";

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statsFromApi, setStatsFromApi] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [projectsFromApi, setProjectsFromApi] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    fetch("/api/projects/public/stats")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && data.data) setStatsFromApi(data.data);
        else setStatsFromApi(null);
      })
      .catch(() => { if (!cancelled) setStatsFromApi(null); })
      .finally(() => { if (!cancelled) setStatsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setProjectsLoading(true);
    fetch("/api/projects/public")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setProjectsFromApi(data.data);
        } else {
          setProjectsFromApi([]);
        }
      })
      .catch(() => { if (!cancelled) setProjectsFromApi([]); })
      .finally(() => { if (!cancelled) setProjectsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => {
    const d = statsFromApi;
    const empty = (label, icon) => ({ label, value: "—", change: "—", icon });
    if (!d) {
      return [
        empty("Total Projects", <TrendingUp fontSize="small" />),
        empty("Farmers Trained", <Groups fontSize="small" />),
        empty("Average ROI Increase", <KeyboardDoubleArrowUp fontSize="small" />),
      ];
    }
    return [
      {
        label: "Total Projects",
        value: d.totalProjects != null ? `${d.totalProjects}+` : "—",
        change: d.totalProjectsChangePercent != null ? `${d.totalProjectsChangePercent >= 0 ? "+" : ""}${d.totalProjectsChangePercent}% this year` : "—",
        icon: <TrendingUp fontSize="small" />,
      },
      {
        label: "Farmers Trained",
        value: d.farmersTrained != null ? `${Number(d.farmersTrained).toLocaleString()}+` : "—",
        change: d.farmersTrainedChangePercent != null ? `${d.farmersTrainedChangePercent >= 0 ? "+" : ""}${d.farmersTrainedChangePercent}% impact` : "—",
        icon: <Groups fontSize="small" />,
      },
      {
        label: "Average ROI Increase",
        value: d.averageRoiIncreasePercent != null ? `${d.averageRoiIncreasePercent}%` : "—",
        change: "High Efficiency",
        icon: <KeyboardDoubleArrowUp fontSize="small" />,
      },
    ];
  }, [statsFromApi]);

  const filteredProjects = useMemo(() => {
    if (activeCategory === "All Projects") return projectsFromApi;
    return projectsFromApi.filter((p) => p.category === activeCategory);
  }, [projectsFromApi, activeCategory]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setOpenProjectDialog(true);
  };

  const handleCloseProjectDialog = () => {
    setOpenProjectDialog(false);
    setSelectedProject(null);
  };

  const handleContactInputChange = (field, value) => {
    setContactFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenContactDialog = () => {
    setOpenContactDialog(true);
  };

  const handleCloseContactDialog = () => {
    setOpenContactDialog(false);
    setContactFormData({
      fullName: "",
      email: "",
      phone: "",
      serviceType: "",
      message: "",
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!contactFormData.fullName || !contactFormData.email || !contactFormData.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields (Full Name, Email, and Message).",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactFormData.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    setContactLoading(true);

    try {
      const data = await postContact(contactFormData);

      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        confirmButtonColor: "#13ec13",
      });

      handleCloseContactDialog();
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "#f6f8f6", minHeight: "100vh", pt: { xs: 1, md: 2 }, pb: 1, fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
      <Card
        sx={{
          mt: 0.3,
          mx: 0.3,
          mb: 0.15, // Reduced from 0.3 by half
          borderRadius: { xs: 3, md: 4 },
          background: "#FFFFFF",
          border: "1px solid rgba(15, 189, 15, 0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden"
        }}
      >
        <Container maxWidth={false} sx={{ pt: 1, pb: { xs: 6, md: 10 }, px: { xs: 2, md: 4 } }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <Box sx={{ mb: 4 }}>
              <Chip
                label="Our Portfolio"
                sx={{
                  mt: 1, // Added mt: 1 as requested
                  bgcolor: "rgba(15, 189, 15, 0.1)",
                  color: "#0fbd0f",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  mb: 3,
                  fontSize: "0.75rem",
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  fontWeight: 900,
                  color: "#000000",
                  mb: 3,
                  lineHeight: 1.1,
                }}
              >
                Our Impact
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  color: "#000000",
                  maxWidth: "800px",
                  lineHeight: 1.6,
                }}
              >
                Transforming agricultural challenges into sustainable, profitable realities across East Africa through expert consulting and innovation. Discover how we help farmers and investors scale.
              </Typography>

              </Box>

          {/* Stats Cards – show loading until API responds, then real data (or fallback on error) */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 1.5, md: 2 },
              width: "100%",
              mb: 2,
            }}
          >
            {statsLoading ? (
              [1, 2, 3].map((idx) => (
                <Box key={idx} sx={{ flex: 1, minWidth: 0, display: "flex" }}>
                  <Card
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: { xs: 2, md: 4 },
                      border: "1px solid rgba(15, 189, 15, 0.1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      bgcolor: "white",
                      minHeight: { xs: "90px", md: "150px" },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 1.5, md: 3 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress size={28} sx={{ color: "#0fbd0f" }} />
                      <Typography variant="body2" sx={{ mt: 1.5, color: "#000000" }}>Loading…</Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))
            ) : (
              stats.map((stat, idx) => (
                <Box
                  key={idx}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                  }}
                >
                  <Card
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: { xs: 2, md: 4 },
                      border: "1px solid rgba(15, 189, 15, 0.1)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      transition: "all 0.4s ease",
                      bgcolor: "white",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: { xs: 1.5, md: 3 },
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        justifyContent: "center",
                        minHeight: { xs: "90px", md: "150px" },
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{
                          color: "#000000",
                          fontWeight: 700,
                          mb: { xs: 0.5, md: 1 },
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontSize: { xs: "0.65rem", md: "0.75rem" },
                        }}
                      >
                        {stat.label}
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 900,
                          color: "#0d1b0d",
                          mb: { xs: 0.5, md: 1 },
                          fontSize: { xs: "1.15rem", md: "2rem" },
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 0.5, md: 1 },
                          color: "#0fbd0f",
                          bgcolor: "rgba(15, 189, 15, 0.08)",
                          px: { xs: 1.25, md: 2 },
                          py: { xs: 0.25, md: 0.5 },
                          borderRadius: "99px",
                        }}
                      >
                        {stat.icon}
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: { xs: "0.7rem", md: "0.85rem" },
                          }}
                        >
                          {stat.change}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))
            )}
          </Box>

          {/* Filters */}
          <Box sx={{ mb: 4, display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                sx={{
                  bgcolor: activeCategory === category ? "#0fbd0f" : "white",
                  color: activeCategory === category ? "white" : "#000000",
                  px: 3,
                  py: 1,
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "none",
                  border: activeCategory === category ? "none" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: activeCategory === category ? "0 4px 12px rgba(15, 189, 15, 0.2)" : "none",
                  "&:hover": {
                    bgcolor: activeCategory === category ? "#0da50d" : "rgba(15, 189, 15, 0.05)",
                    borderColor: "#0fbd0f",
                  },
                  "&:focus": { outline: "none" },
                }}
              >
                {category}
              </Button>
            ))}
            
            {/* View Toggle Chips */}
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
              <Chip
                icon={<ViewModule />}
                label="Grid View"
                onClick={() => setViewMode("grid")}
                sx={{
                  bgcolor: viewMode === "grid" ? "#0fbd0f" : "white",
                  color: viewMode === "grid" ? "white" : "#000000",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: viewMode === "grid" ? "none" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: viewMode === "grid" ? "0 4px 12px rgba(15, 189, 15, 0.2)" : "none",
                  "&:hover": {
                    bgcolor: viewMode === "grid" ? "#0da50d" : "rgba(15, 189, 15, 0.05)",
                    borderColor: "#0fbd0f",
                  },
                  "& .MuiChip-icon": {
                    color: viewMode === "grid" ? "white" : "#000000",
                  },
                }}
              />
              <Chip
                icon={<MapIcon />}
                label="Map View"
                onClick={() => setViewMode("map")}
                sx={{
                  bgcolor: viewMode === "map" ? "#0fbd0f" : "white",
                  color: viewMode === "map" ? "white" : "#000000",
                  fontWeight: 700,
                  cursor: "pointer",
                  border: viewMode === "map" ? "none" : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: viewMode === "map" ? "0 4px 12px rgba(15, 189, 15, 0.2)" : "none",
                  "&:hover": {
                    bgcolor: viewMode === "map" ? "#0da50d" : "rgba(15, 189, 15, 0.05)",
                    borderColor: "#0fbd0f",
                  },
                  "& .MuiChip-icon": {
                    color: viewMode === "map" ? "white" : "#000000",
                  },
                }}
              />
            </Box>
          </Box>

          {/* Projects Grid Section or Map View */}
          {viewMode === "grid" ? (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                width: "100%",
              }}
            >
              {projectsLoading ? (
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress sx={{ color: "#0fbd0f" }} />
                </Box>
              ) : filteredProjects.length === 0 ? (
                <Box sx={{ width: "100%", textAlign: "center", py: 8 }}>
                  <Typography sx={{ color: "#000000", fontSize: "1.125rem" }}>
                    No projects to display{activeCategory !== "All Projects" ? " in this category." : "."}
                  </Typography>
                </Box>
              ) : (
                filteredProjects.map((project) => (
                  <Box
                    key={project.id}
                    sx={{
                      flex: {
                        xs: "0 1 100%", // 1 per row on mobile, same card width
                        md: "0 1 calc(50% - 32px)", // 2 per row on medium
                        lg: "0 1 calc(33.333% - 27px)", // 3 per row on desktop; one card stays 1/3 width
                      },
                      display: "flex",
                      minWidth: 0,
                    }}
                  >
                    <Card
                      onClick={() => handleProjectClick(project)}
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 4,
                        border: "1px solid rgba(15, 189, 15, 0.1)",
                        boxShadow: "none",
                        overflow: "hidden",
                        transition: "all 0.4s ease",
                        cursor: "pointer",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                          "& .MuiCardMedia-root": { transform: "scale(1.1)" },
                        },
                      }}
                    >
                      <Box sx={{ overflow: "hidden", aspectRatio: "16/10" }}>
                        <CardMedia
                          component="img"
                          image={buildProjectImageUrl(project.image) || PROJECT_PLACEHOLDER_IMAGE}
                          alt={project.imageAltText || project.title}
                          sx={{ transition: "transform 0.6s ease", height: "100%", width: "100%", objectFit: "cover" }}
                        />
                      </Box>
                      <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0fbd0f", mb: 2 }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
                            {project.location}
                          </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, color: "#000000" }}>
                          {project.title}
                        </Typography>
                        <Typography sx={{ color: "#000000", mb: 4, fontSize: "1.0625rem", lineHeight: 1.6, flex: 1 }}>
                          {project.shortDescription || project.description}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 3, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                          {(Array.isArray(project.tags) ? project.tags : []).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              sx={{
                                bgcolor: "rgba(15, 189, 15, 0.05)",
                                color: "#0fbd0f",
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: "0.7rem",
                              }}
                            />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Box>
                ))
              )}
            </Box>
          ) : (
            <Box sx={{ mb: 4 }}>
              {projectsLoading ? (
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", py: 8 }}>
                  <CircularProgress sx={{ color: "#0fbd0f" }} />
                </Box>
              ) : (
                <CharityMap projects={filteredProjects} />
              )}
            </Box>
          )}

          {/* New Full Width Card Section */}
          <Box
            sx={{
              mt: 1, // Reduced from 8 to 1
              mx: { xs: -2, md: -4 }, // Negative margin to bleed to the edges of the parent Container
              mb: { xs: -6, md: -10 }, // Matches Container pb to sit flush at the bottom
            }}
          >
            <Card
              sx={{
                bgcolor: "#0d1b0d",
                color: "white",
                borderRadius: 0,
                p: { xs: 3, md: 5 }, // Reduced by half
                textAlign: "center",
                border: "none",
                boxShadow: "none",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "33.33%",
                  height: "100%",
                  background: "linear-gradient(to left, rgba(19, 236, 19, 0.1), transparent)",
                }
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  mb: 1.5, // Reduced from 3
                  fontSize: { xs: "1.75rem", md: "2.5rem" }, // Slightly smaller font for compactness
                  lineHeight: 1.1
                }}
              >
                Let's Build Something Together
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  mb: 3, // Reduced from 6
                  fontSize: "1rem", // Slightly smaller font
                  maxWidth: "800px",
                  mx: "auto",
                  lineHeight: 1.5
                }}
              >
                Whether you're looking to optimize your current farm operations or start a new sustainable project, our team is ready to guide you every step of the way.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={handleOpenContactDialog}
                  sx={{
                    bgcolor: "#13ec13",
                    color: "#0d1b0d",
                    px: 4, // Reduced padding
                    py: 1, // Reduced padding
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: "1rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#11d411" },
                    "&:focus": { outline: "none" }
                  }}
                >
                  Start a Conversation
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/services")}
                  sx={{
                    borderColor: "rgba(255,255,255,0.2)",
                    color: "white",
                    px: 4, // Reduced padding
                    py: 1, // Reduced padding
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: "1rem",
                    textTransform: "none",
                    "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                    "&:focus": { outline: "none" }
                  }}
                >
                  View Our Services
                </Button>
              </Stack>
            </Card>
          </Box>
        </MotionBox>
      </Container>
    </Card>

      {/* Contact Dialog */}
      <Dialog
        open={openContactDialog}
        onClose={handleCloseContactDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            maxWidth: "600px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#0d1b0d",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Contact Us
          </Typography>
          <IconButton
            onClick={handleCloseContactDialog}
            sx={{
              color: "white",
              outline: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "none",
              },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "none",
              },
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: "#f6f8f6",
          }}
        >
          <Box 
            component="form" 
            onSubmit={handleContactSubmit} 
            id="contact-form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              width: "100%",
            }}
          >
            {/* Full Name */}
            <TextField
              fullWidth
              label="Full Name"
              required
              value={contactFormData.fullName}
              onChange={(e) => handleContactInputChange("fullName", e.target.value)}
              sx={{
                width: "100%",
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={contactFormData.email}
              onChange={(e) => handleContactInputChange("email", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Phone Number */}
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              value={contactFormData.phone}
              onChange={(e) => handleContactInputChange("phone", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Type of Service */}
            <FormControl fullWidth sx={{ width: "100%" }}>
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#13ec13",
                  },
                }}
              >
                Type of Service Interested In
              </InputLabel>
              <Select
                value={contactFormData.serviceType}
                onChange={(e) => handleContactInputChange("serviceType", e.target.value)}
                label="Type of Service Interested In"
                sx={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                }}
              >
                <MenuItem value="Project Design & Development">Project Design & Development</MenuItem>
                <MenuItem value="BSF Training & Setup">BSF Training & Setup</MenuItem>
                <MenuItem value="Proposal Writing">Proposal Writing</MenuItem>
                <MenuItem value="Farm Consultation">Farm Consultation</MenuItem>
                <MenuItem value="Agribusiness Planning">Agribusiness Planning</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Message */}
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={5}
              required
              value={contactFormData.message}
              onChange={(e) => handleContactInputChange("message", e.target.value)}
              placeholder="Tell us about your agribusiness needs..."
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            pt: 0,
            backgroundColor: "#f6f8f6",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleCloseContactDialog}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              color: "#000000",
              textTransform: "none",
              fontWeight: 600,
              outline: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "none",
              },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "none",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="contact-form"
            variant="contained"
            disabled={contactLoading}
            startIcon={contactLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              px: 4,
              py: 1,
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              outline: "none",
              "&:hover": {
                backgroundColor: "#11d411",
                boxShadow: "0 6px 16px rgba(17, 212, 17, 0.4)",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "white",
              },
            }}
          >
            {contactLoading ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Project Detail Dialog */}
      <Dialog
        open={openProjectDialog}
        onClose={handleCloseProjectDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            maxWidth: "900px",
            overflow: "hidden",
          },
        }}
      >
        {selectedProject && (
          <>
            <Box
              sx={{
                position: "relative",
                height: { xs: "250px", md: "400px" },
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={buildProjectImageUrl(selectedProject.image) || PROJECT_PLACEHOLDER_IMAGE}
                alt={selectedProject.imageAltText || selectedProject.title}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <IconButton
                onClick={handleCloseProjectDialog}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                  },
                  outline: "none",
                  "&:focus": {
                    outline: "none",
                    boxShadow: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                    boxShadow: "none",
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <DialogContent
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                backgroundColor: "#f6f8f6",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0fbd0f", mb: 2 }}>
                <LocationOn sx={{ fontSize: 20 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: "uppercase", fontSize: "0.875rem" }}>
                  {selectedProject.location}
                </Typography>
              </Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  color: "#0d1b0d",
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                }}
              >
                {selectedProject.title}
              </Typography>

              <Typography
                sx={{
                  color: "#000000",
                  mb: 4,
                  fontSize: "1.1875rem",
                  lineHeight: 1.8,
                }}
              >
                {selectedProject.fullContent || selectedProject.description}
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0d1b0d",
                    mb: 2,
                    fontSize: "1.125rem",
                  }}
                >
                  Key Highlights
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {(Array.isArray(selectedProject.tags) ? selectedProject.tags : []).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      sx={{
                        bgcolor: "rgba(15, 189, 15, 0.1)",
                        color: "#0fbd0f",
                        fontWeight: 700,
                        borderRadius: 2,
                        fontSize: "0.875rem",
                        py: 2.5,
                        height: "auto",
                        "& .MuiChip-label": {
                          px: 2,
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 3,
                  p: 3,
                  border: "1px solid rgba(15, 189, 15, 0.1)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0d1b0d",
                    mb: 2,
                    fontSize: "1rem",
                  }}
                >
                  Interested in this project?
                </Typography>
                <Typography
                  sx={{
                    color: "#000000",
                    mb: 3,
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  Let's discuss how we can help you implement a similar solution for your agribusiness needs.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleCloseProjectDialog();
                    handleOpenContactDialog();
                  }}
                  sx={{
                    bgcolor: "#13ec13",
                    color: "#0d1b0d",
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#11d411",
                    },
                    outline: "none",
                    "&:focus": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                  }}
                >
                  Get in Touch
                </Button>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
      </Box>
  );
}
