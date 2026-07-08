"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";

// We dynamically import Leaflet to avoid SSR issues
let L: any = null;

interface AddressMapProps {
  onLocationSelect: (lat: number, lng: number, address?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function AddressMap({ onLocationSelect, initialLat, initialLng }: AddressMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const defaultLat = initialLat || 20.5937;
  const defaultLng = initialLng || 78.9629;
  const defaultZoom = initialLat ? 15 : 5;

  // Reverse geocode using Nominatim (free)
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.address) {
        const addr = data.address;
        return {
          addressLine1: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", ") || "",
          city: addr.city || addr.town || addr.village || addr.county || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
        };
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
    }
    return undefined;
  };

  // Initialize map
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Dynamic import of leaflet
      const leaflet = await import("leaflet");
      L = leaflet.default || leaflet;

      // Import CSS
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapRef.current) return;

      // Create map
      const map = L.map(mapRef.current, {
        center: [defaultLat, defaultLng],
        zoom: defaultZoom,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const markerIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          width: 32px; height: 32px; 
          background: #3A5240; 
          border-radius: 50% 50% 50% 0; 
          transform: rotate(-45deg); 
          border: 3px solid #F5F0E8;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="
            width: 8px; height: 8px; 
            background: #F5F0E8; 
            border-radius: 50%; 
            transform: rotate(45deg);
          "></div>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Add marker if initial position provided
      if (initialLat && initialLng) {
        markerRef.current = L.marker([initialLat, initialLng], { icon: markerIcon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", async () => {
          const pos = markerRef.current.getLatLng();
          const addr = await reverseGeocode(pos.lat, pos.lng);
          onLocationSelect(pos.lat, pos.lng, addr);
        });
      }

      // Click to place/move marker
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: markerIcon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", async () => {
            const pos = markerRef.current.getLatLng();
            const addr = await reverseGeocode(pos.lat, pos.lng);
            onLocationSelect(pos.lat, pos.lng, addr);
          });
        }
        const addr = await reverseGeocode(lat, lng);
        onLocationSelect(lat, lng, addr);
      });

      mapInstanceRef.current = map;
      setIsLoading(false);
      setMapReady(true);
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Use current location
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;
        if (map) {
          map.setView([latitude, longitude], 16);

          const markerIcon = L.divIcon({
            className: "custom-map-marker",
            html: `<div style="
              width: 32px; height: 32px; 
              background: #3A5240; 
              border-radius: 50% 50% 50% 0; 
              transform: rotate(-45deg); 
              border: 3px solid #F5F0E8;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
            ">
              <div style="
                width: 8px; height: 8px; 
                background: #F5F0E8; 
                border-radius: 50%; 
                transform: rotate(45deg);
              "></div>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude], { icon: markerIcon, draggable: true }).addTo(map);
            markerRef.current.on("dragend", async () => {
              const pos = markerRef.current.getLatLng();
              const addr = await reverseGeocode(pos.lat, pos.lng);
              onLocationSelect(pos.lat, pos.lng, addr);
            });
          }

          const addr = await reverseGeocode(latitude, longitude);
          onLocationSelect(latitude, longitude, addr);
        }
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("Unable to get your location. Please enable location services.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-border">
      {/* Map Container */}
      <div ref={mapRef} style={{ height: 280, width: "100%" }} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-card flex items-center justify-center z-[1000]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            Loading map...
          </div>
        </div>
      )}

      {/* Use My Location button */}
      {mapReady && (
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLocating}
          className="md:hidden absolute top-3 right-3 z-[1000] bg-card border border-border px-3 py-2 rounded-lg shadow-md flex items-center gap-2 text-xs text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
        >
          {isLocating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} className="text-accent" />
          )}
          {isLocating ? "Locating..." : "Use My Location"}
        </button>
      )}

      {/* Instruction */}
      {mapReady && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-md">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin size={10} className="text-accent" />
            Click on the map or drag the pin to set delivery location
          </p>
        </div>
      )}
    </div>
  );
}
