import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Rating,
  Avatar,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import { LocationOn, CalendarToday, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const REVIEWS_API = "/api/reviews/approved";
const SERVICES_API = "/api/services/public";

const buildImageUrl = (path) => {
  if (!path) return null;
  const normalized = String(path).replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
};

export default function BackgroundImageSection() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch approved reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${REVIEWS_API}?limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON");
        const text = await res.text();
        if (!text || !text.trim()) throw new Error("Empty response");
        const data = JSON.parse(text);
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setReviews(data.data);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error("Error loading reviews:", err);
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  // Fetch background images from all published services (any service with an image)
  useEffect(() => {
    const fetchBackgroundImages = async () => {
      try {
        const response = await fetch(`${SERVICES_API}?limit=100`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON");
        const text = await response.text();
        if (!text || !text.trim()) throw new Error("Empty response");
        const data = JSON.parse(text);
        const services = data.success && Array.isArray(data.data) ? data.data : [];
        const imageUrls = services
          .filter((s) => s.image)
          .map((s) => buildImageUrl(s.image))
          .filter(Boolean);
        setBackgroundImages(imageUrls);
      } catch (error) {
        console.error("Failed to fetch background images:", error);
        setBackgroundImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBackgroundImages();
  }, []);

  // Rotate reviews independently
  useEffect(() => {
    // Only start the rotation if we have reviews
    if (reviews.length === 0) return;

    const interval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(interval);
  }, [reviews]);

  // Rotate background images independently
  useEffect(() => {
    // Only start the rotation if we have background images
    if (backgroundImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBackgroundIndex(
        (prevIndex) => (prevIndex + 1) % backgroundImages.length
      );
    }, 4000); // Change background image every 4 seconds

    return () => clearInterval(interval);
  }, [backgroundImages]);

  return (
    <Box
      data-section="reviews"
      id="reviews-section"
      sx={{
        pt: { xs: 0, sm: 0, md: 0 },
        pb: { xs: 0.25, sm: 0.375, md: 0.5 },
        position: "relative",
        zIndex: 1,
        backgroundColor: "#f6f8f6", // Light green-tinted background
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Card
        sx={{
          mx: { xs: 0.375, sm: 0.375, md: 0.375 },
          borderRadius: { xs: 3, md: 4 },
          background: "#FFFFFF",
          border: "1px solid rgba(19, 236, 19, 0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: { xs: "visible", sm: "hidden" },
        }}
      >
        {/* Full Width Background Images */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          {backgroundImages.length > 0 ? (
            backgroundImages.map((imageUrl, index) => (
              <Box
                key={`${imageUrl}-${index}`}
                component="img"
                src={imageUrl}
                alt={`Background ${index + 1}`}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: index === currentBackgroundIndex ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop";
                }}
              />
            ))
          ) : (
            // Loading placeholder - solid background until images load
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "linear-gradient(135deg, #13ec13 0%, #11d411 100%)",
                opacity: 0.8,
              }}
            />
          )}
        </Box>
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 0.75, sm: 0.75, md: 0.75 },
            pt: { xs: 0.5, sm: 0, md: 0 },
            pb: { xs: 0.5, sm: 0, md: 0 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              minHeight: { xs: "350px", sm: "300px", md: "350px" },
              position: "relative",
              overflow: { xs: "visible", sm: "hidden" },
            }}
          >
            {/* Vintage Style Heading for Reviews */}
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 0.5, sm: 0.75, md: 1 },
                position: "relative",
                py: { xs: 0.5, sm: 0.75, md: 1 },
                zIndex: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Calibri Light", Calibri, sans-serif',
                  fontSize: {
                    xs: "1.5rem",
                    sm: "2rem",
                    md: "2.5rem",
                    lg: "3rem",
                  },
                  fontWeight: 900,
                  color: "#000000",
                  letterSpacing: "0.03em",
                  lineHeight: 1.1,
                  display: "inline-block",
                  position: "relative",
                  textShadow: "2px 2px 4px rgba(255, 255, 255, 0.8)",
                }}
              >
                MK Agribusiness Testimonials
              </Typography>
            </Box>

            {/* Single Testimonial Card Overlay - Centered and Transitioning */}
            {reviews.length > 0 && (
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: { xs: "250px", sm: "300px", md: "350px" },
                  p: { xs: 0.5, sm: 1, md: 1.5 },
                  pt: { xs: 1, sm: 1, md: 1.5 },
                  pb: { xs: 2.5, sm: 1, md: 1.5 },
                  mt: { xs: 0.5, sm: 0, md: 0 },
                  mb: { xs: 1.5, sm: 0, md: 0 },
                }}
              >
                {reviews.map((review, index) => (
                  <Box
                    key={review.id}
                    sx={{
                      position: "absolute",
                      width: { xs: "95%", sm: "90%", md: "600px" },
                      maxWidth: { xs: "400px", sm: "500px", md: "600px" },
                      left: "50%",
                      top: "50%",
                      transform: index === currentReviewIndex
                        ? "translateX(-50%) translateY(-50%) scale(1)"
                        : "translateX(-50%) translateY(-30%) scale(0.95)",
                      opacity: index === currentReviewIndex ? 1 : 0,
                      transition:
                        "opacity 1s ease-in-out, transform 1s ease-in-out",
                      pointerEvents:
                        index === currentReviewIndex ? "auto" : "none",
                      zIndex: index === currentReviewIndex ? 2 : 1,
                    }}
                  >
                    <Card
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: { xs: 2, sm: 2.5, md: 3 },
                        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 } }}>
                        {/* User Info */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: { xs: 1.5, sm: 2, md: 2.5 },
                          }}
                        >
                          <Avatar
                            alt={review.name}
                            sx={{
                              width: { xs: 40, sm: 48, md: 64 },
                              height: { xs: 40, sm: 48, md: 64 },
                              mr: { xs: 1, sm: 1.5, md: 2 },
                            }}
                          >
                            {review.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                                mb: 0.5,
                                color: "#000000",
                                fontFamily: '"Calibri Light", Calibri, sans-serif',
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
                                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Comment */}
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#000000",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            mb: { xs: 1.5, sm: 2, md: 2.5 },
                            fontSize: { xs: "0.875rem", sm: "1rem", md: "1.4rem" },
                            lineHeight: { xs: 1.5, sm: 1.6, md: 1.7 },
                            fontStyle: "italic",
                          }}
                        >
                          "{review.comment}"
                        </Typography>

                        {/* Destination and Date */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: { xs: 1, sm: 1.25, md: 1.5 },
                            pt: { xs: 1.5, sm: 1.75, md: 2 },
                            borderTop: "1px solid rgba(0,0,0,0.1)",
                          }}
                        >
                          {review.location && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                              }}
                            >
                              <LocationOn
                                sx={{
                                  fontSize: { xs: 16, sm: 18, md: 20 },
                                  color: "#000000",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
                                  color: "#000000",
                                  fontFamily: '"Calibri Light", Calibri, sans-serif',
                                  fontWeight: 500,
                                }}
                              >
                                {review.location}
                              </Typography>
                            </Box>
                          )}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                            }}
                          >
                            <CalendarToday
                              sx={{
                                fontSize: { xs: 16, sm: 18, md: 20 },
                                color: "#000000",
                              }}
                            />
<Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.875rem" },
                              color: "#000000",
                              fontFamily: '"Calibri Light", Calibri, sans-serif',
                            }}
                          >
                            {formatDate(review.createdAt)}
                          </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                ))}
              </Box>
            )}

            {/* View All Button - Centered below review card */}
            {reviews.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: { xs: 2, sm: 1.25, md: 1.5 },
                  mb: { xs: 0.5, sm: 0.75, md: 1 },
                  position: "relative",
                  zIndex: 3,
                  pt: { xs: 1, sm: 0, md: 0 },
                }}
              >
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/reviews")}
                  sx={{
                    backgroundColor: "#13ec13", // Primary Green
                    color: "#0d1b0d",
                    fontWeight: 700,
                    textTransform: "none",
                    fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
                    px: { xs: 1, sm: 1.25, md: 1.5 },
                    py: { xs: 0.375, sm: 0.5, md: 0.625 },
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: "#11d411", // Darker Green
                      color: "#0d1b0d",
                    },
                    "&:focus": {
                      outline: "none",
                      backgroundColor: "#13ec13",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      backgroundColor: "#13ec13",
                    },
                    boxShadow: "0 2px 8px rgba(19, 236, 19, 0.3)",
                  }}
                >
                  View All
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Card>
    </Box>
  );
}
