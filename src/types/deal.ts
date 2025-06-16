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