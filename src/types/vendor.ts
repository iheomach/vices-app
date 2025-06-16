// src/types/vendor.ts
import { Deal } from './deal';
export interface Vendor {
  id: string;
  name: string;
  type: 'Cannabis' | 'Alcohol';
  rating: number;
  distance: string;
  address: string;
  phone?: string;
  hours?: string;
  lat: number;
  lng: number;
  deals: Deal[];
  averageDealScore: number;
  isPremium?: boolean;
  place?: google.maps.places.PlaceResult;
}

