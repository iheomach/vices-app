import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  plan: {
    amount: number;
    currency: string;
    interval: string;
  };
}

interface Invoice {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string;
  invoice_pdf: string;
}

const SubscriptionManagement: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch subscription data
  const fetchSubscriptionData = async () => {
    if (!token || !user?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/subscription-status/${user.id}/`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        setInvoices(data.invoices || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch subscription data');
      }
    } catch (err) {
      setError('Network error while fetching subscription data');
    } finally {
      setLoading(false);
    }
  };

  // Cancel subscription
  const handleCancelSubscription = async () => {
    if (!subscription || !token) return;

    const confirmCancel = window.confirm(
      'Are you sure you want to cancel your subscription? You\'ll continue to have access until the end of your current billing period.'
    );

    if (!confirmCancel) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/cancel-subscription/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.id,
          user_id: user?.id,
        }),
      });

      if (response.ok) {
        setSuccess('Subscription cancelled successfully. You\'ll retain access until the end of your billing period.');
        await fetchSubscriptionData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      setError('Network error while cancelling subscription');
    } finally {
      setActionLoading(false);
    }
  };

  // Reactivate subscription
  const handleReactivateSubscription = async () => {
    if (!subscription || !token) return;

    try {
      setActionLoading(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/payments/reactivate-subscription/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.id,
          user_id: user?.id,
        }),
      });

      if (response.ok) {
        setSuccess('Subscription reactivated successfully!');
        await fetchSubscriptionData(); // Refresh data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to reactivate subscription');
      }
    } catch (err) {
      setError('Network error while reactivating subscription');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [token, user?.id]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return `$${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'past_due':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'canceled':
      case 'cancelled':
        return 'text-red-400 bg-red-400/20';
      case 'incomplete':
        return 'text-orange-400 bg-orange-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-5 h-5" />;
      case 'past_due':
        return <AlertTriangle className="w-5 h-5" />;
      case 'canceled':
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7CC379]" />
            <span className="text-lg">Loading subscription data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has premium account but no subscription data
  const isPremiumWithoutSubscription = user?.account_tier === 'premium' && !subscription;

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent">
              Subscription Management
            </h1>
            <p className="text-gray-300">Manage your premium subscription and billing</p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
              {success}
            </div>
          )}

          {/* No Subscription State */}
          {!subscription && !isPremiumWithoutSubscription && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">No Active Subscription</h2>
              <p className="text-gray-300 mb-6">You don't have an active subscription. Upgrade to Premium to access all features!</p>
              <a
                href="/payment"
                className="inline-block bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Upgrade to Premium
              </a>
            </div>
          )}

          {/* Premium without Stripe subscription */}
          {isPremiumWithoutSubscription && (
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h2 className="text-2xl font-semibold text-[#7CC379]">Premium Account</h2>
              </div>
              <p className="text-gray-300 mb-4">
                You have a premium account that was activated through a one-time payment or special promotion.
              </p>
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-300">
                  <strong>Status:</strong> Premium (Lifetime/Special)
                </p>
              </div>
            </div>
          )}

          {/* Subscription Details */}
          {subscription && (
            <div className="space-y-6">
              {/* Current Subscription */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Current Subscription</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(subscription.status)}
                        <div>
                          <span className="font-medium">Status</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.cancel_at_period_end ? 'Cancelling' : subscription.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-[#7CC379]" />
                        <span className="font-medium">Amount</span>
                      </div>
                      <span className="text-white">
                        {formatAmount(subscription.plan.amount, subscription.plan.currency)} / {subscription.plan.interval}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-[#7CC379]" />
                        <span className="font-medium">Current Period</span>
                      </div>
                      <span className="text-white text-sm">
                        {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <RefreshCw className="w-5 h-5 text-[#7CC379]" />
                        <span className="font-medium">Next Billing</span>
                      </div>
                      <span className="text-white text-sm">
                        {subscription.cancel_at_period_end ? 'Cancelled' : formatDate(subscription.current_period_end)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-4">
                  {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                    <button
                      onClick={handleCancelSubscription}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                  )}
                  
                  {subscription.cancel_at_period_end && (
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={actionLoading}
                      className="bg-[#7CC379] text-white px-6 py-3 rounded-lg hover:bg-[#5a9556] transition-all disabled:opacity-50"
                    >
                      {actionLoading ? 'Reactivating...' : 'Reactivate Subscription'}
                    </button>
                  )}

                  <button
                    onClick={fetchSubscriptionData}
                    disabled={actionLoading}
                    className="bg-[#7CC379]/20 text-[#7CC379] px-6 py-3 rounded-lg hover:bg-[#7CC379]/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-2" />
                    Refresh Data
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
                <h2 className="text-2xl font-semibold text-[#7CC379] mb-6">Billing History</h2>
                
                {invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300">No billing history available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-black/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <p className="font-medium text-white">
                              {formatAmount(invoice.amount_paid, invoice.currency)}
                            </p>
                            <p className="text-sm text-gray-300">
                              {formatDate(invoice.created)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            invoice.status === 'paid' 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-red-400/20 text-red-400'
                          }`}>
                            {invoice.status}
                          </span>
                          
                          {invoice.hosted_invoice_url && (
                            <a
                              href={invoice.hosted_invoice_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#7CC379] hover:text-[#5a9556] transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscriptionManagement;
