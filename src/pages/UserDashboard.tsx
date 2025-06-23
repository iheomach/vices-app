import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { safeArray } from '../utils/safeArray';
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
  aiPrice: string;
  safety: string;
  category: string;
  confidence: number;
}

interface AIInsight {
  icon: string;
  title: string;
  value: string;
  description: string;
  status: 'good' | 'warning' | 'optimal';
}

interface WellnessMetric {
  id: string;
  title: string;
  description: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
}

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [activeMood, setActiveMood] = useState<string>('relaxed');
  const [aiConfidence, setAiConfidence] = useState<number>(94);

  const moods: Mood[] = [
    { id: 'relaxed', emoji: '😌', label: 'Relaxed' },
    { id: 'social', emoji: '🎉', label: 'Social' },
    { id: 'creative', emoji: '💡', label: 'Creative' },
    { id: 'focused', emoji: '🎯', label: 'Focused' },
    { id: 'sleepy', emoji: '😴', label: 'Sleepy' },
    { id: 'energetic', emoji: '⚡', label: 'Energetic' }
  ];

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        const prompt = `You are a wellness-focused AI coach for cannabis and alcohol consumption. Generate exactly 3 personalized recommendations in JSON format for a user with the following profile:

User Profile:
- Primary Goal: Better sleep quality
- Current Usage: Cannabis 2-3x/week, Alcohol 1-2x/week  
- Tolerance Level: Low-Medium
- Time of Day: Evening (7-9 PM)
- Experience Level: Intermediate
- Health Focus: Sleep optimization, stress reduction

Requirements:
1. Generate exactly 3 recommendations
2. Each must have different "type" categories: choose from [OPTIMAL DOSAGE, TIMING OPTIMIZATION, TOLERANCE BREAK, STRAIN SELECTION, WELLNESS PAUSE, MICRO-DOSING, SAFETY CHECK]
3. One must be cannabis-related, one alcohol-related, one wellness-related
4. Include realistic market pricing
5. Safety levels: Low Risk, Moderate, High Risk, Excellent
6. Confidence scores: 85-98%
7. Categories: Cannabis, Alcohol, Wellness

Return ONLY valid JSON array with this exact structure:
[
  {
    "id": "1",
    "type": "OPTIMAL DOSAGE",
    "title": "Brief descriptive title",
    "description": "2-sentence explanation with specific dosage/timing and health benefit",
    "aiPrice": "Realistic price with unit",
    "safety": "Risk level",
    "category": "Cannabis/Alcohol/Wellness",
    "confidence": 96
  }
]

Focus on harm reduction, wellness optimization, and evidence-based recommendations. Be specific with dosages, timing, and expected outcomes.`;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/openai/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        
        // Parse the response from OpenAI and extract the recommendations
        let recommendationData: Recommendation[] = [];
        
        try {
          // The API might return the JSON as a string or already parsed
          if (typeof data.result === 'string') {
            recommendationData = JSON.parse(data.result);
          } else if (Array.isArray(data.result)) {
            recommendationData = data.result;
          }
        } catch (error) {
          console.error('Error parsing OpenAI response:', error);
          setRecommendations([]);
        }
        
        setRecommendations(recommendationData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const aiInsights: AIInsight[] = [
    { icon: '🧠', title: 'AI Confidence', value: `${aiConfidence}%`, description: 'Wellness optimization', status: 'optimal' },
    { icon: '🛡️', title: 'Safety Score', value: '9.2/10', description: 'Current consumption risk', status: 'good' },
    { icon: '📈', title: 'Tolerance', value: 'Stable', description: 'Well-managed levels', status: 'optimal' },
    { icon: '💡', title: 'Insights', value: '5 New', description: 'Personalized recommendations', status: 'good' }
  ];

  const wellnessMetrics: WellnessMetric[] = [
    {
      id: '1',
      title: 'Sleep Quality Impact',
      description: 'Cannabis timing improved sleep by 23% this week',
      score: 8.4,
      trend: 'up',
      icon: '😴'
    },
    {
      id: '2',
      title: 'Mood Correlation',
      description: 'Strong positive correlation with weekend social use',
      score: 7.8,
      trend: 'stable',
      icon: '😊'
    },
    {
      id: '3',
      title: 'Tolerance Management',
      description: 'Current strategy maintaining optimal efficiency',
      score: 9.1,
      trend: 'up',
      icon: '⚖️'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-[#7CC379]';
      case 'good': return 'text-green-100';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '→';
      default: return '→';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setAiConfidence(prev => Math.max(90, Math.min(99, prev + Math.floor(Math.random() * 3) - 1)));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
      <Header />

      {/* Main content with padding-top to account for fixed header */}
      <main className="flex-1 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent">
              {getTimeBasedGreeting()}, {user?.first_name || 'Friend'}!
            </h1>
            <p className="text-gray-300 text-lg">
              Your AI wellness coach is ready to optimize your experience
            </p>
          </div>

          {/* Mood Selector */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-[#7CC379]/20">
            <h2 className="text-xl font-semibold text-[#7CC379] text-center mb-6">
              How do you want to feel tonight?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setActiveMood(mood.id)}
                  className={`p-4 rounded-2xl transition-all duration-300 text-center ${
                    activeMood === mood.id
                      ? 'border-2 border-[#7CC379] bg-[#7CC379]/10 transform -translate-y-1'
                      : 'border-2 border-transparent bg-black/30 hover:border-[#7CC379] hover:bg-[#7CC379]/5 hover:-translate-y-1'
                  }`}
                >
                  <span className="text-3xl block mb-2">{mood.emoji}</span>
                  <span className="text-sm text-gray-200">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Wellness Recommendations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-[#7CC379]/20 relative overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#7CC379]/20"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#7CC379] to-[#5a9556]"></div>
                <div className="absolute top-4 right-4 bg-gradient-to-r from-[#7CC379] to-[#5a9556] px-3 py-1 rounded-full text-xs font-medium text-white">
                  {rec.confidence}% AI
                </div>
                
                <div className="text-[#7CC379] text-sm font-semibold mb-2">{rec.type}</div>
                <h3 className="text-lg font-semibold mb-2 text-white">{rec.title}</h3>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">{rec.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[#7CC379] font-semibold">
                    {rec.aiPrice}
                    <div className="text-xs text-gray-400">AI Market Price</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-200">{rec.safety}</div>
                    <div className="text-xs text-gray-400">{rec.category}</div>
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-[#7CC379] to-[#5a9556] py-3 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-[#7CC379]/25 transform hover:-translate-y-0.5">
                  Add to Journal
                </button>
              </div>
            ))}
          </div>

          {/* AI Insights Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {safeArray(aiInsights).map((insight, index) => (
              <div
                key={index}
                className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-[#7CC379]/20 text-center"
              >
                <div className="text-4xl mb-4">{insight.icon}</div>
                <div className={`text-lg font-semibold mb-2 ${getStatusColor(insight.status)}`}>{insight.title}</div>
                <div className="text-2xl font-bold mb-2 text-white">{insight.value}</div>
                <div className="text-gray-300 text-sm">{insight.description}</div>
              </div>
            ))}
          </div>

          {/* Wellness Metrics */}
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-[#7CC379]/20">
            <h2 className="text-2xl font-semibold text-[#7CC379] mb-6 flex items-center gap-2">
              🎯 Your Wellness Analytics
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {wellnessMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="bg-black/30 rounded-2xl p-6 border border-[#7CC379]/10 transition-all duration-300 hover:border-[#7CC379] hover:-translate-y-1"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-3xl">{metric.icon}</span>
                    <span className="text-2xl">{getTrendIcon(metric.trend)}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{metric.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{metric.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7CC379] font-bold text-lg">{metric.score}/10</span>
                    <span className="text-xs text-gray-400 capitalize">{metric.trend} trend</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;