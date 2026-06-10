import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  Paper,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { LocationOn } from "@mui/icons-material";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

export default function Staff() {
  const navigate = useNavigate();
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [membersError, setMembersError] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [highlightId, setHighlightId] = useState(null);

  // Sample user profiles with green color scheme
  const sampleProfiles = [
    {
      id: 1,
      name: "Dr. Sarah Mwangi",
      role: "Agricultural Economics Director",
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
      role: "Senior Agribusiness Consultant",
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
      role: "Ag-Tech Innovation Lead",
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
      role: "Irrigation Systems Specialist",
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
      role: "Waste Management Consultant",
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
      role: "Farm Operations Manager",
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
      role: "Market Development Analyst",
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
      role: "Sustainable Agriculture Advisor",
      description: "Promoting sustainable farming practices and environmental conservation in agriculture.",
      image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop",
      email: "michael.otieno@mkagri.com",
      phone: "+254 700 890 123",
      location: "Mombasa, Kenya",
      expertise: ["Sustainability", "Environmental Conservation", "Organic Farming"],
    },
  ];

  const buildImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        setMembersError(null);
        const res = await fetch("/api/admin-users/public?limit=100");
        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.data)) {
          throw new Error(data.message || "Failed to load team");
        }
        const normalized = data.data.map((m) => ({
          id: m.id,
          name: m.full_name,
          role: m.position || m.role || "Team Member",
          description: m.description,
          image: buildImageUrl(m.profile_image),
        }));
        setMembers(normalized.length > 0 ? normalized : sampleProfiles);
      } catch (err) {
        // Use sample profiles if API fails
        setMembers(sampleProfiles);
        setMembersError(null);
      } finally {
        setMembersLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // When coming back from detail, scroll to the originating card
  useEffect(() => {
    const targetId = location.state?.scrollToId;
    const highlight = location.state?.highlightId;
    if (!targetId) return;

    const scrollToCard = () => {
      const cardEl = document.querySelector(`[data-member-id="${targetId}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTimeout(scrollToCard, 100);
      }
    };

    requestAnimationFrame(scrollToCard);
    if (highlight) {
      setHighlightId(highlight);
    }
    // remove highlight after 2 seconds
    const clear = highlight
      ? setTimeout(() => setHighlightId(null), 2000)
      : null;
    // Clear state so it doesn't re-run on next renders
    navigate("/staff", { replace: true, state: null });
    return () => {
      if (clear) clearTimeout(clear);
    };
  }, [location.state, navigate]);

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
        minHeight: "100vh",
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
        }}
      >
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/team")}
          sx={{
            mt: 0.5,
            mb: 0.75,
            backgroundColor: "#13ec13",
            color: "#0d1b0d",
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: 2,
            outline: "none",
            "&:focus": { outline: "none", boxShadow: "none" },
            "&:focus-visible": { outline: "none", boxShadow: "none" },
            "&:hover": {
              backgroundColor: "#11d411",
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Back to Team
        </Button>

        <Paper
          elevation={0}
          sx={{
            py: { xs: 3, sm: 4, md: 5 },
            px: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: { xs: 3, md: 4 },
            background: "#FFFFFF",
            border: "1px solid rgba(19, 236, 19, 0.15)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            minHeight: "auto",
            height: "auto",
            overflow: "hidden",
          }}
        >
          {/* Meet Our Team Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, sm: 5, md: 6 } }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2,
                color: "#13ec13",
                fontWeight: 700,
                fontSize: "0.875rem",
                mb: 1,
                display: "block",
              }}
            >
              Our Expert Team
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: 2,
                color: "#0d1b0d",
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                lineHeight: 1.2,
              }}
            >
              Meet Our <span style={{ color: "#13ec13" }}>Agricultural Experts</span>
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#000000",
                fontSize: { xs: "1rem", md: "1.125rem" },
                maxWidth: "800px",
                mx: "auto",
                lineHeight: 1.7,
              }}
            >
              Get to know the dedicated professionals who drive innovation and excellence in agricultural consulting.
            </Typography>
          </Box>

          {/* Staff Members Grid - 4 cards per row */}
          {membersError && (
            <Typography
              variant="body1"
              sx={{ color: "error.main", textAlign: "center", mb: 2 }}
            >
              {membersError}
            </Typography>
          )}
          {!membersError && membersLoading && (
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", textAlign: "center", mb: 2 }}
            >
              Loading team...
            </Typography>
          )}
          {!membersError && !membersLoading && members.length === 0 && (
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", textAlign: "center", mb: 2 }}
            >
              Team coming soon.
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, sm: 2, md: 2 },
              justifyContent: "flex-start",
            }}
          >
            {members.map((member, index) => (
              <Box
                key={member.id}
                sx={{
                  width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" },
                  minWidth: 0,
                  flexShrink: 0,
                }}
              >
                <MotionCard
                  data-member-id={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  sx={{
                    overflow: "hidden",
                    border: `1px solid ${
                      highlightId && String(highlightId) === String(member.id)
                        ? "rgba(19, 236, 19, 0.6)"
                        : "rgba(19, 236, 19, 0.15)"
                    }`,
                    borderRadius: 4,
                    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "linear-gradient(to bottom, #FFFFFF 0%, rgba(245, 255, 245, 0.5) 100%)",
                    boxShadow:
                      highlightId && String(highlightId) === String(member.id)
                        ? "0 0 0 3px rgba(19, 236, 19, 0.6), 0 12px 40px rgba(19, 236, 19, 0.25)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                    minHeight: "100%",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 32px rgba(19, 236, 19, 0.15)",
                      borderColor: "rgba(19, 236, 19, 0.3)",
                    },
                  }}
                >
                  {/* Card Content */}
                  <Box
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 2.5 },
                      pb: { xs: 2.5, sm: 3, md: 3 },
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "center",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    {/* Circular Profile Image */}
                    <Box
                      sx={{
                        width: { xs: "120px", sm: "140px", md: "140px" },
                        height: { xs: "120px", sm: "140px", md: "140px" },
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "rgba(19, 236, 19, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        mb: 2,
                        border: "3px solid rgba(19, 236, 19, 0.2)",
                        boxShadow: "0 4px 20px rgba(19, 236, 19, 0.15)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "rgba(19, 236, 19, 0.4)",
                          boxShadow: "0 6px 30px rgba(19, 236, 19, 0.25)",
                          transform: "scale(1.05)",
                        },
                      }}
                    >
                      {member.image ? (
                        <Box
                          component="img"
                          src={member.image}
                          alt={member.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center",
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
                          display: member.image ? "none" : "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%",
                          color: "#13ec13",
                        }}
                      >
                        <PersonIcon sx={{ fontSize: "4rem", opacity: 0.5 }} />
                      </Box>
                    </Box>

                    {/* Role Label */}
                    <Chip
                      label={member.role}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(19, 236, 19, 0.1)",
                        color: "#13ec13",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        mb: 1,
                        height: "24px",
                        border: "1px solid rgba(19, 236, 19, 0.2)",
                      }}
                    />

                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: "#0d1b0d",
                        fontSize: { xs: "1.1rem", md: "1.25rem" },
                        lineHeight: 1.2,
                      }}
                    >
                      {member.name}
                    </Typography>

                    {/* Description */}
                    {member.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000000",
                          fontSize: { xs: "0.75rem", md: "0.8rem" },
                          lineHeight: 1.5,
                          mb: 1.5,
                          minHeight: "3.5em",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {member.description}
                      </Typography>
                    )}

                    {/* Contact Info */}
                    {member.email && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                          mb: 2,
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {member.location && (
                          <Chip
                            icon={<LocationOn sx={{ fontSize: "0.875rem", color: "#13ec13" }} />}
                            label={member.location}
                            size="small"
                            sx={{
                              backgroundColor: "rgba(19, 236, 19, 0.05)",
                              color: "#000000",
                              fontSize: "0.7rem",
                              height: "22px",
                            }}
                          />
                        )}
                      </Stack>
                    )}

                    {/* Learn More Button */}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/team/${member.id}`);
                      }}
                      sx={{
                        backgroundColor: "#13ec13",
                        color: "#0d1b0d",
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontSize: { xs: "0.875rem", md: "0.9rem" },
                        textTransform: "none",
                        fontWeight: 700,
                        mt: "auto",
                        mb: 0,
                        width: "100%",
                        boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
                        "&:hover": {
                          backgroundColor: "#11d411",
                          boxShadow: "0 6px 20px rgba(19, 236, 19, 0.4)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.3s ease",
                        "&:focus": {
                          outline: "none",
                        },
                        "&:focus-visible": {
                          outline: "none",
                          boxShadow: "none",
                        },
                      }}
                    >
                      Learn More
                    </Button>
                  </Box>
                </MotionCard>
              </Box>
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

