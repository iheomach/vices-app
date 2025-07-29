// src/App.tsx
import React from 'react';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/UserProfile';
import UserSignupPage from './pages/UserSignupPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ViceJourneyTracker from './pages/ViceJourneyTracker';
import SubscriptionManagement from './pages/SubscriptionManagement';
import './index.css'; // or wherever your global styles are
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './pages/PaymentForm';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ContactUsPage from './pages/ContactUsPage';
import AboutUsPage from './pages/AboutUsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
            <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/usersignup" element={<UserSignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route
              path="/payment"
              element={
              <ProtectedRoute>
                <Elements stripe={stripePromise}>
                <PaymentForm />
                </Elements>
              </ProtectedRoute>
              }
            />
            <Route path="/vice-journey-tracker" element={
              <ProtectedRoute>
              <ViceJourneyTracker />
              </ProtectedRoute>
            } />
            <Route path="/user-dashboard" element={
              <ProtectedRoute>
              <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
              <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/subscription-management" element={
              <ProtectedRoute>
              <SubscriptionManagement />
              </ProtectedRoute>
            } />
            </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;