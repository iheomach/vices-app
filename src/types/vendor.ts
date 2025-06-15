// src/types/vendor.ts
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

// src/types/deal.ts
export interface Deal {
  id: number;
  product: string;
  original: string;
  sale: string;
  discount: string;
  dealScore: number;
  isBlurred?: boolean;
  vendorId: string;
}