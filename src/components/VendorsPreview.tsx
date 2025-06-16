// src/components/VendorsPreview.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Star, Clock, Phone, Navigation, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { VendorsApi } from '../services/api/vendorApi';
import { Vendor } from '../types/vendor';

// Google Maps component
const GoogleMap: React.FC<{
  vendors: Vendor[];
  userLocation: { lat: number; lng: number } | null;
  selectedVendor: string | null;
  hoveredVendor: string | null;
  onVendorClick: (vendorId: string) => void;
  onVendorHover: (vendorId: string | null) => void;
}> = ({ vendors, userLocation, selectedVendor, hoveredVendor, onVendorClick, onVendorHover }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{ [key: string]: google.maps.Marker }>({});
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!userLocation) return;

    const initMap = () => {
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

    if (typeof google !== 'undefined' && google.maps) {
      initMap();
    } else {
      // Load Google Maps script if not already loaded
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
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

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const vendorsApi = new VendorsApi();

  useEffect(() => {
    // Get user's location and fetch vendors
    const initializeVendors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              await fetchVendors(latitude, longitude);
            },
            async (error) => {
              console.warn('Geolocation failed:', error);
              // Fallback to Calgary center
              const defaultLat = 51.0447;
              const defaultLng = -114.0719;
              setUserLocation({ lat: defaultLat, lng: defaultLng });
              await fetchVendors(defaultLat, defaultLng);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        } else {
          // Geolocation not supported, use default location
          const defaultLat = 51.0447;
          const defaultLng = -114.0719;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          await fetchVendors(defaultLat, defaultLng);
        }
      } catch (err) {
        console.error('Error initializing vendors:', err);
        setError('Failed to load vendors. Please try again.');
        setLoading(false);
      }
    };

    initializeVendors();
  }, []);

  const fetchVendors = async (lat: number, lng: number) => {
    try {
      const vendorsData = await vendorsApi.searchVendors(lat, lng);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors. Showing sample data.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVendor = useCallback((vendorId: string) => {
    setSelectedVendor(selectedVendor === vendorId ? null : vendorId);
  }, [selectedVendor]);

  const handleVendorHover = useCallback((vendorId: string | null) => {
    setHoveredVendor(vendorId);
  }, []);

  const getVendorIcon = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "🌿" : "🍷";
  };

  const getTypeColor = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "text-green-400" : "text-red-400";
  };

  const getTypeBg = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "bg-green-400/10" : "bg-red-400/10";
  };

  const handleRefresh = () => {
    if (userLocation) {
      setLoading(true);
      setError(null);
      fetchVendors(userLocation.lat, userLocation.lng);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Finding Best Deals Near You</h2>
          <p className="text-gray-400">Analyzing local vendors and deals...</p>
        </div>
      </div>
    );
  }

  if (error && vendors.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Vendors</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-green-400/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              VICES
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-lg font-medium">Local Vendors</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && vendors.length > 0 && (
        <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-4 mx-6 mt-4 rounded">
          <div className="flex">
            <div className="text-yellow-400">⚠️</div>
            <div className="ml-3">
              <p className="text-sm text-yellow-200">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Pane - Vendors List */}
        <div className="w-1/2 p-6 overflow-y-auto bg-black/10 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Local Vendors</h1>
            <p className="text-gray-400">
              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} found near you
              {userLocation && (
                <span className="text-green-400 ml-2">📍 Using your location</span>
              )}
            </p>
          </div>

          <div className="space-y-4">
            {vendors.map((vendor, index) => (
              <div key={vendor.id} className="relative">
                <div
                  className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all duration-300 cursor-pointer ${
                    hoveredVendor === vendor.id || selectedVendor === vendor.id
                      ? 'border-green-400/50 bg-white/10 shadow-lg shadow-green-400/20'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => toggleVendor(vendor.id)}
                  onMouseEnter={() => handleVendorHover(vendor.id)}
                  onMouseLeave={() => handleVendorHover(null)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getVendorIcon(vendor.type)}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{vendor.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBg(vendor.type)} ${getTypeColor(vendor.type)}`}>
                            {vendor.type}
                          </span>
                          {vendor.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{vendor.rating}</span>
                            </div>
                          )}
                          {/* Add blur status indicator */}
                          {index === 0 && (
                            <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded text-xs">
                              <Eye className="w-3 h-3 text-green-400" />
                              <span className="text-green-400">Full Access</span>
                            </div>
                          )}
                          {index > 0 && (
                            <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded text-xs">
                              <EyeOff className="w-3 h-3 text-red-400" />
                              <span className="text-red-400">Sign up to view</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-semibold">{vendor.distance}</div>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        {selectedVendor === vendor.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{vendor.address}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      {vendor.hours && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{vendor.hours}</span>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Deals Section */}
                  {selectedVendor === vendor.id && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top duration-300">
                      <h4 className="text-lg font-semibold mb-4 text-green-400">Current Deals</h4>
                      <div className="space-y-3">
                        {vendor.deals && vendor.deals.length > 0 ? (
                          vendor.deals.map((deal) => (
                            <div key={deal.id} className="relative">
                              <div className={`bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors ${
                                deal.isBlurred ? 'overflow-hidden' : ''
                              }`}>
                                <div className="flex justify-between items-start">
                                  <div className={deal.isBlurred ? 'filter blur-sm select-none' : ''}>
                                    <h5 className="font-medium text-white">{deal.product}</h5>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className="text-gray-400 line-through text-sm">{deal.original}</span>
                                      <span className="text-green-400 font-semibold">{deal.sale}</span>
                                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                                        {deal.discount}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-col space-y-2">
                                    {deal.isBlurred ? (
                                      <button className="bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                                        Sign Up to View
                                      </button>
                                    ) : (
                                      <button className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all">
                                        View Deal
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Blur overlay for locked deals */}
                                {deal.isBlurred && (
                                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                      <EyeOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                      <p className="text-sm text-gray-300 font-medium">Sign up to unlock</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-400 text-center py-4">
                            No deals available at this time
                          </div>
                        )}
                      </div>

                      {/* Show signup prompt for vendors with blurred deals */}
                      {vendor.deals && vendor.deals.some(deal => deal.isBlurred) && (
                        <div className="mt-4 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-lg rounded-lg p-6 border border-purple-400/30 text-center">
                          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent mb-2">
                            Unlock All Deals
                          </h3>
                          <p className="text-gray-300 text-sm mb-3">
                            Sign up to see full deal details and save money!
                          </p>
                          <button className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 px-6 py-2 rounded-full font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105">
                            Sign Up Free
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Signup Gradient at bottom of last vendor */}
                {index === vendors.length - 1 && (
                  <div className="mt-6 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-green-600/20 backdrop-blur-lg rounded-xl p-8 border border-purple-400/30 text-center">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                        Unlock Full Potential
                      </h3>
                      <p className="text-gray-300 mt-2">
                        Sign up to see all vendors in your area and get access to exclusive deals
                      </p>
                    </div>
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">50+</div>
                        <div className="text-sm text-gray-400">More Vendors</div>
                      </div>
                      <div className="w-px h-12 bg-gray-600"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">200+</div>
                        <div className="text-sm text-gray-400">Exclusive Deals</div>
                      </div>
                      <div className="w-px h-12 bg-gray-600"></div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">24/7</div>
                        <div className="text-sm text-gray-400">Live Updates</div>
                      </div>
                    </div>
                    <button className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 px-8 py-3 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all transform hover:scale-105">
                      Sign Up Free
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane - Real Google Map */}
        <div className="w-1/2 relative bg-gray-800">
          <GoogleMap
            vendors={vendors}
            userLocation={userLocation}
            selectedVendor={selectedVendor}
            hoveredVendor={hoveredVendor}
            onVendorClick={toggleVendor}
            onVendorHover={handleVendorHover}
          />

          {/* API Status Indicator */}
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-lg rounded-lg p-2 border border-white/20 z-10">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
              <span className="text-xs text-gray-300">
                {error ? 'Limited Data' : 'Live Data'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;