export interface PaymentData {
    amount: number;
    currency?: string;
    user_id?: string;
    description?: string;
  }

  export interface SubscriptionData {
    price_id: string;
    user_id: string;
    email?: string;
  }
  
  export interface PaymentIntentResponse {
    client_secret: string;
    id?: string;
  }

  export interface SubscriptionResponse {
    client_secret: string;
    subscription_id: string;
    status?: string;
  }
  
  export interface PaymentError {
    message: string;
    code?: string;
  }
  
  export interface PaymentFormProps {
    amount: number;
    onSuccess?: (paymentIntent: any) => void;
    onError?: (error: PaymentError) => void;
  }