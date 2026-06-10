import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
} from "@mui/material";
import {
  ListAlt,
  ViewList,
  AddCircle,
  Edit,
  Delete,
  ArrowBack,
  Visibility,
  LocationOn,
  ShoppingCartCheckout,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import {
  getMyListings,
  getPublicListings,
  getListingById,
  deleteListing,
} from "../api";
import Footer from "../components/Footer/Footer";

const PRIMARY = "#17cf54";
const PROJECT_GREEN = "#0fbd0f";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const TEXT_MUTED = "#4e9767";
const PLACEHOLDER_IMG = "https://placehold.co/400x240/f6f8f6/4e9767?text=Listing";

const getBaseUrl = () => {
  const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
  return env ? String(env).replace(/\/$/, "") : "";
};

const resolveImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = getBaseUrl();
  return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
};

const formatPrice = (price, unit) => {
  if (price == null || price === "") return null;
  const p = Number(price);
  if (isNaN(p)) return null;
  const u = unit && String(unit).trim() ? ` ${String(unit).trim()}` : "";
  return `${p.toLocaleString()}${u}`;
};

const statusLabel = (status) => {
  const s = String(status || "").replace(/_/g, " ");
  return s ? s.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
};

// WhatsApp: digits only for wa.me link (user should store with country code, e.g. 255...)
const getWhatsAppUrl = (phone, listingTitle) => {
  if (!phone || !String(phone).trim()) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 9) return null;
  const text = listingTitle
    ? encodeURIComponent(`Hi, I'm interested in your listing: ${listingTitle}`)
    : "";
  return text ? `https://wa.me/${digits}?text=${text}` : `https://wa.me/${digits}`;
};

const WhatsAppIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width="24"
    height="24"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function ListingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyListingsPath = location.pathname === "/marketplace/my-listings";

  const [tab, setTab] = useState(isMyListingsPath ? 0 : 1);
  const [myListings, setMyListings] = useState([]);
  const [publicListings, setPublicListings] = useState([]);
  const [loadingMy, setLoadingMy] = useState(false);
  const [loadingPublic, setLoadingPublic] = useState(false);
  const [error, setError] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detailListing, setDetailListing] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);

  // Sync tab with path when navigating between /marketplace/my-listings and /marketplace/listings
  useEffect(() => {
    setTab(location.pathname === "/marketplace/my-listings" ? 0 : 1);
  }, [location.pathname]);

  // Show success message when returning from add/edit
  useEffect(() => {
    if (location.state?.message) setSuccessMessage(location.state.message);
  }, [location.state?.message]);

  const fetchMyListings = async () => {
    setLoadingMy(true);
    setError(null);
    try {
      const data = await getMyListings();
      setMyListings(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load your listings");
      setMyListings([]);
    } finally {
      setLoadingMy(false);
    }
  };

  const fetchPublicListings = async () => {
    setLoadingPublic(true);
    setError(null);
    try {
      const data = await getPublicListings();
      setPublicListings(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to load listings");
      setPublicListings([]);
    } finally {
      setLoadingPublic(false);
    }
  };

  useEffect(() => {
    if (tab === 0) fetchMyListings();
    else fetchPublicListings();
  }, [tab]);

  const openDetail = async (id) => {
    setDetailId(id);
    setDetailListing(null);
    setDetailLoading(true);
    try {
      const data = await getListingById(id);
      setDetailListing(data.data);
    } catch (err) {
      setError(err.message || "Failed to load listing");
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetailListing(null);
  };

  const handleEdit = (listing) => {
    closeDetail();
    navigate("/marketplace/add-listing", { state: { editListing: listing } });
  };

  const handleDelete = async (listing) => {
    const confirmed = await Swal.fire({
      title: "Delete listing?",
      text: `"${listing.title}" will be permanently removed.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d32f2f",
      cancelButtonColor: "#4e9767",
      confirmButtonText: "Delete",
    });
    if (!confirmed.isConfirmed) return;
    setDeletingId(listing.id);
    try {
      await deleteListing(listing.id);
      setMyListings((prev) => prev.filter((l) => l.id !== listing.id));
      closeDetail();
      Swal.fire({
        icon: "success",
        title: "Listing deleted",
        text: "Your listing has been removed.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      setError(err.message || "Failed to delete listing");
    } finally {
      setDeletingId(null);
    }
  };

  const listings = tab === 0 ? myListings : publicListings;
  const loading = tab === 0 ? loadingMy : loadingPublic;
  const canEditDelete = (listing) =>
    tab === 0 &&
    listing &&
    (listing.status === "pending_approval" || listing.status === "rejected");

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: BG_LIGHT,
        color: "#000",
        pt: 2,
        pb: 4,
        width: "100%",
        maxWidth: "100vw",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          px: { xs: 0.5, sm: 0.75 },
          mb: { xs: 0.5, sm: 0.75 },
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/marketplace/dashboard")}
          sx={{
            mt: { xs: 0.5, sm: 0.75 },
            mb: { xs: 0.5, sm: 0.75 },
            color: "#000",
            "&:focus": { outline: "none", boxShadow: "none" },
            "&:focus-visible": { outline: "none", boxShadow: "none" },
          }}
        >
          Dashboard
        </Button>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2,
            border: "1px solid",
            borderColor: BORDER_LIGHT,
            overflow: "hidden",
            p: { xs: "5px", sm: "9px" },
            boxSizing: "border-box",
            width: "calc(100% - 1px)",
            mx: "0.5px",
            mb: "2px",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 2,
              mb: 2,
              width: "100%",
              minWidth: 0,
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, color: "#000", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
              Marketplace Listings
            </Typography>
            {tab === 0 && (
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => navigate("/marketplace/add-listing")}
                sx={{
                  bgcolor: PRIMARY,
                  color: "#000",
                  fontWeight: 700,
                  ml: "auto",
                  mr: 1,
                  flexShrink: 0,
                  minWidth: "fit-content",
                  "&:hover": { bgcolor: "#12a842", color: "#000" },
                  "&:focus": { outline: "none", boxShadow: "none" },
                  "&:focus-visible": { outline: "none", boxShadow: "none" },
                }}
              >
                Add listing
              </Button>
            )}
          </Box>

          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              navigate(v === 0 ? "/marketplace/my-listings" : "/marketplace/listings", { replace: true });
            }}
            sx={{
              borderBottom: 1,
              borderColor: BORDER_LIGHT,
              mb: 2,
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, color: "#000" },
            }}
          >
            <Tab icon={<ListAlt />} iconPosition="start" label="My listings" />
            <Tab icon={<ViewList />} iconPosition="start" label="All listings" />
          </Tabs>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress sx={{ color: PRIMARY }} />
            </Box>
          ) : listings.length === 0 ? (
            <Typography sx={{ py: 4, color: "#000" }}>
              {tab === 0
                ? "You have no listings yet. Add one to get started."
                : "No approved listings at the moment."}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                width: "100%",
              }}
            >
              {listings.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    flex: {
                      xs: "0 1 100%",
                      md: "0 1 calc(50% - 16px)",
                      lg: "0 1 calc(33.333% - 22px)",
                    },
                    display: "flex",
                    minWidth: 0,
                  }}
                >
                  <Card
                    onClick={() => openDetail(item.id)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 4,
                      border: "1px solid rgba(15, 189, 15, 0.1)",
                      boxShadow: "none",
                      overflow: "hidden",
                      transition: "all 0.4s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                        "& .MuiCardMedia-root": { transform: "scale(1.1)" },
                      },
                    }}
                  >
                    <Box sx={{ overflow: "hidden", aspectRatio: "16/10" }}>
                      <CardMedia
                        component="img"
                        image={resolveImageUrl(item.imageUrl) || PLACEHOLDER_IMG}
                        alt={item.title || "Listing"}
                        sx={{
                          transition: "transform 0.6s ease",
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                          bgcolor: "#e8f5e9",
                        }}
                      />
                    </Box>
                    <CardContent sx={{ p: 4, flex: 1, display: "flex", flexDirection: "column" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: PROJECT_GREEN, mb: 2 }}>
                        <LocationOn sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: "uppercase" }}>
                          {item.location || item.category || "Listing"}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: "#000000" }}>
                        {item.title || "Untitled"}
                      </Typography>
                      {item.category && item.category !== (item.location || item.category) && (
                        <Typography variant="body2" sx={{ color: "#000", mb: 1 }}>
                          {item.category}
                        </Typography>
                      )}
                      {formatPrice(item.price, item.priceUnit) && (
                        <Typography variant="body2" sx={{ color: "#000", fontWeight: 600, mb: 2 }}>
                          {formatPrice(item.price, item.priceUnit)}
                        </Typography>
                      )}
                      {tab === 0 && item.status && (
                        <Chip
                          label={statusLabel(item.status)}
                          size="small"
                          sx={{
                            alignSelf: "flex-start",
                            mt: 1,
                            mb: 2,
                            bgcolor:
                              item.status === "approved"
                                ? "rgba(15, 189, 15, 0.1)"
                                : item.status === "rejected"
                                  ? "rgba(0,0,0,0.06)"
                                  : "rgba(245, 158, 11, 0.15)",
                            color:
                              item.status === "approved"
                                ? PROJECT_GREEN
                                : item.status === "rejected"
                                  ? "#666"
                                  : "#d97706",
                            fontWeight: 700,
                            borderRadius: 2,
                            fontSize: "0.7rem",
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          mt: "auto",
                          pt: 3,
                          borderTop: "1px solid rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="small"
                          startIcon={<Visibility />}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetail(item.id);
                          }}
                          sx={{
                            color: PROJECT_GREEN,
                            fontWeight: 700,
                            "&:focus": { outline: "none" },
                            "&:focus-visible": { outline: "none", boxShadow: "none" },
                          }}
                        >
                          View
                        </Button>
                        {item.status === "approved" && (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {getWhatsAppUrl(item.user?.phone, item.title) && (
                              <Button
                                component="a"
                                href={getWhatsAppUrl(item.user.phone, item.title)}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                onClick={(e) => e.stopPropagation()}
                                startIcon={<WhatsAppIcon style={{ width: 18, height: 18 }} />}
                                sx={{
                                  minWidth: 0,
                                  px: 1,
                                  borderColor: "#25D366",
                                  color: "#25D366",
                                  "&:hover": { borderColor: "#1da851", bgcolor: "rgba(37, 211, 102, 0.08)", color: "#1da851" },
                                  "&:focus": { outline: "none" },
                                  "&:focus-visible": { outline: "none", boxShadow: "none" },
                                }}
                                variant="outlined"
                              >
                                WhatsApp
                              </Button>
                            )}
                            <Button
                              size="small"
                              startIcon={<ShoppingCartCheckout sx={{ fontSize: 18 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                Swal.fire({
                                  icon: "info",
                                  title: "Buy in escrow",
                                  text: "Escrow service is coming soon. You will be able to pay securely and release funds when you receive the goods.",
                                });
                              }}
                              sx={{
                                minWidth: 0,
                                px: 1,
                                bgcolor: PRIMARY,
                                color: "#000",
                                fontWeight: 700,
                                "&:hover": { bgcolor: "#12a842", color: "#000" },
                                "&:focus": { outline: "none" },
                                "&:focus-visible": { outline: "none", boxShadow: "none" },
                              }}
                              variant="contained"
                            >
                              Escrow
                            </Button>
                          </Box>
                        )}
                        {canEditDelete(item) && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(item);
                              }}
                              title="Edit"
                              sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                              disabled={deletingId === item.id}
                              color="error"
                              title="Delete"
                              sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
                            >
                              {deletingId === item.id ? (
                                <CircularProgress size={20} color="error" />
                              ) : (
                                <Delete fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>

      <Dialog
        open={!!detailId}
        onClose={closeDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            "& .MuiDialogTitle-root, .MuiDialogContent-root": { color: "#000" },
            "& .MuiDialogActions-root .MuiButton-root:focus": { outline: "none", boxShadow: "none" },
            "& .MuiDialogActions-root .MuiButton-root:focus-visible": { outline: "none", boxShadow: "none" },
          },
        }}
      >
        <DialogTitle>Listing details</DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: PRIMARY }} />
            </Box>
          ) : detailListing ? (
            <Box sx={{ pt: 0.5 }}>
              {detailListing.imageUrl && (
                <Box
                  component="img"
                  src={resolveImageUrl(detailListing.imageUrl) || PLACEHOLDER_IMG}
                  alt=""
                  sx={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 1, mb: 2 }}
                />
              )}
              <Typography variant="h6">{detailListing.title || "Untitled"}</Typography>
              {detailListing.status && (
                <Chip
                  label={statusLabel(detailListing.status)}
                  size="small"
                  color={
                    detailListing.status === "approved"
                      ? "success"
                      : detailListing.status === "rejected"
                        ? "default"
                        : "warning"
                  }
                  sx={{ mt: 0.5, mb: 1 }}
                />
              )}
              {detailListing.description && (
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
                  {detailListing.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                {detailListing.category && (
                  <Typography variant="body2">
                    <strong>Category:</strong> {detailListing.category}
                  </Typography>
                )}
                {formatPrice(detailListing.price, detailListing.priceUnit) && (
                  <Typography variant="body2">
                    <strong>Price:</strong> {formatPrice(detailListing.price, detailListing.priceUnit)}
                  </Typography>
                )}
                {detailListing.quantity != null && detailListing.quantity !== "" && (
                  <Typography variant="body2">
                    <strong>Quantity:</strong> {detailListing.quantity}{" "}
                    {detailListing.quantityUnit || ""}
                  </Typography>
                )}
                {detailListing.location && (
                  <Typography variant="body2">
                    <strong>Location:</strong> {detailListing.location}
                  </Typography>
                )}
              </Box>
              {detailListing.user && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Seller
                  </Typography>
                  <Typography variant="body2">
                    {detailListing.user.fullName || detailListing.user.email}
                  </Typography>
                  {detailListing.user.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {detailListing.user.phone}
                    </Typography>
                  )}
                </Box>
              )}
              {detailListing.status === "approved" && (
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                  {getWhatsAppUrl(detailListing.user?.phone, detailListing.title) && (
                    <Button
                      component="a"
                      href={getWhatsAppUrl(detailListing.user.phone, detailListing.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="medium"
                      startIcon={<WhatsAppIcon style={{ width: 20, height: 20 }} />}
                      sx={{
                        borderColor: "#25D366",
                        color: "#25D366",
                        "&:hover": {
                          borderColor: "#1da851",
                          bgcolor: "rgba(37, 211, 102, 0.08)",
                          color: "#1da851",
                        },
                        "&:focus": { outline: "none", boxShadow: "none" },
                        "&:focus-visible": { outline: "none", boxShadow: "none" },
                      }}
                    >
                      Contact on WhatsApp
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<ShoppingCartCheckout />}
                    onClick={() => {
                      closeDetail();
                      setTimeout(() => {
                        Swal.fire({
                          icon: "info",
                          title: "Buy in escrow",
                          text: "Escrow service is coming soon. You will be able to pay securely and release funds when you receive the goods.",
                        });
                      }, 150);
                    }}
                    sx={{
                      bgcolor: PRIMARY,
                      color: "#000",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "#12a842", color: "#000" },
                      "&:focus": { outline: "none", boxShadow: "none" },
                      "&:focus-visible": { outline: "none", boxShadow: "none" },
                    }}
                  >
                    Buy in escrow
                  </Button>
                </Box>
              )}
              {detailListing.status === "rejected" && detailListing.rejectedReason && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">Rejection reason:</Typography>
                  <Typography variant="body2">{detailListing.rejectedReason}</Typography>
                </Alert>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          {detailListing && canEditDelete(detailListing) && (
            <>
              <Button
                startIcon={<Edit />}
                onClick={() => handleEdit(detailListing)}
                sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
              >
                Edit
              </Button>
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={() => handleDelete(detailListing)}
                disabled={deletingId === detailListing.id}
                sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
              >
                Delete
              </Button>
            </>
          )}
          <Button
            onClick={closeDetail}
            sx={{ "&:focus": { outline: "none" }, "&:focus-visible": { outline: "none", boxShadow: "none" } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </Box>
  );
}
