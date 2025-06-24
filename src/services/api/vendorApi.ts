// services/api/vendorApi.ts
export interface SearchVendorsParams {
  lat: number;
  lng: number;
  radius: number; // in meters
  category: 'cannabis' | 'alcohol' | 'both';
}

export interface VendorFilter {
  category?: 'cannabis' | 'alcohol' | 'both';
  rating?: number;
  distance?: number;
  verified?: boolean;
}

export class VendorsApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }

  /**
   * Search for vendors using location and filters
   */
  async searchVendors(params: SearchVendorsParams): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams({
        lat: params.lat.toString(),
        lng: params.lng.toString(),
        radius: params.radius.toString(),
        category: params.category
      });

      const response = await fetch(`${this.baseUrl}/vendors/search/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching vendors:', error);
      throw error;
    }
  }

  /**
   * Get nearby vendors with default settings
   */
  async getNearbyVendors(lat: number, lng: number, category: 'cannabis' | 'alcohol' | 'both' = 'both'): Promise<any[]> {
    try {
      const queryParams = new URLSearchParams({
        lat: lat.toString(),
        lng: lng.toString(),
        category: category
      });

      const response = await fetch(`${this.baseUrl}/vendors/nearby/?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting nearby vendors:', error);
      throw error;
    }
  }

  /**
   * Get vendors by specific category
   */
  async getVendorsByCategory(category: 'cannabis' | 'alcohol'): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/?category=${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error getting vendors by category:', error);
      throw error;
    }
  }

  /**
   * Get vendor details by ID
   */
  async getVendorById(id: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting vendor details:', error);
      throw error;
    }
  }

  /**
   * Get deals for a specific vendor
   */
  async getVendorDeals(vendorId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${vendorId}/deals/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting vendor deals:', error);
      throw error;
    }
  }

  /**
   * Get products for a specific vendor
   */
  async getVendorProducts(vendorId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${vendorId}/products/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting vendor products:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a specific vendor
   */
  async getVendorReviews(vendorId: string): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/vendors/${vendorId}/reviews/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error getting vendor reviews:', error);
      throw error;
    }
  }

  /**
   * Filter vendors client-side
   */
  filterVendors(vendors: any[], filters: VendorFilter): any[] {
    return vendors.filter(vendor => {
      // Category filter
      if (filters.category && filters.category !== 'both') {
        const vendorCategory = vendor.category?.toLowerCase();
        if (vendorCategory !== filters.category) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating && vendor.rating < filters.rating) {
        return false;
      }

      // Distance filter (assuming distance_km is available)
      if (filters.distance && vendor.distance_km > filters.distance) {
        return false;
      }

      // Verified filter
      if (filters.verified !== undefined && vendor.verified !== filters.verified) {
        return false;
      }

      return true;
    });
  }

  /**
   * Sort vendors by various criteria
   */
  sortVendors(vendors: any[], sortBy: 'distance' | 'rating' | 'name' | 'reviews' = 'distance'): any[] {
    return [...vendors].sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distance_km || 0) - (b.distance_km || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return (b.reviews || 0) - (a.reviews || 0);
        default:
          return 0;
      }
    });
  }
}