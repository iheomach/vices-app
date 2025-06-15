// src/App.tsx
import React from 'react';
import LandingPage from './components/LandingPage';
import VendorsPreview from './components/VendorsPreview';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'; // or wherever your global styles are

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/vendors" element={<VendorsPreview />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;