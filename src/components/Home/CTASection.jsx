import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Fade,
  Container,
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
  Grid,
} from "@mui/material";
import { Close, Send } from "@mui/icons-material";
import Swal from "sweetalert2";
import { postContact } from "../../api";

export default function CTASection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
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
    if (!formData.fullName || !formData.email || !formData.message) {
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
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    setLoading(true);

    try {
      const data = await postContact(formData);

      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        confirmButtonColor: "#13ec13",
      });

      handleCloseDialog();
    } catch (err) {
      console.error("Error submitting form:", err);
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

  return (
    <Box
      sx={{
        pt: 0.75,
        pb: 0.75,
        px: 0,
        bgcolor: "#f6f8f6",
        position: "relative",
        overflow: "hidden",
        minHeight: "auto",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 0.75, sm: 0.75, md: 0.75 },
          pt: { xs: 0.375, sm: 0.375, md: 0.375 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: { xs: 3, md: 4 },
            backgroundColor: "#0d1b0d",
            py: { xs: 1.5, sm: 2, md: 2.5 },
            pb: { xs: 2.5, sm: 3, md: 3.5 },
            px: { xs: 0.75, sm: 0.75, md: 0.75 },
            border: "1px solid rgba(19, 236, 19, 0.15)", // Primary Green border
            minHeight: "auto",
            height: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              right: 0,
              top: 0,
              width: "33.333333%",
              height: "100%",
              background: "linear-gradient(to left, rgba(19, 236, 19, 0.2), transparent)",
            },
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 2,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              pb: 1,
            }}
          >
            <Fade in={isVisible} timeout={1000}>
              <Box sx={{ maxWidth: "672px", mx: "auto", display: "flex", flexDirection: "column", gap: 2, textAlign: "center" }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "1.875rem", md: "3rem" },
                    fontWeight: 900,
                    color: "white",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    textAlign: "center",
                  }}
                >
                  Ready to Transform Your Farm?
                </Typography>
                <Typography
                  sx={{
                    fontSize: "1.125rem",
                    color: "rgba(255, 255, 255, 0.7)",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  Connect with our specialists today to take your agribusiness to the next level of profitability and sustainability.
                </Typography>
              </Box>
            </Fade>
            <Fade in={isVisible} timeout={1200}>
              <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleOpenDialog}
                  sx={{
                    minWidth: "200px",
                    py: 1,
                    px: 4,
                    fontSize: "1rem",
                    fontWeight: 700,
                    borderRadius: 2,
                    backgroundColor: "#13ec13",
                    color: "#0d1b0d",
                    textTransform: "none",
                    boxShadow: "0 10px 15px -3px rgba(19, 236, 19, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 20px 25px -5px rgba(19, 236, 19, 0.3)",
                    },
                    "&:active": {
                      transform: "scale(0.95)",
                    },
                  }}
                >
                  Contact Us Now
                </Button>
              </Box>
            </Fade>
          </Box>
        </Box>
      </Container>

      {/* Contact Dialog */}
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
              fontFamily: '"Calibri Light", Calibri, sans-serif',
            }}
          >
            Contact Us
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
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
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
                value={formData.serviceType}
                onChange={(e) => handleInputChange("serviceType", e.target.value)}
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
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
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
            onClick={handleCloseDialog}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              color: "#000000",
              fontFamily: '"Calibri Light", Calibri, sans-serif',
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
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              px: 4,
              py: 1,
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              fontWeight: 700,
              fontFamily: '"Calibri Light", Calibri, sans-serif',
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
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
