export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Location preferences
  city: string;
  province: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  
  // Consumption preferences
  preferred_categories: string[];
  tolerance_level: string;
  favorite_effects: string[];
  account_tier: string;
  consumption_goals: string[];

  // Preferences
  receive_deal_notifications: boolean;
  
  // Account info
  is_verified: boolean;
  date_of_birth: string | null; // ISO date string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}