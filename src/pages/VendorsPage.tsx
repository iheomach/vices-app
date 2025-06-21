// pages/VendorsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Star, Clock, Phone, ChevronDown, ChevronUp, Eye, EyeOff, Filter } from 'lucide-react';
import { VendorsApi } from '../services/api/vendorApi';
import { Vendor } from '../types/vendor';
import Header from '../components/Header';
import GoogleMap from '../components/GoogleMap';

import { SearchVendorsParams } from '../services/api/vendorApi';
import { ScrapedVendor } from '../types/scrapedVendor';
import { Loader } from '@googlemaps/js-api-loader';

// Initialize Google Maps Loader
const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
  version: 'weekly'
});

type VendorCategory = 'both' | 'cannabis' | 'alcohol';

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [hoveredVendor, setHoveredVendor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>('both');
  const [showFilters, setShowFilters] = useState(false);

  const vendorsApi = new VendorsApi();

  useEffect(() => {
    // Safari polyfill for Google Maps
    if (typeof window !== 'undefined' && !window.requestIdleCallback) {
      window.requestIdleCallback = function(callback) {
        return setTimeout(callback, 1);
      };
      window.cancelIdleCallback = function(id) {
        clearTimeout(id);
      };
    }
  }, []);

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
              await fetchVendors(latitude, longitude, selectedCategory);
            },
            async (error) => {
              console.warn('Geolocation failed:', error);
              // Fallback to Calgary center
              const defaultLat = 51.0447;
              const defaultLng = -114.0719;
              setUserLocation({ lat: defaultLat, lng: defaultLng });
              await fetchVendors(defaultLat, defaultLng, selectedCategory);
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
          await fetchVendors(defaultLat, defaultLng, selectedCategory);
        }
      } catch (err) {
        console.error('Error initializing vendors:', err);
        setError('Failed to load vendors. Please try again.');
        setLoading(false);
      }
    };

    initializeVendors();
  }, [selectedCategory]); // Re-fetch when category changes

  const fetchVendors = async (lat: number, lng: number, category: VendorCategory) => {
    try {
      const searchParams: SearchVendorsParams = {
        lat,
        lng,
        radius: Number(process.env.REACT_APP_SEARCH_RADIUS) || 5000,
        category: category
      };

      const response = await vendorsApi.searchVendors(searchParams);
      
      // Type assertion: tell TypeScript that response contains ScrapedVendor objects
      const scrapedVendors = response as unknown as ScrapedVendor[];
      
      // Transform the scraped data to match our Vendor type
      const transformedVendors: Vendor[] = scrapedVendors.map((vendor: ScrapedVendor) => {
        // Create a proper Google Maps LatLng object if google is available
        let location: google.maps.LatLng | undefined;
        
        try {
          if (typeof google !== 'undefined' && google.maps) {
            location = new google.maps.LatLng({
              lat: vendor.latitude,
              lng: vendor.longitude
            });
          }
        } catch (e) {
          console.warn('Google Maps not loaded yet:', e);
        }

        // Determine vendor type from category
        const vendorType = vendor.category?.toLowerCase().includes('cannabis') ? 'Cannabis' : 'Alcohol';

        return {
          id: vendor.google_id || vendor.place_id || vendor.id || String(Date.now()),
          name: vendor.name,
          type: vendorType,
          rating: vendor.rating || 0,
          distance: vendor.distance || '', // Distance string from API (e.g., "1.2km")
          address: vendor.full_address,
          phone: vendor.phone,
          hours: vendor.working_hours_old_format,
          lat: vendor.latitude,
          lng: vendor.longitude,
          deals: [], // Deals will be fetched separately if needed
          averageDealScore: 0,
          isPremium: vendor.verified || false,
          place: location ? {
            name: vendor.name,
            formatted_address: vendor.full_address,
            geometry: {
              location
            },
            rating: vendor.rating,
            user_ratings_total: vendor.reviews,
            photos: vendor.photo ? [{
              getUrl: () => vendor.photo || ''
            }] : [],
            opening_hours: vendor.working_hours ? {
              weekday_text: Object.entries(vendor.working_hours).map(
                ([day, hours]) => `${day}: ${hours}`
              )
            } : undefined
          } as google.maps.places.PlaceResult : undefined
        };
      });

      setVendors(transformedVendors);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load vendors. Please try again.');
      }
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

  const handleCategoryChange = (category: VendorCategory) => {
    setSelectedCategory(category);
    setSelectedVendor(null); // Clear selected vendor when changing category
  };

  const getVendorIcon = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "🌿" : "🍷";
  };

  const getTypeColor = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "text-green-400" : "text-red-400";
  };

  const getTypeBg = (type: "Cannabis" | "Alcohol"): string => {
    return type === "Cannabis" ? "bg-green-400/10" : "bg-red-400/10";
  };

  const getCategoryDisplayText = (category: VendorCategory): string => {
    switch (category) {
      case 'cannabis': return 'Cannabis Dispensaries';
      case 'alcohol': return 'Liquor Stores';
      case 'both': return 'All Vendors';
      default: return 'All Vendors';
    }
  };

  const getFilteredVendorCount = (): string => {
    const count = vendors.length;
    const categoryText = getCategoryDisplayText(selectedCategory).toLowerCase();
    return `${count} ${categoryText} found near you`;
  };

  const handleRefresh = () => {
    if (userLocation) {
      setLoading(true);
      setError(null);
      fetchVendors(userLocation.lat, userLocation.lng, selectedCategory);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Finding Best Deals Near You</h2>
          <p className="text-gray-400">Searching for {getCategoryDisplayText(selectedCategory).toLowerCase()}...</p>
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
      <Header />

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
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">Local Vendors</h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {/* Category Filter */}
            {showFilters && (
              <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Filter by Category</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCategoryChange('both')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === 'both'
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    All Vendors
                  </button>
                  <button
                    onClick={() => handleCategoryChange('cannabis')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === 'cannabis'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    🌿 Cannabis
                  </button>
                  <button
                    onClick={() => handleCategoryChange('alcohol')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedCategory === 'alcohol'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-gray-300'
                    }`}
                  >
                    🍷 Alcohol
                  </button>
                </div>
              </div>
            )}

            <p className="text-gray-400">
              {getFilteredVendorCount()}
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

            {/* Empty state when no vendors found */}
            {vendors.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">
                  {selectedCategory === 'cannabis' ? '🌿' : selectedCategory === 'alcohol' ? '🍷' : '🔍'}
                </div>
                <h3 className="text-xl font-semibold mb-2">No {getCategoryDisplayText(selectedCategory)} Found</h3>
                <p className="text-gray-400 mb-4">
                  Try expanding your search radius or selecting a different category.
                </p>
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all"
                >
                  Refresh Search
                </button>
              </div>
            )}
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

          {/* Category Indicator */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-lg rounded-lg p-2 border border-white/20 z-10">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-300">Showing:</span>
              <span className="text-xs font-medium text-white">{getCategoryDisplayText(selectedCategory)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;