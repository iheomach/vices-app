// src/App.tsx
import React from 'react';
import LandingPage from './components/LandingPage';
import VendorsPreview from './components/VendorsPreview';
import UserSignupPage from './components/UserSignupPage';
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
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
            <Route path="/vendors" element={<VendorsPreview />} />
            <Route path="/usersignup" element={<UserSignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user-dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;