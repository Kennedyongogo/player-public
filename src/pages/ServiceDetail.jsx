import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Box,
  Typography,
  Container,
  Paper,
  Chip,
  Button,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Alert,
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
import { postQuote } from "../api";
import {
  ArrowBack,
  Facebook,
  LinkedIn,
  WhatsApp,
  ArrowForward,
  Close,
  Send,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const MotionBox = motion(Box);

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

// Helper function to create slug from title
const createSlugFromTitle = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const buildImageUrl = (path) => {
  if (!path) return null;
  const normalized = String(path).replace(/\\/g, '/');
  if (normalized.startsWith('http')) return normalized;
  if (normalized.startsWith('/')) return normalized;
  return `/${normalized}`;
};

// Sample services with detailed content
const sampleServices = [
  {
    id: 1,
    slug: "project-design-management",
    title: "Project Design & Management",
    description: "Expert planning and end-to-end execution for large-scale agricultural projects and rural development.",
    content: `Our Project Design & Management service provides comprehensive support from concept to completion for agricultural and rural development projects.

**What We Offer:**

- **Feasibility Studies**: Comprehensive analysis of project viability, market potential, and resource requirements
- **Project Planning**: Detailed project timelines, budgets, and resource allocation strategies
- **Design & Engineering**: Technical designs for infrastructure, irrigation systems, and farm layouts
- **Implementation Management**: On-ground project execution with quality control and timeline management
- **Monitoring & Evaluation**: Continuous assessment of project progress and impact measurement

**Why Choose Us:**

We bring years of experience in managing complex agricultural projects across East Africa. Our team ensures that every project is delivered on time, within budget, and meets the highest quality standards. We work closely with stakeholders to ensure sustainable outcomes that benefit communities and investors alike.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBoP_IBYmdTueJfsPjFhMH8NtB0Uh1aRNyRoVAHyLrukWfjNkKin2uDT0mhQW4mLhxEaZlZxj4ZYucHFwdd5-IpynArcuAci9QVQTdLFtxqQHjR27qHhf0jM0cxQVtxZeR5WJ5pFvk2mu866HaQ9nd1DGwL-iTfDvCHWcVteossiYgtGgc4AlyD_rSPpkM_CyMxAL693XA_Wk9xU5VzcS3y77sVTeKZk2pi89zumfUEcdhgV_N7NGf29WI3F3x0MDx7u2jIhzTk7mJo",
    tags: ["Project Management", "Design", "Implementation"],
  },
  {
    id: 2,
    slug: "proposal-development",
    title: "Proposal Development",
    description: "Professional grant proposals and business plans tailored to secure funding and drive enterprise growth.",
    content: `Our Proposal Development service helps you create compelling, well-structured proposals that stand out to funders and investors.

**What We Offer:**

- **Grant Proposal Writing**: Tailored proposals for local and international funding opportunities
- **Business Plan Development**: Comprehensive business plans with financial projections and market analysis
- **Technical Proposals**: Detailed technical documentation for infrastructure and development projects
- **Proposal Review & Editing**: Expert review and refinement of existing proposals
- **Funding Strategy**: Identification of suitable funding sources and application strategies

**Our Success Rate:**

With over 80% approval rate on proposals we've developed, we understand what funders are looking for. Our team stays updated on the latest funding opportunities and requirements, ensuring your proposals meet all criteria and stand the best chance of approval.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6gAVHpOl8XLRI1NdAlCmbNte0t9u2SS3j0mlBW1dgw4NbcN73loDpllImFLjy_XITqqQA_o-OFzGf7dwkES8QN9X8XE47t1toXBZAfHLfZHHdqDgXzlkRQ9ocvHBNPEJ1Ec-3jtIHuNuaJepAxdaO5APCih6XkjGGj1kPxh_PZJ2oWH3gRj7a-I-OOi8ZIOAQXjH4zwo_DP4OX4gHALGuD0BPZUK9kBOdK057Oisopht-OxEgPUliCBee-UieeEuZs-QqlWD933Rc",
    tags: ["Proposals", "Grants", "Business Plans"],
  },
  {
    id: 3,
    slug: "bsf-production",
    title: "BSF Production",
    description: "Sustainable protein production through innovative Black Soldier Fly technology for animal feed systems.",
    content: `Black Soldier Fly (BSF) production is revolutionizing animal feed production in Africa. Our specialized BSF service provides complete setup and training for sustainable protein production.

**What We Offer:**

- **BSF Farm Design**: Custom-designed BSF production units optimized for your scale and location
- **Training Programs**: Comprehensive hands-on training for farmers and entrepreneurs
- **Production Setup**: End-to-end setup including infrastructure, equipment, and initial stock
- **Technical Support**: Ongoing technical assistance and troubleshooting
- **Market Linkage**: Connections to feed manufacturers and buyers

**Why BSF?**

BSF larvae convert organic waste into high-quality protein (up to 40% protein content) that's perfect for poultry and fish feed. This sustainable approach reduces feed costs by up to 60% while addressing waste management challenges. Our clients have seen significant cost savings and improved farm profitability.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuATVi__6O-OiV7QFnJvil843alCQeGmxl7pySjoi69VtE0LlfrOWLRPDHW-z4ht9HerIp05z1y1hYp-4yq2XLE26rTopiGsPNqFE6Sh4NZuWXY1JjB1k5S7iLuvTrMUXraZAkoH19N_2VswvHLE7F5nSDbd5BPDqgHgMBU_xmlApgL0oZ4BaYIyWNv6wenFSl5OuEdUzIFJPGTZOtmKS7c3iLGP_ji1AwAyNdGTkDCjEIrkRwmso1SVPLG-ETWMMleN0UwDGePiC6ol",
    tags: ["BSF", "Sustainability", "Protein Production"],
  },
  {
    id: 4,
    slug: "digital-farm-solutions",
    title: "Digital Farm Solutions",
    description: "Cutting-edge digital tools and IoT for precision farming, real-time monitoring, and data management.",
    content: `Transform your farm operations with our Digital Farm Solutions, leveraging IoT sensors, automation, and data analytics.

**What We Offer:**

- **IoT Sensor Installation**: Soil moisture, temperature, humidity, and crop health monitoring systems
- **Automated Irrigation**: Smart irrigation systems that optimize water usage and reduce costs
- **Farm Management Software**: Digital platforms for tracking inventory, sales, and operations
- **Data Analytics**: Insights from farm data to improve decision-making and productivity
- **Training & Support**: Comprehensive training on using digital tools effectively

**Impact:**

Our digital solutions have helped farmers reduce water usage by up to 40%, improve crop yields by 25%, and make data-driven decisions that increase profitability. Real-time monitoring allows for early problem detection and proactive management.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCom-j2yR5pG05CTzLyQF5SNH7KrpiMgvS0OE9GlgtQBlDAZhh4Xvu0W1TYCo_P9UEElb2vP5Y7Hbvgt2XNLj8fO7DTXIKhE6GQ_7dFA92izFKlAlc9Xu-oOiQ8ffXLWh9jEooWCy4TX4yuIk2YUBxs_yo8wOJoW-UbtdwA_MbGPKzgdwRXMVy55M1v61ys0OvTLqxXjeQv1s_NjlcRij1Dj-yuqAI0s9qDNuvZXZ21rezLH8igaCK3ZXVUUiqVOG-XlcY-66mC3wzM",
    tags: ["Technology", "IoT", "Automation"],
  },
  {
    id: 5,
    slug: "market-research",
    title: "Market Research",
    description: "Comprehensive analysis of local and global agricultural markets to identify opportunities and risks.",
    content: `Make informed business decisions with our comprehensive market research services for agricultural products and services.

**What We Offer:**

- **Market Analysis**: In-depth analysis of local, regional, and international markets
- **Consumer Research**: Understanding consumer preferences, buying patterns, and trends
- **Competitor Analysis**: Assessment of market competition and positioning strategies
- **Price Analysis**: Market pricing trends and optimal pricing strategies
- **Market Entry Strategies**: Roadmaps for entering new markets or expanding existing operations

**Our Approach:**

We combine traditional research methods with modern data analytics to provide actionable insights. Our reports include market size, growth projections, opportunities, threats, and strategic recommendations tailored to your business goals.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuA1noHdkuUXFID-OwkBvMiBstb1pnqgcu6uS4BwKRqVMV8F6BQlFOtJdje0HxTVuISn0Gz-a8lGAgYA5hv52TNzatKWlw5ol-j22ortyTSqlRd3eG5sBzzjEAhk5F3lqzSMl7jlumMHeyotxLfO9HC2vVQp3MDMtHQwyWCs3-Qgp58jrJROoVoCoQqvR0XjeKV5dgaLVJp5UsRuuqo-a8hLMFK77vWJvtcMf1akSQDLyuOiZEPGcsTfmtsEj88oyZ1MFQVzEMCGWMPS",
    tags: ["Research", "Market Analysis", "Strategy"],
  },
  {
    id: 6,
    slug: "supply-chain-optimization",
    title: "Supply Chain Optimization",
    description: "Streamlining logistics from the farm gate to the consumer, reducing waste and increasing profitability.",
    content: `Optimize your supply chain to reduce costs, minimize waste, and improve efficiency from production to consumption.

**What We Offer:**

- **Supply Chain Analysis**: Comprehensive assessment of your current supply chain operations
- **Logistics Optimization**: Route planning, transportation efficiency, and cost reduction strategies
- **Cold Chain Management**: Design and implementation of cold storage and transportation systems
- **Post-Harvest Handling**: Best practices for handling, storage, and preservation of agricultural products
- **Market Linkage**: Connections to reliable buyers, processors, and distributors

**Results:**

Our supply chain optimization services have helped clients reduce post-harvest losses by up to 30%, cut transportation costs by 25%, and improve product quality reaching the market. We focus on creating efficient, sustainable supply chains that benefit all stakeholders.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuByrB-V25kF4rJhL5VBZP2fGreKr382xkGAagF9oz3CLiiyx_HqYBqhcTrLF5eGxpkkkh-kJeeKzbSYAjZx97jBt4cs71JUl_xcBJfUeOJmZeonDj35CQ5c9XlmimyApeVNoFMUgVBmJVzlAWCKYcMnT3qn6i6SNowqqnbHHHGFlSVU_h6KmMQMwd_uIRUSTM5_2hrgQhNpZ7FufJXjRgwH_zBlPS73_rsZDIBawDplB7FCkLvSS5izTY_u5IKOUjpfr9gEdPZP-t2b",
    tags: ["Logistics", "Supply Chain", "Efficiency"],
  },
  {
    id: 7,
    slug: "agricultural-training",
    title: "Agricultural Training",
    description: "Building human capacity through hands-on technical training sessions and workshops for farmers.",
    content: `Build the skills and knowledge needed for successful farming through our comprehensive agricultural training programs.

**What We Offer:**

- **Technical Training**: Hands-on training in modern farming techniques and best practices
- **Workshop Programs**: Interactive workshops covering various aspects of agriculture
- **Farmer Field Schools**: Practical learning experiences in real farm settings
- **Extension Services**: Ongoing support and knowledge transfer to farming communities
- **Certification Programs**: Recognized certification for completed training courses

**Training Topics Include:**

- Crop production and management
- Livestock husbandry and health
- Soil management and fertility
- Water management and irrigation
- Pest and disease control
- Post-harvest handling
- Business and financial management

Our training programs are designed to be practical, accessible, and immediately applicable. We've trained over 1,200 farmers who have seen significant improvements in productivity and profitability.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuD37_pHJ7e_TCaZV8BZ5ImkiJtiROuFisWxmRaH_G2y6DHmvXet0hT0K8BGOsoOfL_p75YQnqX7uswUZA4_09uLysAYwUYnepNLSVgdKhU9gDUqS3_JyrVr_UiPcy0aHt95Bp4xq0eYc2RLldShmiDUqynfYGXC5qq7lIO2-f-uGd_x98C0q7pxvhU_M4v7ra3hk2YqzkedotTKtk1hJFfZ36Hppe-JySNr2IdXk-5q_4fuNC-Ym-TZimYEaDq6YfWEdzz9Uwty4rCZ",
    tags: ["Training", "Education", "Capacity Building"],
  },
  {
    id: 8,
    slug: "sustainability-consulting",
    title: "Sustainability Consulting",
    description: "Implementing regenerative and eco-friendly practices to ensure long-term environmental viability.",
    content: `Create sustainable, environmentally responsible farming operations that benefit both the planet and your bottom line.

**What We Offer:**

- **Sustainability Audits**: Comprehensive assessment of your farm's environmental impact
- **Regenerative Agriculture**: Implementation of practices that restore soil health and biodiversity
- **Organic Certification**: Guidance through organic certification processes
- **Climate Resilience**: Strategies for adapting to climate change and extreme weather
- **Carbon Footprint Reduction**: Methods to reduce greenhouse gas emissions and improve efficiency

**Our Approach:**

We help farmers transition to sustainable practices that not only protect the environment but also improve long-term productivity and profitability. Our regenerative agriculture methods have helped clients improve soil health, increase biodiversity, and reduce input costs while maintaining or improving yields.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJw1vJYo0MzBQoaLFzmm-pFL2CRdnj5da1JJBdNVCj81v4WavcSThYdHK5QWtplJTnvO58OJcV9oV5rpUU5aHpsnP3Yx7qVFeRYcjncvofemrQIXcpzfw8dADYj3UjK6dbZ3XHb4VVf7-Drm23LhdMECzP9HpoKjucd3ILIIfhs0JSdqUrU75snyOqco17sbnxa7UfzXoDQTz9XAKLezb9zh46xJcUkKXoShOMluzpNokPuBeRpP8mGv5B7zupXw1r1h64hpoiuEt-",
    tags: ["Sustainability", "Environment", "Regenerative"],
  },
  {
    id: 9,
    slug: "investment-advisory",
    title: "Investment Advisory",
    description: "Strategic financial advice and due diligence for agribusiness investors looking to enter emerging markets.",
    content: `Navigate agricultural investments with confidence through our expert investment advisory services.

**What We Offer:**

- **Investment Analysis**: Comprehensive evaluation of agricultural investment opportunities
- **Due Diligence**: Thorough assessment of potential investments, risks, and returns
- **Financial Modeling**: Detailed financial projections and ROI analysis
- **Market Entry Strategies**: Strategic guidance for entering new agricultural markets
- **Risk Assessment**: Identification and mitigation of investment risks

**For Investors:**

Whether you're looking to invest in existing farms, start new agricultural ventures, or expand your portfolio, we provide the expertise and analysis needed to make informed decisions. Our advisory services help you understand market dynamics, assess opportunities, and structure deals that maximize returns while managing risks.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDITJhGx6vRA0BOEc0racv1g6RqqK2OFXmR0oDYUZloShdWhvHV41DTlfUKw4fxz-hIXevdUeaqYNctgPCbgDFDKCCPC5fsUD_D7aHDPj85lhnjETe_hw-70BixyYzO4gnzNsg-gfjTe5vgZ9ANLaRRZBMdkX8YmHGW-I4_i7lDwLPCJJL0TSggOSA15qzBwrLIOhekbDNqdwPL4ecGRNJmfeg8pJwgNIfda9fq1jspfaJKqIqAXYza0Y17Cjvye4ItKRB8CTfk6Lfa",
    tags: ["Investment", "Finance", "Advisory"],
  },
  {
    id: 10,
    slug: "feasibility-studies",
    title: "Feasibility Studies",
    description: "Detailed analysis of technical and economic viability to de-risk your agricultural ventures.",
    content: `Make informed decisions with comprehensive feasibility studies that assess the viability of your agricultural projects.

**What We Offer:**

- **Technical Feasibility**: Assessment of technical requirements, resources, and implementation challenges
- **Economic Analysis**: Financial viability, cost-benefit analysis, and ROI projections
- **Market Feasibility**: Market demand analysis, competition assessment, and sales projections
- **Environmental Impact**: Environmental assessment and sustainability considerations
- **Risk Analysis**: Identification of potential risks and mitigation strategies

**Comprehensive Reports:**

Our feasibility studies provide detailed analysis across all critical dimensions of your project. We deliver comprehensive reports that include market analysis, financial projections, technical assessments, risk evaluations, and actionable recommendations. These studies help you make informed decisions and secure funding from investors and lenders.`,
    featuredImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCukQOnvNp8aGeGUfZqWgM90q7hwbEwyMaVlDc20f4obAKjMExXI0jllQ7542tZZi8gDFW_O91evrlikrDGgxiSwADelK_YfNK563WbtlLDRoA40G3PtPyhDOWiKDkphDhVipPZOQ1AdcMrIkR9wvXmkxyZMB3UwwrygFoPAB620KxQM9hZvlmhhiTZ6Ppd3b1_vYuFid7rwVpqSa1fpv6uB6FQSn-tdq2-atQphF-rS9KwrIEIViJ3_ulTBjyOQM2RKA88Sd3EFjad",
    tags: ["Analysis", "Feasibility", "Planning"],
  },
];

export default function ServiceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [openQuoteDialog, setOpenQuoteDialog] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    projectType: "",
    location: "",
    scaleOfOperation: "",
    expectedOutcomes: "",
  });

  useEffect(() => {
    const fetchService = async () => {
      if (!slug) {
        setLoading(false);
        setError("Invalid service");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        setService(null);
        setRelatedServices([]);

        // Fetch from API first (published service by slug)
        const res = await fetch(`/api/services/public/${encodeURIComponent(slug)}`);
        const data = await res.json();

        if (res.ok && data.success && data.data) {
          const s = data.data;
          const imageUrl = buildImageUrl(s.image) || "/placeholder.jpg";
          setService({
            id: s.id,
            slug: s.slug,
            title: s.title,
            description: s.shortDescription || s.description,
            content: s.fullContent || s.description || "",
            featuredImage: imageUrl,
            tags: Array.isArray(s.benefits) ? s.benefits : (Array.isArray(s.useCases) ? s.useCases : []),
          });
          // Optionally load related services by IDs
          const relatedIds = Array.isArray(s.relatedServiceIds) ? s.relatedServiceIds : [];
          if (relatedIds.length > 0) {
            const allRes = await fetch("/api/services/public?limit=50");
            const allData = await allRes.json();
            if (allRes.ok && allData.success && Array.isArray(allData.data)) {
              const related = allData.data
                .filter((svc) => relatedIds.includes(svc.id) && svc.slug !== s.slug)
                .slice(0, 3)
                .map((svc) => ({
                  id: svc.id,
                  slug: svc.slug,
                  title: svc.title,
                  description: svc.shortDescription || svc.description,
                  featuredImage: buildImageUrl(svc.image) || "/placeholder.jpg",
                }));
              setRelatedServices(related);
            }
          }
          setLoading(false);
          return;
        }

        // Fallback: check if it's a sample service
        const sampleService = sampleServices.find((s) => s.slug === slug);
        if (sampleService) {
          setService(sampleService);
          const related = sampleServices.filter((s) => s.slug !== slug).slice(0, 3);
          setRelatedServices(related);
          setLoading(false);
          return;
        }

        throw new Error("Service not found");
      } catch (err) {
        setError(err.message || "Failed to load service");
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = service?.title || "";
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };
    
    window.open(shareUrls[platform], "_blank", "width=600,height=400");
  };

  const handleOpenQuoteDialog = () => setOpenQuoteDialog(true);

  const handleCloseQuoteDialog = () => {
    setOpenQuoteDialog(false);
    setQuoteFormData({
      projectType: "",
      location: "",
      scaleOfOperation: "",
      expectedOutcomes: "",
    });
  };

  const handleQuoteInputChange = (field, value) => {
    setQuoteFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteFormData.projectType || !quoteFormData.location || !quoteFormData.scaleOfOperation || !quoteFormData.expectedOutcomes) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all required fields.",
        confirmButtonColor: "#13ec13",
      });
      return;
    }
    setQuoteLoading(true);
    try {
      const data = await postQuote({ ...quoteFormData, service: service?.title });
      if (!data.success) {
        throw new Error(data.message || "Failed to submit quote request");
      }
      Swal.fire({
        icon: "success",
        title: "Quote Request Submitted!",
        text: "Thank you for your interest. We'll prepare a detailed proposal and get back to you soon.",
        confirmButtonColor: "#13ec13",
      });
      handleCloseQuoteDialog();
    } catch (err) {
      console.error("Error submitting quote request:", err);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err.message || "Please try again later.",
        confirmButtonColor: "#13ec13",
      });
    } finally {
      setQuoteLoading(false);
    }
  };

  const formatMarkdown = (content) => {
    if (!content) return null;
    const lines = content.split("\n");
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
                  fontSize: { xs: "1.05rem", md: "1.1rem" },
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
                  fontSize: { xs: "1.05rem", md: "1.1rem" },
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

  if (error && !service) {
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
            {error || "Service not found"}
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
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
            Back
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>{service?.title || "Service Details"} - MK Agribusiness</title>
        <meta name="description" content={service?.description || ""} />
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
          {/* Back Button - goes to previous page (e.g. home Key Services) or home if no history */}
          <Button
            startIcon={<ArrowBack />}
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
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
            Back
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
                src={service?.featuredImage || "/placeholder.jpg"}
                alt={service?.title || "Service"}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 30%",
                }}
              />
            </Box>

            {/* Service Content */}
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Title and Meta */}
              <Box sx={{ mb: 2 }}>
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
                  {service?.title || "Loading..."}
                </Typography>

                {/* Share Buttons */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3, pb: 2, borderBottom: "1px solid rgba(19, 236, 19, 0.15)" }}>
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
                </Box>
              </Box>

              {/* Service Content */}
              <Box
                sx={{
                  mb: 4,
                  "& p": {
                    mb: 2,
                    color: "#000000",
                    lineHeight: 1.8,
                    fontSize: { xs: "1.05rem", md: "1.1rem" },
                    fontWeight: 700,
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
                    fontWeight: 700,
                  },
                  "& strong": {
                    fontWeight: 700,
                    color: "#0d1b0d",
                  },
                }}
              >
                {service?.content ? formatMarkdown(service.content) : (
                  <Typography variant="body1" sx={{ color: "#000000", fontWeight: 700, fontStyle: "italic" }}>
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
                  {service?.tags?.map((tag, index) => (
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
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Related Services */}
              {(relatedServices?.length > 0) && (
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
                    Related Services
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {relatedServices.map((relatedService, index) => (
                      <MotionBox
                        key={relatedService.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Paper
                          sx={{
                            p: 3,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            border: "1px solid rgba(19, 236, 19, 0.1)",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                              borderColor: "rgba(19, 236, 19, 0.3)",
                            },
                          }}
                          onClick={() => navigate(`/service/${relatedService.slug}`)}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              mb: 1,
                              color: "#0d1b0d",
                              fontSize: "1.2rem",
                            }}
                          >
                            {relatedService.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              mb: 2,
                              color: "#000000",
                              fontWeight: 700,
                              lineHeight: 1.6,
                            }}
                          >
                            {relatedService.description}
                          </Typography>
                          <Button
                            endIcon={<ArrowForward />}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/service/${relatedService.slug}`);
                            }}
                            sx={{
                              color: "#13ec13",
                              fontWeight: 700,
                              px: 0,
                              "&:focus": { outline: "none", boxShadow: "none" },
                              "&:focus-visible": { outline: "none", boxShadow: "none" },
                              "&:hover": {
                                backgroundColor: "transparent",
                                color: "#11d411",
                              },
                            }}
                          >
                            Learn More
                          </Button>
                        </Paper>
                      </MotionBox>
                    ))}
                  </Box>
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
                  Ready to Get Started?
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleOpenQuoteDialog}
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
                  Request a Quote
                </Button>
              </Box>
            </Box>
          </Paper>
        </MotionBox>
      </Container>
    </Box>

      {/* Quote Request Dialog */}
      <Dialog
        open={openQuoteDialog}
        onClose={handleCloseQuoteDialog}
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
            Request a Quote
          </Typography>
          <IconButton
            onClick={handleCloseQuoteDialog}
            sx={{
              color: "white",
              outline: "none",
              "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
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
            onSubmit={handleQuoteSubmit}
            id="service-quote-form"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              width: "100%",
            }}
          >
            <FormControl fullWidth sx={{ width: "100%", mt: 1 }}>
              <InputLabel sx={{ "&.Mui-focused": { color: "#13ec13" } }}>
                Type of Project *
              </InputLabel>
              <Select
                value={quoteFormData.projectType}
                onChange={(e) => handleQuoteInputChange("projectType", e.target.value)}
                label="Type of Project *"
                required
                sx={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                }}
              >
                <MenuItem value="Crop">Crop</MenuItem>
                <MenuItem value="Livestock">Livestock</MenuItem>
                <MenuItem value="BSF">BSF (Black Soldier Fly)</MenuItem>
                <MenuItem value="Mixed Farming">Mixed Farming</MenuItem>
                <MenuItem value="Aquaculture">Aquaculture</MenuItem>
                <MenuItem value="Agro-processing">Agro-processing</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Location"
              required
              value={quoteFormData.location}
              onChange={(e) => handleQuoteInputChange("location", e.target.value)}
              placeholder="Enter project location (e.g., Nairobi, Kiambu County)"
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#13ec13" },
              }}
            />

            <FormControl fullWidth sx={{ width: "100%" }}>
              <InputLabel sx={{ "&.Mui-focused": { color: "#13ec13" } }}>
                Scale of Operation *
              </InputLabel>
              <Select
                value={quoteFormData.scaleOfOperation}
                onChange={(e) => handleQuoteInputChange("scaleOfOperation", e.target.value)}
                label="Scale of Operation *"
                required
                sx={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(0, 0, 0, 0.23)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                }}
              >
                <MenuItem value="Small Scale">Small Scale (1-10 hectares/units)</MenuItem>
                <MenuItem value="Medium Scale">Medium Scale (10-50 hectares/units)</MenuItem>
                <MenuItem value="Large Scale">Large Scale (50+ hectares/units)</MenuItem>
                <MenuItem value="Commercial">Commercial Enterprise</MenuItem>
                <MenuItem value="Industrial">Industrial Scale</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Expected Outcomes"
              multiline
              rows={5}
              required
              value={quoteFormData.expectedOutcomes}
              onChange={(e) => handleQuoteInputChange("expectedOutcomes", e.target.value)}
              placeholder="Describe your project goals, expected results, and any specific requirements..."
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  borderRadius: 2,
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#13ec13" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#13ec13" },
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
            onClick={handleCloseQuoteDialog}
            sx={{
              mr: 2,
              px: 3,
              py: 1,
              color: "#000000",
              textTransform: "none",
              fontWeight: 600,
              outline: "none",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.05)" },
              "&:focus": { outline: "none", boxShadow: "none" },
              "&:focus-visible": { outline: "none", boxShadow: "none" },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="service-quote-form"
            variant="contained"
            disabled={quoteLoading}
            startIcon={quoteLoading ? <CircularProgress size={20} color="inherit" /> : <Send />}
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
              "&:focus": { outline: "none", boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)" },
              "&:focus-visible": { outline: "none", boxShadow: "0 4px 12px rgba(19, 236, 19, 0.3)" },
              "&:disabled": { backgroundColor: "#ccc", color: "white" },
            }}
          >
            {quoteLoading ? "Submitting..." : "Request Quote"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
