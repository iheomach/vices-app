import React from 'react';
import Header from '../components/Header';

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1B272C] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#7CC379]">
          Features
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {/* AI Journey Tracker */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#7CC379] to-[#5a9556] rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">🧠</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">AI Journey Tracker</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              Track consumption, analyze patterns, and get personalized insights with our advanced AI system. Set goals, join challenges, and optimize your experience.
            </p>
          </div>

          {/* Wellness Optimization */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">Wellness Optimization</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              AI-powered recommendations for dosage, timing, and substance selection based on your goals, tolerance, and lifestyle patterns.
            </p>
          </div>

          {/* Smart Insights */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">Smart Insights</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              Advanced analytics reveal consumption patterns, health correlations, and optimization opportunities unique to your journey.
            </p>
          </div>

          {/* Health & Safety */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">🛡️</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">Health & Safety</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              Comprehensive safety monitoring, interaction warnings, tolerance management, and educational resources for responsible use.
            </p>
          </div>

          {/* Community Support */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">Community Support</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              Connect with like-minded individuals, join wellness challenges, and get support through anonymous communities and peer networks.
            </p>
          </div>

          {/* Premium Analytics */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
              <span className="text-4xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-[#7CC379] text-center">Premium Analytics</h3>
            <p className="text-green-100/70 leading-relaxed text-center">
              Deep health insights, biometric integration, predictive modeling, and comprehensive wellness reports with premium features.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeaturesPage;
