import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Search,
  ArrowForward,
  AccessTime,
  Payments,
  Recycling,
  Agriculture,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { postNewsletter } from "../api";

const MotionBox = motion(Box);

const categories = [
  "All Posts",
  "Agri-Finance",
  "Agri-Tech",
  "Climate-Smart",
  "Livestock",
  "Regenerative",
  "Marketing",
  "Sustainable Tech",
  "Other",
];

const categoryIcons = {
  "Agri-Finance": Payments,
  "Agri-Tech": Agriculture,
  "Climate-Smart": Recycling,
  Livestock: Agriculture,
  Regenerative: Recycling,
  Marketing: Payments,
  "Sustainable Tech": Recycling,
  Other: Agriculture,
};

const buildImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/${path}`;
};

const createSlug = (post) => {
  if (post.slug) return post.slug;
  if (post.title) {
    return post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  return (post.id || "").toString();
};

const ITEMS_PER_PAGE = 6;

export default function Blog() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blogs/public?limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.data)) {
          setBlogs(data.data);
        } else {
          setBlogs([]);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load blog posts");
          setBlogs([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const featuredPosts = useMemo(() => {
    return blogs
      .filter((b) => b.featured)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
      .map((post) => ({
        ...post,
        slug: post.slug || createSlug(post),
        description:
          post.excerpt ||
          (post.content
            ? post.content.replace(/\s+/g, " ").trim().slice(0, 200) + (post.content.length > 200 ? "..." : "")
            : "") ||
          "",
        image: buildImageUrl(post.featuredImage),
        Icon: categoryIcons[post.category] || Agriculture,
      }));
  }, [blogs]);

  const filteredLatest = useMemo(() => {
    let list = [...blogs];
    if (selectedCategory !== "All Posts") {
      list = list.filter((b) => b.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.title || "").toLowerCase().includes(q) ||
          (b.excerpt || "").toLowerCase().includes(q) ||
          (b.content || "").toLowerCase().includes(q)
      );
    }
    list.sort(
      (a, b) =>
        new Date(b.publishDate || b.createdAt || 0) - new Date(a.publishDate || a.createdAt || 0)
    );
    return list.map((post) => ({
      ...post,
      slug: post.slug || createSlug(post),
      description:
        post.excerpt ||
        (post.content
          ? post.content.replace(/\s+/g, " ").trim().slice(0, 150) + (post.content.length > 150 ? "..." : "")
          : "") ||
        "",
      readTime: post.readTime ? `${post.readTime} min read` : "—",
      image: buildImageUrl(post.featuredImage),
    }));
  }, [blogs, selectedCategory, searchQuery]);

  const paginatedLatest = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredLatest.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLatest, page]);

  const totalPages = Math.max(1, Math.ceil(filteredLatest.length / ITEMS_PER_PAGE));

  const handleReadArticle = (post) => {
    const slug = post.slug || createSlug(post);
    navigate(`/blog/${slug}`);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email) {
      Swal.fire({
        icon: "warning",
        title: "Email required",
        text: "Please enter your email address.",
        confirmButtonColor: "#0fbd0f",
      });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#0fbd0f",
      });
      return;
    }
    setNewsletterLoading(true);
    try {
      const data = await postNewsletter({ email, source: "blog" });
      Swal.fire({
        icon: "success",
        title: "Subscribed!",
        text: data.message || "You'll receive our latest updates.",
        confirmButtonColor: "#0fbd0f",
      });
      setNewsletterEmail("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Subscription failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#0fbd0f",
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f6f8f6",
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <CircularProgress sx={{ color: "#0fbd0f" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, bgcolor: "#f6f8f6", minHeight: "40vh", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" sx={{ bgcolor: "#0fbd0f" }} onClick={() => window.location.reload()}>
            Try again
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        pt: 1.5,
        pb: 0.3,
        px: 0,
        bgcolor: "#f6f8f6",
        background:
          "linear-gradient(135deg, rgba(246, 248, 246, 0.95) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(246, 248, 246, 0.95) 100%)",
        position: "relative",
        overflow: "hidden",
        overflowX: "hidden",
        minHeight: "100vh",
        maxWidth: "100vw",
        width: "100%",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(circle at 20% 80%, rgba(15, 189, 15, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(13, 27, 13, 0.05) 0%, transparent 50%)",
          zIndex: 0,
        },
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 1,
          px: { xs: 1.5, sm: 1.5, md: 1.5 },
          pt: { xs: 0.75, sm: 0.75, md: 0.75 },
          pb: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          maxWidth: "100%",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Paper
            elevation={3}
            sx={{
              py: { xs: 2, md: 3 },
              px: 0,
              borderRadius: { xs: 3, md: 4 },
              background: "#FFFFFF",
              border: "1px solid rgba(15, 189, 15, 0.15)",
              flex: 1,
              mb: 0.3,
              overflow: "hidden",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            {/* Page Heading - Wrapped in padding */}
            <Box sx={{ mb: 6, maxWidth: "1000px", px: 1.5 }}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  fontWeight: 900,
                  color: "#0d1b0d",
                  mb: 2,
                  lineHeight: 1.1,
                }}
              >
                Resources & Blog
              </Typography>
              <Typography
                sx={{
                  fontSize: "1.125rem",
                  color: "#4c9a4c",
                  lineHeight: 1.6,
                  maxWidth: "800px",
                }}
              >
                Empowering farmers and agripreneurs with expert knowledge, sustainable strategies, and bankable insights to transform African agriculture.
              </Typography>
            </Box>

            {/* Category Filter & Search - Wrapped in padding */}
            <Box
              sx={{
                mb: 3,
                display: "flex",
                flexDirection: { xs: "column", lg: "row" },
                gap: 3,
                alignItems: { lg: "center" },
                justifyContent: "space-between",
                px: 1.5,
              }}
            >
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                {categories.map((category, idx) => (
                  <Button
                    key={idx}
                    variant={selectedCategory === category ? "contained" : "text"}
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(1);
                    }}
                    sx={{
                      bgcolor: selectedCategory === category ? "#0fbd0f" : "rgba(15, 189, 15, 0.05)",
                      color: selectedCategory === category ? "white" : "#0d1b0d",
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: selectedCategory === category ? "#0da50d" : "rgba(15, 189, 15, 0.1)",
                      },
                      "&:focus": { outline: "none" },
                      "&:focus-visible": { outline: "none" },
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </Box>
              <TextField
                placeholder="Search articles..."
                size="small"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                sx={{
                  width: { xs: "100%", lg: "300px" },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(15, 189, 15, 0.05)",
                    borderRadius: 2,
                    "& fieldset": { border: "none" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#0fbd0f" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Featured Section - Stretching edge-to-edge */}
            <Box sx={{ mb: 4, px: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#0d1b0d", mb: 4, px: 0 }}>
                Featured Insights
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, 1fr)",
                  },
                }}
              >
                {featuredPosts.map((post) => (
                  <Card
                    key={post.id}
                    sx={{
                      borderRadius: 4,
                      border: "1px solid #e7f3e7",
                      boxShadow: "none",
                      overflow: "hidden",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                        "& .MuiCardMedia-root": { transform: "scale(1.05)" },
                      },
                    }}
                  >
                    <Box sx={{ overflow: "hidden", aspectRatio: "16/9" }}>
                      <CardMedia
                        component="img"
                        image={post.image || "/placeholder.jpg"}
                        alt={post.heroAltText || post.title}
                        sx={{ transition: "transform 0.6s ease" }}
                      />
                    </Box>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#0fbd0f", mb: 2 }}>
                        {(() => {
                          const IconC = post.Icon;
                          return IconC ? <IconC fontSize="small" /> : <Agriculture fontSize="small" />;
                        })()}
                        <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {post.category || "—"}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                        {post.title}
                      </Typography>
                      <Typography sx={{ color: "#000000", mb: 3, fontSize: "1.0625rem", lineHeight: 1.6, lineClamp: 3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {post.description}
                      </Typography>
                      <Button
                        endIcon={<ArrowForward />}
                        onClick={() => handleReadArticle(post)}
                        sx={{
                          color: "#0fbd0f",
                          fontWeight: 700,
                          p: 0,
                          "&:hover": { bgcolor: "transparent", gap: 1 },
                          "&:focus": { outline: "none" },
                          "&:focus-visible": { outline: "none" },
                        }}
                      >
                        Read Full Article
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>

            {/* Newsletter - Wrapper with padding so green card has room for both curved edges */}
            <Box sx={{ mb: 4, px: 1.5, width: "100%", boxSizing: "border-box" }}>
              <Box
                sx={{
                  bgcolor: "#e7f3e7",
                  py: { xs: 2.5, md: 3 },
                  px: { xs: 2, sm: 3, md: 4 },
                  borderRadius: { xs: 3, md: 4 },
                  position: "relative",
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
              <Box
                sx={{
                  position: "absolute",
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  bgcolor: "rgba(15, 189, 15, 0.03)",
                  borderRadius: "50%",
                  filter: "blur(60px)",
                }}
              />
              <Grid container spacing={2} alignItems="center" sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box" }}>
                <Grid item xs={12} md={5} sx={{ width: "100%" }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, color: "#0d1b0d", fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
                    Stay Ahead of the Curve
                  </Typography>
                  <Typography sx={{ color: "#4c9a4c", fontSize: "1rem", lineHeight: 1.5, width: "100%" }}>
                    Join our community of 500+ agripreneurs. Stay updated with the latest in sustainable farming, market trends, and grant opportunities.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={7} sx={{ width: "100%" }}>
                  <Box
                    component="form"
                    onSubmit={handleNewsletterSubmit}
                    sx={{
                      display: "flex",
                      gap: 2,
                      width: "100%",
                      alignItems: "stretch",
                      flexWrap: "wrap",
                    }}
                  >
                    <TextField
                      fullWidth
                      type="email"
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      disabled={newsletterLoading}
                      sx={{
                        flex: 1,
                        minWidth: { xs: "100%", sm: 200 },
                        bgcolor: "white",
                        borderRadius: 3,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 3,
                          "& fieldset": { border: "none" },
                        },
                        "& .MuiInputBase-input": {
                          py: 2,
                          px: 2.5,
                        },
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={newsletterLoading}
                      sx={{
                        bgcolor: "#0fbd0f",
                        color: "white",
                        px: 4,
                        py: 2,
                        borderRadius: 3,
                        fontWeight: 700,
                        textTransform: "none",
                        whiteSpace: "nowrap",
                        boxShadow: "0 4px 14px 0 rgba(15,189,15,0.39)",
                        "&:hover": { 
                          bgcolor: "#0da50d",
                          boxShadow: "0 6px 20px rgba(15,189,15,0.23)",
                        },
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                      }}
                    >
                      {newsletterLoading ? "Subscribing..." : "Subscribe Now"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              </Box>
            </Box>

            {/* Latest Articles - Stretching edge-to-edge */}
            <Box sx={{ mb: 1.5, px: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, px: 0 }}>
                Latest Articles
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gap: 4,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                }}
              >
                {paginatedLatest.length === 0 ? (
                  <Typography sx={{ gridColumn: "1 / -1", textAlign: "center", color: "text.secondary", py: 4 }}>
                    No articles found.
                  </Typography>
                ) : (
                  paginatedLatest.map((article) => (
                    <Card
                      key={article.id}
                      sx={{
                        borderRadius: 4,
                        border: "1px solid #e7f3e7",
                        boxShadow: "none",
                        overflow: "hidden",
                        bgcolor: "white",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                          "& .MuiCardMedia-root": { transform: "scale(1.05)" },
                        },
                      }}
                    >
                      <Box sx={{ overflow: "hidden" }}>
                        <CardMedia
                          component="img"
                          image={article.image || "/placeholder.jpg"}
                          alt={article.heroAltText || article.title}
                          sx={{
                            aspectRatio: "16/9",
                            transition: "transform 0.6s ease",
                          }}
                        />
                      </Box>
                      <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                        <Chip
                          label={article.category || "—"}
                          size="small"
                          sx={{
                            alignSelf: "flex-start",
                            bgcolor: "rgba(15, 189, 15, 0.1)",
                            color: "#0fbd0f",
                            fontWeight: 700,
                            mb: 2,
                            borderRadius: 1,
                          }}
                        />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#000000", mb: 2, flex: 1, fontSize: "1rem" }}
                        >
                          {article.description || "—"}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            pt: 2,
                            borderTop: "1px solid #e7f3e7",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              color: "#000000",
                            }}
                          >
                            <AccessTime sx={{ fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {article.readTime}
                            </Typography>
                          </Box>
                          <Button
                            onClick={() => handleReadArticle(article)}
                            sx={{
                              color: "#0fbd0f",
                              fontWeight: 700,
                              p: 0,
                              minWidth: 0,
                              "&:hover": {
                                bgcolor: "transparent",
                                textDecoration: "underline",
                              },
                              "&:focus": { outline: "none" },
                              "&:focus-visible": { outline: "none" },
                            }}
                          >
                            Read More
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Box>

            {/* Pagination - Centered with padding */}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 8, pb: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, p) => setPage(p)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 700,
                      "&.Mui-selected": {
                        bgcolor: "#0fbd0f",
                        color: "white",
                        "&:hover": { bgcolor: "#0da50d" },
                      },
                      "&:focus": { outline: "none" },
                      "&:focus-visible": { outline: "none" },
                    },
                  }}
                />
              </Box>
            )}
          </Paper>
        </MotionBox>
      </Container>
    </Box>
  );
}
