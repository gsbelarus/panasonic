'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ============================================================================
// Types
// ============================================================================

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface LeafletMapProps {
  markers: MapMarker[];
  selectedMarkerId: string | null;
  onMarkerClick: (id: string) => void;
  className?: string;
}

// ============================================================================
// Tile Layer URLs
// ============================================================================

const TILE_LAYERS = {
  map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

// ============================================================================
// Custom Marker Icon
// ============================================================================

// Create custom red marker icon
const createMarkerIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
        <path fill="${isSelected ? '#dc2626' : '#b91c1c'}" stroke="#fff" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z"/>
        <circle fill="#fff" cx="12" cy="12" r="5"/>
      </svg>
    `,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
};

// ============================================================================
// LeafletMap Component
// ============================================================================

export default function LeafletMap({
  markers,
  selectedMarkerId,
  onMarkerClick,
  className = '',
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'satellite'>('map');

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      center: [25.2048, 55.2708], // Default center (Dubai)
      zoom: 5,
      zoomControl: true,
    });

    // Add initial tile layer
    const tileLayer = L.tileLayer(TILE_LAYERS.map.url, {
      attribution: TILE_LAYERS.map.attribution,
      maxZoom: 19,
    }).addTo(map);

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(map);

    mapRef.current = map;
    tileLayerRef.current = tileLayer;
    markersLayerRef.current = markersLayer;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Handle view mode change
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const config = TILE_LAYERS[viewMode];
    tileLayerRef.current.setUrl(config.url);
    // Note: Attribution change requires removing and re-adding the layer
    // For simplicity, we keep the initial attribution
  }, [viewMode]);

  // Update markers when data or selection changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    if (markers.length === 0) return;

    // Add new markers
    markers.forEach((marker) => {
      const isSelected = marker.id === selectedMarkerId;
      const icon = createMarkerIcon(isSelected);

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon })
        .bindPopup(marker.name)
        .on('click', () => {
          onMarkerClick(marker.id);
        });

      markersLayerRef.current?.addLayer(leafletMarker);
    });

  }, [markers, selectedMarkerId, onMarkerClick]);

  // Fit bounds only when markers change
  useEffect(() => {
    if (!mapRef.current || markers.length === 0) return;

    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [markers]);

  // Center map on selected marker
  useEffect(() => {
    if (!mapRef.current || !selectedMarkerId) return;

    const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
    if (selectedMarker) {
      mapRef.current.setView([selectedMarker.lat, selectedMarker.lng], 12, {
        animate: true,
      });
    }
  }, [selectedMarkerId, markers]);

  const handleViewModeChange = useCallback((mode: 'map' | 'satellite') => {
    setViewMode(mode);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Map/Satellite Toggle */}
      <div className="absolute top-2 left-2 z-[1000] flex rounded-md overflow-hidden shadow-md">
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'map'
            ? 'bg-white text-[var(--foreground)]'
            : 'bg-gray-200 text-[var(--muted)] hover:bg-gray-100'
            }`}
          onClick={() => handleViewModeChange('map')}
        >
          Map
        </button>
        <button
          type="button"
          className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === 'satellite'
            ? 'bg-white text-[var(--foreground)]'
            : 'bg-gray-200 text-[var(--muted)] hover:bg-gray-100'
            }`}
          onClick={() => handleViewModeChange('satellite')}
        >
          Satellite
        </button>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px] rounded-lg" />

      {/* Custom marker styles */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
