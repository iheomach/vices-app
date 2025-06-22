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
  description: string;
  image_url?: string;
  deals?: Deal[];
  hours_of_operation?: {
    [key: string]: string;
  };
  reviews?: Array<{
    id: string;
    user_id: string;
    rating: number;
    comment: string;
    created_at: string;
  }>;
}

