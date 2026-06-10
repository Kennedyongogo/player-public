import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Box,
  Typography,
  Container,
  Card,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom green marker icon for MK Agribusiness
const createGreenMarker = () => {
  return L.divIcon({
    className: "custom-green-marker",
    html: `<div style="
      background-color: #13ec13;
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
};

// Component to fit map bounds to show all markers
const MapBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const group = new L.featureGroup(bounds.map(marker => {
        return L.marker(marker.position);
      }));
      const boundsObj = group.getBounds();
      if (boundsObj.isValid()) {
        map.fitBounds(boundsObj.pad(0.1), {
          maxZoom: 10,
        });
      }
    }
  }, [bounds, map]);

  return null;
};

const CharityMap = ({ projects = [] }) => {
  // Map location names to coordinates (Kenya coordinates)
  const locationCoordinates = {
    "Kiambu County, Kenya": [-1.0332, 36.8696],
    "Central Province": [-0.75, 36.75],
    "Rift Valley Region": [0.5, 36.0],
    "Nairobi Innovation Hub": [-1.2921, 36.8219],
    "Mombasa Port Zone": [-4.0435, 39.6682],
    "Mount Kenya Region": [0.1667, 37.3333],
  };

  // Create markers from projects
  const markers = projects
    .map((project) => {
      const coords = locationCoordinates[project.location];
      if (!coords) return null;

      return {
        id: project.id,
        title: project.title,
        location: project.location,
        description: project.description,
        tags: project.tags,
        position: coords,
      };
    })
    .filter((marker) => marker !== null);

  // Default center (Nairobi, Kenya)
  const defaultCenter = [-1.2921, 36.8219];
  const defaultZoom = 7;

  return (
    <Box
      sx={{
        pt: { xs: 0, sm: 0, md: 0 },
        pb: { xs: 1, sm: 1.5, md: 2 },
        position: "relative",
        zIndex: 1,
        background: "#FFFFFF",
        fontFamily: '"Calibri Light", Calibri, sans-serif',
      }}
    >
      <Card
        sx={{
          mx: { xs: 0.75, sm: 0.75, md: 0.75 },
          borderRadius: { xs: 3, md: 4 },
          background: "#FFFFFF",
          border: "1px solid rgba(15, 189, 15, 0.2)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            px: { xs: 1.5, sm: 1.5, md: 1.5 },
            pt: { xs: 2, sm: 2, md: 2 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Header Section */}
          <Box sx={{ mb: { xs: 2, sm: 2.5, md: 3 }, textAlign: "center" }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                mb: { xs: 0.5, md: 0.75 },
                color: "#0d1b0d",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
              }}
            >
              Our Impact Across Kenya
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mb: { xs: 0.5, md: 0.75 },
                color: "#000000",
                fontFamily: '"Calibri Light", Calibri, sans-serif',
                fontSize: { xs: "1rem", md: "1.125rem" },
                lineHeight: 1.7,
                maxWidth: "800px",
                mx: "auto",
              }}
            >
              Explore our agricultural projects and their impact across different regions of Kenya. Click on markers to learn more about each project.
            </Typography>
          </Box>

          {/* Map Container */}
          <Box
            sx={{
              width: "100%",
              height: { xs: "400px", sm: "500px", md: "600px" },
              borderRadius: { xs: 2, md: 3 },
              overflow: "hidden",
              border: "1px solid rgba(15, 189, 15, 0.1)",
              mb: { xs: 2, md: 2 },
            }}
          >
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Add markers for each project */}
              {markers.map((marker) => (
                <Marker 
                  key={marker.id} 
                  position={marker.position} 
                  icon={createGreenMarker()}
                >
                  <Popup>
                    <Box sx={{ minWidth: "200px", maxWidth: "300px" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: "#0fbd0f" }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0fbd0f", fontFamily: '"Calibri Light", Calibri, sans-serif', textTransform: "uppercase", fontSize: "0.75rem" }}>
                          {marker.location}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: "#0d1b0d", fontFamily: '"Calibri Light", Calibri, sans-serif', fontSize: "1rem" }}>
                        {marker.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#000000", fontFamily: '"Calibri Light", Calibri, sans-serif', mb: 1.5, fontSize: "0.875rem", lineHeight: 1.6 }}>
                        {marker.description}
                      </Typography>
                      {marker.tags && marker.tags.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {marker.tags.slice(0, 2).map((tag, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                bgcolor: "rgba(15, 189, 15, 0.1)",
                                color: "#0fbd0f",
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                              }}
                            >
                              {tag}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Popup>
                </Marker>
              ))}

              {/* Fit bounds to show all markers */}
              {markers.length > 0 && <MapBounds bounds={markers} />}
            </MapContainer>
          </Box>
        </Container>
      </Card>
    </Box>
  );
};

export default CharityMap;
