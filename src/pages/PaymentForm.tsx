// components/PaymentForm.tsx
import React, { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  CardElement,
  CardElementProps,
} from '@stripe/react-stripe-js';
import { StripeCardElement } from '@stripe/stripe-js';
import { PaymentData, PaymentIntentResponse, PaymentError } from '../types/payment';

interface PaymentFormState {
  loading: boolean;
  error: string | null;
  success: boolean;
  processing: boolean;
}

const PaymentForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formState, setFormState] = useState<PaymentFormState>({
    loading: false,
    error: null,
    success: false,
    processing: false,
  });

  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 2000, // $20.00 in cents
    currency: 'usd',
    user_id: 'user_123',
  });

  const createPaymentIntent = async (data: PaymentData): Promise<PaymentIntentResponse> => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/create-payment-intent/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header if needed
        // 'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
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
      // Create payment intent on your backend
      const { client_secret } = await createPaymentIntent(paymentData);

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name', // You can collect this from a form
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
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  if (formState.success) {
    return (
      <div className="payment-success">
        <h2>Payment Successful!</h2>
        <p>Thank you for your purchase.</p>
      </div>
    );
  }

  return (
    <div className="payment-form-container">
      <form onSubmit={handleSubmit} className="payment-form">
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            value={paymentData.amount / 100}
            onChange={(e) =>
              setPaymentData(prev => ({
                ...prev,
                amount: parseFloat(e.target.value) * 100,
              }))
            }
            min="0.50"
            step="0.01"
            disabled={formState.processing}
          />
        </div>

        <div className="card-element-container">
          <CardElement options={cardStyle} />
        </div>

        {formState.error && (
          <div className="error-message" role="alert">
            {formState.error}
          </div>
        )}

        <button
          type="submit"
          disabled={!stripe || formState.loading || formState.processing}
          className="pay-button"
        >
          {formState.processing
            ? 'Processing...'
            : `Pay $${(paymentData.amount / 100).toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;