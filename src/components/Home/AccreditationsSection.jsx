import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const FAQS_API = "/api/faqs/public";

export default function AccreditationsSection() {
  const [expanded, setExpanded] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(FAQS_API);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setFaqs(data.data);
        } else {
          setFaqs([]);
        }
      } catch (err) {
        console.error("Error loading FAQs:", err);
        setError(err.message || "Failed to load FAQs");
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        pt: 0,
        pb: 0,
        position: "relative",
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Card
        sx={{
          mx: { xs: 0.75, sm: 0.75, md: 0.75 },
          mt: 0.75,
          mb: 0.75,
          borderRadius: { xs: 3, md: 4 },
          background: "#FFFFFF",
          border: "1px solid rgba(15, 189, 15, 0.15)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth={false} disableGutters sx={{ px: 0, width: "100%" }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            sx={{
              py: { xs: 3, md: 4 },
              px: 0,
              width: "100%",
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 }, px: 2 }}>
              <Typography
                sx={{
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#13ec13",
                  fontFamily: '"Calibri Light", Calibri, sans-serif',
                  mb: 1.5,
                }}
              >
                Got Questions?
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  color: "#0d1b0d",
                  fontFamily: '"Calibri Light", Calibri, sans-serif',
                  fontSize: { xs: "2.25rem", md: "3rem" },
                }}
              >
                Frequently Asked <span style={{ color: "#13ec13" }}>Questions</span>
              </Typography>
              <Box
                sx={{
                  width: 60,
                  height: 4,
                  bgcolor: "#13ec13",
                  mx: "auto",
                  borderRadius: 2,
                }}
              />
            </Box>

            {/* FAQ List – padding keeps all cards (including expanded) aligned; no margin on accordions */}
            <Box sx={{ width: "100%", px: { xs: 2, md: 3 }, boxSizing: "border-box" }}>
              {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress sx={{ color: "#13ec13" }} />
                </Box>
              ) : error ? (
                <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
                  <Typography sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" }}>
                    Unable to load FAQs. Please try again later.
                  </Typography>
                </Box>
              ) : faqs.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
                  <Typography sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" }}>
                    No FAQs at the moment.
                  </Typography>
                </Box>
              ) : (
                faqs.map((faq, index) => (
                  <Accordion
                    key={faq.id || index}
                    expanded={expanded === `panel${index}`}
                    onChange={handleChange(`panel${index}`)}
                    elevation={0}
                    sx={{
                      mb: 2,
                      mx: 0,
                      width: "100%",
                      boxSizing: "border-box",
                      background: "#f8f9f8", // Subtle off-white background for distinction
                      border: "1px solid rgba(15, 189, 15, 0.2)", // More visible border
                      borderRadius: "16px !important",
                      overflow: "hidden",
                      transition: "border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)", // Subtle shadow for depth
                      "&::before": { display: "none" },
                      "&:hover": {
                        borderColor: "rgba(19, 236, 19, 0.4)",
                        bgcolor: "rgba(19, 236, 19, 0.05)",
                        boxShadow: "0 4px 12px rgba(19, 236, 19, 0.15)",
                        transform: "translateY(-2px)", // Slight lift on hover
                      },
                      ...(expanded === `panel${index}` && {
                        borderColor: "#13ec13",
                        bgcolor: "rgba(19, 236, 19, 0.08)",
                        boxShadow: "0 8px 25px rgba(19, 236, 19, 0.2)",
                      }),
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            color: expanded === `panel${index}` ? "#13ec13" : "#000000",
                          }}
                        />
                      }
                      sx={{
                        px: { xs: 2, md: 3 },
                        py: 1,
                        outline: "none",
                        "&:focus": { outline: "none", boxShadow: "none" },
                        "&:focus-visible": { outline: "none", boxShadow: "none" },
                        "& .MuiAccordionSummary-content": {
                          alignItems: "center",
                          gap: 2,
                        },
                        "& .MuiAccordionSummary-expandIconWrapper": {
                          "&:focus": { outline: "none", boxShadow: "none" },
                          "&:focus-visible": { outline: "none", boxShadow: "none" },
                        },
                        "& .MuiButtonBase-root": {
                          "&:focus": { outline: "none", boxShadow: "none" },
                          "&:focus-visible": { outline: "none", boxShadow: "none" },
                        },
                      }}
                    >
                      <HelpOutlineIcon
                        sx={{
                          color: expanded === `panel${index}` ? "#13ec13" : "#13ec13",
                          fontSize: "1.5rem",
                          opacity: 0.8,
                        }}
                      />
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: "1rem", md: "1.125rem" },
                          color: expanded === `panel${index}` ? "#0d1b0d" : "#000000",
                          fontFamily: '"Calibri Light", Calibri, sans-serif',
                          transition: "color 0.3s ease",
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{
                        px: { xs: 2, md: 3 },
                        pb: 3,
                        pt: 0,
                        ml: { md: 5 },
                        overflow: "visible",
                        overflowY: "visible",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#000000",
                          fontFamily: '"Calibri Light", Calibri, sans-serif',
                          fontSize: "1.05rem",
                          lineHeight: 1.7,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))
              )}
            </Box>
          </MotionBox>
        </Container>
      </Card>
    </Box>
  );
}
