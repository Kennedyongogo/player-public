import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Fade,
  Grid,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Build } from "@mui/icons-material";
import Swal from "sweetalert2";
import { postServiceRequest } from "../../api";

const buildImageUrl = (path) => {
  if (!path) return null;
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized}`;
};

// Placeholder image when service has no image (optional Unsplash or local)
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&h=600&fit=crop";

export default function KeyServicesSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestService, setRequestService] = useState(null);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestForm, setRequestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Show all published services (no "key/featured" filtering)
    fetch("/api/services/public")
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
          setError(err.message || "Failed to load services");
          setServices([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const imageFor = (service) => {
    const url = buildImageUrl(service.image);
    return url || PLACEHOLDER_IMAGE;
  };

  const openRequestDialog = (service) => {
    setRequestService(service);
    setRequestForm({
      fullName: "",
      email: "",
      phone: "",
      message: service?.title ? `I'm requesting the service: ${service.title}.` : "",
    });
    setRequestDialogOpen(true);
  };

  const closeRequestDialog = () => {
    setRequestDialogOpen(false);
    setRequestService(null);
  };

  const submitServiceRequest = async () => {
    if (!requestService) return;

    if (!requestForm.fullName || !requestForm.email || !requestForm.phone) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in your full name, email, and phone number.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    setRequestSubmitting(true);
    try {
      await postServiceRequest({
        serviceId: requestService.id,
        fullName: requestForm.fullName,
        email: requestForm.email,
        phone: requestForm.phone,
        message: requestForm.message || null,
      });

      Swal.fire({
        icon: "success",
        title: "Request Sent!",
        text: "Thank you for your request. We'll contact you soon.",
        confirmButtonColor: "#13ec13",
      });

      closeRequestDialog();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Request Failed",
        text: err?.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setRequestSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        pt: 0,
        pb: 0,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Card
        sx={{
          mx: 0.75,
          mt: 0.75,
          mb: 0.75,
          borderRadius: 3,
          border: "1px solid #cfe7cf",
          backgroundColor: "#f6f8f6",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          display: "flex",
          flexDirection: "column",
          overflow: "visible",
          "& .MuiCardContent-root": {
            overflow: "visible",
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 1.5, sm: 1.5, md: 1.5 },
            pt: { xs: 0, sm: 0, md: 0 },
          }}
        >
          <Box
            sx={{
              pt: { xs: 2, md: 3 },
              pb: { xs: 1, sm: 1.5, md: 2 },
              px: { xs: 1.5, sm: 1.5, md: 1.5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Fade in={isVisible} timeout={1000}>
                <Box
                  sx={{
                    maxWidth: "800px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "#13ec13",
                      fontFamily: '"Calibri Light", Calibri, sans-serif',
                      mb: 0,
                    }}
                  >
                    Key Services
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: { xs: "2rem", sm: "2.5rem", md: "3.5rem" },
                      fontWeight: 900,
                      color: "#0d1b0d",
                      fontFamily: '"Calibri Light", Calibri, sans-serif',
                      lineHeight: 1.2,
                      mb: 0,
                    }}
                  >
                    Our Expertise
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: { xs: "1rem", md: "1.25rem" },
                      color: "#000000",
                      fontFamily: '"Calibri Light", Calibri, sans-serif',
                      lineHeight: 1.7,
                      maxWidth: "700px",
                    }}
                  >
                    We provide specialized, data-driven solutions for agricultural transformation and business excellence across the entire value chain.
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Box>
        </Container>

        {/* Services Grid */}
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            px: { xs: 0.5, sm: 0.5, md: 0.5 },
            pt: { xs: 0, sm: 0, md: 0 },
            pb: { xs: 1, sm: 1.5, md: 2 },
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: "#13ec13" }} />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#000000" }}>{error}</Typography>
            </Box>
          ) : (
            <Grid
              container
              spacing={{ xs: 0.8, sm: 0.8, md: 0.8 }}
              justifyContent="center"
            >
              {services.map((service, index) => (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    lg: 4,
                  }}
                  key={service.id}
                >
                  <Fade in={isVisible} timeout={1000 + index * 100}>
                    <Card
                      onClick={() => service.slug && navigate(`/service/${service.slug}`)}
                      sx={{
                        height: "100%",
                        width: "100%",
                        borderRadius: 3,
                        border: "1px solid #cfe7cf",
                        backgroundColor: "#f6f8f6",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        cursor: service.slug ? "pointer" : "default",
                        "&:hover": {
                          borderColor: "rgba(19, 236, 19, 0.5)",
                          boxShadow: "0 20px 25px -5px rgba(19, 236, 19, 0.1)",
                        },
                      }}
                    >
                      {/* Image */}
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "4/3",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          component="img"
                          src={imageFor(service)}
                          alt={service.imageAltText || service.title}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE;
                          }}
                        />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 2,
                            backgroundColor: "rgba(19, 236, 19, 0.2)",
                            color: "#13ec13",
                            mb: 2,
                          }}
                        >
                          <Build sx={{ fontSize: 26 }} />
                        </Box>
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            mb: 1.5,
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          }}
                        >
                          {service.title}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "1rem",
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            lineHeight: 1.75,
                          }}
                        >
                          {service.shortDescription || service.description || ""}
                        </Typography>

                        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-start" }}>
                          <Button
                            disableElevation
                            disableRipple
                            onClick={(e) => {
                              // Prevent triggering the card's onClick navigation.
                              e.stopPropagation();
                              openRequestDialog(service);
                            }}
                            variant="contained"
                            sx={{
                              backgroundColor: "#13ec13",
                              color: "#0d1b0d",
                              fontWeight: 800,
                              borderRadius: 2,
                              textTransform: "none",
                              px: 2.25,
                              "&:focus": {
                                outline: "none",
                                boxShadow: "none",
                              },
                              "&:focus-visible": {
                                outline: "none",
                                boxShadow: "none",
                              },
                              "&:hover": {
                                backgroundColor: "#11d411",
                              },
                            }}
                          >
                            Request Service
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
          {!loading && !error && services.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "#000000" }}>No services at the moment.</Typography>
            </Box>
          )}
        </Container>
      </Card>

      <Dialog
        open={requestDialogOpen}
        onClose={closeRequestDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: "1px solid rgba(19, 236, 19, 0.15)",
            backgroundColor: "#f6f8f6",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0d1b0d", pb: 0 }}>
          Request Service
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography sx={{ color: "#000000", mb: 2 }}>
            Service: <b>{requestService?.title || "—"}</b>
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            required
            value={requestForm.fullName}
            onChange={(e) => setRequestForm((p) => ({ ...p, fullName: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            required
            type="email"
            value={requestForm.email}
            onChange={(e) => setRequestForm((p) => ({ ...p, email: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Phone"
            required
            type="tel"
            value={requestForm.phone}
            onChange={(e) => setRequestForm((p) => ({ ...p, phone: e.target.value }))}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={closeRequestDialog}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              backgroundColor: "transparent",
              color: "#0d1b0d",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={submitServiceRequest}
            variant="contained"
            disabled={requestSubmitting}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 900,
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              "&:hover": { backgroundColor: "#11d411" },
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          >
            {requestSubmitting ? <CircularProgress size={20} sx={{ color: "#0d1b0d" }} /> : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
