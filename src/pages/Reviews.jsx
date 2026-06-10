import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Rating,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Autocomplete,
} from "@mui/material";
import { motion } from "framer-motion";
import { LocationOn, CalendarToday, Send, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const MotionBox = motion(Box);

const REVIEWS_API = "/api/reviews/approved";

// All 47 counties of Kenya (alphabetical)
const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa",
  "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi",
  "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu",
  "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa",
  "Murang'a", "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

export default function Reviews() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    comment: "",
    rating: 0,
    recommend: false,
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (err) {
      return dateString;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchReviews = async () => {
    try {
      setListLoading(true);
      const res = await fetch(`${REVIEWS_API}?limit=100`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data) && data.data.length > 0) {
        setReviews(data.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit review");
      }

      Swal.fire({
        icon: "success",
        title: "Thank you!",
        text: "Your review was submitted and is awaiting approval.",
        confirmButtonColor: "#13ec13",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        comment: "",
        rating: 0,
        recommend: false,
      });
      // Refresh list (will show once approved)
      fetchReviews();
    } catch (err) {
      console.error("Error submitting review:", err);
      Swal.fire({
        icon: "error",
        title: "Submission failed",
        text: err.message || "Please try again.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        pt: 1.5,
        pb: 0.75,
        px: 0,
        bgcolor: "#f6f8f6", // Light green-tinted background
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
          pt: { xs: 0.75, sm: 0.75, md: 0.75 },
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
            onClick={() => {
              navigate("/");
              setTimeout(() => {
                // Scroll to the reviews section (BackgroundImageSection)
                const reviewsSection = document.getElementById("reviews-section");
                if (reviewsSection) {
                  reviewsSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }, 100);
            }}
            sx={{
              mt: 0.07,
              mb: 0.5,
              backgroundColor: "#13ec13", // Primary Green
              color: "#0d1b0d",
              fontWeight: 700,
              outline: "none",
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
              "&:hover": {
                backgroundColor: "#11d411", // Darker Green
                color: "#0d1b0d",
              },
            }}
          >
            Back to Reviews Section
          </Button>

          <Paper
            elevation={3}
            sx={{
              py: { xs: 1.5, sm: 2, md: 2.5 },
              px: { xs: 0.75, sm: 0.75, md: 0.75 },
              borderRadius: { xs: 3, md: 4 },
              background: "#FFFFFF",
              border: "1px solid rgba(19, 236, 19, 0.15)", // Primary Green border
              minHeight: "auto",
              height: "auto",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant="h2"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                  fontSize: { xs: "1.5rem", sm: "1.8rem", md: "2.2rem" },
                  color: "#000000",
                  fontFamily: '"Calibri Light", Calibri, sans-serif',
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: { xs: "60px", sm: "70px", md: "80px" },
                    height: "4px",
                    background: "linear-gradient(45deg, #13ec13, #11d411)", // Green gradient
                    borderRadius: "2px",
                  },
                }}
              >
                Customer Reviews
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 1,
                  maxWidth: { xs: "100%", sm: "800px", md: "900px" },
                  mx: "auto",
                  px: { xs: 1, sm: 0 },
                  fontWeight: 500,
                  fontSize: { xs: "0.85rem", sm: "0.95rem", md: "1rem" },
                  lineHeight: 1.6,
                  color: "#000000",
                }}
              >
                Read what our clients have to say about their agribusiness experiences
              </Typography>
            </Box>

            {/* Reviews Grid - 4 cards per row */}
            <Grid
              container
              spacing={{ xs: 2, sm: 2.5, md: 3 }}
              justifyContent="center"
            >
              {listLoading && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 6,
                    }}
                  >
                    <CircularProgress sx={{ color: "#13ec13" }} />
                  </Box>
                </Grid>
              )}
              {!listLoading && reviews.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 4,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ color: "#000000", fontWeight: 600 }}
                    >
                      No reviews available yet.
                    </Typography>
                  </Box>
                </Grid>
              )}
              {!listLoading &&
                reviews.map((review, index) => (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3,
                  }}
                  key={review.id}
                >
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: { xs: "auto", sm: "320px", md: "340px" },
                        minHeight: { xs: "280px", sm: "320px", md: "340px" },
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition:
                          "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          flexGrow: 1,
                          p: { xs: 2, sm: 2.5, md: 3 },
                          display: "flex",
                          flexDirection: "column",
                          height: "100%",
                        }}
                      >
                        {/* User Info */}
                        <Box
                          sx={{
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: "1rem", md: "1.125rem" },
                              mb: 0.5,
                              color: "#000000",
                            }}
                          >
                            {review.name}
                          </Typography>
                          <Rating
                            value={review.rating}
                            readOnly
                            precision={0.5}
                            size="small"
                            sx={{
                            "& .MuiRating-iconFilled": {
                                color: "#13ec13", // Primary Green
                            },
                            }}
                          />
                        </Box>

                        {/* Comment */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#000000",
                            mb: 2,
                            fontSize: { xs: "0.95rem", md: "1rem" },
                            lineHeight: 1.6,
                            fontStyle: "italic",
                            fontWeight: 600,
                            flexGrow: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          "{review.comment}"
                        </Typography>

                        {/* Destination and Date */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                            pt: 1.5,
                            borderTop: "1px solid rgba(0,0,0,0.1)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <LocationOn
                              sx={{
                                fontSize: { xs: 16, md: 18 },
                                color: "#13ec13", // Primary Green
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                color: "#000000",
                                fontWeight: 600,
                              }}
                            >
                          {review.location || "—"}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarToday
                              sx={{
                                fontSize: { xs: 16, md: 18 },
                                color: "#000000",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: { xs: "0.85rem", md: "0.95rem" },
                                color: "#000000",
                                fontWeight: 600,
                              }}
                            >
                              {formatDate(review.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </MotionBox>
                </Grid>
              ))}
            </Grid>

            {/* Review Submission Form */}
            <Box sx={{ mt: { xs: 2, sm: 2.5, md: 3 } }}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: 3, md: 4 },
                  background: "#FFFFFF",
                  border: "1px solid rgba(19, 236, 19, 0.15)", // Primary Green border
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    mb: 1,
                    fontWeight: 700,
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" },
                    color: "#000000",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    textAlign: "center",
                  }}
                >
                  Share Your Experience
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 3,
                    color: "#000000",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    textAlign: "center",
                  }}
                >
                  We'd love to hear about your experience with MK Agribusiness!
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                    {/* Name */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        sx={{
                          "& .MuiInputLabel-root": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
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
                    </Grid>

                    {/* Email */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        sx={{
                          "& .MuiInputLabel-root": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
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
                    </Grid>

                    {/* Phone */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        sx={{
                          "& .MuiInputLabel-root": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
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
                    </Grid>

                    {/* Location – all 47 Kenyan counties (searchable) */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Autocomplete
                        value={formData.location || null}
                        onChange={(_, newValue) => handleInputChange("location", newValue || "")}
                        options={KENYA_COUNTIES}
                        getOptionLabel={(option) => option || ""}
                        isOptionEqualToValue={(option, value) => option === value}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="County"
                            placeholder="Search or select county..."
                            sx={{
                              "& .MuiInputLabel-root": {
                                color: "#000000",
                                fontFamily: '"Calibri Light", Calibri, sans-serif',
                              },
                              "& .MuiOutlinedInput-input": {
                                color: "#000000",
                                fontFamily: '"Calibri Light", Calibri, sans-serif',
                              },
                              "& .MuiOutlinedInput-input::placeholder": {
                                color: "#000000",
                                opacity: 0.85,
                              },
                              "& .MuiOutlinedInput-root": {
                                backgroundColor: "white",
                                borderRadius: 2,
                                "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                                "&:hover fieldset": { borderColor: "#13ec13" },
                                "&.Mui-focused fieldset": { borderColor: "#13ec13", borderWidth: "2px" },
                              },
                              "& .MuiInputLabel-root.Mui-focused": { color: "#13ec13" },
                            }}
                          />
                        )}
                        ListboxProps={{
                          sx: {
                            maxHeight: 320,
                            "& .MuiAutocomplete-option": {
                              py: 1.25,
                              fontSize: "0.9375rem",
                            },
                          },
                        }}
                        slotProps={{
                          popper: {
                            sx: {
                              "& .MuiAutocomplete-listbox": {
                                "& .MuiAutocomplete-option[aria-selected='true']": {
                                  bgcolor: "rgba(19, 236, 19, 0.12)",
                                },
                                "& .MuiAutocomplete-option.Mui-focused": {
                                  bgcolor: "rgba(19, 236, 19, 0.08)",
                                },
                              },
                            },
                          },
                        }}
                        noOptionsText="No county found"
                      />
                    </Grid>

                    {/* Star Rating */}
                    <Grid size={{ xs: 12 }}>
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          }}
                        >
                          Your Rating *
                        </Typography>
                        <Rating
                          value={formData.rating}
                          onChange={(event, newValue) => {
                            handleInputChange("rating", newValue);
                          }}
                          size="large"
                          sx={{
                            "& .MuiRating-iconFilled": {
                              color: "#13ec13", // Primary Green
                            },
                            "& .MuiRating-label": {
                              color: "#000000",
                              fontFamily: '"Calibri Light", Calibri, sans-serif',
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Comment */}
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        label="Your Review Comment"
                        multiline
                        rows={4}
                        required
                        value={formData.comment}
                        onChange={(e) => handleInputChange("comment", e.target.value)}
                        placeholder="Share your experience with MK Agribusiness Consultants..."
                        sx={{
                          "& .MuiInputLabel-root": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                          },
                          "& .MuiOutlinedInput-input::placeholder": {
                            color: "#000000",
                            opacity: 0.85,
                          },
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
                    </Grid>

                    {/* Recommend Checkbox */}
                    <Grid size={{ xs: 12 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={formData.recommend}
                            onChange={(e) => handleInputChange("recommend", e.target.checked)}
                            sx={{
                            color: "#13ec13", // Primary Green
                            "&.Mui-checked": {
                              color: "#13ec13",
                            },
                            }}
                          />
                        }
                        label={
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              color: "#000000",
                              fontFamily: '"Calibri Light", Calibri, sans-serif',
                            }}
                          >
                            Would you recommend us to your friends?
                          </Typography>
                        }
                      />
                    </Grid>

                    {/* Submit Button */}
                    <Grid size={{ xs: 12 }}>
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Send />}
                          disabled={loading || !formData.name || !formData.email || !formData.comment || formData.rating === 0}
                          sx={{
                            backgroundColor: "#13ec13", // Primary Green
                            color: "#0d1b0d",
                            px: { xs: 4, sm: 5, md: 6 },
                            py: { xs: 1.25, sm: 1.5 },
                            borderRadius: 3,
                            fontSize: { xs: "0.875rem", md: "1rem" },
                            fontWeight: 600,
                            textTransform: "none",
                            boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
                            "&:hover": {
                              backgroundColor: "#11d411", // Darker Green
                              boxShadow: "0 6px 16px rgba(17, 212, 17, 0.4)",
                              transform: "translateY(-2px)",
                            },
                            "&:disabled": {
                              backgroundColor: "#ccc",
                              color: "white",
                            },
                            transition: "all 0.3s ease",
                          }}
                        >
                          {loading ? "Submitting..." : "Submit Review"}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}

