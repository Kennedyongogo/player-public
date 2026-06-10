import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// Floating WhatsApp entry point - Direct chat with MK Agribusiness Consultants
const Chatbot = () => {
  const whatsappNumber = "254769963782"; // MK Agribusiness Consultants WhatsApp number from ContactSection
  const defaultMessage = "Hello MK Agribusiness Consultants, I'm interested in your agribusiness services!";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1001,
      }}
    >
      <Tooltip title="Chat with MK Agribusiness on WhatsApp">
        <IconButton
          component="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#25D366",
            color: "#fff",
            boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#1EBE57",
              transform: "scale(1.1)",
              boxShadow: "0 16px 40px rgba(37, 211, 102, 0.4)",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            },
            "&:focus-visible": {
              outline: "none",
              boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
            },
          }}
        >
          <WhatsAppIcon sx={{ fontSize: 32 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default Chatbot;

