// src/types/scrapedVendor.ts

export interface ScrapedVendor {
  id: string;
  name: string;
  full_address: string;
  phone?: string;
  rating?: number;
  working_hours_old_format?: string;
  latitude: number;
  longitude: number;
  category?: string;
  verified?: boolean;
  source?: string;
  website?: string;
  google_id?: string;
  place_id?: string;
  reviews?: number;
  photo?: string;
  working_hours?: {
    [key: string]: string;
  } | null;
  // New properties from the API response
  distance?: string;        // Distance display string (e.g., "1.2km", "500m")
  distance_km?: number;     // Distance in kilometers for sorting
}
