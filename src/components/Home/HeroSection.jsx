import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Box, Button, Container, Fade } from "@mui/material";

export default function HeroSection() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Detect when hero section is visible and notify header
  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
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
      id="hero-section"
      sx={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        marginTop: "-80px",
      }}
    >
      {/* Hero Section with Full Screen Corn Image */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `linear-gradient(rgba(16, 34, 16, 0.7) 0%, rgba(16, 34, 16, 0.5) 100%), url("/corn-field-440338_1280.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: "relative", 
            zIndex: 2,
            px: { xs: 3, md: 5 },
          }}
        >
          <Fade in={isVisible} timeout={1000}>
            <Box
              sx={{
                maxWidth: "768px",
                mx: "auto",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                fontFamily: '"Calibri Light", Calibri, sans-serif',
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.25rem", md: "3.75rem" },
                    fontWeight: 600,
                    color: "white",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    lineHeight: 1.2,
                  }}
                >
                  Empowering Farmers, Transforming Agribusiness
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "1.125rem", md: "1.25rem" },
                    fontWeight: 400,
                    color: "rgba(255, 255, 255, 0.9)",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    lineHeight: 1.6,
                  }}
                >
                  Professional consultancy services dedicated to farm business excellence and sustainable agricultural growth through innovation and expertise.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/book-consultation")}
                  sx={{
                    minWidth: "160px",
                    py: 2,
                    px: 4,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: "#13ec13",
                    color: "#0d1b0d",
                    textTransform: "none",
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
                  Book a Consultation
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/staff")}
                  sx={{
                    minWidth: "160px",
                    py: 2,
                    px: 4,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    borderColor: "rgba(255, 255, 255, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(12px)",
                    color: "white",
                    textTransform: "none",
                    "&:focus": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                      boxShadow: "none",
                    },
                    "&:hover": {
                      borderColor: "rgba(255, 255, 255, 0.3)",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                >
                  Talk to Our Experts
                </Button>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>
    </Box>
  );
}
