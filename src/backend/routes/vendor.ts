// src/backend/routes/vendors.ts
import express from 'express';
import axios from 'axios';

const router = express.Router();

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // Convert to meters
}

// Helper function to format distance
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

// Helper function to determine vendor type from place data
function determineVendorType(place: any): 'Cannabis' | 'Alcohol' | null {
  const name = place.name?.toLowerCase() || '';
  const types = place.types || [];
  
  // Cannabis keywords
  const cannabisKeywords = ['dispensary', 'cannabis', 'weed', 'marijuana', 'pot', 'herb', 'green', 'leaf'];
  const alcoholKeywords = ['liquor', 'beer', 'wine', 'spirits', 'brewery', 'distillery', 'bar', 'pub'];
  
  // Check name for cannabis keywords
  if (cannabisKeywords.some(keyword => name.includes(keyword))) {
    return 'Cannabis';
  }
  
  // Check name for alcohol keywords or place types
  if (alcoholKeywords.some(keyword => name.includes(keyword)) || 
      types.includes('liquor_store') || 
      types.includes('bar') || 
      types.includes('restaurant')) {
    return 'Alcohol';
  }
  
  return null;
}

// Helper function to generate mock deals for a vendor
function generateMockDeals(vendorId: string, vendorName: string, vendorType: 'Cannabis' | 'Alcohol', isFirstVendor: boolean = false): any[] {
  const cannabisProducts = [
    { product: 'Blue Dream 3.5g', original: '$45', sale: '$35', discount: '22% off' },
    { product: 'OG Kush 7g', original: '$85', sale: '$68', discount: '20% off' },
    { product: 'Premium Gummies', original: '$25', sale: '$18', discount: '28% off' },
    { product: 'White Widow 3.5g', original: '$50', sale: '$38', discount: '24% off' },
    { product: 'CBD Oil 30ml', original: '$60', sale: '$45', discount: '25% off' }
  ];
  
  const alcoholProducts = [
    { product: 'Crown Royal 750ml', original: '$35', sale: '$28', discount: '20% off' },
    { product: 'Craft Beer 6-pack', original: '$18', sale: '$14', discount: '22% off' },
    { product: 'Whiskey Flight Set', original: '$32', sale: '$24', discount: '25% off' },
    { product: 'Wine Selection 3-pack', original: '$55', sale: '$42', discount: '24% off' },
    { product: 'Premium Vodka 1L', original: '$45', sale: '$36', discount: '20% off' }
  ];
  
  const products = vendorType === 'Cannabis' ? cannabisProducts : alcoholProducts;
  const numDeals = Math.floor(Math.random() * 3) + 1; // 1-3 deals
  const selectedProducts = products.slice(0, numDeals);
  
  return selectedProducts.map((product, index) => ({
    id: Date.now() + index,
    ...product,
    dealScore: Math.floor(Math.random() * 30) + 70, // 70-100
    isBlurred: !isFirstVendor, // Only first vendor shows unblurred deals
    vendorId: vendorId
  }));
}

// Helper function to get current hours status
function getCurrentHoursStatus(openingHours: any): string {
  if (!openingHours) return 'Hours not available';
  
  if (openingHours.open_now === true) {
    return 'Open now';
  } else if (openingHours.open_now === false) {
    return 'Closed';
  }
  
  return 'Hours not available';
}

// Search vendors endpoint
router.post('/search', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, types = ['cannabis', 'alcohol'] } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!googleApiKey) {
      console.error('Google Maps API key is not configured');
      return res.status(500).json({ error: 'Google Maps API not configured' });
    }

    console.log(`Searching for vendors near ${lat}, ${lng} within ${radius}m`);

    interface Deal {
      id: number;
      product: string;
      original: string;
      sale: string;
      discount: string;
      dealScore: number;
      isBlurred: boolean;
      vendorId: string;
    }

    type VendorType = 'Cannabis' | 'Alcohol';

    interface Vendor {
      id: string;
      name: string;
      type: VendorType;
      rating: number;
      distance: string;
      address: string;
      phone?: string;
      hours: string;
      lat: number;
      lng: number;
      deals: Deal[];
      averageDealScore: number;
      isPremium: boolean;
      place: {
        place_id: string;
        website?: string;
        types?: string[];
      };
    }

    const vendors: Vendor[] = [];
    let vendorIndex = 0;

    // Search for each type
    for (const type of types) {
    let searchQueries: string[] = [];
      
      if (type === 'cannabis') {
        // Multiple searches for cannabis dispensaries
        searchQueries = [
          'cannabis dispensary',
          'marijuana dispensary',
          'weed store',
          'dispensary'
        ];
      } else if (type === 'alcohol') {
        // Multiple searches for alcohol vendors
        searchQueries = [
          'liquor store',
          'beer store',
          'wine shop',
          'spirits store',
          'brewery',
          'bar'
        ];
      }

      for (const query of searchQueries) {
        try {
          console.log(`Searching Google Places for: "${query}"`);
          
          // Google Places Nearby Search
          const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
          const placesParams = {
            location: `${lat},${lng}`,
            radius: radius.toString(),
            keyword: query,
            key: googleApiKey
          };

          const placesResponse = await axios.get(placesUrl, { params: placesParams });
          const places = (placesResponse.data as { results: any[] }).results || [];

          console.log(`Found ${places.length} places for query "${query}"`);

          // Process each place
          for (const place of places.slice(0, 10)) { // Limit to 10 per query
            try {
              // Skip if we already have this place
              if (vendors.find(v => v.id === place.place_id)) continue;

              // Get additional details
              const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
              const detailsParams = {
                place_id: place.place_id,
                fields: 'name,formatted_phone_number,opening_hours,website,rating,formatted_address,geometry,types',
                key: googleApiKey
              };

              const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });
              const details = (detailsResponse.data as { result: any }).result;

              if (!details) continue;

              // Determine vendor type
              const vendorType = determineVendorType(details);
              if (!vendorType) continue;

              // Calculate distance
              const distanceMeters = calculateDistance(
                lat, 
                lng, 
                details.geometry.location.lat, 
                details.geometry.location.lng
              );

              // Skip if too far
              if (distanceMeters > radius) continue;

              // Get current hours
              const hours = getCurrentHoursStatus(details.opening_hours);

              // Generate deals (first vendor gets unblurred deals)
              const deals = generateMockDeals(
                place.place_id, 
                details.name, 
                vendorType, 
                vendorIndex === 0
              );

              // Calculate average deal score
              const averageDealScore = deals.length > 0 
                ? Math.round(deals.reduce((sum, deal) => sum + deal.dealScore, 0) / deals.length)
                : 75;

              const vendor = {
                id: place.place_id,
                name: details.name,
                type: vendorType,
                rating: details.rating || 0,
                distance: formatDistance(distanceMeters),
                address: details.formatted_address || place.vicinity || '',
                phone: details.formatted_phone_number || undefined,
                hours: hours,
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
                deals: deals,
                averageDealScore: averageDealScore,
                isPremium: vendorType === 'Cannabis' ? true : Math.random() > 0.5,
                place: {
                  place_id: place.place_id,
                  website: details.website,
                  types: details.types
                }
              };

              vendors.push(vendor);
              vendorIndex++;

              console.log(`Added vendor: ${vendor.name} (${vendorType}) - ${vendor.distance}`);

            } catch (detailsError) {
              if (detailsError && typeof detailsError === 'object' && 'message' in detailsError) {
                console.error('Error fetching place details:', (detailsError as any).message);
              } else {
                console.error('Error fetching place details:', detailsError);
              }
              continue;
            }
          }

          // Rate limiting - wait between requests
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (searchError) {
          if (searchError && typeof searchError === 'object' && 'message' in searchError) {
            console.error(`Error searching for "${query}":`, (searchError as any).message);
          } else {
            console.error(`Error searching for "${query}":`, searchError);
          }
          continue;
        }
      }
    }

    // Sort by distance
    vendors.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(/[^\d.]/g, ''));
      const distB = parseFloat(b.distance.replace(/[^\d.]/g, ''));
      return distA - distB;
    });

    // Ensure the first vendor has unblurred deals
    if (vendors.length > 0) {
      vendors[0].deals = vendors[0].deals.map(deal => ({
        ...deal,
        isBlurred: false
      }));
    }

    console.log(`Returning ${vendors.length} vendors total`);
    res.json({ vendors: vendors.slice(0, 20) }); // Limit to 20 results

  } catch (error) {
    console.error('Error in vendor search:', error);
    res.status(500).json({ 
      error: 'Failed to search vendors',
      message: process.env.NODE_ENV === 'development'
        ? (typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error))
        : 'Internal server error'
    });
  }
});

// Get vendor details endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleApiKey) {
      return res.status(500).json({ error: 'Google Maps API not configured' });
    }
    
    // Get place details from Google
    const detailsUrl = 'https://maps.googleapis.com/maps/api/place/details/json';
    const detailsParams = {
      place_id: id,
      fields: 'name,formatted_phone_number,opening_hours,website,rating,formatted_address,geometry,photos,reviews,types',
      key: googleApiKey
    };

    const response = await axios.get(detailsUrl, { params: detailsParams });
    const details = (response.data as { result: any }).result;

    if (!details) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Determine vendor type
    const vendorType = determineVendorType(details);
    if (!vendorType) {
      return res.status(404).json({ error: 'Vendor type could not be determined' });
    }

    // Enhanced vendor details
    const vendor = {
      id: id,
      name: details.name,
      type: vendorType,
      rating: details.rating || 0,
      address: details.formatted_address || '',
      phone: details.formatted_phone_number || '',
      website: details.website || '',
      hours: details.opening_hours?.weekday_text || [],
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      photos: details.photos?.slice(0, 5) || [],
      reviews: details.reviews?.slice(0, 3) || [],
      deals: generateMockDeals(id, details.name, vendorType),
      averageDealScore: 85,
      isPremium: vendorType === 'Cannabis',
      place: details
    };

    res.json({ vendor });
  } catch (error) {
    console.error('Error fetching vendor details:', error);
    res.status(500).json({ error: 'Failed to fetch vendor details' });
  }
});

// Generate deals endpoint
router.post('/:id/deals', async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorName, vendorType } = req.body;
    
    if (!vendorName || !vendorType) {
      return res.status(400).json({ error: 'Vendor name and type are required' });
    }

    const deals = generateMockDeals(id, vendorName, vendorType);
    res.json({ deals });
  } catch (error) {
    console.error('Error generating deals:', error);
    res.status(500).json({ error: 'Failed to generate deals' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    googleMapsConfigured: !!process.env.GOOGLE_MAPS_API_KEY,
    timestamp: new Date().toISOString()
  });
});

export default router;