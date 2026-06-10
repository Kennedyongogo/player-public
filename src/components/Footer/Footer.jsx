import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Chip,
  Divider,
  Fade,
  Slide,
} from "@mui/material";
import { Facebook, LinkedIn } from "@mui/icons-material";

// Custom TikTok icon
const TikTokIcon = ({ sx, ...props }) => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    sx={{
      width: 24,
      height: 24,
      ...sx,
    }}
    {...props}
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </Box>
);

export default function Footer() {
  const socialLinks = [
    {
      icon: <Facebook />,
      color: "#1877f2",
      label: "Facebook",
      url: "https://www.facebook.com/share/1C6X1m6eMT/?mibextid=wwXIfr",
    },
    {
      icon: <LinkedIn />,
      color: "#0077b5",
      label: "LinkedIn",
      url: "https://www.linkedin.com/company/mk-agribusiness-consultants/",
    },
    {
      icon: <TikTokIcon />,
      color: "#000000",
      label: "TikTok",
      url: "https://www.tiktok.com/@mk.agribusiness.c?_r=1&_t=ZS-946wdLts9rt",
    },
  ];

  const handleSocialClick = (url) => {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      component="footer"
      sx={{
        background: "#0d1b0d",
        pt: { xs: 0, sm: 0, md: 0 },
        pb: 0.4,
        mt: "auto",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 0.75, sm: 0.75, md: 0.75 },
          pt: 0,
          position: "relative",
          zIndex: 1,
        }}
      >
          <Box
            sx={{
              py: { xs: 0.75, sm: 0.875, md: 1 },
              px: { xs: 0.75, sm: 0.75, md: 0.75 },
            }}
          >
          <Fade in timeout={1000}>
            <Box>
              <Grid
                container
                spacing={{ xs: 1, sm: 1.5, md: 2 }}
                justifyContent="space-between"
              >
                <Grid item xs={12} sm={12} md={4}>
                  <Slide direction="up" in timeout={1200}>
                    <Box sx={{ textAlign: "left" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 0.75, sm: 1.5 },
                          mb: { xs: 0.5, sm: 0.75 },
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: "-4px",
                              left: "-4px",
                              right: "-4px",
                              bottom: "-4px",
                              background:
                                "linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                              borderRadius: "50%",
                              opacity: 0,
                              transition: "opacity 0.3s ease",
                            },
                            "&:hover::before": {
                              opacity: 1,
                            },
                          }}
                        >
                          <img
                            src="/images/ChatGPT Image Jan 25, 2026, 10_28_05 AM.png"
                            alt="MK Agribusiness Consultants Logo"
                            style={{
                              height: "44px",
                              maxHeight: "48px",
                              width: "auto",
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: 700,
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            background:
                              "linear-gradient(45deg, #13ec13, #ffffff)", // Green to White
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: { xs: "1.1rem", sm: "1.5rem" },
                          }}
                        >
                          Mk agribusiness consultants
                        </Typography>
                      </Box>

                      <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: { xs: 0.5, sm: 1 },
                            fontWeight: 600,
                            color: "#13ec13", // Green
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          Ready to Transform Your Farm?
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 0.5,
                            lineHeight: 1.6,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            fontSize: { xs: "1.1rem", sm: "1.2rem" },
                          }}
                        >
                          Connect with our specialists today to take your
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: { xs: 1, sm: 1.5 },
                            lineHeight: 1.6,
                            color: "rgba(255, 255, 255, 0.7)",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            fontSize: { xs: "1.1rem", sm: "1.2rem" },
                          }}
                        >
                          agribusiness to the next level of profitability and sustainability.
                        </Typography>
                      </Box>

                      {/* Mission Chips */}
                      <Box
                        sx={{
                          mb: { xs: 1, sm: 2 },
                          display: "flex",
                          flexWrap: "wrap",
                          gap: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        <Chip
                          label="Sustainability"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(45deg, #13ec13, #0d1b0d)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.4)",
                            },
                          }}
                        />
                        <Chip
                          label="Innovation"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(45deg, #0d1b0d, #13ec13)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.4)",
                            },
                          }}
                        />
                        <Chip
                          label="Profitability"
                          size="small"
                          sx={{
                            background:
                              "linear-gradient(45deg, #13ec13, #0d1b0d)",
                            color: "white",
                            fontWeight: 600,
                            fontSize: { xs: "0.7rem", sm: "0.75rem" },
                            "&:hover": {
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.4)",
                            },
                          }}
                        />
                      </Box>

                      {/* Social Media Icons - mobile/tablet */}
                      <Box sx={{ display: { xs: "block", md: "none" } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: { xs: 0.5, sm: 1 },
                            fontWeight: 600,
                            color: "white",
                            fontFamily: '"Calibri Light", Calibri, sans-serif',
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                          }}
                        >
                          Follow Us
                        </Typography>
                        <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                          {socialLinks.map((social, index) => (
                            <IconButton
                              key={index}
                              aria-label={social.label}
                              onClick={() => handleSocialClick(social.url)}
                              sx={{
                                color: "rgba(255, 255, 255, 0.8)",
                                background: "rgba(19, 236, 19, 0.05)",
                                border: "1px solid rgba(19, 236, 19, 0.1)",
                                transition:
                                  "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                outline: "none",
                                "&:focus": {
                                  outline: "none",
                                },
                                "&:focus-visible": {
                                  outline: "none",
                                },
                                "&:hover": {
                                  background: social.color,
                                  color: "white",
                                  border: `1px solid ${social.color}`,
                                  transform: "translateY(-3px) scale(1.1)",
                                  boxShadow: `0 8px 25px ${social.color}40`,
                                },
                              }}
                            >
                              {social.icon}
                            </IconButton>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Slide>
                </Grid>

                {/* Social media right column on desktop */}
                <Grid item xs={12} sm={12} md={4} sx={{ display: { xs: "none", md: "flex" } }}>
                  <Slide direction="up" in timeout={1600}>
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        textAlign: "right",
                        gap: 1,
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          background:
                            "linear-gradient(45deg, #13ec13, #ffffff)", // Green to White
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: { xs: "1.1rem", sm: "1.4rem" },
                        }}
                      >
                        Follow Us
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {socialLinks.map((social, index) => (
                          <IconButton
                            key={index}
                            aria-label={social.label}
                            onClick={() => handleSocialClick(social.url)}
                            sx={{
                              color: "rgba(255, 255, 255, 0.8)",
                              background: "rgba(19, 236, 19, 0.05)",
                              border: "1px solid rgba(19, 236, 19, 0.1)",
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              outline: "none",
                              "&:focus": {
                                outline: "none",
                              },
                              "&:focus-visible": {
                                outline: "none",
                              },
                              "&:hover": {
                                background: social.color,
                                color: "white",
                                border: `1px solid ${social.color}`,
                                transform: "translateY(-3px) scale(1.1)",
                                boxShadow: `0 8px 25px ${social.color}40`,
                              },
                            }}
                          >
                            {social.icon}
                          </IconButton>
                        ))}
                      </Box>
                    </Box>
                  </Slide>
                </Grid>

                {/* Contact column removed */}
              </Grid>

              {/* Copyright Section */}
              <Fade in timeout={2000}>
                <Box>
                  <Divider
                    sx={{
                      my: 1,
                      borderColor: "rgba(139, 115, 85, 0.2)", // Secondary Brown
                      "&::before, &::after": {
                        borderColor: "rgba(139, 115, 85, 0.1)",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: { xs: 0.75, sm: 0.875 },
                      textAlign: "center",
                      pt: 0.15,
                      pb: 0.05,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontWeight: 500,
                        fontSize: { xs: "0.85rem", sm: "0.95rem" },
                      }}
                    >
                      © {new Date().getFullYear()} Mk agribusiness consultants. All rights
                      reserved.
                    </Typography>
                    <Box
                      sx={{
                        py: { xs: 0.15, sm: 0.18 },
                        px: { xs: 0.45, sm: 0.5 },
                        background: "rgba(255, 255, 255, 0.1)", // subtle white
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        textAlign: "center",
                        minWidth: "auto",
                        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        "&:hover": {
                          background: "rgba(255, 255, 255, 0.2)",
                          boxShadow: "0 10px 32px rgba(0, 0, 0, 0.16)",
                          backdropFilter: "blur(14px)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "white",
                          fontWeight: 700,
                          fontSize: { xs: "0.78rem", sm: "0.9rem" },
                        }}
                      >
                        developed by Carlvyne Technologies ltd
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Fade>
            </Box>
          </Fade>
        </Box>
      </Container>
    </Box>
  );
}
