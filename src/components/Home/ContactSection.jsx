import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Card,
} from "@mui/material";
import { LocationOn, Email, Phone, Language } from "@mui/icons-material";

export default function ContactSection() {
  return (
    <Box
      id="contact-section"
      sx={{
        position: "relative",
        pt: 0,
        pb: { xs: 0.5, sm: 0.75, md: 1 },
        px: 0,
        background: "rgba(255, 255, 255, 0.5)",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Card
        sx={{
          mx: { xs: 0.75, sm: 0.75, md: 0.75 },
          mt: 0.75,
          mb: 0.2,
          borderRadius: { xs: 3, md: 4 },
          background: "#FFFFFF",
          border: "1px solid rgba(15, 189, 15, 0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth={false}
          disableGutters
          sx={{
            px: 0,
            width: "100%",
          }}
        >
          <Box
            sx={{
              py: { xs: 2, sm: 2.5, md: 3 },
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <Stack spacing={1}>
              <Stack
                spacing={0.75}
                alignItems="center"
                textAlign="center"
                sx={{ width: "100%", px: 1 }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: 2,
                    color: "#13ec13",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  Get in touch
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: "#0d1b0d",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    lineHeight: 1.2,
                    fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem" },
                  }}
                >
                  Start Your <span style={{ color: "#13ec13" }}>Agricultural Journey</span> with Us
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#000000",
                    fontFamily: '"Calibri Light", Calibri, sans-serif',
                    lineHeight: 1.7,
                    maxWidth: 800,
                    fontSize: { xs: "1rem", md: "1.125rem" },
                    mb: 2,
                  }}
                >
                  Whether you're looking to optimize your current farm operations or start a 
                  new sustainable project, our team is ready to guide you every step of the way.
                </Typography>
              </Stack>

              <Box 
                sx={{ 
                  display: "flex", 
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 2,
                  width: "100%",
                  boxSizing: "border-box",
                  px: { xs: 1, sm: 1, md: 1 },
                }}
              >
                {[
                  {
                    icon: <Phone sx={{ fontSize: 20 }} />,
                    label: "Phone/WhatsApp",
                    value: "+254 769963782",
                    color: "#13ec13",
                  },
                  {
                    icon: <Email sx={{ fontSize: 20 }} />,
                    label: "Email",
                    value: "mkagribusinessconsultants@gmail.com",
                    color: "#0d1b0d",
                  },
                  {
                    icon: <LocationOn sx={{ fontSize: 20 }} />,
                    label: "Location",
                    value: "Nairobi, Kenya",
                    color: "#13ec13",
                  },
                  {
                    icon: <Language sx={{ fontSize: 20 }} />,
                    label: "Website",
                    value: "www.mkagribusinessconsultancy.com",
                    color: "#0d1b0d",
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      flex: { xs: "0 0 calc(50% - 8px)", md: "1 1 0" },
                      minWidth: 0,
                      p: 3,
                      borderRadius: 4,
                      background: item.color === "#13ec13" 
                        ? "rgba(19, 236, 19, 0.04)" 
                        : "rgba(13, 27, 13, 0.04)",
                      border: `1px solid ${item.color}15`,
                      transition: "all 0.35s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "180px",
                      boxSizing: "border-box",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                        borderColor: `${item.color}40`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "12px",
                        background: item.color,
                        color: "white",
                        boxShadow: `0 8px 20px ${item.color}33`,
                        mb: 1.5,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: "#0d1b0d",
                          fontFamily: '"Calibri Light", Calibri, sans-serif',
                          textTransform: "uppercase",
                          letterSpacing: 1,
                          fontSize: "0.75rem",
                          mb: 0.5,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000",
                          fontFamily: '"Calibri Light", Calibri, sans-serif',
                          lineHeight: 1.4,
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

                {/* <Box 
                  sx={{ 
                    display: "flex", 
                    flexDirection: { xs: "column", sm: "row" }, 
                    flexWrap: { xs: "nowrap", sm: "wrap", md: "nowrap" },
                    gap: 2,
                    width: "100%",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    px: { xs: 0, sm: 0, md: 0 },
                  }}
                >
                  {[
                    {
                      icon: <Phone sx={{ fontSize: 20 }} />,
                      label: "Phone/WhatsApp",
                      value: "+254 769963782",
                      color: "#13ec13",
                    },
                    {
                      icon: <Email sx={{ fontSize: 20 }} />,
                      label: "Email",
                      value: "mkagribusinessconsultants@gmail.com",
                      color: "#0d1b0d",
                    },
                    {
                      icon: <LocationOn sx={{ fontSize: 20 }} />,
                      label: "Location",
                      value: "Nairobi, Kenya",
                      color: "#13ec13",
                    },
                    {
                      icon: <Language sx={{ fontSize: 20 }} />,
                      label: "Website",
                      value: "www.mkagribusinessconsultancy.com",
                      color: "#0d1b0d",
                    },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        flex: { 
                          xs: "1 1 100%", 
                          sm: "0 0 calc(50% - 8px)", 
                          md: "0 0 calc(25% - 12px)" 
                        },
                        minWidth: 0,
                        maxWidth: { 
                          xs: "100%", 
                          sm: "calc(50% - 8px)", 
                          md: "calc(25% - 12px)" 
                        },
                        width: { 
                          xs: "100%", 
                          sm: "calc(50% - 8px)", 
                          md: "calc(25% - 12px)" 
                        },
                        p: 3,
                        borderRadius: 4,
                        background: item.color === "#13ec13" 
                          ? "rgba(19, 236, 19, 0.04)" 
                          : "rgba(13, 27, 13, 0.04)",
                        border: `1px solid ${item.color}15`,
                        transition: "all 0.35s ease",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "180px",
                        boxSizing: "border-box",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
                          borderColor: `${item.color}40`,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "12px",
                          background: item.color,
                          color: "white",
                          boxShadow: `0 8px 20px ${item.color}33`,
                          mb: 1.5,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: "#0d1b0d",
                            textTransform: "uppercase",
                            letterSpacing: 1,
                            fontSize: "0.75rem",
                            mb: 0.5,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#000000",
                            lineHeight: 1.4,
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box> */}
            </Stack>
          </Box>
        </Container>
      </Card>
    </Box>
  );
}
