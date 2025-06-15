import React, { useState } from 'react';
import { useEffect } from 'react';
import { GOOGLE_MAPS_API_KEY } from '../config'; // Ensure you have your API key set up
import { MapPin, Star, Clock, Phone, Navigation, ChevronDown, ChevronUp } from 'lucide-react';

const VendorsPage = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
    const [hoveredVendor, setHoveredVendor] = useState<number | null>(null);

    useEffect(() => {
    // Example: Search for cannabis dispensaries and liquor stores near a location
    const fetchVendors = async () => {
      const location = '51.0447,-114.0719'; // Calgary center, or use geolocation
      const radius = 3000; // meters

      // Types: 'liquor_store' and 'store' for cannabis (Canada)
      const types = [
        { type: 'Cannabis', keyword: 'cannabis dispensary' },
        { type: 'Alcohol', keyword: 'liquor store' }
      ];

      let allResults: Vendor[] = [];

      for (const t of types) {
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location}&radius=${radius}&keyword=${encodeURIComponent(
          t.keyword
        )}&key=${GOOGLE_MAPS_API_KEY}`;

        // Note: This endpoint is not CORS-enabled. For production, use a backend proxy.
        const response = await fetch(url);
        const data = await response.json();

        const mapped = (data.results || []).map((place: any, idx: number) => ({
          id: place.place_id.hashCode?.() || idx + Math.random(),
          name: place.name,
          type: t.type as 'Cannabis' | 'Alcohol',
          rating: place.rating || 0,
          distance: '', // You can calculate distance if you want
          address: place.vicinity || '',
          phone: '', // Need to fetch details for phone
          hours: '', // Need to fetch details for hours
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          deals: [] // No deals from Google
        }));

        allResults = allResults.concat(mapped);
      }

      setVendors(allResults);
    };

    fetchVendors();
  }, []);

interface Deal {
    id: number;
    product: string;
    original: string;
    sale: string;
    discount: string;
}

interface Vendor {
    id: number;
    name: string;
    type: "Cannabis" | "Alcohol";
    rating: number;
    distance: string;
    address: string;
    phone: string;
    hours: string;
    lat: number;
    lng: number;
    deals: Deal[];
}

const toggleVendor = (vendorId: number) => {
    setSelectedVendor(selectedVendor === vendorId ? null : vendorId);
};

interface VendorTypeIconProps {
    type: "Cannabis" | "Alcohol";
}

const getVendorIcon = (type: VendorTypeIconProps["type"]): string => {
    return type === "Cannabis" ? "🌿" : "🍷";
};

interface TypeColorProps {
    type: "Cannabis" | "Alcohol";
}

const getTypeColor = (type: TypeColorProps["type"]): string => {
    return type === "Cannabis" ? "text-green-400" : "text-red-400";
};

interface GetTypeBgProps {
    type: "Cannabis" | "Alcohol";
}

const getTypeBg = (type: GetTypeBgProps["type"]): string => {
    return type === "Cannabis" ? "bg-green-400/10" : "bg-red-400/10";
};

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
          <button className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all">
            Sign Up
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Pane - Vendors List */}
        <div className="w-1/2 p-6 overflow-y-auto bg-black/10 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Local Vendors</h1>
            <p className="text-gray-400">4 vendors found near you</p>
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
                  onMouseEnter={() => setHoveredVendor(vendor.id)}
                  onMouseLeave={() => setHoveredVendor(null)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getVendorIcon(vendor.type as "Cannabis" | "Alcohol")}</div>
                      <div>
                        <h3 className="text-xl font-semibold">{vendor.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBg(vendor.type as "Cannabis" | "Alcohol")} ${getTypeColor(vendor.type as "Cannabis" | "Alcohol")}`}>
                            {vendor.type}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{vendor.rating}</span>
                          </div>
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
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{vendor.hours}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{vendor.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Deals Section */}
                  {selectedVendor === vendor.id && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in slide-in-from-top duration-300">
                      <h4 className="text-lg font-semibold mb-4 text-green-400">Current Deals</h4>
                      <div className="space-y-3">
                        {vendor.deals.map((deal) => (
                          <div key={deal.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-white">{deal.product}</h5>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-gray-400 line-through text-sm">{deal.original}</span>
                                  <span className="text-green-400 font-semibold">{deal.sale}</span>
                                  <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                                    {deal.discount}
                                  </span>
                                </div>
                              </div>
                              <button className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all">
                                View Deal
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Signup Gradient at bottom of 4th vendor */}
                {index === 3 && (
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

        {/* Right Pane - Map */}
        <div className="w-1/2 relative bg-gray-800">
          {/* Map Container */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 400 400">
                {/* Grid lines to simulate map */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Simulated streets */}
                <path d="M0,150 Q200,150 400,150" stroke="white" strokeWidth="2" opacity="0.4" fill="none"/>
                <path d="M200,0 Q200,200 200,400" stroke="white" strokeWidth="2" opacity="0.4" fill="none"/>
                <path d="M0,250 Q400,250 400,250" stroke="white" strokeWidth="1" opacity="0.3" fill="none"/>
              </svg>
            </div>

            {/* Vendor Markers */}
            {vendors.map((vendor, index) => {
              const x = 150 + (index * 50) + (Math.sin(index) * 40);
              const y = 150 + (index * 30) + (Math.cos(index) * 30);
              const isHighlighted = hoveredVendor === vendor.id || selectedVendor === vendor.id;
              
              return (
                <div
                  key={vendor.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                    isHighlighted ? 'scale-150 z-20' : 'scale-100 z-10'
                  }`}
                  style={{ left: `${x}px`, top: `${y}px` }}
                  onMouseEnter={() => setHoveredVendor(vendor.id)}
                  onMouseLeave={() => setHoveredVendor(null)}
                  onClick={() => toggleVendor(vendor.id)}
                >
                  {/* Marker Pin */}
                  <div className={`relative cursor-pointer`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all ${
                      isHighlighted 
                        ? vendor.type === 'Cannabis' 
                          ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                          : 'bg-red-500 shadow-lg shadow-red-500/50'
                        : vendor.type === 'Cannabis'
                          ? 'bg-green-400/80'
                          : 'bg-red-400/80'
                    }`}>
                      {getVendorIcon(vendor.type as "Cannabis" | "Alcohol")}
                    </div>
                    
                    {/* Vendor Info Popup */}
                    {isHighlighted && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-black/90 backdrop-blur-lg rounded-lg p-3 min-w-48 border border-white/20">
                        <div className="text-sm font-semibold text-white">{vendor.name}</div>
                        <div className="text-xs text-gray-300">{vendor.distance}</div>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs text-gray-300">{vendor.rating}</span>
                        </div>
                        {/* Arrow pointing down */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
                      </div>
                    )}
                  </div>

                  {/* Ripple effect for highlighted marker */}
                  {isHighlighted && (
                    <div className="absolute inset-0 rounded-full animate-ping">
                      <div className={`w-8 h-8 rounded-full ${
                        vendor.type === 'Cannabis' ? 'bg-green-400' : 'bg-red-400'
                      } opacity-30`}></div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 space-y-2">
              <button className="bg-black/50 backdrop-blur-lg p-3 rounded-lg border border-white/20 hover:bg-black/70 transition-colors">
                <Navigation className="w-5 h-5 text-white" />
              </button>
              <button className="bg-black/50 backdrop-blur-lg p-3 rounded-lg border border-white/20 hover:bg-black/70 transition-colors text-white font-bold">
                +
              </button>
              <button className="bg-black/50 backdrop-blur-lg p-3 rounded-lg border border-white/20 hover:bg-black/70 transition-colors text-white font-bold">
                −
              </button>
            </div>

            {/* Current Location */}
            <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg">
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></div>
              </div>
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default VendorsPage;