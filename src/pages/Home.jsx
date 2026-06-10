import React from "react";
import { Box } from "@mui/material";
import HeroSection from "../components/Home/HeroSection";
import KeyServicesSection from "../components/Home/KeyServicesSection";
import AccreditationsSection from "../components/Home/AccreditationsSection";
import ContactSection from "../components/Home/ContactSection";
import BackgroundImageSection from "../components/Home/BackgroundImageSection";
import CTASection from "../components/Home/CTASection";
import Footer from "../components/Footer/Footer";

export default function Home() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
      <HeroSection />
      <KeyServicesSection />
      <AccreditationsSection />
      <ContactSection />
      <BackgroundImageSection />
      <CTASection />
      <Footer />
    </Box>
  );
}
