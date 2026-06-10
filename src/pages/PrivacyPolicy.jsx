import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Button,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const lastUpdated = "February 2026";

  const sections = [
    {
      title: "Introduction",
      content:
        "MK Agribusiness Consultants ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, marketplace, and related services. Please read this policy carefully.",
    },
    {
      title: "Information We Collect",
      content:
        "We may collect personal information you provide directly (e.g. name, email, phone, address, profile and farm details when using the marketplace), information collected automatically (e.g. IP address, browser type, device information, usage data), and cookies and similar technologies to improve your experience.",
    },
    {
      title: "How We Use Your Information",
      content:
        "We use your information to provide and improve our services, process transactions, communicate with you, send updates and marketing (where you have agreed), personalize content, ensure security and prevent fraud, and comply with legal obligations.",
    },
    {
      title: "Sharing and Disclosure",
      content:
        "We may share your information with service providers who assist our operations, with other users where necessary for marketplace transactions (e.g. buyers/sellers), and when required by law or to protect our rights. We do not sell your personal information to third parties.",
    },
    {
      title: "Data Security",
      content:
        "We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. No method of transmission over the Internet is 100% secure; we encourage you to use strong passwords and keep your account details confidential.",
    },
    {
      title: "Your Rights",
      content:
        "Depending on applicable law, you may have the right to access, correct, or delete your personal data, object to or restrict processing, and data portability. To exercise these rights or ask questions about our practices, contact us using the details below.",
    },
    {
      title: "Cookies",
      content:
        "We use cookies and similar technologies to remember preferences, analyze traffic, and improve site performance. You can manage cookie settings in your browser; disabling some cookies may affect site functionality.",
    },
    {
      title: "Changes to This Policy",
      content:
        "We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the 'Last updated' date. Continued use of our services after changes constitutes acceptance of the updated policy.",
    },
    {
      title: "Contact Us",
      content:
        "For privacy-related questions or requests, contact MK Agribusiness Consultants at the contact details provided on our website, or via the contact form.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | MK Agribusiness Consultants</title>
        <meta name="description" content="Privacy Policy for MK Agribusiness Consultants. How we collect, use, and protect your information." />
      </Helmet>
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          bgcolor: "#f6f8f6",
          pt: 2,
          pb: 6,
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4 }, maxWidth: "100%" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 2,
              color: "#000000",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "rgba(19, 236, 19, 0.08)", color: "#0d1b0d" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
            }}
          >
            Back
          </Button>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              fontWeight: 800,
              color: "#0d1b0d",
              mb: 0.5,
            }}
          >
            Privacy Policy
          </Typography>
          <Typography variant="body2" sx={{ color: "#000000", mb: 4, fontSize: "1.05rem" }}>
            Last updated: {lastUpdated}
          </Typography>

          {sections.map((section, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography
                variant="h2"
                sx={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#0d1b0d",
                  mb: 1,
                }}
              >
                {section.title}
              </Typography>
              <Typography
                sx={{
                  color: "#000000",
                  lineHeight: 1.7,
                  fontSize: "1.125rem",
                }}
              >
                {section.content}
              </Typography>
            </Box>
          ))}
        </Container>
      </Box>
    </>
  );
}
