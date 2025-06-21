// src/App.tsx
import React from 'react';
import LandingPage from './pages/LandingPage';
import VendorsPage from './pages/VendorsPage';
import UserSignupPage from './pages/UserSignupPage';
import LoginPage from './pages/LoginPage';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductDetailsPage from './pages/ProductDetailsPage';
import { AuthProvider } from './contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; // or wherever your global styles are


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/usersignup" element={<UserSignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/product/:id" element={
              <ProtectedRoute>
                <ProductDetailsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;