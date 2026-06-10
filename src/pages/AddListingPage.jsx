import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";
import Swal from "sweetalert2";
import { createListing, updateListing } from "../api";
import Footer from "../components/Footer/Footer";

const PRIMARY = "#17cf54";
const BG_LIGHT = "#f6f8f6";
const BORDER_LIGHT = "#d0e7d7";
const TEXT_MUTED = "#4e9767";

export default function AddListingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const editListing = location.state?.editListing || null;
  const isEdit = !!editListing?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [location_, setLocation_] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    if (editListing) {
      setTitle(editListing.title || "");
      setDescription(editListing.description || "");
      setCategory(editListing.category || "");
      setPrice(editListing.price != null ? String(editListing.price) : "");
      setPriceUnit(editListing.priceUnit || "");
      setQuantity(editListing.quantity != null ? String(editListing.quantity) : "");
      setQuantityUnit(editListing.quantityUnit || "");
      setLocation_(editListing.location || "");
    }
  }, [editListing]);

  const getBaseUrl = () => {
    try {
      const env = typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL;
      return env ? String(env).replace(/\/$/, "") : "";
    } catch {
      return "";
    }
  };
  const resolveImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const base = getBaseUrl();
    return path.startsWith("/") ? `${base}${path}` : `${base}/${path}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = (title || "").trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const hasFile = imageFile && imageFile.size > 0;
      const useFormData = hasFile || (isEdit && removeImage);
      if (useFormData) {
        const form = new FormData();
        form.append("title", trimmedTitle);
        if ((description || "").trim()) form.append("description", (description || "").trim());
        if ((category || "").trim()) form.append("category", (category || "").trim());
        if (price !== "" && !isNaN(parseFloat(price))) form.append("price", parseFloat(price));
        if ((priceUnit || "").trim()) form.append("priceUnit", (priceUnit || "").trim());
        if (quantity !== "" && !isNaN(parseFloat(quantity))) form.append("quantity", parseFloat(quantity));
        if ((quantityUnit || "").trim()) form.append("quantityUnit", (quantityUnit || "").trim());
        if ((location_ || "").trim()) form.append("location", (location_ || "").trim());
        if (hasFile) form.append("listing_image", imageFile);
        if (isEdit && removeImage) form.append("delete_image", "true");
        if (isEdit) {
          await updateListing(editListing.id, form);
          await Swal.fire({
            icon: "success",
            title: "Listing updated",
            text: "Your listing has been updated successfully.",
            confirmButtonColor: PRIMARY,
          });
          navigate("/marketplace/my-listings");
        } else {
          await createListing(form);
          await Swal.fire({
            icon: "success",
            title: "Listing created",
            text: "Your listing was created. It will appear publicly after admin approval.",
            confirmButtonColor: PRIMARY,
          });
          navigate("/marketplace/my-listings");
        }
      } else {
        const body = {
          title: trimmedTitle,
          description: (description || "").trim() || undefined,
          category: (category || "").trim() || undefined,
          price: price !== "" && !isNaN(parseFloat(price)) ? parseFloat(price) : undefined,
          priceUnit: (priceUnit || "").trim() || undefined,
          quantity: quantity !== "" && !isNaN(parseFloat(quantity)) ? parseFloat(quantity) : undefined,
          quantityUnit: (quantityUnit || "").trim() || undefined,
          location: (location_ || "").trim() || undefined,
        };
        if (isEdit) {
          await updateListing(editListing.id, body);
          await Swal.fire({
            icon: "success",
            title: "Listing updated",
            text: "Your listing has been updated successfully.",
            confirmButtonColor: PRIMARY,
          });
          navigate("/marketplace/my-listings");
        } else {
          await createListing(body);
          await Swal.fire({
            icon: "success",
            title: "Listing created",
            text: "Your listing was created. It will appear publicly after admin approval.",
            confirmButtonColor: PRIMARY,
          });
          navigate("/marketplace/my-listings");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

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
          onClick={() => navigate("/marketplace/my-listings")}
          sx={{
            mt: { xs: 0.5, sm: 0.75 },
            mb: { xs: 0.5, sm: 0.75 },
            color: "#000",
            fontSize: "1rem",
            "&:focus": { outline: "none", boxShadow: "none" },
            "&:focus-visible": { outline: "none", boxShadow: "none" },
          }}
        >
          Back to my listings
        </Button>

        <Paper
          component="form"
          onSubmit={handleSubmit}
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
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: "#000" }}>
            {isEdit ? "Edit listing" : "Add new listing"}
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 2, color: "#000", fontSize: "1.0625rem" }}
          >
            {isEdit
              ? "Update the details below. After saving, the listing will remain in its current approval status."
              : "List what you want to sell. Your listing will be reviewed by the admin before it appears publicly."}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              minWidth: 0,
              "& .MuiInputLabel-root": {
                color: "#000",
                fontSize: "1rem",
                "&.Mui-focused": { color: "#000" },
                "&.MuiFormLabel-filled": { color: "#000" },
              },
              "& .MuiInputBase-input": { color: "#000", fontSize: "1rem" },
              "& .MuiInputBase-input::placeholder": { color: "#000", opacity: 0.75 },
              "& .MuiFormHelperText-root": { color: "#000", fontSize: "0.9375rem" },
            }}
          >
            <TextField
              fullWidth
              required
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Organic maize, 50kg bags"
              size="small"
              inputProps={{ maxLength: 255 }}
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product or service"
              multiline
              rows={4}
              size="small"
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Grains, Feeds, Livestock"
              size="small"
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              label="Location"
              value={location_}
              onChange={(e) => setLocation_(e.target.value)}
              placeholder="e.g. Nairobi, Kenya"
              size="small"
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              type="number"
              label="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              size="small"
              inputProps={{ min: 0, step: "any" }}
              InputProps={{
                endAdornment: priceUnit ? (
                  <InputAdornment position="end">{priceUnit}</InputAdornment>
                ) : null,
              }}
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              label="Price unit"
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              placeholder="e.g. KES, USD, per kg"
              size="small"
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
              size="small"
              inputProps={{ min: 0, step: "any" }}
              sx={{ width: "100%" }}
            />
            <TextField
              fullWidth
              label="Quantity unit"
              value={quantityUnit}
              onChange={(e) => setQuantityUnit(e.target.value)}
              placeholder="e.g. kg, bags, tonnes"
              size="small"
              sx={{ width: "100%" }}
            />
            <Box>
              <Typography variant="body2" sx={{ mb: 0.5, color: "text.secondary" }}>Listing image</Typography>
              <input
                accept="image/*"
                type="file"
                id="listing_image"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setImageFile(f || null);
                  if (f) setRemoveImage(false);
                }}
                style={{ display: "block", width: "100%", marginBottom: 8 }}
              />
              {isEdit && editListing?.imageUrl && !removeImage && !imageFile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: 0.5 }}>
                  <Box component="img" src={resolveImageUrl(editListing.imageUrl)} alt="" sx={{ maxHeight: 80, borderRadius: 1, border: "1px solid #ddd" }} />
                  <Button type="button" size="small" onClick={() => setRemoveImage(true)} sx={{ color: "text.secondary" }}>Remove image</Button>
                </Box>
              )}
              {imageFile && (
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Selected: {imageFile.name}</Typography>
                  <Button type="button" size="small" onClick={() => { setImageFile(null); setRemoveImage(false); }} sx={{ ml: 1 }}>Clear</Button>
                  {imagePreviewUrl && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 2,
                        backgroundColor: "#f8f9fa",
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        position: "relative",
                        maxWidth: 400,
                      }}
                    >
                      <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>Preview</Typography>
                      <Box
                        component="img"
                        src={imagePreviewUrl}
                        alt="Listing preview"
                        sx={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          borderRadius: "8px",
                          display: "block",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>Upload a product image (e.g. JPG, PNG). Optional.</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Save />}
              disabled={submitting}
              sx={{
                bgcolor: PRIMARY,
                color: "#000",
                fontSize: "1rem",
                "&:hover": { bgcolor: "#12a842", color: "#000" },
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
            >
              {submitting ? "Saving…" : isEdit ? "Save changes" : "Create listing"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/marketplace/my-listings")}
              disabled={submitting}
              sx={{
                borderColor: BORDER_LIGHT,
                color: "#000",
                fontSize: "1rem",
                "&:focus": { outline: "none", boxShadow: "none" },
                "&:focus-visible": { outline: "none", boxShadow: "none" },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>

      <Footer />
    </Box>
  );
}
