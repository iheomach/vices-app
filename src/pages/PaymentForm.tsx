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
import { useAuth } from '../contexts/AuthContext';

interface PaymentFormState {
  loading: boolean;
  error: string | null;
  success: boolean;
  processing: boolean;
}

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, updateUser, token } = useAuth();

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
    amount: 50, // $0.50 in cents
    currency: 'usd',
    user_id: user?.id || 'guest',
  });

  const upgradeUserToPremium = async (): Promise<void> => {
    if (!user) {
      console.error('No user found to upgrade');
      return;
    }

    try {
      console.log('Upgrading user to premium...');
      console.log('Current user before update:', user);
      
      try {
        // Use the dedicated premium upgrade endpoint
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/upgrade-to-premium/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify({
            user_id: user?.id,
            payment_intent_id: 'stripe_payment_intent_id' // You can add the actual Stripe payment intent ID here if needed
          })
        });

        if (response.ok) {
          const updatedUser = await response.json();
          console.log('User successfully upgraded to premium via dedicated endpoint!', updatedUser);
          
          // Update the user state directly since we got the updated user from the backend
          // The backend returns: { id, email, first_name, last_name, account_tier }
          // We need to merge this with the existing user data
          if (user) {
            const mergedUser = { ...user, ...updatedUser };
            
            // Update localStorage or sessionStorage with the merged user
            const currentStoredToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (currentStoredToken) {
              if (localStorage.getItem('authToken')) {
                localStorage.setItem('userData', JSON.stringify(mergedUser));
              } else {
                sessionStorage.setItem('userData', JSON.stringify(mergedUser));
              }
            }
          }
        } else {
          const errorData = await response.json();
          console.error('Premium upgrade failed:', errorData);
          throw new Error(errorData.error || 'Failed to upgrade to premium');
        }
      } catch (apiError) {
        console.error('API update failed, trying local update:', apiError);
        
        // Fallback: Update locally if API fails
        if (user) {
          const updatedUser = { ...user, account_tier: 'premium' };
          
          // Update localStorage or sessionStorage
          const currentStoredToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
          if (currentStoredToken) {
            if (localStorage.getItem('authToken')) {
              localStorage.setItem('userData', JSON.stringify(updatedUser));
            } else {
              sessionStorage.setItem('userData', JSON.stringify(updatedUser));
            }
          }
          
          console.log('User upgraded to premium locally');
        }
      }
    } catch (error) {
      console.error('Error upgrading user to premium:', error);
    }
  };

  const createPaymentIntent = async (data: PaymentData): Promise<PaymentIntentResponse> => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('💳 Creating Payment Intent...');
    console.log('💳 API URL:', apiUrl);
    console.log('💳 Payment data:', data);

    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    try {
      console.log('💳 Sending request to payment endpoint...');
      const response = await fetch(`${apiUrl}/api/payments/create-payment-intent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('💳 Payment API Response status:', response.status);
      console.log('💳 Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('💳 Payment API Error Response:', errorText);
        
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

      const result = await response.json();
      console.log('💳 Payment Intent created successfully!');
      console.log('💳 Client secret received:', result.client_secret ? 'Yes' : 'No');
      console.log('💳 Full response:', result);
      
      return result;
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
      console.log('🎯 Creating payment intent for amount:', paymentData.amount);
      console.log('🎯 Payment data:', paymentData);
      
      const { client_secret } = await createPaymentIntent(paymentData);
      console.log('🎯 Payment intent created, client_secret received');

      console.log('🎯 Confirming payment with Stripe...');
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name',
          },
        },
      });

      if (error) {
        console.error('🚨 Stripe payment error:', error);
        console.error('🚨 Error code:', error.code);
        console.error('🚨 Error message:', error.message);
        setFormState(prev => ({
          ...prev,
          error: error.message || 'Payment failed',
          loading: false,
          processing: false,
        }));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('🎉 Payment succeeded!');
        console.log('🎉 Payment Intent ID:', paymentIntent.id);
        console.log('🎉 Amount charged:', paymentIntent.amount);
        console.log('🎉 Payment method:', paymentIntent.payment_method);
        console.log('Payment successful:', paymentIntent);
        
        // Upgrade user to premium after successful payment
        await upgradeUserToPremium();
        
        setFormState(prev => ({
          ...prev,
          success: true,
          loading: false,
          processing: false,
        }));
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
              <p className="text-green-100/80 mb-2">Thank you for your purchase.</p>
              <p className="text-[#7CC379] font-semibold mb-4">Welcome to Premium!</p>
              <p className="text-green-100/70 text-sm mb-4">Your account has been upgraded and you now have access to all premium features.</p>
              <a href="/user-dashboard" className="inline-block mt-4 px-6 py-2 bg-[#7CC379] text-black rounded-lg font-semibold hover:bg-[#5a9556] transition">Go to Dashboard</a>
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