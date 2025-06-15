import { Vendor } from '../../types/vendor';

export class VendorsApi {
  private baseUrl = process.env.REACT_APP_API_URL || '/api';
  
  async searchVendors(lat: number, lng: number): Promise<Vendor[]> {
    // TODO: Implement actual API call
    return [];
  }
  
  async getVendorDetails(id: string): Promise<Vendor> {
    // TODO: Implement actual API call
    // For now, return a dummy Vendor object to satisfy the return type
    return {} as Vendor;
  }
}