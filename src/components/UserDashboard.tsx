import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

interface Mood {
  id: string;
  emoji: string;
  label: string;
}

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  rating: number;
  vendor: string;
  badge: string;
}

interface Vendor {
  id: string;
  name: string;
  distance: string;
  type: string;
  rating: number;
  hours: string;
  aiMatches: number;
}

interface Insight {
  icon: string;
  title: string;
  value: string;
  description: string;
}

const UserDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeMood, setActiveMood] = useState<string>('relaxed');
  const [aiConfidence, setAiConfidence] = useState<number>(94);
  const [greeting, setGreeting] = useState<string>(getTimeBasedGreeting());

  // Update the greeting periodically to ensure it stays current
  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const moods: Mood[] = [
    { id: 'relaxed', emoji: '😌', label: 'Relaxed' },
    { id: 'social', emoji: '🎉', label: 'Social' },
    { id: 'creative', emoji: '💡', label: 'Creative' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'sleepy', emoji: '😴', label: 'Sleepy' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' }
  ];

  const recommendations: Recommendation[] = [
    {
      id: '1',
      type: 'PERFECT FOR RELAXATION',
      title: 'Lavender Kush - Indica',
      description: 'AI detected this matches your evening preference for relaxation. Low tolerance impact with calming terpenes.',
      price: '$28.99',
      rating: 4.8,
      vendor: 'Green Leaf Dispensary',
      badge: 'AI Match'
    },
    {
      id: '2',
      type: 'BEST VALUE TODAY',
      title: 'Premium Wine Collection',
      description: '30% off your favorite Cabernet. AI suggests this based on your wine preferences and current tolerance.',
      price: '$24.99',
      originalPrice: '$35.99',
      rating: 4.6,
      vendor: 'Alberta Spirits Co.',
      badge: 'Smart Deal'
    },
    {
      id: '3',
      type: 'MICRO-DOSE FRIENDLY',
      title: 'Low-Dose Gummies',
      description: 'Perfect for maintaining your current tolerance level. AI recommends 2.5mg for your profile.',
      price: '$19.99',
      rating: 4.9,
      vendor: 'High Society',
      badge: 'Tolerance Optimizer'
    }
  ];

  const insights: Insight[] = [
    { icon: '🧠', title: 'AI Confidence', value: `${aiConfidence}%`, description: 'Recommendation accuracy' },
    { icon: '📊', title: 'Tolerance Level', value: 'Low', description: 'Optimal for your goals' },
    { icon: '💰', title: 'Savings Today', value: '$47', description: 'From AI-detected deals' },
    { icon: '🎯', title: 'Perfect Matches', value: '12', description: 'Products found for you' }
  ];

  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Green Leaf Dispensary',
      distance: '0.3 mi',
      type: 'Cannabis',
      rating: 4.8,
      hours: 'Open until 10PM',
      aiMatches: 3
    },
    {
      id: '2',
      name: 'Alberta Spirits Co.',
      distance: '0.7 mi',
      type: 'Alcohol',
      rating: 4.6,
      hours: 'Open until 11PM',
      aiMatches: 2
    },
    {
      id: '3',
      name: 'High Society',
      distance: '1.2 mi',
      type: 'Cannabis',
      rating: 4.9,
      hours: 'Open until 9PM',
      aiMatches: 4
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAiConfidence(prev => Math.max(90, Math.min(99, prev + Math.floor(Math.random() * 3) - 1)));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-slate-50">
      {/* Header */}
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-green-500/20 sticky top-0 z-50">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-500 flex items-center gap-2">
            VICES
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white">Welcome, {user?.first_name || 'User'}!</span>
            <button 
              className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={() => navigate('/profile')}
            >
              Profile
            </button>
            <button 
              className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12 mt-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            {getTimeBasedGreeting()}, {user?.first_name || 'Friend'}!
          </h1>
          <p className="text-slate-400 text-lg">
            Your AI is ready to help you find the perfect experience
          </p>
        </div>

        {/* Mood Selector */}
        <div className="bg-slate-800/80 rounded-2xl p-6 mb-8 border border-green-500/20">
          <h2 className="text-xl font-semibold text-green-500 text-center mb-6">
            How do you want to feel tonight?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setActiveMood(mood.id)}
                className={`p-4 rounded-2xl transition-all duration-300 text-center ${
                  activeMood === mood.id
                    ? 'border-2 border-green-500 bg-green-500/10 transform -translate-y-1'
                    : 'border-2 border-transparent bg-slate-700/80 hover:border-green-500 hover:bg-green-500/5 hover:-translate-y-1'
                }`}
              >
                <span className="text-3xl block mb-2">{mood.emoji}</span>
                <span className="text-sm text-slate-200">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-800/80 rounded-2xl p-6 border border-green-500/20 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
              <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full text-xs font-medium">
                {rec.badge}
              </div>
              
              <div className="text-green-500 text-sm font-semibold mb-2">{rec.type}</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-50">{rec.title}</h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{rec.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-green-500 font-semibold">
                  {rec.price}
                  {rec.originalPrice && (
                    <span className="text-slate-500 line-through ml-2">{rec.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">{renderStars(rec.rating)}</span>
                  <span className="text-sm">{rec.rating}</span>
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 py-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 transform hover:-translate-y-0.5">
                View at {rec.vendor}
              </button>
            </div>
          ))}
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="bg-slate-800/80 rounded-2xl p-6 border border-green-500/20 text-center"
            >
              <div className="text-4xl mb-4">{insight.icon}</div>
              <div className="text-green-500 text-lg font-semibold mb-2">{insight.title}</div>
              <div className="text-2xl font-bold mb-2">{insight.value}</div>
              <div className="text-slate-400 text-sm">{insight.description}</div>
            </div>
          ))}
        </div>

        {/* Nearby Vendors */}
        <div className="bg-slate-800/80 rounded-2xl p-8 border border-green-500/20">
          <h2 className="text-2xl font-semibold text-green-500 mb-6 flex items-center gap-2">
            📍 Nearby Vendors with Your Matches
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-slate-700/80 rounded-2xl p-4 border border-green-500/10 transition-all duration-300 hover:border-green-500 hover:-translate-y-1"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-50">{vendor.name}</span>
                  <span className="text-green-500 text-sm">{vendor.distance}</span>
                </div>
                <div className="text-slate-400 text-sm mb-2">
                  {vendor.type} • {vendor.aiMatches} AI matches
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-400">{renderStars(vendor.rating)}</span>
                  <span>{vendor.rating} • {vendor.hours}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;