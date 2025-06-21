// types/signup.ts
export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  location: string;
  agreeToTerms: boolean;
  receiveDeals: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}