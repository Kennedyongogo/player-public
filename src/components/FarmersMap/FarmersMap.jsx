import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box, Typography } from "@mui/material";
import { LocationOn, Verified } from "@mui/icons-material";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const PRIMARY = "#17cf54";

const createGreenMarker = () =>
  L.divIcon({
    className: "custom-green-marker",
    html: `<div style="
      background-color: ${PRIMARY};
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
    ">📍</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

const MapBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const group = new L.featureGroup(bounds.map((m) => L.marker(m.position)));
      const boundsObj = group.getBounds();
      if (boundsObj.isValid()) {
        map.fitBounds(boundsObj.pad(0.1), { maxZoom: 10 });
      }
    }
  }, [bounds, map]);
  return null;
};

const FarmersMap = ({ farmers = [] }) => {
  const markers = farmers
    .filter((f) => {
      const p = f.profile;
      return p && p.latitude != null && p.longitude != null;
    })
    .map((f) => {
      const p = f.profile;
      const lat = parseFloat(p.latitude);
      const lng = parseFloat(p.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      const locationParts = [p.region, p.country].filter(Boolean);
      return {
        id: f.id,
        fullName: f.fullName,
        farmOrBusinessName: p.farmOrBusinessName,
        location: locationParts.length ? locationParts.join(", ") : (p.country || p.region || "—"),
        produces: Array.isArray(p.produces) ? p.produces : [],
        availability: p.availability,
        isVerified: f.isVerified === true || f.is_verified === true,
        position: [lat, lng],
      };
    })
    .filter(Boolean);

  const defaultCenter = [-1.2921, 36.8219];
  const defaultZoom = 7;

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: "400px", sm: "500px", md: "550px" },
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {markers.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f6f8f6",
            color: "#000000",
            fontFamily: '"Calibri Light", Calibri, sans-serif',
          }}
        >
          <Typography sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>
            No farmer locations with coordinates to show on the map.
          </Typography>
        </Box>
      ) : (
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position} icon={createGreenMarker()}>
              <Popup>
                <Box sx={{ minWidth: "200px", maxWidth: "320px", fontFamily: '"Calibri Light", Calibri, sans-serif', color: "#000000" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: PRIMARY }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', textTransform: "uppercase", fontSize: "0.75rem" }}>
                      {marker.location}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" }}>
                    {marker.farmOrBusinessName || marker.fullName}
                  </Typography>
                  {marker.isVerified && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                      <Verified sx={{ fontSize: 14, color: PRIMARY }} />
                      <Typography variant="caption" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif' }}>MK Verified</Typography>
                    </Box>
                  )}
                  {marker.produces.length > 0 && (
                    <Typography variant="body2" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "0.875rem", lineHeight: 1.5 }}>
                      Produces: {marker.produces.slice(0, 5).join(", ")}{marker.produces.length > 5 ? "…" : ""}
                    </Typography>
                  )}
                </Box>
              </Popup>
            </Marker>
          ))}
          <MapBounds bounds={markers} />
        </MapContainer>
      )}
    </Box>
  );
};

export default FarmersMap;
