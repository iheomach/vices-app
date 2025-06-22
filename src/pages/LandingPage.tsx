import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, BarChart3, Target, Calendar, MapPin, Shield, Users, Zap } from 'lucide-react';

interface TrackingStatus {
  message: string;
  type: 'loading' | 'success' | 'error' | 'idle';
}

const VicesLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>({
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

  const handleStartJourney = () => {
    if (isAuthenticated) {
      navigate('/vice-journey-tracker');
    } else {
      navigate('/usersignup');
    }
  };

  const handleViewDemo = () => {
    setTrackingStatus({
      message: "🧠 Analyzing consumption patterns...",
      type: 'loading'
    });

    setTimeout(() => {
      setTrackingStatus({
        message: "✅ Generated 5 personalized insights and 3 optimization recommendations!",
        type: 'success'
      });
    }, 2000);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
          
          <ul className="hidden md:flex space-x-8">
            <li>
              <button 
                onClick={() => navigate('/features')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Features
              </button>
            </li>
            <li>
              <button 
                onClick={() => navigate('/pricing')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Pricing
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
                onClick={() => scrollToSection('wellness')}
                className="text-white hover:text-[#7CC379] font-medium transition-colors"
              >
                Wellness
              </button>
            </li>
          </ul>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => navigate('/user-dashboard')}
                  className="bg-gradient-to-r from-[#7CC379] to-[#66A363] px-4 py-2 rounded-full text-white font-medium hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300"
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
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
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#7CC379] rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-[#7CC379] rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#7CC379] rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent">
            VICES
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            AI-Powered Wellness Platform
          </h2>
          
          <p className="text-xl md:text-2xl text-green-100/80 mb-10 max-w-4xl mx-auto leading-relaxed">
            Transform your relationship with cannabis and alcohol through intelligent tracking, AI insights, and personalized optimization. 
            The complete wellness platform for mindful consumption.
          </p>
          
          {/* Feature Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <button 
              onClick={() => scrollToSection('journey-tracker')}
              className="bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all flex items-center justify-center space-x-2"
            >
              <Brain className="w-5 h-5" />
              <span>Journey Tracker</span>
            </button>
            
            <button 
              onClick={() => scrollToSection('wellness')}
              className="border-2 border-[#7CC379] text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-[#7CC379]/20 transition-all flex items-center justify-center space-x-2"
            >
              <Target className="w-5 h-5" />
              <span>Wellness Tools</span>
            </button>

            <button 
              onClick={() => scrollToSection('features')}
              className="bg-[#1B272C]/80 border border-[#7CC379]/30 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-[#1B272C] transition-all flex items-center justify-center space-x-2"
            >
              <Brain className="w-5 h-5" />
              <span>AI Features</span>
            </button>

            <button 
              onClick={handleViewDemo}
              className="bg-gradient-to-r from-gray-600 to-gray-500 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-gray-500 hover:to-gray-400 hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all flex items-center justify-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Demo</span>
            </button>
          </div>

          {/* Main CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={handleStartJourney}
              className="bg-gradient-to-r from-[#7CC379] to-[#66A363] px-8 py-4 rounded-xl text-white text-lg font-bold hover:shadow-lg hover:shadow-[#7CC379]/25 transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Your Journey
            </button>
            
            <button
              onClick={handleViewDemo}
              className="bg-white/10 backdrop-blur-lg px-8 py-4 rounded-xl text-white text-lg font-bold hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 border border-white/20"
            >
              View AI Demo
            </button>
          </div>

          {trackingStatus.message && (
            <div className={`text-lg mt-4 p-4 rounded-xl ${
              trackingStatus.type === 'success' ? 'text-[#7CC379] bg-[#7CC379]/10 border border-[#7CC379]/20' : 
              trackingStatus.type === 'error' ? 'text-red-400 bg-red-400/10 border border-red-400/20' : 
              'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
            }`}>
              {trackingStatus.message}
            </div>
          )}
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Calendar className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">Daily Journal</h3>
                </div>
                <p className="text-green-100/70">
                  Log consumption, mood, effects, and sleep quality in under 2 minutes. Our smart interface learns your patterns.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Brain className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">AI Insights</h3>
                </div>
                <p className="text-green-100/70">
                  Advanced algorithms analyze your data to identify patterns, optimize dosages, and predict ideal timing.
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm border border-[#7CC379]/20 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Target className="w-6 h-6 text-[#7CC379]" />
                  <h3 className="text-xl font-semibold text-white">Goals & Challenges</h3>
                </div>
                <p className="text-green-100/70">
                  Join community challenges like T-breaks, set personal goals, and track progress with gamified experiences.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#7CC379]/20 to-[#7CC379]/5 border border-[#7CC379]/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-white">Track Your Journey</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-green-100/70">This Week</span>
                  <span className="text-[#7CC379] font-semibold">5 mindful days</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#7CC379] to-[#5a9556] h-2 rounded-full w-4/5"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-100/70">Sleep Quality</span>
                  <span className="text-blue-400 font-semibold">7.2/10 (+0.8)</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-green-100/70">Mood Average</span>
                  <span className="text-purple-400 font-semibold">7.5/10 (Stable)</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
              
                <button 
                onClick={() => navigate('/vice-journey-tracker')}
                className="w-full mt-6 bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                Start Tracking Today
                </button>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Mindful",
                price: "$0",
                period: "forever",
                features: [
                  "Basic journey tracking",
                  "Daily journal entries",
                  "Simple wellness insights",
                  "Community access",
                  "Basic safety tools"
                ],
                color: "border-gray-500",
                buttonColor: "bg-gray-600 hover:bg-gray-700"
              },
              {
                name: "Optimized",
                price: "$12.99",
                period: "per month",
                features: [
                  "Advanced AI insights",
                  "Unlimited tracking",
                  "Premium analytics",
                  "Wellness challenges",
                  "Tolerance management",
                  "Health correlations",
                  "Priority support"
                ],
                color: "border-[#7CC379] ring-2 ring-[#7CC379]/50",
                buttonColor: "bg-gradient-to-r from-[#7CC379] to-[#5a9556]",
                popular: true
              },
              {
                name: "Wellness Pro",
                price: "$29.99",
                period: "per month",
                features: [
                  "Everything in Optimized",
                  "Personal AI wellness coach",
                  "Biometric integrations",
                  "Healthcare provider access",
                  "Custom wellness reports",
                  "1-on-1 support sessions",
                  "Family plan options"
                ],
                color: "border-purple-500",
                buttonColor: "bg-purple-600 hover:bg-purple-700"
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm border-2 ${plan.color} rounded-2xl p-8`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#7CC379] text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-[#7CC379]">{plan.price}</span>
                    <span className="text-green-100/60">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <span className="text-[#7CC379]">✓</span>
                        <span className="text-green-100/70">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.buttonColor}`}>
                    {plan.name === "Mindful" ? "Start Free" : "Begin Wellness Journey"}
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
            <button className="bg-gradient-to-r from-[#7CC379] to-[#5a9556] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-[#7CC379]/40 hover:-translate-y-2 transition-all">
              🌱 Start Your Wellness Journey
            </button>
            
            <button className="border-2 border-[#7CC379] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7CC379]/20 transition-all">
              Learn About Our Approach
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#7CC379] to-[#5a9556] bg-clip-text text-transparent">
                VICES
              </h3>
              <p className="text-green-100/60 leading-relaxed">
                The AI-powered wellness platform for mindful cannabis and alcohol consumption. 
                Build healthier habits through intelligent tracking and personalized insights.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#7CC379]">Wellness Features</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Journey Tracker</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">AI Insights</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Health Monitoring</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Community Support</a></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#7CC379]">Resources</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Wellness Blog</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Research</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Safety Guidelines</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Support Center</a></p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#7CC379]">Legal</h3>
              <div className="space-y-2">
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Privacy Policy</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Terms of Service</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">HIPAA Compliance</a></p>
                <p><a href="#" className="text-green-100/60 hover:text-[#7CC379] transition-colors">Age Verification</a></p>
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
    </div>
  );
};

export default VicesLandingPage;