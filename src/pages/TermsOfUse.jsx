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

export default function TermsOfUse() {
  const navigate = useNavigate();
  const lastUpdated = "February 2026";

  const sections = [
    {
      title: "Acceptance of Terms",
      content:
        "By accessing or using the website and services of MK Agribusiness Consultants ('we', 'our', or 'us'), including the marketplace, you agree to be bound by these Terms of Use. If you do not agree, please do not use our services. We may update these terms from time to time; continued use after changes constitutes acceptance.",
    },
    {
      title: "Description of Services",
      content:
        "We provide agribusiness consulting, advisory, training, and a digital marketplace for agricultural inputs, produce, and related services. Specific offerings may vary and are subject to availability and eligibility. We reserve the right to modify or discontinue any service with reasonable notice where practicable.",
    },
    {
      title: "User Accounts and Obligations",
      content:
        "Where registration is required (e.g. marketplace), you must provide accurate information and keep your account secure. You are responsible for all activity under your account. You agree not to use our services for any unlawful purpose, to not misuse or attempt to gain unauthorized access to our systems or other users' data, and to comply with all applicable laws.",
    },
    {
      title: "Marketplace Use",
      content:
        "Use of our marketplace is subject to these Terms and any additional marketplace-specific rules. Listings, transactions, and user conduct must be lawful and in good faith. We may suspend or terminate accounts that breach these terms or pose a risk to other users or the platform.",
    },
    {
      title: "Intellectual Property",
      content:
        "All content on our website and platform (text, graphics, logos, software) is owned by or licensed to MK Agribusiness Consultants and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent, except for limited personal, non-commercial use.",
    },
    {
      title: "Disclaimer of Warranties",
      content:
        "Our services are provided 'as is' and 'as available'. We do not warrant that the site or services will be uninterrupted, error-free, or free of harmful components. Advice and content are for general information and do not replace professional advice tailored to your situation.",
    },
    {
      title: "Limitation of Liability",
      content:
        "To the fullest extent permitted by law, MK Agribusiness Consultants and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data, arising from your use of or inability to use our services. Our total liability shall not exceed the amount you paid to us in the twelve months preceding the claim, if any.",
    },
    {
      title: "Indemnification",
      content:
        "You agree to indemnify and hold harmless MK Agribusiness Consultants, its officers, employees, and agents from any claims, damages, or expenses (including legal fees) arising from your use of our services or your breach of these Terms.",
    },
    {
      title: "Governing Law",
      content:
        "These Terms shall be governed by the laws of Kenya (or the jurisdiction in which we primarily operate, as stated on our website). Any disputes shall be subject to the exclusive jurisdiction of the courts of that jurisdiction, unless otherwise required by mandatory law.",
    },
    {
      title: "Contact",
      content:
        "For questions about these Terms of Use, please contact MK Agribusiness Consultants using the contact details on our website or via our contact form.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Use | MK Agribusiness Consultants</title>
        <meta name="description" content="Terms of Use for MK Agribusiness Consultants website and marketplace." />
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
            Terms of Use
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
