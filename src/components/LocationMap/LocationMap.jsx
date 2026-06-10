import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Box, Paper, IconButton, Typography } from "@mui/material";
import { Map as MapIcon, SatelliteAlt, Terrain } from "@mui/icons-material";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Component to handle map view changes
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

const LocationMap = ({ latitude, longitude, height = "300px" }) => {
  const [mapView, setMapView] = useState("osm"); // "osm", "satellite", "terrain"
  const [mapCenter, setMapCenter] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);

  useEffect(() => {
    if (latitude != null && longitude != null) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        const center = [lat, lng];
        setMapCenter(center);
        setMarkerPosition(center);
      }
    }
  }, [latitude, longitude]);

  if (!mapCenter || !markerPosition) {
    return null;
  }

  return (
    <Box sx={{ width: "100%", maxWidth: "100%", mt: 1 }}>
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100%",
          height: height,
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
          position: "relative",
        }}
      >
        {typeof window !== "undefined" && (
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
            zoomControl={true}
            key={`map-${mapCenter[0]}-${mapCenter[1]}`}
          >
            {/* OSM Layer */}
            {mapView === "osm" && (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            
            {/* Satellite Layer */}
            {mapView === "satellite" && (
              <TileLayer
                attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                maxZoom={20}
              />
            )}
            
            {/* Terrain Layer */}
            {mapView === "terrain" && (
              <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
            )}
            
            <MapViewUpdater center={mapCenter} zoom={13} />
            {markerPosition && Array.isArray(markerPosition) && markerPosition.length === 2 && (
              <Marker position={markerPosition} />
            )}
          </MapContainer>
        )}
        
        {/* Map View Switcher */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: 1,
            border: "1px solid #ccc",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <IconButton
            size="small"
            sx={{
              backgroundColor: mapView === "osm" ? "rgba(23, 207, 84, 0.1)" : "transparent",
              color: mapView === "osm" ? "#17cf54" : "#000000",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
              padding: "8px",
              minWidth: "40px",
              minHeight: "40px",
            }}
            onClick={() => setMapView("osm")}
            title="OpenStreetMap View"
          >
            <MapIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              backgroundColor: mapView === "satellite" ? "rgba(23, 207, 84, 0.1)" : "transparent",
              color: mapView === "satellite" ? "#17cf54" : "#000000",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
              padding: "8px",
              minWidth: "40px",
              minHeight: "40px",
            }}
            onClick={() => setMapView("satellite")}
            title="Satellite View"
          >
            <SatelliteAlt fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            sx={{
              backgroundColor: mapView === "terrain" ? "rgba(23, 207, 84, 0.1)" : "transparent",
              color: mapView === "terrain" ? "#17cf54" : "#000000",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
              "&:focus": { outline: "none" },
              "&:focus-visible": { outline: "none" },
              padding: "8px",
              minWidth: "40px",
              minHeight: "40px",
            }}
            onClick={() => setMapView("terrain")}
            title="Terrain View"
          >
            <Terrain fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default LocationMap;
