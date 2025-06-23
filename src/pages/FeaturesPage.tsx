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
            <div className="text-[#7CC379] text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-3 text-[#7CC379]">AI Journey Tracker</h3>
            <p className="text-gray-300">
              Track your consumption patterns, get personalized insights, and optimize your experience with AI-powered recommendations.
            </p>
          </div>

          
          {/* Smart Recommendations */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="text-[#7CC379] text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-[#7CC379]">Smart Recommendations</h3>
            <p className="text-gray-300">
              Discover products and experiences tailored to your goals and preferences.
            </p>
          </div>
          
          {/* Community Insights */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="text-[#7CC379] text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3 text-[#7CC379]">Community Insights</h3>
            <p className="text-gray-300">
              Learn from shared experiences and contribute to a knowledgeable community.
            </p>
          </div>
          
          {/* Wellness Goals */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="text-[#7CC379] text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-[#7CC379]">Wellness Goals</h3>
            <p className="text-gray-300">
              Set and track personal wellness goals with AI-guided optimization.
            </p>
          </div>
          
          {/* Privacy First */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-[#7CC379]/20">
            <div className="text-[#7CC379] text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3 text-[#7CC379]">Privacy First</h3>
            <p className="text-gray-300">
              Your data is encrypted and secure. You control what you share.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeaturesPage;
