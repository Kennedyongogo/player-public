import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box, Typography } from "@mui/material";
import { LocationOn } from "@mui/icons-material";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createGreenMarker = () =>
  L.divIcon({
    className: "custom-green-marker",
    html: `<div style="
      background-color: #17cf54;
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
    ">💼</div>`,
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

const JobOpportunitiesMap = ({ opportunities = [] }) => {
  const markers = opportunities
    .filter((o) => o.latitude != null && o.longitude != null)
    .map((o) => {
      const lat = parseFloat(o.latitude);
      const lng = parseFloat(o.longitude);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return {
        id: o.id,
        title: o.title,
        location: o.location,
        description: o.description,
        type: o.type,
        applyUrl: o.applyUrl,
        attachmentUrl: o.attachmentUrl,
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
            No job opportunities with coordinates to show on the map.
          </Typography>
        </Box>
      ) : (
        <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((marker) => (
            <Marker key={marker.id} position={marker.position} icon={createGreenMarker()}>
              <Popup>
                <Box sx={{ minWidth: "200px", maxWidth: "320px", fontFamily: '"Calibri Light", Calibri, sans-serif', color: "#000000" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: "#17cf54" }} />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: "#000000",
                        fontFamily: '"Calibri Light", Calibri, sans-serif',
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                      }}
                    >
                      {marker.location || "Location"}
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: "#000000" }}>
                    {marker.title}
                  </Typography>

                  {marker.type && (
                    <Typography variant="caption" sx={{ display: "block", mb: 0.5, color: "#000000" }}>
                      {marker.type}
                    </Typography>
                  )}

                  {marker.description && (
                    <Typography variant="body2" sx={{ color: "#000000", fontSize: "0.875rem", lineHeight: 1.5 }}>
                      {marker.description.slice(0, 120)}
                      {marker.description.length > 120 ? "…" : ""}
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

export default JobOpportunitiesMap;

