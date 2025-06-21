import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface LocationStatus {
  message: string;
  type: 'loading' | 'success' | 'error' | 'idle';
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const handleStartExploring = () => {
    if (isAuthenticated) {
      navigate('/vendors');
    } else {
      navigate('/login');
    }
  };
  const [locationStatus, setLocationStatus] = useState<LocationStatus>({
    message: '',
    type: 'idle'
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus({
        message: "❌ Geolocation is not supported by this browser.",
        type: 'error'
      });
      return;
    }

    setLocationStatus({
      message: "🔄 Requesting location access...",
      type: 'loading'
    });

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        
        setLocationStatus({
          message: `✅ Location enabled! Finding deals near ${lat}, ${lon}`,
          type: 'success'
        });

        // Simulate API call to backend
        setTimeout(() => {
          setLocationStatus({
            message: `🎉 Found 15 deals within 2 miles of your location!`,
            type: 'success'
          });
        }, 2000);
      },
      (error: GeolocationPositionError) => {
        let errorMessage = "❌ An unknown error occurred.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "❌ Location access denied. Please enable location services to find nearby deals.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "❌ Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "❌ Location request timed out.";
            break;
        }
        
        setLocationStatus({
          message: errorMessage,
          type: 'error'
        });
      }
    );
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .hero-gradient {
          background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5530 100%);
        }

        .text-gradient {
          background: linear-gradient(45deg, #4ade80, #22c55e, #16a34a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-animation {
          animation: glow 2s ease-in-out infinite alternate;
        }

        @keyframes glow {
          from { filter: brightness(1); }
          to { filter: brightness(1.2); }
        }

        .floating {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(74, 222, 128, 0.2);
        }

        .hover-lift {
          transition: all 0.3s ease;
        }

        .hover-lift:hover {
          transform: translateY(-10px) scale(1.02);
        }

        .nav-blur {
          backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'nav-blur' : ''}`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-extrabold text-gradient">
            VICES
          </div>
          
          <ul className="hidden md:flex space-x-8">
            <li>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-white hover:text-green-400 font-medium transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-white hover:text-green-400 font-medium transition-colors"
              >
                About
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-white hover:text-green-400 font-medium transition-colors"
              >
                Contact
              </button>
            </li>
          </ul>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.first_name || 'User'}!</span>
              <button
                className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-green-500/30 hover:-translate-y-1 transition-all"
                onClick={() => navigate('/user-dashboard')}
              >
                My Dashboard
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <button
                className="text-white hover:text-green-400 font-medium transition-colors"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-red-500/30 hover:-translate-y-1 transition-all"
                onClick={() => navigate('/usersignup')}
              >
                Get Started
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient pt-32 pb-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white rounded-full"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 text-gradient glow-animation floating">
            Find Your Vices
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover the best weed and alcohol deals in your area. Smart recommendations powered by AI, tailored to your location.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
            onClick={handleStartExploring}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-2 transition-all"
            >         
              Start Exploring
            </button>
            
            <button 
              onClick={() => scrollToSection('features')}
              className="border-2 border-green-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-400 hover:text-gray-900 transition-all"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-green-400">
            Why Choose Vices?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🧬",
                title: "Smart Product Matching",
                description: "AI finds products that match your exact preferences, tolerance level, and desired effects. No more guessing - get personalized recommendations that actually work for you."
              },
              {
                icon: "💡",
                title: "Tolerance Intelligence",
                description: "Track your usage patterns to prevent tolerance buildup and optimize effects. Our AI helps you get the most out of every experience while staying safe."
              },
              {
                icon: "🎯",
                title: "Mood-Based Recommendations",
                description: "Tell us how you want to feel - creative, relaxed, energetic, or social - and we'll find the perfect cannabis or alcohol products to match your mood."
              },
              {
                icon: "🛡️",
                title: "Safety First",
                description: "Advanced safety features check for medication interactions, suggest safer alternatives, and provide dosage guidance based on your personal profile."
              },
              {
                icon: "📅",
                title: "AI Party Planner",
                description: "Syncs with your Google Calendar to plan perfect party experiences for concerts, events, and nights out. Get recommendations for any social situation."
              },
              {
                icon: "💰",
                title: "Best Local Deals",
                description: "AI-powered deal scoring across all nearby dispensaries and liquor stores. Compare prices instantly and get alerts when your favorites go on sale."
              }
            ].map((feature, index) => (
              <div key={index} className="glass-effect rounded-2xl p-8 text-center hover-lift">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-green-400">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Demo Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-green-400">
            {isAuthenticated 
              ? `Welcome Back, ${user?.first_name || 'Friend'}!` 
              : 'Ready to Find Deals Near You?'}
          </h2>
          
          <p className="text-xl text-gray-300 mb-10">
            {isAuthenticated
              ? 'Continue exploring deals customized for your preferences.'
              : 'Enable location access to discover the best weed and alcohol deals in your area right now.'}
          </p>
          
          <button
            onClick={isAuthenticated ? handleStartExploring : requestLocation}
            className="bg-gradient-to-r from-red-600 to-red-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-2 transition-all mb-6"
          >
            {isAuthenticated 
              ? '🔍 View Personalized Deals' 
              : '📍 Enable Location & Start Exploring'}
          </button>
          
          {locationStatus.message && (
            <div className={`text-lg mt-6 ${
              locationStatus.type === 'success' ? 'text-green-400' : 
              locationStatus.type === 'error' ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {locationStatus.message}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-green-400">VICES</h3>
              <p className="text-gray-400 leading-relaxed">
                Your smart companion for finding the best cannabis and alcohol deals. Discover, compare, and save on your favorite products.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">Quick Links</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Home</a></p>
                <p><a href="#features" className="text-gray-400 hover:text-green-400 transition-colors">Features</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">About Us</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact</a></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">Legal</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Privacy Policy</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Terms of Service</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Age Verification</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Compliance</a></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-400">Support</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Help Center</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Contact Support</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Report Issue</a></p>
                <p><a href="#" className="text-gray-400 hover:text-green-400 transition-colors">Feedback</a></p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-400/20 pt-6 text-center">
            <p className="text-gray-500">
              &copy; 2025 Vices. All rights reserved. Please consume responsibly and in accordance with local laws.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;