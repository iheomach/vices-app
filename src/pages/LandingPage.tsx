import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, BarChart3, Target, Calendar, MapPin, Shield, Users, Zap, Menu, X } from 'lucide-react';
import journal from '../images/journal.png';
import ai_insight from '../images/ai_insight.png';
import challenges from '../images/challenges.png';
import VideoModal from '../components/VideoModal';

const VicesLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/vice-journey-tracker');
    } else {
      navigate('/usersignup');
    }
  };

  const handleViewDemo = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMobileMenuOpen(false); // Close mobile menu when navigating
  };

  const handleMobileNavigation = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false); // Close mobile menu after navigation
  };

  // Mock phone screens for parallax effect
  const AppScreen = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
    <div className={`relative bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden ${className}`} style={style}>
      <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 rounded-t-3xl flex items-center justify-center">
        <div className="w-16 h-1 bg-slate-600 rounded-full"></div>
      </div>
      <div className="pt-6">
        {children}
      </div>
    </div>
  );

  const DashboardScreen = () => (
    <div className="p-4 text-white text-xs">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold text-[#7CC379]">VICES</h1>
        <div className="flex gap-1">
          <div className="w-6 h-6 bg-green-500 rounded-full"></div>
          <div className="w-6 h-6 bg-red-500 rounded-full"></div>
        </div>
      </div>
      <h2 className="text-sm mb-1">Good evening, Iheoma!</h2>
      <p className="text-slate-400 mb-4 text-xs">Track your wellness journey</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-xs text-slate-400">Mood</div>
          <div className="text-sm font-bold">8/10</div>
        </div>
        <div className="bg-slate-800 p-2 rounded">
          <div className="text-xs text-slate-400">Sleep</div>
          <div className="text-sm font-bold">7h 30m</div>
        </div>
      </div>
      <div className="bg-slate-800 p-3 rounded">
        <div className="text-xs font-medium mb-1">Recent Entry</div>
        <div className="text-xs text-slate-400 mb-1">2025-06-23</div>
        <div className="text-xs">Cannabis: 500g</div>
        <div className="text-xs text-green-400">Feeling relaxed</div>
      </div>
    </div>
  );

  const JournalScreen = () => (
    <div className="p-4 text-white text-xs">
      <h2 className="text-sm mb-4 text-[#7CC379] font-bold">Today's Entry</h2>
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Substance Used</label>
          <div className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs">None</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mood: 5/10</label>
            <div className="bg-slate-800 h-1 rounded-full">
              <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Sleep: 5/10</label>
            <div className="bg-slate-800 h-1 rounded-full">
              <div className="bg-blue-500 h-1 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {['relaxed', 'social', 'creative'].map(tag => (
            <span key={tag} className="bg-slate-700 px-1 py-0.5 rounded text-xs">
              + {tag}
            </span>
          ))}
        </div>
        <button className="w-full bg-[#7CC379] text-white py-2 rounded text-xs font-medium">
          Save Entry
        </button>
      </div>
    </div>
  );

  const InsightsScreen = () => (
    <div className="p-4 text-white text-xs">
      <h2 className="text-sm mb-3 text-[#7CC379] font-bold">AI Analysis</h2>
      <div className="bg-slate-800 p-2 rounded mb-3">
        <h3 className="text-xs font-medium mb-2">Key Patterns:</h3>
        <div className="space-y-1 text-xs text-slate-300">
          <p>• Cannabis improves mood</p>
          <p>• Mixed use affects sleep</p>
          <p>• T-breaks help tolerance</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <div className="bg-green-900 p-2 rounded text-center">
          <div className="text-sm font-bold text-green-400">19%</div>
          <div className="text-xs text-slate-400">Goal</div>
        </div>
        <div className="bg-blue-900 p-2 rounded text-center">
          <div className="text-sm font-bold text-blue-400">0</div>
          <div className="text-xs text-slate-400">Mood</div>
        </div>
        <div className="bg-purple-900 p-2 rounded text-center">
          <div className="text-sm font-bold text-purple-400">0%</div>
          <div className="text-xs text-slate-400">Sleep</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B272C] via-[#203a43] to-[#2c5530] text-white overflow-x-hidden">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-xl bg-[#1B272C]/80' : ''
      }`}>
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div 
            className="text-3xl font-black bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/')}
          >
            VICES
          </div>
          
          {/* Desktop Navigation */}
          <ul className="hidden md:flex space-x-8">
            <li>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('journey-tracker')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Journey Tracker
              </button>
            </li>
            <li>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Pricing
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/about')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                About Us
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/contact')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Contact
              </button>
              </li>
            {isAuthenticated && (
              <li>
                <button
                  onClick={() => navigate('/user-dashboard')}
                  className="text-white hover:text-[#7CC379] font-medium transition-colors"
                >
                  Your Dashboard
                </button>
              </li>
            )}
            <li>
            </li>
          </ul>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => logout()}
                  className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-white hover:text-[#7CC379] font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/usersignup')}
                  className="bg-gradient-to-r from-[#7CC379] to-[#66A363] px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white hover:text-[#7CC379] transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-[#1B272C]/95 backdrop-blur-xl border-t border-[#7CC379]/20 px-6 py-4">
            <div className="space-y-4">
              {/* Navigation Links */}
              <div className="space-y-3">
                <button 
                  onClick={() => handleMobileNavigation(() => scrollToSection('features'))}
                  className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                >
                  Features
                </button>
                <button 
                  onClick={() => handleMobileNavigation(() => scrollToSection('journey-tracker'))}
                  className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                >
                  Journey Tracker
                </button>
                <button 
                  onClick={() => handleMobileNavigation(() => scrollToSection('pricing'))}
                  className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                >
                  Pricing
                </button>
                <button 
                  onClick={() => handleMobileNavigation(() => navigate('/about'))}
                  className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                >
                  About Us
                </button>
                
                <button
                  onClick={() => handleMobileNavigation(() => navigate('/contact'))}
                  className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                >
                  Contact
                </button>
                {isAuthenticated && (
                  <button
                    onClick={() => handleMobileNavigation(() => navigate('/user-dashboard'))}
                    className="block w-full text-left text-white hover:text-[#7CC379] font-medium transition-colors py-2"
                  >
                    Your Dashboard
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-[#7CC379]/20 pt-4"></div>

              {/* Auth Buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <button 
                    onClick={() => handleMobileNavigation(() => logout())}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 rounded-full text-white font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300"
                  >
                    Sign Out
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => handleMobileNavigation(() => navigate('/login'))}
                      className="w-full text-white hover:text-[#7CC379] font-medium transition-colors py-3 border border-[#7CC379]/30 rounded-full hover:bg-[#7CC379]/10"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => handleMobileNavigation(() => navigate('/usersignup'))}
                      className="w-full bg-gradient-to-r from-[#7CC379] to-[#66A363] px-4 py-3 rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300"
                    >
                      Sign Up Free
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Parallax */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#7CC379] rounded-full animate-pulse"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          ></div>
          <div 
            className="absolute top-3/4 right-1/4 w-2 h-2 bg-[#7CC379] rounded-full animate-pulse"
            style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
          ></div>
          <div 
            className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#7CC379] rounded-full animate-pulse"
            style={{ transform: `translate(-50%, -50%) translateY(${scrollY * 0.4}px)` }}
          ></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 
            className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent"
            style={{ transform: `translateY(${scrollY * 0.2}px)` }}
          >
            VICES
          </h1>
          
          <h2 
            className="text-2xl md:text-3xl font-bold mb-6 text-white"
            style={{ transform: `translateY(${scrollY * 0.3}px)` }}
          >
            AI-Powered Wellness Platform
          </h2>
          
          <p 
            className="text-xl md:text-2xl text-green-100/80 mb-10 max-w-4xl mx-auto leading-relaxed"
            style={{ transform: `translateY(${scrollY * 0.4}px)` }}
          >
            Transform your relationship with cannabis and alcohol through intelligent tracking, AI insights, and personalized optimization. 
            The complete wellness platform for mindful consumption.
          </p>
          
          {/* Feature Buttons */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8"
            style={{ transform: `translateY(${scrollY * 0.5}px)` }}
          >
            <button 
              onClick={() => scrollToSection('journey-tracker')}
              className="bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all flex items-center justify-center space-x-2"
            >
              <span>AI-powered Journey Tracker</span>
            </button>
            
            <button 
              onClick={() => scrollToSection('wellness')}
              className="border-2 border-[#7CC379] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-[#7CC379]/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Wellness Tools</span>
            </button>


            <button 
              onClick={handleViewDemo}
              className="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-gray-500 hover:to-gray-400 hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all flex items-center justify-center space-x-2"
            >
              <span>View Demo</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section id="features" className="py-20 px-6 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#7CC379]">
            Complete Wellness Platform
          </h2>
          <p className="text-xl text-center text-green-100/70 mb-16 max-w-3xl mx-auto">
            From tracking to optimization, VICES provides everything you need for a mindful and healthy relationship with substances
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI Journey Tracker",
                description: "Track consumption, analyze patterns, and get personalized insights with our advanced AI system. Set goals, join challenges, and optimize your experience.",
                color: "from-[#7CC379] to-[#5a9556]"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Wellness Optimization",
                description: "AI-powered recommendations for dosage, timing, and substance selection based on your goals, tolerance, and lifestyle patterns.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Smart Insights",
                description: "Advanced analytics reveal consumption patterns, health correlations, and optimization opportunities unique to your journey.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Health & Safety",
                description: "Comprehensive safety monitoring, interaction warnings, tolerance management, and educational resources for responsible use.",
                color: "from-red-500 to-red-600"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Support",
                description: "Connect with like-minded individuals, join wellness challenges, and get support through anonymous communities and peer networks.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Premium Analytics",
                description: "Deep health insights, biometric integration, predictive modeling, and comprehensive wellness reports with premium features.",
                color: "from-emerald-500 to-emerald-600"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-2xl p-8 hover:scale-105 transition-all hover:border-[#7CC379]/40">
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">
                  {feature.title}
                </h3>
                <p className="text-green-100/70 leading-relaxed text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Journey Tracker Feature Highlight */}
      <section id="journey-tracker" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#7CC379]">
              AI Vice Journey Tracker
            </h2>
            <p className="text-xl text-green-100/70 max-w-3xl mx-auto">
              Our flagship feature that transforms how you understand and optimize your consumption patterns
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-center items-start md:items-center gap-8 max-w-6xl mx-auto">
            {/* Daily Journal Feature */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6 w-full">
                <div className="flex items-center space-x-4 mb-4">
                  <Calendar className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">Daily Journal</h3>
                </div>
                <p className="text-green-100/70">
                  Log consumption, mood, effects, and sleep quality in under 2 minutes. Our smart interface learns your patterns.
                </p>
              </div>
              {/* Screenshot placeholder */}
              <div className="h-54 max-w-xs flex items-center justify-center mt-4 bg-black/10 rounded-xl border border-dashed border-[#7CC379]/20 mx-auto">
                <img src={journal} alt="Daily Journal Screenshot" className="h-full w-auto object-contain" />
              </div>
            </div>
            {/* AI Insights Feature */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6 w-full">
                <div className="flex items-center space-x-4 mb-4">
                  <Brain className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                </div>
                <p className="text-green-100/70">
                  Advanced algorithms analyze your data to identify patterns, optimize dosages, and predict ideal timing.
                </p>
              </div>
              {/* Screenshot placeholder */}
              <div className="h-54 max-w-xs flex items-center justify-center mt-4 bg-black/10 rounded-xl border border-dashed border-[#7CC379]/20 mx-auto">
                <img src={ai_insight} alt="AI Insights Screenshot" className="h-full w-auto object-contain" />
              </div>
            </div>
            {/* Goals & Challenges Feature */}
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6 w-full">
                <div className="flex items-center space-x-4 mb-4">
                  <Target className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">Goals & Challenges</h3>
                </div>
                <p className="text-green-100/70">
                  Join community challenges like T-breaks, set personal goals, and track progress with gamified experiences.
                </p>
              </div>
              {/* Screenshot placeholder */}
              <div className="h-54 max-w-xs flex items-center justify-center mt-4 bg-black/10 rounded-xl border border-dashed border-[#7CC379]/20 mx-auto">
                <img src={challenges} alt="Goals & Challenges Screenshot" className="h-full w-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wellness & Optimization Platform */}
      <section id="wellness" className="py-20 px-6 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#7CC379]">
              Wellness-First Approach
            </h2>
            <p className="text-xl text-green-100/70 max-w-3xl mx-auto">
              Every feature is designed to promote mindful consumption and optimize your health and wellbeing
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Mood Optimization",
                description: "AI recommendations for achieving desired mental states safely",
                icon: "🧠"
              },
              {
                title: "Tolerance Management",
                description: "Smart tracking and planning for healthy tolerance levels",
                icon: "📈"
              },
              {
                title: "Health Monitoring",
                description: "Track correlations between consumption and wellbeing",
                icon: "❤️"
              },
              {
                title: "Mindful Consumption",
                description: "Tools and techniques for conscious, intentional use",
                icon: "🧘"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6 text-center hover:scale-105 transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-3 text-[#7CC379]">{feature.title}</h3>
                <p className="text-green-100/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#7CC379]">
              Wellness Investment Plans
            </h2>
            <p className="text-xl text-green-100/70 max-w-3xl mx-auto">
              Invest in your wellness journey with plans designed for every level of commitment
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
              name: "Free",
              price: "$0",
              period: "forever",
              features: [
                "Basic journal tracking (5 entries/month)",
                "Simple mood & sleep logging",
                "Basic dashboard overview",
                "One active goal at a time",
                "Weekly AI insights",
                "Community access"
              ],
              color: "border-gray-500",
              buttonColor: "bg-gray-600 hover:bg-gray-700"
              },
              {
              name: "Premium",
              price: "$9.99",
              period: "per month",
              features: [
                "Unlimited journal entries",
                "Advanced tracking & analytics",
                "Multiple goals & challenges",
                "Detailed AI insights & recommendations",
                "Data export (json)",
                "Priority support",
                "Ad-free experience"
              ],
              color: "border-[#7CC379] ring-2 ring-[#7CC379]/50",
              buttonColor: "bg-gradient-to-r from-[#7CC379] to-[#5a9556]",
              popular: true
              },
              {
              name: "Premium",
              price: "$9.99",
              period: "per month",
              features: [
                "Unlimited journal entries",
                "Advanced tracking & analytics",
                "Multiple goals & challenges",
                "Detailed AI insights & recommendations",
                "Data export (json)",
                "Priority support",
                "Ad-free experience"
              ],
              color: "border-[#7CC379] ring-2 ring-[#7CC379]/50",
              buttonColor: "bg-gradient-to-r from-[#7CC379] to-[#5a9556]",
              popular: true
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border-2 ${plan.color} rounded-2xl p-8 flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#7CC379] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
                </div>
              )}
              
              <div className="text-center flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="mb-6">
                <span className="text-4xl font-bold text-[#7CC379]">{plan.price}</span>
                <span className="text-green-100/60">/{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                  <span className="text-[#7CC379]">✓</span>
                  <span className="text-green-100/70">{feature}</span>
                  </li>
                ))}
                </ul>
                
                <button
                className={`w-full py-3 rounded-lg font-semibold transition-all mt-auto ${plan.buttonColor}`}
                onClick={() => {
                  if (plan.name === "Premium") {
                  navigate('/payment');
                  } else {
                  navigate('/usersignup');
                  }
                }}
                >
                {plan.name === "Free" ? "Start Free" : "Activate Premium Plan"}
                </button>
              </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-[#1B272C] to-[#203a43]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-[#7CC379]">
            Transform Your Relationship with Substances
          </h2>
          
          <p className="text-xl text-green-100/80 mb-10">
            Join thousands of users who are building healthier, more mindful relationships with cannabis and alcohol through AI-powered wellness insights
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all"
            >
              🌱 Start Your Wellness Journey
            </button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent">
                VICES
              </h3>
              <p className="text-green-100/60 leading-relaxed max-w-xl mx-auto">
                The AI-powered wellness platform for mindful cannabis and alcohol consumption. 
                Build healthier habits through intelligent tracking and personalized insights.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#7CC379]">Legal</h3>
              <div className="space-y-2">
                <p><button onClick={() => navigate('/privacy-policy')} className="text-green-100/60 hover:text-[#7CC379] transition-colors">Privacy Policy</button></p>
                <p><button onClick={() => navigate('/terms-of-service')} className="text-green-100/60 hover:text-[#7CC379] transition-colors">Terms of Service</button></p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#7CC379]/20 pt-6 text-center">
            <p className="text-green-100/50">
              &copy; 2025 VICES. All rights reserved. Promoting mindful consumption and wellness through technology.
            </p>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <VideoModal 
          isOpen={isVideoModalOpen} 
          onClose={closeVideoModal} 
          videoId="GGO-7hSqI4Q"
        />
      )}
    </div>
  );
};

export default VicesLandingPage;