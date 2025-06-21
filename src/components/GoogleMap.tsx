// components/GoogleMap.tsx
import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import { Vendor } from '../types/vendor';

interface GoogleMapProps {
  vendors: Vendor[];
  userLocation: { lat: number; lng: number } | null;
  selectedVendor: string | null;
  hoveredVendor: string | null;
  onVendorClick: (vendorId: string) => void;
  onVendorHover: (vendorId: string | null) => void;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  vendors, 
  userLocation, 
  selectedVendor, 
  hoveredVendor, 
  onVendorClick, 
  onVendorHover 
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!userLocation) return;

    const initMap = () => {
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        setTimeout(initMap, 500);
        return;
      }
      const mapElement = document.getElementById('google-map');
      if (!mapElement || map) return;

      const newMap = new google.maps.Map(mapElement, {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: 13,
        styles: [
          {
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#1f2937"}]
          },
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{"color": "#ffffff"}]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#374151"}]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{"color": "#1e40af"}]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Add user location marker
      const userLocationMarker = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: newMap,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      setMap(newMap);
      setUserMarker(userLocationMarker);
    };

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    
    if (!window.google || !window.google.maps) {
      if (!existingScript) {
        // Create global callback for Safari compatibility
        (window as any).initGoogleMapsCallback = () => {
          // Wait for all Google Maps components to be available
          const checkGoogleMapsReady = () => {
            if (
              window.google && 
              window.google.maps && 
              window.google.maps.Map &&
              window.google.maps.Marker &&
              window.google.maps.InfoWindow &&
              window.google.maps.LatLngBounds
            ) {
              try {
                initMap();
                // Clean up the global callback
                delete (window as any).initGoogleMapsCallback;
              } catch (error) {
                console.warn('Map initialization failed:', error);
                setTimeout(checkGoogleMapsReady, 1000);
              }
            } else {
              setTimeout(checkGoogleMapsReady, 300);
            }
          };
          
          checkGoogleMapsReady();
        };

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&v=3.52&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        script.onerror = (error) => {
          console.error('Failed to load Google Maps:', error);
        };
        document.head.appendChild(script);
      }
    } else {
      // Google Maps already loaded
      const checkAndInit = () => {
        if (
          window.google && 
          window.google.maps && 
          window.google.maps.Map &&
          window.google.maps.Marker &&
          window.google.maps.InfoWindow &&
          window.google.maps.LatLngBounds
        ) {
          try {
            initMap();
          } catch (error) {
            console.warn('Map initialization failed on cached load:', error);
            setTimeout(checkAndInit, 500);
          }
        } else {
          setTimeout(checkAndInit, 300);
        }
      };
      
      setTimeout(checkAndInit, 200);
    }
  }, [userLocation, map]);

  // Update vendor markers
  useEffect(() => {
    if (!map || !vendors.length) return;

    // Clear existing vendor markers
    Object.values(markers).forEach(marker => marker.setMap(null));
    const newMarkers: { [key: string]: google.maps.Marker } = {};

    vendors.forEach((vendor) => {
      const isHighlighted = hoveredVendor === vendor.id || selectedVendor === vendor.id;
      
      const marker = new google.maps.Marker({
        position: { lat: vendor.lat, lng: vendor.lng },
        map: map,
        title: vendor.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isHighlighted ? 12 : 8,
          fillColor: vendor.type === 'Cannabis' ? '#22c55e' : '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        zIndex: isHighlighted ? 100 : 50,
      });

      // Add click listener
      marker.addListener('click', () => {
        onVendorClick(vendor.id);
      });

      // Add hover listeners
      marker.addListener('mouseover', () => {
        onVendorHover(vendor.id);
      });

      marker.addListener('mouseout', () => {
        onVendorHover(null);
      });

      // Create info window for highlighted markers
      if (isHighlighted) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="color: #000; padding: 8px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${vendor.name}</h3>
              <p style="margin: 0 0 4px 0; font-size: 14px;">${vendor.distance}</p>
              ${vendor.rating > 0 ? `<p style="margin: 0; font-size: 14px;">⭐ ${vendor.rating}</p>` : ''}
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">${vendor.address}</p>
            </div>
          `
        });
        
        infoWindow.open(map, marker);
        
        // Store info window to close later
        (marker as any).infoWindow = infoWindow;
      } else if ((marker as any).infoWindow) {
        (marker as any).infoWindow.close();
      }

      newMarkers[vendor.id] = marker;
    });

    setMarkers(newMarkers);
  }, [map, vendors, selectedVendor, hoveredVendor, onVendorClick, onVendorHover]);

  // Fit bounds when vendors change
  useEffect(() => {
    if (!map || !vendors.length || !userLocation) return;

    const bounds = new google.maps.LatLngBounds();
    
    // Include user location
    bounds.extend({ lat: userLocation.lat, lng: userLocation.lng });
    
    // Include all vendors
    vendors.forEach(vendor => {
      bounds.extend({ lat: vendor.lat, lng: vendor.lng });
    });

    map.fitBounds(bounds);
    
    // Set max zoom to prevent over-zooming
    const listener = google.maps.event.addListener(map, 'idle', () => {
      const currentZoom = map.getZoom();
      if (currentZoom && currentZoom > 15) {
        map.setZoom(15);
      }
      google.maps.event.removeListener(listener);
    });
  }, [map, vendors, userLocation]);

  return (
    <div className="relative h-full">
      <div id="google-map" className="w-full h-full" />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 space-y-2">
        <button 
          onClick={() => {
            if (map && userLocation) {
              map.setCenter({ lat: userLocation.lat, lng: userLocation.lng });
              map.setZoom(13);
            }
          }}
          className="bg-black/70 backdrop-blur-lg p-3 rounded-lg border border-white/20 hover:bg-black/80 transition-colors"
          title="Center on your location"
        >
          <Navigation className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-lg rounded-lg p-4 border border-white/20">
        <div className="text-sm font-semibold text-white mb-2">Legend</div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Your Location</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Cannabis Dispensary</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-300">Liquor Store</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {!map && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;