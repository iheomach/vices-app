// components/PaymentForm.tsx
import React, { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardElementProps,
} from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { PaymentData, PaymentIntentResponse, SubscriptionData, SubscriptionResponse } from '../types/payment';
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
  const { user, updateUser, token } = useAuth(); // ✅ Get token at component level

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

  const [subscriptionData] = useState({
    price_id: 'price_1RqN4fKrgfp4oNY3kDtd7Cvs', // Replace with the price ID from Stripe Dashboard
    user_id: user?.id || 'guest',
    email: user?.email || '',
  });

  const upgradeUserToPremium = async (): Promise<void> => {
    if (!user) {
      console.error('No user found to upgrade');
      return;
    }

    try {
      console.log('Upgrading user to premium...');
      
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/users/upgrade-to-premium/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to upgrade user:', errorText);
        throw new Error(`Failed to upgrade user: ${errorText}`);
      }

      const updatedUser = await response.json();
      console.log('User successfully upgraded to premium!', updatedUser);
      
      // Update the user context with the new data
      if (updateUser) {
        await updateUser(updatedUser);
      }
      
    } catch (error) {
      console.error('Error upgrading user to premium:', error);
      throw error; // Re-throw to handle in the main flow
    }
  };

  const createSubscription = async (data: SubscriptionData, paymentMethodId: string): Promise<SubscriptionResponse> => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log('Creating subscription...');
    console.log('API URL:', apiUrl);
    console.log('Subscription data:', data);
    console.log('Payment method ID:', paymentMethodId);

    if (!apiUrl) {
      throw new Error('API URL not configured. Please check your environment variables.');
    }

    try {
      // ✅ Use token from component scope
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // ✅ Include Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Token ${token}`;
      }

      // ✅ Add payment_method_id to the data
      const subscriptionData = {
        ...data,
        payment_method_id: paymentMethodId
      };

      const response = await fetch(`${apiUrl}/api/payments/create-subscription/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(subscriptionData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 502) {
          throw new Error('Backend server is not responding. Please try again later.');
        } else if (response.status === 404) {
          throw new Error('Subscription endpoint not found. Please contact support.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Subscription creation failed: ${errorText || 'Unknown error'}`);
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
      // ✅ Create payment method first
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'Customer Name',
          email: user?.email || '',
        },
      });

      if (paymentMethodError) {
        console.error('Payment method creation error:', paymentMethodError);
        setFormState(prev => ({
          ...prev,
          error: paymentMethodError.message || 'Failed to create payment method',
          loading: false,
          processing: false,
        }));
        return;
      }

      if (!paymentMethod) {
        setFormState(prev => ({
          ...prev,
          error: 'Failed to create payment method',
          loading: false,
          processing: false,
        }));
        return;
      }

      // ✅ Create subscription with payment method ID
      const { client_secret, subscription_id, status } = await createSubscription(subscriptionData, paymentMethod.id);

      console.log('Subscription response:', { client_secret, subscription_id, status });

      // ✅ Only confirm payment if client_secret exists (for incomplete subscriptions)
      if (client_secret) {
        console.log('Confirming payment with client_secret...');
        const { error } = await stripe.confirmCardPayment(client_secret, {
          payment_method: paymentMethod.id,
        });

        if (error) {
          console.error('Subscription payment confirmation error:', error);
          setFormState(prev => ({
            ...prev,
            error: error.message || 'Subscription payment failed',
            loading: false,
            processing: false,
          }));
          return;
        }
        console.log('Payment confirmed successfully!');
      } else {
        // ✅ No client_secret means subscription was charged immediately
        console.log('Subscription was charged immediately, no payment confirmation needed');
      }

      console.log('Subscription created successfully!');
      console.log('Subscription ID:', subscription_id);
      console.log('Subscription Status:', status);
      
      // Upgrade user to premium after successful subscription setup
      await upgradeUserToPremium();
      
      setFormState(prev => ({
        ...prev,
        success: true,
        loading: false,
        processing: false,
      }));

    } catch (err) {
      console.error('Subscription error:', err);
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
              <h2 className="text-2xl font-bold text-[#7CC379] mb-2">Subscription Active!</h2>
              <p className="text-green-100/80 mb-2">Thank you for subscribing to Premium.</p>
              <p className="text-[#7CC379] font-semibold mb-4">Welcome to Premium!</p>
              <p className="text-green-100/70 text-sm mb-2">Your monthly subscription is now active and you have access to all premium features.</p>
              <p className="text-green-100/60 text-xs mb-4">You'll be charged $0.50 monthly. Cancel anytime from your account settings.</p>
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
            <h2 className="text-2xl font-bold text-[#7CC379] mb-4 text-center">Start Your Premium Subscription</h2>
            <div className="mb-4">
              <label className="block text-green-100/80 font-medium mb-1">Monthly Subscription</label>
              <div className="w-full px-4 py-2 rounded-lg border border-[#7CC379]/30 bg-white/10 text-white">
                $0.50 USD / month
              </div>
              <p className="text-green-100/60 text-sm mt-1">Cancel anytime from your account settings</p>
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
                <span>Subscribe for $0.50/month</span>
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