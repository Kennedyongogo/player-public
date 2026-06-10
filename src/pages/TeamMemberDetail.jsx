import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Alert,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person,
  ArrowBack,
  Share,
  Facebook,
  WhatsApp,
  Twitter,
  Google,
} from "@mui/icons-material";

const MotionBox = motion(Box);

// Sample profiles matching Staff.jsx
const sampleProfiles = [
  {
    id: 1,
    name: "Dr. Sarah Mwangi",
    full_name: "Dr. Sarah Mwangi",
    role: "Agricultural Economics Director",
    position: "Agricultural Economics Director",
    description: "Expert in sustainable farming practices with 15+ years of experience in agricultural economics and project management.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    email: "sarah.mwangi@mkagri.com",
    phone: "+254 700 123 456",
    location: "Nairobi, Kenya",
    expertise: ["Agricultural Economics", "Project Management", "Sustainability"],
  },
  {
    id: 2,
    name: "James Kipchoge",
    full_name: "James Kipchoge",
    role: "Senior Agribusiness Consultant",
    position: "Senior Agribusiness Consultant",
    description: "Specialized in dairy value chain optimization and modern farming techniques.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    email: "james.kipchoge@mkagri.com",
    phone: "+254 700 234 567",
    location: "Nakuru, Kenya",
    expertise: ["Dairy Value Chain", "Livestock Management", "Farm Optimization"],
  },
  {
    id: 3,
    name: "Grace Wanjiru",
    full_name: "Grace Wanjiru",
    role: "Ag-Tech Innovation Lead",
    position: "Ag-Tech Innovation Lead",
    description: "Pioneering technology solutions for modern agriculture and smart farming systems.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    email: "grace.wanjiru@mkagri.com",
    phone: "+254 700 345 678",
    location: "Nairobi, Kenya",
    expertise: ["Ag-Tech", "IoT Solutions", "Data Analytics"],
  },
  {
    id: 4,
    name: "Peter Ochieng",
    full_name: "Peter Ochieng",
    role: "Irrigation Systems Specialist",
    position: "Irrigation Systems Specialist",
    description: "Expert in designing and implementing efficient irrigation systems for sustainable water management.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    email: "peter.ochieng@mkagri.com",
    phone: "+254 700 456 789",
    location: "Eldoret, Kenya",
    expertise: ["Irrigation Systems", "Water Management", "Resource Efficiency"],
  },
  {
    id: 5,
    name: "Mary Akinyi",
    full_name: "Mary Akinyi",
    role: "Waste Management Consultant",
    position: "Waste Management Consultant",
    description: "Leading expert in organic waste management and circular economy solutions for agriculture.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    email: "mary.akinyi@mkagri.com",
    phone: "+254 700 567 890",
    location: "Kisumu, Kenya",
    expertise: ["Waste Management", "Circular Economy", "BSF Production"],
  },
  {
    id: 6,
    name: "David Kamau",
    full_name: "David Kamau",
    role: "Farm Operations Manager",
    position: "Farm Operations Manager",
    description: "Specialized in farm operations optimization and productivity enhancement strategies.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
    email: "david.kamau@mkagri.com",
    phone: "+254 700 678 901",
    location: "Thika, Kenya",
    expertise: ["Operations Management", "Productivity", "Farm Planning"],
  },
  {
    id: 7,
    name: "Esther Njeri",
    full_name: "Esther Njeri",
    role: "Market Development Analyst",
    position: "Market Development Analyst",
    description: "Expert in agricultural market analysis and value chain development strategies.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
    email: "esther.njeri@mkagri.com",
    phone: "+254 700 789 012",
    location: "Nairobi, Kenya",
    expertise: ["Market Analysis", "Value Chains", "Business Development"],
  },
  {
    id: 8,
    name: "Michael Otieno",
    full_name: "Michael Otieno",
    role: "Sustainable Agriculture Advisor",
    position: "Sustainable Agriculture Advisor",
    description: "Promoting sustainable farming practices and environmental conservation in agriculture.",
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop",
    email: "michael.otieno@mkagri.com",
    phone: "+254 700 890 123",
    location: "Mombasa, Kenya",
    expertise: ["Sustainability", "Environmental Conservation", "Organic Farming"],
  },
];

export default function TeamMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        setError(null);

        // Always try the API first
        const res = await fetch(`/api/admin-users/public/${id}`);
        const data = await res.json();
        if (res.ok && data.success && data.data) {
          const m = data.data;
          setMember({
            id: m.id,
            name: m.full_name,
            full_name: m.full_name,
            position: m.position || m.role || "Team Member",
            description: m.description,
            image: buildImageUrl(m.profile_image),
            facebook_link: m.facebook_link,
            whatsapp_link: m.whatsapp_link,
            twitter_link: m.twitter_link,
            google_link: m.google_link,
          });
          setLoading(false);
          return;
        }

        // Fallback to sample profiles only when API fails and id is 1-8
        const sampleId = parseInt(id, 10);
        if (sampleId >= 1 && sampleId <= 8) {
          const sampleMember = sampleProfiles.find((p) => p.id === sampleId);
          if (sampleMember) {
            setMember({
              ...sampleMember,
              facebook_link: null,
              whatsapp_link: null,
              twitter_link: null,
              google_link: null,
            });
            setLoading(false);
            return;
          }
        }

        setError(data?.message || "Team member not found");
      } catch (err) {
        // On network error, fall back to sample if id is 1-8
        const sampleId = parseInt(id, 10);
        if (sampleId >= 1 && sampleId <= 8) {
          const sampleMember = sampleProfiles.find((p) => p.id === sampleId);
          if (sampleMember) {
            setMember({
              ...sampleMember,
              facebook_link: null,
              whatsapp_link: null,
              twitter_link: null,
              google_link: null,
            });
            setLoading(false);
            return;
          }
        }
        setError(err.message || "Failed to load team member");
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  const handleBack = () => {
    navigate("/staff", { state: { scrollToId: id, highlightId: id } });
  };

  const handleSocialClick = (platform) => {
    const socialLink = member?.[`${platform}_link`];
    
    // Only open link if it exists, otherwise do nothing
    if (socialLink) {
      window.open(socialLink, "_blank");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          bgcolor: "rgba(255, 255, 255, 0.5)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 255, 245, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(19, 236, 19, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.05) 0%, transparent 50%)",
            zIndex: 0,
          },
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <CircularProgress sx={{ color: "#13ec13" }} />
        </Box>
      </Box>
    );
  }

  if (error || !member) {
    return (
      <Box
        sx={{
          pt: 0.75,
          pb: 0.75,
          px: 0,
          bgcolor: "rgba(255, 255, 255, 0.5)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 255, 245, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)",
          position: "relative",
          overflow: "hidden",
          minHeight: "auto",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 80%, rgba(19, 236, 19, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.05) 0%, transparent 50%)",
            zIndex: 0,
          },
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 0.375, sm: 0.5, md: 0.75 },
            pt: { xs: 0.375, sm: 0.375, md: 0.375 },
            py: 2,
          }}
        >
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error || "Team member not found"}
          </Alert>
          <Button 
            variant="contained" 
            onClick={handleBack}
            sx={{
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "#11d411",
              },
            }}
          >
            <ArrowBack sx={{ mr: 1 }} />
            Back to Team
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        pt: 0.75,
        pb: 0.75,
        px: 0,
        bgcolor: "rgba(255, 255, 255, 0.5)",
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 255, 245, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: "auto",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(19, 236, 19, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        },
      }}
    >
        <Container 
          maxWidth={false} 
          sx={{ 
            position: "relative",
            zIndex: 1,
            px: { xs: 0.375, sm: 0.5, md: 0.75 },
            pt: { xs: 0.375, sm: 0.375, md: 0.375 },
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back button outside card */}
            <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={handleBack}
                sx={{ 
                  mt: 0.5,
                  mb: 0.75,
                  backgroundColor: "#13ec13",
                  color: "#0d1b0d",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#11d411",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
                  },
                  "&:focus": {
                    outline: "none",
                  },
                  "&:focus-visible": {
                    outline: "none",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Back to Team
              </Button>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: { xs: 3, md: 4 },
                background: "#FFFFFF",
                border: "1px solid rgba(19, 236, 19, 0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              }}
            >
              {/* Header Section */}
              <Box sx={{ mb: 2 }}>
                {/* Profile Picture - Full Width */}
                <Box sx={{ mb: 0 }}>
                  <Box
                    sx={{
                      width: "100%",
                      height: { xs: 400, sm: 500, md: 600 },
                      borderRadius: { xs: 3, md: 4 },
                      overflow: "hidden",
                      border: "6px solid rgba(255, 255, 255, 0.3)",
                      boxShadow: "0 20px 60px rgba(19, 236, 19, 0.15)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: "-3px",
                        borderRadius: { xs: 3, md: 4 },
                        background: "linear-gradient(135deg, #13ec13, #11d411)",
                        zIndex: -1,
                      }
                    }}
                  >
                    {member?.image ? (
                      <Box
                        component="img"
                        src={member.image}
                        alt={member.name}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center 30%",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        display: member?.image ? "none" : "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, #13ec13, #11d411)",
                        color: "#0d1b0d",
                      }}
                    >
                      <Person sx={{ fontSize: { xs: "5rem", sm: "6.5rem", md: "8rem" }, mb: 1 }} />
                      <Typography variant="h4" sx={{ fontWeight: 600, fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.7rem" } }}>
                        No Photo Available
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Profile Information - No Card, Left Aligned */}
                <Box>
                  {/* Name */}
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{ 
                      fontWeight: 900,
                      color: "#0d1b0d",
                      fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.85rem" },
                      textAlign: "left",
                      mb: 0,
                    }}
                  >
                    {member?.name}
                  </Typography>

                  {/* Position */}
                  <Typography
                    variant="h5"
                    sx={{
                      color: "#13ec13",
                      fontSize: { xs: "0.75rem", sm: "0.85rem", md: "1rem" },
                      fontWeight: 700,
                      textAlign: "left",
                      mb: 1.5,
                    }}
                  >
                    {member?.position || "Team Member"}
                  </Typography>

                  {/* Description */}
                  {member?.description && (
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        color: "#000000",
                        fontSize: { xs: "0.9rem", sm: "1rem", md: "1.05rem" },
                        textAlign: "left",
                      }}
                    >
                      {member.description}
                    </Typography>
                  )}

                  {/* No description message */}
                  {!member?.description && (
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.8,
                        color: "text.secondary",
                        fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
                        textAlign: "left",
                        fontStyle: "italic",
                      }}
                    >
                      More information about this team member will be available soon.
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Share Section */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 1.5, sm: 2 }, 
                  borderRadius: { xs: 3, md: 4 },
                  background: "#FFFFFF",
                  border: "1px solid rgba(19, 236, 19, 0.15)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#0d1b0d",
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.45rem" },
                  }}
                >
                  <Share sx={{ fontSize: { xs: "1.2rem", md: "1.35rem" }, color: "#13ec13" }} />
                  Connect with {member?.full_name || member?.name}
                </Typography>
                
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    startIcon={<Facebook />}
                    onClick={() => handleSocialClick("facebook")}
                    sx={{
                      backgroundColor: "#1877f2",
                      "&:hover": { backgroundColor: "#166fe5" },
                      px: 1.5,
                      py: 0.75,
                      minWidth: 100,
                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                      "&:focus": {
                        outline: "none",
                        boxShadow: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Facebook
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<WhatsApp />}
                    onClick={() => handleSocialClick("whatsapp")}
                    sx={{
                      backgroundColor: "#25d366",
                      "&:hover": { backgroundColor: "#22c55e" },
                      px: 1.5,
                      py: 0.75,
                      minWidth: 100,
                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                      "&:focus": {
                        outline: "none",
                        boxShadow: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    WhatsApp
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<Twitter />}
                    onClick={() => handleSocialClick("twitter")}
                    sx={{
                      backgroundColor: "#1da1f2",
                      "&:hover": { backgroundColor: "#1a91da" },
                      px: 1.5,
                      py: 0.75,
                      minWidth: 100,
                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                      "&:focus": {
                        outline: "none",
                        boxShadow: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    X
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<Google />}
                    onClick={() => handleSocialClick("google")}
                    sx={{
                      backgroundColor: "#db4437",
                      "&:hover": { backgroundColor: "#c23321" },
                      px: 1.5,
                      py: 0.75,
                      minWidth: 100,
                      fontSize: { xs: "0.7rem", md: "0.8rem" },
                      "&:focus": {
                        outline: "none",
                        boxShadow: "none",
                      },
                      "&:focus-visible": {
                        outline: "none",
                        boxShadow: "none",
                      },
                    }}
                  >
                    Google
                  </Button>
                </Box>
              </Paper>
            </Paper>

          </MotionBox>
        </Container>
      </Box>
  );
}
