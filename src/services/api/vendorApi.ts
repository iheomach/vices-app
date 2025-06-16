// src/services/api/vendorApi.ts
import { Vendor } from '../../types/vendor';
import { Deal } from '../../types/deal';

export class VendorsApi {
  private baseUrl = process.env.REACT_APP_API_URL || '/api';
  
  async searchVendors(lat: number, lng: number, radius: number = 5000): Promise<Vendor[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat,
          lng,
          radius,
          types: ['cannabis', 'alcohol']
        }),
      });

      if (!response.ok) {
        console.warn(`API call failed with status ${response.status}, falling back to mock data`);
        return this.getMockVendors();
      }

      const data = await response.json();
      return data.vendors || [];
    } catch (error) {
      console.error('Error searching vendors:', error);
      console.info('Using mock data as fallback');
      // Return mock data as fallback
      return this.getMockVendors();
    }
  }
  
  async getVendorDetails(id: string): Promise<Vendor | null> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.vendor;
    } catch (error) {
      console.error('Error fetching vendor details:', error);
      return null;
    }
  }

  async generateDeals(vendorId: string, vendorName: string, vendorType: 'Cannabis' | 'Alcohol'): Promise<Deal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${vendorId}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorName,
          vendorType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.deals || [];
    } catch (error) {
      console.error('Error generating deals:', error);
      return [];
    }
  }

  // Fallback mock data when API is unavailable
  private getMockVendors(): Vendor[] {
    return [
      {
        id: "cannabis_1",
        name: "Green Leaf Dispensary",
        type: "Cannabis",
        rating: 4.8,
        distance: "0.3 mi",
        address: "123 Main St, Calgary AB",
        phone: "(403) 555-0123",
        hours: "Open until 10PM",
        lat: 51.0447,
        lng: -114.0719,
        averageDealScore: 85,
        isPremium: true,
        deals: [
          {
            id: 1,
            product: "Blue Dream 3.5g",
            original: "$45",
            sale: "$35",
            discount: "22% off",
            dealScore: 88,
            isBlurred: false,
            vendorId: "cannabis_1"
          },
          {
            id: 2,
            product: "Premium Gummies",
            original: "$25",
            sale: "$18",
            discount: "28% off",
            dealScore: 92,
            isBlurred: false,
            vendorId: "cannabis_1"
          }
        ]
      },
      {
        id: "alcohol_1",
        name: "Alberta Spirits Co.",
        type: "Alcohol",
        rating: 4.6,
        distance: "0.7 mi",
        address: "456 Oak Ave, Calgary AB",
        phone: "(403) 555-0456",
        hours: "Open until 11PM",
        lat: 51.0505,
        lng: -114.0857,
        averageDealScore: 78,
        isPremium: false,
        deals: [
          {
            id: 3,
            product: "Crown Royal 750ml",
            original: "$35",
            sale: "$28",
            discount: "20% off",
            dealScore: 75,
            isBlurred: true,
            vendorId: "alcohol_1"
          },
          {
            id: 4,
            product: "Craft Beer 6-pack",
            original: "$18",
            sale: "$14",
            discount: "22% off",
            dealScore: 82,
            isBlurred: true,
            vendorId: "alcohol_1"
          }
        ]
      },
      {
        id: "cannabis_2",
        name: "High Society",
        type: "Cannabis",
        rating: 4.9,
        distance: "1.2 mi",
        address: "789 Pine St, Calgary AB",
        phone: "(403) 555-0789",
        hours: "Open until 9PM",
        lat: 51.0369,
        lng: -114.0581,
        averageDealScore: 95,
        isPremium: true,
        deals: [
          {
            id: 5,
            product: "White Widow 7g",
            original: "$80",
            sale: "$65",
            discount: "19% off",
            dealScore: 95,
            isBlurred: true,
            vendorId: "cannabis_2"
          }
        ]
      },
      {
        id: "alcohol_2",
        name: "Barrel & Brew",
        type: "Alcohol",
        rating: 4.7,
        distance: "1.8 mi",
        address: "321 Elm Dr, Calgary AB",
        phone: "(403) 555-0321",
        hours: "Open until 10PM",
        lat: 51.0286,
        lng: -114.1057,
        averageDealScore: 73,
        deals: [
          {
            id: 6,
            product: "Whiskey Flight Set",
            original: "$32",
            sale: "$24",
            discount: "25% off",
            dealScore: 73,
            isBlurred: true,
            vendorId: "alcohol_2"
          }
        ]
      }
    ];
  }
}