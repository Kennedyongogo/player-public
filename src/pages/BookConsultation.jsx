import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ArrowBack, Send, CalendarToday, AccessTime } from "@mui/icons-material";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import { postConsultation } from "../api";

const MotionBox = motion(Box);

export default function BookConsultation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const prefill = location.state || {};
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    consultationType: prefill.consultationType || "",
    preferredDate: "",
    preferredTime: "",
    message: prefill.message || "",
  });

  useEffect(() => {
    // If user navigated here from a specific service card, prefill form fields.
    if (!prefill) return;
    setFormData((prev) => ({
      ...prev,
      consultationType: prefill.consultationType || prev.consultationType,
      message: prefill.message || prev.message,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.consultationType) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields (Full Name, Email, Phone, and Consultation Type).",
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
      const data = await postConsultation(formData);

      if (!data.success) {
        throw new Error(data.message || "Failed to book consultation");
      }

      Swal.fire({
        icon: "success",
        title: "Consultation Booked!",
        text: "Thank you for booking a consultation. We'll contact you soon to confirm your appointment.",
        confirmButtonColor: "#13ec13",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        consultationType: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      });
    } catch (err) {
      console.error("Error submitting consultation:", err);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Book a Consultation - MK Agribusiness Consultants</title>
        <meta
          name="description"
          content="Book a consultation with our agricultural experts. Get professional advice on farm business, project design, and sustainable agricultural growth."
        />
      </Helmet>
      <Box
        sx={{
          pt: 0.75,
          pb: 0.75,
          px: 0,
          bgcolor: "rgba(255, 255, 255, 0.5)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 255, 245, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)",
          position: "relative",
          overflow: "hidden",
          minHeight: "100vh",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(19, 236, 19, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.05) 0%, transparent 50%)",
            zIndex: 0,
          },
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 0.375, sm: 0.5, md: 0.75 },
            pt: { xs: 0.375, sm: 0.375, md: 0.375 },
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back Button */}
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/")}
              sx={{
                mt: 0.27,
                mb: 0.75,
                backgroundColor: "#13ec13",
                color: "#0d1b0d",
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                outline: "none",
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
                "&:hover": {
                  backgroundColor: "#11d411",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to Home
            </Button>

            <Paper
              elevation={0}
              sx={{
                py: { xs: 0.75, sm: 1, md: 1.25 },
                px: { xs: 1.5, sm: 1.5, md: 1.5 },
                borderRadius: { xs: 3, md: 4 },
                background: "#FFFFFF",
                border: "1px solid rgba(19, 236, 19, 0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                {/* Header */}
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      mb: 2,
                      color: "#0d1b0d",
                      fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.6rem" },
                      lineHeight: 1.2,
                    }}
                  >
                    Book a Consultation
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#000000",
                      fontSize: { xs: "1rem", md: "1.125rem" },
                      lineHeight: 1.7,
                      maxWidth: "700px",
                      mx: "auto",
                    }}
                  >
                    Schedule a consultation with our agricultural experts. Get personalized advice on
                    farm business, project design, and sustainable agricultural growth.
                  </Typography>
                </Box>

                {/* Consultation Form */}
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  id="consultation-form"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
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
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g., +254 700 123 456"
                    sx={{
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

                  {/* Consultation Type */}
                  <FormControl fullWidth required>
                    <InputLabel
                      sx={{
                        "&.Mui-focused": {
                          color: "#13ec13",
                        },
                      }}
                    >
                      Consultation Type
                    </InputLabel>
                    <Select
                      value={formData.consultationType}
                      onChange={(e) => handleInputChange("consultationType", e.target.value)}
                      label="Consultation Type"
                      sx={{
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
                      <MenuItem value="Farm Consultation">Farm Consultation</MenuItem>
                      <MenuItem value="Project Design & Development">Project Design & Development</MenuItem>
                      <MenuItem value="BSF Training & Setup">BSF Training & Setup</MenuItem>
                      <MenuItem value="Proposal Writing">Proposal Writing</MenuItem>
                      <MenuItem value="Agribusiness Planning">Agribusiness Planning</MenuItem>
                      <MenuItem value="Financial Planning">Financial Planning</MenuItem>
                      <MenuItem value="General Inquiry">General Inquiry</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Preferred Date and Time - calendar pickers */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    {/* Stack so each picker spans full width on every screen size */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <DatePicker
                        label="Preferred Date"
                        value={formData.preferredDate ? dayjs(formData.preferredDate) : null}
                        onChange={(newValue) =>
                          handleInputChange("preferredDate", newValue ? dayjs(newValue).format("YYYY-MM-DD") : "")
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
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
                              "& .MuiIconButton-root:focus, & .MuiIconButton-root:focus-visible": {
                                outline: "none",
                                boxShadow: "none",
                              },
                            },
                          },
                          openPickerButton: {
                            sx: {
                              color: "#13ec13",
                              "&:focus": { outline: "none" },
                              "&:focus-visible": { outline: "none", boxShadow: "none" },
                            },
                          },
                        }}
                        slots={{
                          openPickerIcon: CalendarToday,
                        }}
                        minDate={dayjs()}
                      />
                      <TimePicker
                        label="Preferred Time"
                        value={
                          formData.preferredTime
                            ? dayjs(`2000-01-01T${formData.preferredTime}`)
                            : null
                        }
                        onChange={(newValue) =>
                          handleInputChange("preferredTime", newValue ? dayjs(newValue).format("HH:mm") : "")
                        }
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            sx: {
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
                              "& .MuiIconButton-root:focus, & .MuiIconButton-root:focus-visible": {
                                outline: "none",
                                boxShadow: "none",
                              },
                            },
                          },
                          openPickerButton: {
                            sx: {
                              color: "#13ec13",
                              "&:focus": { outline: "none" },
                              "&:focus-visible": { outline: "none", boxShadow: "none" },
                            },
                          },
                        }}
                        slots={{
                          openPickerIcon: AccessTime,
                        }}
                      />
                    </Box>
                  </LocalizationProvider>

                  {/* Message */}
                  <TextField
                    fullWidth
                    label="Additional Notes or Questions"
                    multiline
                    rows={5}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us about your specific needs, questions, or any additional information that would help us prepare for your consultation..."
                    sx={{
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

                  {/* Submit Button */}
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                      sx={{
                        px: 6,
                        py: 1.5,
                        backgroundColor: "#13ec13",
                        color: "#0d1b0d",
                        fontWeight: 700,
                        textTransform: "none",
                        borderRadius: 2,
                        boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
                        outline: "none",
                        fontSize: { xs: "0.95rem", md: "1rem" },
                        "&:hover": {
                          backgroundColor: "#11d411",
                          transform: "translateY(-2px)",
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
                      {loading ? "Submitting..." : "Book Consultation"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </MotionBox>
        </Container>
      </Box>
    </>
  );
}
