import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Paper,
  Avatar,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { postContact } from "../api";
import {
  ArrowBack,
  CalendarToday,
  AccessTime,
  Share,
  Facebook,
  LinkedIn,
  Instagram,
  WhatsApp,
  ArrowForward,
  Person,
  Close,
  Send,
} from "@mui/icons-material";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Custom X icon for Twitter/X rebrand
const XIcon = ({ sx, ...props }) => (
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
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </Box>
);

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    message: "",
  });
  const hasIncrementedView = useRef(false);
  const prevSlugRef = useRef(null);

  const buildImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  // Build absolute URL for Open Graph meta tags (Facebook requires full URLs)
  const buildAbsoluteUrl = (path) => {
    if (!path || typeof window === 'undefined') return '';
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    
    // Handle relative paths
    const origin = window.location.origin;
    let normalizedPath = path;
    
    // Remove leading slashes to avoid double slashes
    normalizedPath = normalizedPath.replace(/^\/+/, '');
    
    // Ensure it starts with a single slash
    normalizedPath = `/${normalizedPath}`;
    
    // Build full URL
    const fullUrl = `${origin}${normalizedPath}`;
    return fullUrl;
  };

  useEffect(() => {
    // reset guard on slug change
    if (prevSlugRef.current !== slug) {
      hasIncrementedView.current = false;
      prevSlugRef.current = slug;
    }
    if (hasIncrementedView.current) return;
    hasIncrementedView.current = true;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        setPost(null);
        setRelatedPosts([]);

        const res = await fetch(`/api/blogs/public/${slug}`);
        
        // Check if response is ok and has content
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        // Check if response has content before parsing JSON
        const text = await res.text();
        if (!text || text.trim() === '') {
          throw new Error("Empty response from server");
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          throw new Error("Invalid JSON response from server");
        }
        
        if (!data.success || !data.data) {
          throw new Error(data.message || "Blog post not found");
        }

        const normalized = {
          ...data.data,
          tags: Array.isArray(data.data.tags)
            ? data.data.tags
            : typeof data.data.tags === "string"
            ? data.data.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          author: data.data.authorName || data.data.author || "Unknown",
          authorImage: buildImageUrl(data.data.authorImage),
          featuredImage: buildImageUrl(data.data.featuredImage),
          readTime: data.data.readTime ? `${data.data.readTime} min` : "—",
          likes: data.data.likes ?? 0,
          views: data.data.views ?? 0,
          // Meta fields for Open Graph - prioritize featuredImage (what user wants MOST)
          metaTitle: data.data.metaTitle || data.data.title,
          metaDescription: data.data.metaDescription || data.data.excerpt || "",
          // Store original image paths (not normalized) for absolute URL building in meta tags
          // Priority: featuredImage first (user's priority), then ogImage as fallback
          ogImagePath: data.data.featuredImage || data.data.ogImage,
          content: data.data.content, // Store actual content for description extraction
        };

        setPost(normalized);

        // Fetch related: prefer relatedPostIds from API, then same category
        try {
          const relRes = await fetch("/api/blogs/public?limit=100");
          if (relRes.ok) {
            const relText = await relRes.text();
            if (relText && relText.trim() !== "") {
              try {
                const relData = JSON.parse(relText);
                if (relData.success && Array.isArray(relData.data)) {
                  const allBlogs = relData.data;
                  const ids = Array.isArray(normalized.relatedPostIds) ? normalized.relatedPostIds : [];
                  let related = ids
                    .map((id) => allBlogs.find((p) => p.id === id))
                    .filter(Boolean)
                    .slice(0, 3);
                  if (related.length < 3) {
                    const sameCategory = allBlogs.filter(
                      (p) =>
                        p.slug !== normalized.slug &&
                        p.category === normalized.category &&
                        !related.some((r) => r.id === p.id)
                    );
                    related = [...related, ...sameCategory].slice(0, 3);
                  }
                  const relNormalized = related.map((p) => ({
                    ...p,
                    tags: Array.isArray(p.tags)
                      ? p.tags
                      : typeof p.tags === "string"
                      ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
                      : [],
                    author: p.authorName || p.author || "Unknown",
                    authorImage: buildImageUrl(p.authorImage),
                    featuredImage: buildImageUrl(p.featuredImage),
                    readTime: p.readTime ? `${p.readTime} min` : "—",
                  }));
                  setRelatedPosts(relNormalized);
                }
              } catch (parseError) {
                console.warn("Failed to parse related posts:", parseError);
              }
            }
          }
        } catch (relError) {
          console.warn("Failed to fetch related posts:", relError);
        }

        // Increment view count (best-effort)
        {
          try {
            const viewRes = await fetch(`/api/blogs/public/${slug}/view`, { method: "POST" });
            if (viewRes.ok) {
              const viewText = await viewRes.text();
              if (viewText && viewText.trim() !== '') {
                try {
                  const viewData = JSON.parse(viewText);
                  if (viewData.success && viewData.data?.views !== undefined) {
                    setPost((prev) => (prev ? { ...prev, views: viewData.data.views } : prev));
                  } else {
                    // fallback increment locally
                    setPost((prev) => (prev ? { ...prev, views: (prev.views ?? 0) + 1 } : prev));
                  }
                } catch (viewParseError) {
                  // Silently fail view increment
                  console.warn("Failed to parse view count:", viewParseError);
                }
              }
            }
          } catch (viewError) {
            console.warn("Failed to increment view count:", viewError);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load blog post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post?.title || "";
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      instagram: `https://www.instagram.com/`, // Opens Instagram (on mobile may open app)
    };
    
    if (platform === "instagram") {
      // Instagram doesn't have a direct share URL like Facebook
      // Open Instagram website (on mobile, this may open the app if installed)
      // Also copy the link to clipboard for easy pasting
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
      
      // Copy link to clipboard as well for easy sharing
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }
    
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const handleLike = async () => {
    if (!post) return;
    // Optimistic like for snappy UX
    setPost((prev) =>
      prev ? { ...prev, likes: (prev.likes ?? 0) + 1 } : prev
    );
    try {
      setLikeLoading(true);
      const res = await fetch(`/api/blogs/public/${post?.slug}/like`, { method: "POST" });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim() !== '') {
          try {
            const data = JSON.parse(text);
            if (data.success && data.data?.likes !== undefined) {
              setPost((prev) => (prev ? { ...prev, likes: data.data.likes } : prev));
            }
          } catch (parseError) {
            // Silently fail - keep optimistic update
            console.warn("Failed to parse like response:", parseError);
          }
        }
      }
    } catch (_) {
      // Silently fail - keep optimistic update
    } finally {
      setLikeLoading(false);
    }
  };

  const handleOpenContactDialog = () => {
    setOpenContactDialog(true);
  };

  const handleCloseContactDialog = () => {
    setOpenContactDialog(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      serviceType: "",
      message: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields (Full Name, Email, and Message).",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }

    setContactLoading(true);

    try {
      const data = await postContact(formData);

      if (!data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      Swal.fire({
        icon: "success",
        title: "Message Sent!",
        text: "Thank you for contacting us. We'll get back to you soon.",
        confirmButtonColor: "#13ec13",
      });

      handleCloseContactDialog();
    } catch (err) {
      console.error("Error submitting form:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setContactLoading(false);
    }
  };

  // Strip HTML tags from content
  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Remove all HTML tags
    let text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ');
    text = text.replace(/&amp;/g, '&');
    text = text.replace(/&lt;/g, '<');
    text = text.replace(/&gt;/g, '>');
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#39;/g, "'");
    // Clean up multiple spaces and newlines
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  };

  const formatMarkdown = (content) => {
    // Strip HTML tags first
    const cleanContent = stripHtmlTags(content);
    const lines = cleanContent.split("\n");
    const elements = [];
    let listItems = [];
    let keyIndex = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <Box key={`list-${keyIndex++}`} component="ul" sx={{ mb: 2, pl: 3 }}>
            {listItems.map((item, idx) => (
              <Typography
                key={idx}
                variant="body1"
                component="li"
                sx={{
                  mb: 0.5,
                  color: "#000000",
                  lineHeight: 1.8,
                  fontSize: { xs: "1.1rem", md: "1.15rem" },
                  fontWeight: 500,
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        );
        listItems = [];
      }
    };

    lines.forEach((line) => {
      if (line.trim() === "") {
        flushList();
        elements.push(<Box key={`empty-${keyIndex++}`} sx={{ mb: 1.5 }} />);
      } else if (line.startsWith("## ")) {
        flushList();
        elements.push(
          <Typography
            key={`heading-${keyIndex++}`}
            variant="h5"
            sx={{
              mt: 3,
              mb: 2,
              fontWeight: 800,
              color: "#0d1b0d",
              fontSize: { xs: "1.4rem", md: "1.6rem" },
            }}
          >
            {line.replace("## ", "")}
          </Typography>
        );
      } else if (line.startsWith("**") && line.endsWith("**")) {
        flushList();
        elements.push(
          <Typography
            key={`bold-${keyIndex++}`}
            variant="body1"
            component="strong"
            sx={{
              fontWeight: 700,
              color: "#0d1b0d",
              display: "block",
              mb: 1.5,
              fontSize: { xs: "1.05rem", md: "1.1rem" },
            }}
          >
            {line.replace(/\*\*/g, "")}
          </Typography>
        );
      } else if (line.startsWith("- ")) {
        listItems.push(line.replace("- ", ""));
      } else {
        flushList();
        elements.push(
          <Typography
            key={`para-${keyIndex++}`}
            variant="body1"
            sx={{
              mb: 1.5,
              color: "#000000",
              lineHeight: 1.8,
              fontSize: { xs: "1.1rem", md: "1.15rem" },
              fontWeight: 500,
            }}
          >
            {line}
          </Typography>
        );
      }
    });

    flushList();
    return elements;
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

  if (error && !post) {
    return (
      <Box
        sx={{
          pt: 0.75,
          pb: 0.75,
          px: 0,
          bgcolor: "rgba(255, 255, 255, 0.5)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 255, 245, 0.98) 50%, rgba(255, 255, 255, 0.95) 100%)",
          fontFamily: '"Calibri Light", Calibri, sans-serif',
        }}
      >
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || "Blog post not found"}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/blog")}
            variant="contained"
            sx={{
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "#11d411",
              },
            }}
          >
            Back to Blog
          </Button>
        </Container>
      </Box>
    );
  }

  // Build Open Graph meta data - ensure we always have values even if post is loading
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const siteName = "Akira Safaris";
  const defaultTitle = "Akira Safaris Blog - Experience the Magic of Africa";
  const defaultDescription = "Discover amazing safari adventures and travel experiences with Akira Safaris in Kenya.";
  const defaultImage = typeof window !== 'undefined' ? `${window.location.origin}/placeholder.jpg` : '';

  const ogTitle = post?.metaTitle || post?.title || defaultTitle;
  
  // Build description from CONTENT field (what user wants to share)
  // Priority: metaDescription > excerpt > content (from blog.content field)
  let ogDescription = post?.metaDescription || "";
  if (!ogDescription && post?.excerpt) {
    ogDescription = post.excerpt.trim();
  }
  // Extract from blog.content field - the actual blog post content
  if (!ogDescription && post?.content) {
    // Strip HTML tags and get meaningful text from content
    const textContent = post.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    // Take first 300 characters, but try to end at a sentence for better display
    ogDescription = textContent.substring(0, 300);
    const lastPeriod = ogDescription.lastIndexOf('.');
    if (lastPeriod > 200) {
      ogDescription = ogDescription.substring(0, lastPeriod + 1);
    } else if (textContent.length > 300) {
      ogDescription += '...';
    }
  }
  if (!ogDescription) {
    ogDescription = defaultDescription;
  }
  // Clean any remaining HTML
  ogDescription = ogDescription.replace(/<[^>]*>/g, '').trim();
  
  // Build absolute image URL - PRIORITIZE FEATURED IMAGE (what user wants MOST)
  // Use featuredImage first (user's priority), then ogImage as fallback
  let ogImageUrl = defaultImage;
  if (post?.ogImagePath) {
    ogImageUrl = buildAbsoluteUrl(post.ogImagePath);
  }
  
  // Ensure the URL is absolute (starts with http:// or https://)
  if (ogImageUrl && !ogImageUrl.startsWith('http://') && !ogImageUrl.startsWith('https://')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    ogImageUrl = ogImageUrl.startsWith('/') ? `${origin}${ogImageUrl}` : `${origin}/${ogImageUrl}`;
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{ogTitle}</title>
        <meta name="title" content={ogTitle} />
        <meta name="description" content={ogDescription} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        {currentUrl && <meta property="og:url" content={currentUrl} />}
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
        <meta property="og:image:secure_url" content={ogImageUrl?.replace('http://', 'https://') || ogImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content={siteName} />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@akirasafaris" />
        {currentUrl && <meta name="twitter:url" content={currentUrl} />}
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}

        {/* Article specific meta tags */}
        {post?.author && <meta property="article:author" content={post.author} />}
        {post?.publishDate && <meta property="article:published_time" content={new Date(post.publishDate).toISOString()} />}
        {post?.category && <meta property="article:section" content={post.category} />}
        {post?.tags && post.tags.length > 0 && post.tags.map((tag, index) => (
          <meta key={`tag-${index}`} property="article:tag" content={tag} />
        ))}
      </Helmet>
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
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/blog")}
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
            Back to Blog
          </Button>

          <Paper
            elevation={0}
            sx={{
              py: { xs: 0.75, sm: 1, md: 1.25 },
              px: { xs: 1.5, sm: 1.5, md: 1.5 },
              borderRadius: { xs: 3, md: 4 },
              background: "#FFFFFF",
              border: "1px solid rgba(19, 236, 19, 0.15)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Hero Image */}
            <Box
              sx={{
                width: "100%",
                height: { xs: "300px", sm: "400px", md: "500px" },
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={post?.featuredImage || "/placeholder.jpg"}
                alt={post?.title || "Blog Post"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 30%",
                }}
              />
            </Box>

            {/* Article Content */}
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Category and Meta */}
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={post?.category || "Article"}
                  sx={{
                    mb: 2,
                    backgroundColor: "#13ec13",
                    color: "#0d1b0d",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    px: 1,
                  }}
                />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  color: "#0d1b0d",
                  fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.6rem" },
                  lineHeight: 1.2,
                }}
              >
                {post?.title || "Loading..."}
              </Typography>

                {/* Author and Date Info */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 2,
                    mb: 3,
                    pb: 2,
                    borderBottom: "1px solid rgba(19, 236, 19, 0.15)",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Avatar
                      src={post?.authorImage}
                      alt={post?.author || "Author"}
                      sx={{ width: 48, height: 48 }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: "#0d1b0d",
                          fontSize: "0.95rem",
                        }}
                      >
                        {post?.author || "Loading..."}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <CalendarToday
                          sx={{ fontSize: 14, color: "#13ec13" }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#000000",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {post?.publishDate ? new Date(post.publishDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          ) : "Loading..."}
                        </Typography>
                        <AccessTime
                          sx={{ fontSize: 14, color: "#13ec13", ml: 1 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#000000",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {post?.readTime || "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Share Buttons */}
                  <Box sx={{ ml: "auto", display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        display: { xs: "none", sm: "flex" },
                        alignItems: "center",
                        color: "#000000",
                        fontWeight: 600,
                        mr: 1,
                      }}
                    >
                      Share:
                    </Typography>
                    <IconButton
                      onClick={() => handleShare("facebook")}
                      sx={{
                        color: "#1877F2",
                        outline: "none",
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                        "&:hover": { backgroundColor: "rgba(24, 119, 242, 0.1)" },
                      }}
                    >
                      <Facebook />
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare("twitter")}
                      sx={{
                        color: "#000000",
                        outline: "none",
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
                      }}
                    >
                      <XIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare("linkedin")}
                      sx={{
                        color: "#0077B5",
                        outline: "none",
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                        "&:hover": { backgroundColor: "rgba(0, 119, 181, 0.1)" },
                      }}
                    >
                      <LinkedIn />
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare("whatsapp")}
                      sx={{
                        color: "#25D366",
                        outline: "none",
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                        "&:hover": { backgroundColor: "rgba(37, 211, 102, 0.1)" },
                      }}
                    >
                      <WhatsApp />
                    </IconButton>
                    <IconButton
                      onClick={() => handleShare("instagram")}
                      sx={{
                        color: "#E4405F",
                        outline: "none",
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                        "&:hover": { backgroundColor: "rgba(228, 64, 95, 0.1)" },
                        position: "relative",
                      }}
                      title={copied ? "Link copied!" : "Copy link to share on Instagram"}
                    >
                      <Instagram />
                    </IconButton>
                    <MotionButton
                      variant="outlined"
                      size={isMobile ? "small" : "medium"}
                      onClick={handleLike}
                      disabled={likeLoading}
                    disableRipple
                    disableFocusRipple
                      key={post?.likes}
                      whileTap={{ scale: 0.94 }}
                      animate={{ scale: [1, 1.12, 1] }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      sx={{
                      borderColor: "#13ec13",
                      color: "#13ec13",
                      fontWeight: 700,
                      ml: { xs: 0, sm: 1 },
                      "&:hover": { borderColor: "#11d411", backgroundColor: "rgba(19, 236, 19, 0.1)" },
                        "&:focus": { outline: "none" },
                        "&:focus-visible": { outline: "none" },
                      }}
                    >
                      {`👍 ${post?.likes ?? 0}`}
                    </MotionButton>
                  </Box>
                </Box>
              </Box>

              {/* Article Content */}
              <Box
                sx={{
                  mb: 4,
                  "& p": {
                    mb: 2,
                    color: "#000000",
                    lineHeight: 1.8,
                    fontSize: { xs: "1.1rem", md: "1.15rem" },
                    fontWeight: 500,
                  },
                  "& h2": {
                    mt: 4,
                    mb: 2,
                    fontWeight: 800,
                    color: "#0d1b0d",
                    fontSize: { xs: "1.5rem", md: "1.75rem" },
                  },
                  "& ul": {
                    mb: 2,
                    pl: 3,
                  },
                  "& li": {
                    mb: 1,
                    color: "#000000",
                    lineHeight: 1.8,
                  },
                  "& strong": {
                    fontWeight: 700,
                    color: "#0d1b0d",
                  },
                }}
              >
                {post?.content ? formatMarkdown(post.content) : (
                  <Typography variant="body1" sx={{ color: "#000000", fontStyle: "italic" }}>
                    Loading content...
                  </Typography>
                )}
              </Box>

              {/* Tags */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 1.5,
                    color: "#0d1b0d",
                    fontSize: "1.2rem",
                  }}
                >
                  Tags
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {post?.tags?.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      variant="outlined"
                      sx={{
                        borderColor: "rgba(19, 236, 19, 0.3)",
                        color: "#13ec13",
                        fontWeight: 700,
                        "&:hover": {
                          backgroundColor: "rgba(19, 236, 19, 0.1)",
                        },
                      }}
                    />
                  )) || (
                    <Typography variant="body2" sx={{ color: "#000000", fontStyle: "italic" }}>
                      Loading tags...
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Related Posts */}
              {(relatedPosts?.length > 0) && (
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      mb: 3,
                      color: "#0d1b0d",
                      fontSize: { xs: "1.4rem", md: "1.6rem" },
                    }}
                  >
                    Related Articles
                  </Typography>
                  <Grid container spacing={3}>
                    {relatedPosts.map((relatedPost, index) => (
                      <Grid item xs={12} sm={12} md={12} key={relatedPost.id} sx={{ width: "100%" }}>
                        <MotionBox
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Card
                            sx={{
                              width: "100%",
                              minHeight: { xs: 380, md: 260 },
                              display: "flex",
                              flexDirection: { xs: "column", md: "row" },
                              alignItems: "stretch",
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-8px)",
                                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                              },
                            }}
                            onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                          >
                            <CardMedia
                              component="img"
                              sx={{
                                width: { xs: "100%", md: "360px" },
                                maxWidth: { md: "360px" },
                                minWidth: { md: "360px" },
                                height: { xs: "220px", md: "240px" },
                                objectFit: "cover",
                                objectPosition: "center 30%",
                                flexShrink: 0,
                              }}
                              image={relatedPost.featuredImage}
                              alt={relatedPost.title}
                            />
                            <CardContent
                              sx={{
                                p: 2.5,
                                display: "flex",
                                flexDirection: "column",
                                flex: 1,
                              }}
                            >
                              <Chip
                                label={relatedPost.category}
                                size="small"
                                sx={{
                                  mb: 1,
                                  backgroundColor: "#13ec13",
                                  color: "#0d1b0d",
                                  fontWeight: 700,
                                  fontSize: "0.75rem",
                                  alignSelf: "flex-start",
                                }}
                              />
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 800,
                                  mb: 1,
                                  color: "#0d1b0d",
                                  fontSize: "1.1rem",
                                  lineHeight: 1.3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {relatedPost.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{
                                  mb: 2,
                                  color: "#000000",
                                  fontSize: "1rem",
                                  lineHeight: 1.6,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {relatedPost.excerpt}
                              </Typography>
                              <Button
                                endIcon={<ArrowForward />}
                                onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                                sx={{
                                  color: "#13ec13",
                                  fontWeight: 700,
                                  alignSelf: "flex-start",
                                  justifyContent: "flex-start",
                                  px: 0,
                                  "&:focus": { outline: "none", boxShadow: "none" },
                                  "&:focus-visible": { outline: "none", boxShadow: "none" },
                                  "&:hover": {
                                    backgroundColor: "transparent",
                                    color: "#11d411",
                                  },
                                }}
                              >
                                Read More
                              </Button>
                            </CardContent>
                          </Card>
                        </MotionBox>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Call to Action */}
              <Box
                sx={{
                  mt: 5,
                  p: 3,
                  background:
                    "linear-gradient(135deg, #13ec13, #11d411)",
                  borderRadius: 3,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    color: "#0d1b0d",
                    fontSize: { xs: "1.3rem", md: "1.5rem" },
                  }}
                >
                  Ready to Transform Your Agribusiness?
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenContactDialog}
                  sx={{
                    backgroundColor: "#0d1b0d",
                    color: "#13ec13",
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    outline: "none",
                    "&:focus": { outline: "none", boxShadow: "none" },
                    "&:focus-visible": { outline: "none", boxShadow: "none" },
                    "&:hover": {
                      backgroundColor: "#0a150a",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(13, 27, 13, 0.3)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  Contact MK
                </Button>
              </Box>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Link copied! Instagram opened. Paste the link in your post."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Contact Dialog */}
      <Dialog
        open={openContactDialog}
        onClose={handleCloseContactDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            maxWidth: "600px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#0d1b0d",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
            px: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            Contact Us
          </Typography>
          <IconButton
            onClick={handleCloseContactDialog}
            sx={{
              color: "white",
              outline: "none",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
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
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: "#f6f8f6",
          }}
        >
          <Box 
            component="form" 
            onSubmit={handleContactSubmit} 
            id="contact-form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              width: "100%",
            }}
          >
            {/* Full Name */}
            <TextField
              fullWidth
              label="Full Name"
              required
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              sx={{
                width: "100%",
                mt: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Email */}
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Phone Number */}
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />

            {/* Type of Service */}
            <FormControl fullWidth sx={{ width: "100%" }}>
              <InputLabel
                sx={{
                  "&.Mui-focused": {
                    color: "#13ec13",
                  },
                }}
              >
                Type of Service Interested In
              </InputLabel>
              <Select
                value={formData.serviceType}
                onChange={(e) => handleInputChange("serviceType", e.target.value)}
                label="Type of Service Interested In"
                sx={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(0, 0, 0, 0.23)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                }}
              >
                <MenuItem value="Project Design & Development">Project Design & Development</MenuItem>
                <MenuItem value="BSF Training & Setup">BSF Training & Setup</MenuItem>
                <MenuItem value="Proposal Writing">Proposal Writing</MenuItem>
                <MenuItem value="Farm Consultation">Farm Consultation</MenuItem>
                <MenuItem value="Agribusiness Planning">Agribusiness Planning</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Message */}
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={5}
              required
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              placeholder="Tell us about your agribusiness needs..."
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#13ec13",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#13ec13",
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            pt: 0,
            backgroundColor: "#f6f8f6",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleCloseContactDialog}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              color: "#000000",
              textTransform: "none",
              fontWeight: 600,
              outline: "none",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.05)",
              },
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
            Cancel
          </Button>
          <Button
            type="submit"
            form="contact-form"
            variant="contained"
            disabled={contactLoading}
            startIcon={contactLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
            sx={{
              px: 4,
              py: 1,
              backgroundColor: "#13ec13",
              color: "#0d1b0d",
              fontWeight: 700,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              outline: "none",
              "&:hover": {
                backgroundColor: "#11d411",
                boxShadow: "0 6px 16px rgba(17, 212, 17, 0.4)",
              },
              "&:focus": {
                outline: "none",
                boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              },
              "&:focus-visible": {
                outline: "none",
                boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)",
              },
              "&:disabled": {
                backgroundColor: "#ccc",
                color: "white",
              },
            }}
          >
            {contactLoading ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </>
  );
}
