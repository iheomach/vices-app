// backend/routes/vendors.ts (Express.js implementation)
import express from 'express';
import axios from 'axios';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Search vendors endpoint
router.post('/search', async (req, res) => {
  try {
    const { lat, lng, radius = 5000, types = ['cannabis', 'alcohol'] } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const vendors = [];
    
    // Search for each type
    for (const type of types) {
      let keyword = '';
      let vendorType = '';
      
      if (type === 'cannabis') {
        keyword = 'cannabis dispensary';
        vendorType = 'Cannabis';
      } else if (type === 'alcohol') {
        keyword = 'liquor store';
        vendorType = 'Alcohol';
      }

      // Google Places API call
      const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
      const placesParams = {
        location: `${lat},${lng}`,
        radius: radius.toString(),
        keyword: keyword,
        key: process.env.GOOGLE_MAPS_API_KEY
      };

      const placesResponse = await axios.get(placesUrl, { params: placesParams });
      const data = placesResponse.data as { results?: any[] };
      const places = data.results || [];

      // Process each place
      for (const place of places) {
        // Get additional details
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
        const detailsParams = {
          place_id: place.place_id,
          fields: 'name,formatted_phone_number,opening_hours,website,rating,formatted_address,geometry',
          key: process.env.GOOGLE_MAPS_API_KEY
        };

        try {
          const detailsResponse = await axios.get(detailsUrl, { params: detailsParams });
          const details = (detailsResponse.data as { result: any }).result;

          // Calculate distance
          const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
          const distanceStr = distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;

          // Get current hours
          let hours = 'Hours not available';
          if (details.opening_hours?.open_now !== undefined) {
            hours = details.opening_hours.open_now ? 'Open now' : 'Closed';
          }

          // Generate deals using OpenAI
          const deals = await generateDealsWithAI(place.name, vendorType);

          const vendor = {
            id: place.place_id,
            name: place.name,
            type: vendorType,
            rating: place.rating || 0,
            distance: distanceStr,
            address: details.formatted_address || place.vicinity || '',
            phone: details.formatted_phone_number || '',
            hours: hours,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            deals: deals,
            website: details.website || ''
          };

          vendors.push(vendor);
        } catch (detailsError) {
          console.error('Error fetching place details:', detailsError);
          // Add basic vendor info even if details fail
          const distance = calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng);
          const distanceStr = distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;

          vendors.push({
            id: place.place_id,
            name: place.name,
            type: vendorType,
            rating: place.rating || 0,
            distance: distanceStr,
            address: place.vicinity || '',
            phone: '',
            hours: '',
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            deals: [],
            website: ''
          });
        }
      }
    }

    // Sort by distance
    vendors.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(/[^\d.]/g, ''));
      const distB = parseFloat(b.distance.replace(/[^\d.]/g, ''));
      return distA - distB;
    });

    res.json({ vendors: vendors.slice(0, 20) }); // Limit to 20 results
  } catch (error) {
    console.error('Error searching vendors:', error);
    res.status(500).json({ error: 'Failed to search vendors' });
  }
});

// Get vendor details endpoint
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get place details from Google
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json`;
    const detailsParams = {
      place_id: id,
      fields: 'name,formatted_phone_number,opening_hours,website,rating,formatted_address,geometry,photos,reviews',
      key: process.env.GOOGLE_MAPS_API_KEY
    };

    const response = await axios.get(detailsUrl, { params: detailsParams });
    const details = (response.data as { result: any }).result;

    if (!details) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Enhanced vendor details
    const vendor = {
      id: id,
      name: details.name,
      rating: details.rating || 0,
      address: details.formatted_address || '',
      phone: details.formatted_phone_number || '',
      website: details.website || '',
      hours: details.opening_hours?.weekday_text || [],
      lat: details.geometry.location.lat,
      lng: details.geometry.location.lng,
      photos: details.photos?.slice(0, 5) || [],
      reviews: details.reviews?.slice(0, 3) || []
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
    const { vendorName, vendorType } = req.body;
    
    if (!vendorName || !vendorType) {
      return res.status(400).json({ error: 'Vendor name and type are required' });
    }

    const deals = await generateDealsWithAI(vendorName, vendorType);
    res.json({ deals });
  } catch (error) {
    console.error('Error generating deals:', error);
    res.status(500).json({ error: 'Failed to generate deals' });
  }
});

// AI deal generation function
async function generateDealsWithAI(vendorName: string, vendorType: string): Promise<any[]> {
  try {
    const prompt = `Generate 2-3 realistic current deals for "${vendorName}", a ${vendorType.toLowerCase()} ${vendorType === 'Cannabis' ? 'dispensary' : 'store'} in Canada. 

Format as JSON array with this structure:
[
  {
    "id": 1,
    "product": "Product name",
    "original": "$XX",
    "sale": "$XX", 
    "discount": "XX% off"
  }
]

Make deals realistic for Canadian ${vendorType.toLowerCase()} prices. Focus on popular products with believable discounts (15-30% off).`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use cheaper model for deal generation
      messages: [
        {
          role: "system",
          content: "You are a deals generator for Canadian cannabis dispensaries and liquor stores. Generate realistic, current deals in valid JSON format only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return [];

    // Parse JSON response
    const deals = JSON.parse(content);
    return Array.isArray(deals) ? deals : [];
  } catch (error) {
    console.error('Error generating deals with AI:', error);
    // Return fallback deals
    return [
      {
        id: 1,
        product: `${vendorType} Special`,
        original: "$25",
        sale: "$20",
        discount: "20% off"
      }
    ];
  }
}

export default router;