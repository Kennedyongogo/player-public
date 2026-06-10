import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Card,
  Chip,
  Link,
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
  Architecture,
  Description,
  BugReport,
  SmartToy,
  QueryStats,
  LocalShipping,
  School,
  Nature,
  Payments,
  FactCheck,
  ArrowForward,
  Close,
  Send,
  Build,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { postQuote, postContact } from "../api";

const MotionBox = motion(Box);

// Map API icon string to MUI icon component (keep all styling; default Build if unknown)
const iconMap = {
  Architecture,
  Description,
  BugReport,
  SmartToy,
  QueryStats,
  LocalShipping,
  School,
  Nature,
  Payments,
  FactCheck,
  Build,
};

const getIconComponent = (iconName) => {
  if (!iconName) return Build;
  return iconMap[iconName] || Build;
};

const buildImageUrl = (path) => {
  if (!path) return null;
  const normalized = String(path).replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized}`;
};

const HERO_IMAGE_DURATION_MS = 5500;
const HERO_TRANSITION_MS = 1200;

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);

  const heroImageUrls = React.useMemo(() => {
    return services
      .filter((s) => s.image)
      .map((s) => buildImageUrl(s.image))
      .filter(Boolean);
  }, [services]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [formData, setFormData] = useState({
    projectType: "",
    location: "",
    scaleOfOperation: "",
    expectedOutcomes: "",
  });
  const [contactFormData, setContactFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContactInputChange = (field, value) => {
    setContactFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      projectType: "",
      location: "",
      scaleOfOperation: "",
      expectedOutcomes: "",
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.projectType || !formData.location || !formData.scaleOfOperation || !formData.expectedOutcomes) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await postQuote(formData);

      if (!data.success) {
        throw new Error(data.message || "Failed to submit quote request");
      }

      Swal.fire({
        icon: "success",
        title: "Quote Request Submitted!",
        text: "Thank you for your interest. We'll prepare a detailed proposal and get back to you soon.",
        confirmButtonColor: "#13ec13",
      });

      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting quote request:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setLoading(false);
    }
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

  // Cycle hero background through service images (uniform transition)
  useEffect(() => {
    if (heroImageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImageUrls.length);
    }, HERO_IMAGE_DURATION_MS);
    return () => clearInterval(interval);
  }, [heroImageUrls.length]);

  // Fetch published services from API
  useEffect(() => {
    let cancelled = false;
    fetch("/api/services/public?limit=100&isKeyService=false")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          setServices([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setServicesError(err.message || "Failed to load services");
          setServices([]);
        }
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Detect when hero section is visible and notify header (similar to HeroSection)
  useEffect(() => {
    const heroSection = document.getElementById("services-hero-section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          const scrollY = window.scrollY;
          const isAtTop = scrollY <= 20;
          
          // Dispatch custom event to notify header
          const event = new CustomEvent('heroVisibilityChange', {
            detail: {
              isVisible: isVisible && isAtTop,
              intersectionRatio: entry.intersectionRatio,
              scrollY: scrollY
            }
          });
          window.dispatchEvent(event);
        });
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1.0],
        rootMargin: '0px'
      }
    );

    observer.observe(heroSection);

    // Check initial state
    setTimeout(() => {
      const rect = heroSection.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      const isAtTop = window.scrollY <= 20;
      const event = new CustomEvent('heroVisibilityChange', {
        detail: {
          isVisible: isInView && isAtTop,
          intersectionRatio: isInView ? 1 : 0,
          scrollY: window.scrollY
        }
      });
      window.dispatchEvent(event);
    }, 200);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Box
      sx={{
        pb: 1.5,
        px: 0,
        bgcolor: "#f6f8f6",
        minHeight: "100vh",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      {/* Hero Section – background cycles through service images with smooth fade */}
      <Box
        id="services-hero-section"
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          height: { xs: 400, md: 500 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          marginTop: { xs: "-80px", md: "-80px" },
          backgroundColor: "#0d1b0d",
        }}
      >
        {/* Layered service images with uniform crossfade */}
        {heroImageUrls.length > 0 ? (
          heroImageUrls.map((url, index) => (
            <Box
              key={`${url}-${index}`}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${url})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: index === heroImageIndex ? 1 : 0,
                transition: `opacity ${HERO_TRANSITION_MS}ms ease-in-out`,
                zIndex: 0,
              }}
              aria-hidden={index !== heroImageIndex}
            />
          ))
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#0d1b0d",
              zIndex: 0,
            }}
          />
        )}
        {/* Very light overlay so images are clearly visible; text remains readable */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(rgba(13, 27, 13, 0.15), rgba(13, 27, 13, 0.1))",
            zIndex: 1,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>
          <Typography
            variant="h1"
            sx={{
              color: "white",
              fontSize: { xs: "2rem", md: "3rem" },
              fontWeight: 900,
              mb: 2,
              maxWidth: "900px",
              mx: "auto",
              lineHeight: 1.2,
            }}
          >
            MK Agribusiness Consultants Services Overview
          </Typography>
          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: { xs: "1rem", md: "1.25rem" },
              maxWidth: "700px",
              mx: "auto",
              mb: 0,
            }}
          >
            Empowering agricultural enterprises with expert design, innovation, and sustainable solutions for a thriving future.
          </Typography>
        </Container>
      </Box>

      {/* Section Header */}
      <Box sx={{ px: { xs: 1.5, md: 5 }, pb: 2 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "1.75rem", md: "2.25rem" },
              fontWeight: 700,
              color: "#0d1b0d",
              mb: 1,
            }}
          >
            Our Core Offerings
          </Typography>
          <Box
            sx={{
              height: 4,
              width: 80,
              bgcolor: "#0fbd0f",
              borderRadius: "9999px",
            }}
          />
        </Container>
      </Box>

      {/* Services Grid */}
      <Box sx={{ pt: 2, pb: 5, px: 0 }}>
        <Container maxWidth="xl" disableGutters sx={{ px: 0 }}>
          {servicesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress sx={{ color: "#0fbd0f" }} />
            </Box>
          ) : servicesError ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <Typography sx={{ color: "#000000", fontSize: "1.125rem" }}>{servicesError}</Typography>
            </Box>
          ) : services.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <Typography sx={{ color: "#000000", fontSize: "1.125rem" }}>No services at the moment.</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                columnGap: 1.5,
                rowGap: 8,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(5, 1fr)",
                },
                px: 1.5,
              }}
            >
              {services.map((service, index) => {
                const IconComponent = getIconComponent(service.icon);
                const badge = service.badgeLabel
                  ? { label: service.badgeLabel, color: service.badgeColor || "primary" }
                  : null;
                return (
                  <Card
                    key={service.id}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid rgba(15, 189, 15, 0.1)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      bgcolor: "white",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 30px rgba(15, 189, 15, 0.15)",
                        borderColor: "rgba(15, 189, 15, 0.3)",
                      },
                    }}
                  >
                    {badge && (
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontSize: "0.625rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          height: 20,
                          bgcolor: badge.color === "info" ? "#1976d2" : "#0fbd0f",
                          color: "white",
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: "rgba(15, 189, 15, 0.1)",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0fbd0f",
                        mb: 1.5,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "#0fbd0f",
                          color: "white",
                        },
                      }}
                    >
                      <IconComponent sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: "#0d1b0d",
                        fontSize: { xs: "1rem", md: "1.125rem" },
                        lineHeight: 1.3,
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#000000",
                        fontSize: "1.125rem",
                        lineHeight: 1.5,
                        mb: 1.5,
                        flex: 1,
                        fontWeight: 700,
                      }}
                    >
                      {service.shortDescription || service.description || ""}
                    </Typography>
                    <Link
                      component="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (service.slug) navigate(`/service/${service.slug}`);
                      }}
                      sx={{
                        color: "#0fbd0f",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        textDecoration: "none",
                        cursor: "pointer",
                        border: "none",
                        background: "none",
                        padding: 0,
                        outline: "none",
                        "&:hover": {
                          textDecoration: "underline",
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
                      Learn More <ArrowForward sx={{ fontSize: 16 }} />
                    </Link>
                  </Card>
                );
              })}
            </Box>
          )}
        </Container>
      </Box>
      {/* Call to Action Section */}
      <Box
        sx={{
          pt: 1,
          pb: 0.3,
          px: 0,
          bgcolor: "white",
        }}
      >
        <Container maxWidth="xl" disableGutters sx={{ px: 0 }}>
          <Box sx={{ px: 1.5 }}>
            <Paper
              sx={{
                bgcolor: "rgba(15, 189, 15, 0.05)",
                p: { xs: 4, md: 5 },
                borderRadius: 4,
                border: "1px solid rgba(15, 189, 15, 0.2)",
                textAlign: "center",
                boxShadow: "0 4px 20px rgba(15, 189, 15, 0.05)",
                mb: 0.3,
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 900,
                  color: "#0d1b0d",
                  mb: 2,
                }}
              >
                Ready to transform your agribusiness?
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "1.125rem", md: "1.2rem" },
                  color: "#000000",
                  maxWidth: "800px",
                  mx: "auto",
                  mb: 4,
                  lineHeight: 1.6,
                }}
              >
                Partner with MK Agribusiness Consultants to drive innovation, efficiency, and sustainability in your operations. Our team is ready to scale your impact.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleOpenDialog}
                  sx={{
                    bgcolor: "#0fbd0f",
                    color: "white",
                    fontSize: "1rem",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: 4,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      bgcolor: "#0da50d",
                      boxShadow: 6,
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleOpenContactDialog}
                  sx={{
                    borderColor: "#0fbd0f",
                    borderWidth: 2,
                    color: "#0fbd0f",
                    fontSize: "1rem",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    width: { xs: "100%", sm: "auto" },
                    "&:hover": {
                      borderColor: "#0fbd0f",
                      borderWidth: 2,
                      bgcolor: "#0fbd0f",
                      color: "white",
                    },
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  Contact Sales
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Quote Request Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
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
            Request a Quote
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
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
            onSubmit={handleSubmit} 
            id="quote-form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              width: "100%",
            }}
          >
            {/* Type of Project */}
            <FormControl fullWidth sx={{ width: "100%", mt: 1 }}>
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#13ec13",
                  },
                }}
              >
                Type of Project *
              </InputLabel>
              <Select
                value={formData.projectType}
                onChange={(e) => handleInputChange("projectType", e.target.value)}
                label="Type of Project *"
                required
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
                <MenuItem value="Crop">Crop</MenuItem>
                <MenuItem value="Livestock">Livestock</MenuItem>
                <MenuItem value="BSF">BSF (Black Soldier Fly)</MenuItem>
                <MenuItem value="Mixed Farming">Mixed Farming</MenuItem>
                <MenuItem value="Aquaculture">Aquaculture</MenuItem>
                <MenuItem value="Agro-processing">Agro-processing</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Location */}
            <TextField
              fullWidth
              label="Location"
              required
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Enter project location (e.g., Nairobi, Kiambu County)"
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

            {/* Scale of Operation */}
            <FormControl fullWidth sx={{ width: "100%" }}>
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#13ec13",
                  },
                }}
              >
                Scale of Operation *
              </InputLabel>
              <Select
                value={formData.scaleOfOperation}
                onChange={(e) => handleInputChange("scaleOfOperation", e.target.value)}
                label="Scale of Operation *"
                required
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
                <MenuItem value="Small Scale">Small Scale (1-10 hectares/units)</MenuItem>
                <MenuItem value="Medium Scale">Medium Scale (10-50 hectares/units)</MenuItem>
                <MenuItem value="Large Scale">Large Scale (50+ hectares/units)</MenuItem>
                <MenuItem value="Commercial">Commercial Enterprise</MenuItem>
                <MenuItem value="Industrial">Industrial Scale</MenuItem>
              </Select>
            </FormControl>

            {/* Expected Outcomes */}
            <TextField
              fullWidth
              label="Expected Outcomes"
              multiline
              rows={5}
              required
              value={formData.expectedOutcomes}
              onChange={(e) => handleInputChange("expectedOutcomes", e.target.value)}
              placeholder="Describe your project goals, expected results, and any specific requirements..."
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
            onClick={handleCloseDialog}
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
            form="quote-form"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
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
            {loading ? "Submitting..." : "Request Quote"}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}

