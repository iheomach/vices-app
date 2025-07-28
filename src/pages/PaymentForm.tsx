// components/PaymentForm.tsx
import React, { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardElementProps,
} from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { PaymentData, PaymentIntentResponse } from '../types/payment';
import Header from '../components/Header';

interface PaymentFormState {
  loading: boolean;
  error: string | null;
  success: boolean;
  processing: boolean;
}

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  // Debug: Check environment variables
  console.log('Environment check:', {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    NODE_ENV: process.env.NODE_ENV
  });

  const [formState, setFormState] = useState<PaymentFormState>({
    loading: false,
    error: null,
    success: false,
    processing: false,
  });

  const [paymentData] = useState<PaymentData>({
    amount: 999, // $9.99 in cents
    currency: 'usd',
    user_id: 'user_123',
  });

  const createPaymentIntent = async (data: PaymentData): Promise<PaymentIntentResponse> => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('API URL:', apiUrl);
    console.log('Payment data:', data);

    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    try {
      const response = await fetch(`${apiUrl}/api/payments/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 502) {
          throw new Error('Backend server is not responding. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Payment endpoint not found. Please contact support.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Payment failed: ${errorText || 'Unknown error'}`);
        }
      }

      return response.json();
    } catch (error) {
      console.error('Network or parsing error:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to payment server. Please check your internet connection.');
      }
      throw error;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement;

    if (!cardElement) {
      setFormState(prev => ({ ...prev, error: 'Card element not found' }));
      return;
    }

    setFormState(prev => ({ ...prev, loading: true, error: null, processing: true }));

    try {
      const { client_secret } = await createPaymentIntent(paymentData);

      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        },
      });

      if (error) {
        setFormState(prev => ({
          ...prev,
          error: error.message || 'Payment failed',
          loading: false,
          processing: false,
        }));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setFormState(prev => ({
          ...prev,
          success: true,
          loading: false,
          processing: false,
        }));
        // Handle successful payment
        console.log('Payment successful:', paymentIntent);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setFormState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
        processing: false,
      }));
    }
  };

  const cardStyle: CardElementProps['options'] = {
    style: {
      base: {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Inter, sans-serif',
        backgroundColor: 'transparent',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  if (formState.success) {
    return (
      <div className="min-h-screen bg-[#1B272C] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 pt-24">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CC379]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative w-full max-w-md">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <h2 className="text-2xl font-bold text-[#7CC379] mb-2">Payment Successful!</h2>
              <p className="text-green-100/80 mb-4">Thank you for your purchase.</p>
              <a href="/" className="inline-block mt-4 px-6 py-2 bg-[#7CC379] text-black rounded-lg font-semibold hover:bg-[#5a9556] transition">Return Home</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1B272C] flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7CC379]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 space-y-6"
          >
            <h2 className="text-2xl font-bold text-[#7CC379] mb-4 text-center">Complete Your Payment</h2>
            <div className="mb-4">
              <label className="block text-green-100/80 font-medium mb-1">Amount</label>
              <div className="w-full px-4 py-2 rounded-lg border border-[#7CC379]/30 bg-white/10 text-white">
                $9.99 USD
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-green-100/80 font-medium mb-1">Card Details</label>
              <div className="rounded-lg border border-[#7CC379]/30 bg-white/10 p-3">
                <CardElement options={cardStyle} />
              </div>
            </div>

            {formState.error && (
              <div className="bg-red-100 text-red-700 rounded-lg px-4 py-2 mb-2 text-center" role="alert">
                {formState.error}
              </div>
            )}

            <button
              type="submit"
              disabled={formState.loading || formState.processing || !stripe}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {(formState.loading || formState.processing) ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
              ) : (
              <>
                <span>Pay ${ (paymentData.amount / 100).toFixed(2) }</span>
              </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;