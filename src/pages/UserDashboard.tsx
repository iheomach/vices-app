import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { safeArray } from '../utils/safeArray';
import { Goal } from '../types/goals';
import { JournalEntry, Stats } from '../types/tracking';
import { Insight } from '../types/sharedTypes';
import { TrackingApi } from '../services/api/trackingApi';
import { GoalsApi } from '../services/api/goalsApi';
import { safeGoals, safeJournalEntries, safeInsights } from '../utils/safeArray';
import { useNavigate } from 'react-router-dom';

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
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [activeMood, setActiveMood] = useState<string>('relaxed');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string }>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
  });

  const trackingApi = new TrackingApi();
  const goalsApi = new GoalsApi();

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

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [goalsResponse, journalResponse, insightsResponse, statsResponse] = await Promise.all([
          goalsApi.getGoals().catch(() => []),
          trackingApi.getJournalEntries().catch(() => []),
          trackingApi.getInsights().catch(() => []),
          trackingApi.getStats().catch(() => null)
        ]);

        setGoals(safeGoals(goalsResponse));
        setJournalEntries(safeJournalEntries(journalResponse));
        setInsights(safeInsights(insightsResponse));
        setStats(statsResponse);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch latest user profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/profile/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({ firstName: data.first_name, lastName: data.last_name });
      }
    };
    fetchProfile();
  }, [token]);

  // Calculate real metrics from database
  const calculateGoalProgress = (): number => {
    if (!goals || goals.length === 0) return 0;
    const activeGoals = goals.filter(goal => goal.status === 'active');
    if (activeGoals.length === 0) return 0;
    
    const totalProgress = activeGoals.reduce((sum, goal) => {
      const progress = goal.current_value && goal.target_value 
        ? (goal.current_value / goal.target_value) * 100 
        : 0;
      return sum + Math.min(progress, 100);
    }, 0);
    
    return Math.round(totalProgress / activeGoals.length);
  };

  const calculateAverageMood = (): number => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    const totalMood = journalEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0);
    return Math.round((totalMood / journalEntries.length) * 10) / 10;
  };

  const calculateSleepQuality = (): number => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    const totalSleep = journalEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0);
    return Math.round((totalSleep / journalEntries.length) * 10) / 10;
  };

  const calculateConsistencyScore = (): number => {
    if (!journalEntries || journalEntries.length < 7) return 0;
    
    // Count days in the last 7 days where user logged entries
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentEntries = journalEntries.filter(entry => 
      new Date(entry.timestamp) >= oneWeekAgo
    );
    
    const uniqueDays = new Set(
      recentEntries.map(entry => 
        new Date(entry.timestamp).toDateString()
      )
    );
    
    return Math.round((uniqueDays.size / 7) * 100);
  };

  const calculateMoodTrend = (): string => {
    if (!journalEntries || journalEntries.length < 7) return 'stable';
    
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 'stable';
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / olderEntries.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 1) return 'up';
    if (difference < -1) return 'down';
    return 'stable';
  };

  const calculateSleepTrend = (): string => {
    if (!journalEntries || journalEntries.length < 7) return 'stable';
    
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 'stable';
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / olderEntries.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 0.5) return 'up';
    if (difference < -0.5) return 'down';
    return 'stable';
  };

  // Real AI insights based on actual data
  const aiInsights: AIInsight[] = [
    { 
      icon: '📊', 
      title: 'Goal Progress', 
      value: `${calculateGoalProgress()}%`, 
      description: 'Active challenges completion', 
      status: calculateGoalProgress() > 70 ? 'optimal' : calculateGoalProgress() > 40 ? 'good' : 'warning' 
    },
    { 
      icon: '😊', 
      title: 'Mood Average', 
      value: `${calculateAverageMood()}/10`, 
      description: 'Overall wellness score', 
      status: calculateAverageMood() > 7 ? 'optimal' : calculateAverageMood() > 5 ? 'good' : 'warning' 
    },
    { 
      icon: '😴', 
      title: 'Sleep Quality', 
      value: `${calculateSleepQuality()}/10`, 
      description: 'Rest optimization', 
      status: calculateSleepQuality() > 7 ? 'optimal' : calculateSleepQuality() > 5 ? 'good' : 'warning' 
    },
    { 
      icon: '📅', 
      title: 'Consistency', 
      value: `${calculateConsistencyScore()}%`, 
      description: 'Weekly tracking adherence', 
      status: calculateConsistencyScore() > 80 ? 'optimal' : calculateConsistencyScore() > 50 ? 'good' : 'warning' 
    }
  ];

  // Real wellness metrics based on actual data
  const wellnessMetrics: WellnessMetric[] = [
    {
      id: '1',
      title: 'Goal Achievement',
      description: `${goals?.filter(g => g.status === 'completed').length || 0} challenges completed`,
      score: calculateGoalProgress() / 10,
      trend: calculateGoalProgress() > 70 ? 'up' : 'stable',
      icon: '🎯'
    },
    {
      id: '2',
      title: 'Mood Stability',
      description: `Average mood trend is ${calculateMoodTrend()}`,
      score: calculateAverageMood(),
      trend: calculateMoodTrend() as 'up' | 'down' | 'stable',
      icon: '😊'
    },
    {
      id: '3',
      title: 'Sleep Optimization',
      description: `Sleep quality trend is ${calculateSleepTrend()}`,
      score: calculateSleepQuality(),
      trend: calculateSleepTrend() as 'up' | 'down' | 'stable',
      icon: '😴'
    }
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        
        const moodDescriptions = {
          relaxed: 'relaxed and calm',
          social: 'social and outgoing',
          creative: 'creative and inspired',
          focused: 'focused and productive',
          sleepy: 'sleepy and ready for rest',
          energetic: 'energetic and active'
        };
        
        const prompt = `You are a wellness-focused AI coach for cannabis and alcohol consumption. Generate exactly 3 personalized recommendations in JSON format for a user who wants to feel ${moodDescriptions[activeMood as keyof typeof moodDescriptions]} tonight.

User Profile:
- Primary Goal: Better sleep quality
- Current Usage: Cannabis 2-3x/week, Alcohol 1-2x/week  
- Tolerance Level: Low-Medium
- Time of Day: Evening (7-9 PM)
- Experience Level: Intermediate
- Health Focus: Sleep optimization, stress reduction
- Desired Mood: ${moodDescriptions[activeMood as keyof typeof moodDescriptions]}

Requirements:
1. Generate exactly 3 recommendations tailored to help achieve the ${moodDescriptions[activeMood as keyof typeof moodDescriptions]} feeling
2. Each must have different "type" categories: choose from [OPTIMAL DOSAGE, TIMING OPTIMIZATION, TOLERANCE BREAK, STRAIN SELECTION, WELLNESS PAUSE, MICRO-DOSING, SAFETY CHECK]
3. One must be cannabis-related, one alcohol-related, one wellness-related
4. Include realistic market pricing
5. Safety levels: Low Risk, Moderate, High Risk, Excellent
6. Confidence scores: 85-98%
7. Categories: Cannabis, Alcohol, Wellness
8. Focus on substances and activities that promote the desired ${moodDescriptions[activeMood as keyof typeof moodDescriptions]} feeling

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

Focus on harm reduction, wellness optimization, and evidence-based recommendations that specifically help achieve the ${moodDescriptions[activeMood as keyof typeof moodDescriptions]} feeling. Be specific with dosages, timing, and expected outcomes.`;

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
  }, [activeMood]);

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

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
      <Header />

      {/* Main content with padding-top to account for fixed header */}
      <main className="flex-1 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-[#7CC379] border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-xl text-[#7CC379]">Loading your wellness data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h2>
              <p className="text-gray-300 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-[#7CC379] hover:bg-[#6BB369] px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent">
                  {getTimeBasedGreeting()}, {profile.firstName || 'Friend'}!
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
                {isLoading ? (
                  // Loading state
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-[#7CC379]/20 relative overflow-hidden"
                    >
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-6 bg-gray-700 rounded mb-4"></div>
                        <div className="h-16 bg-gray-600 rounded mb-4"></div>
                        <div className="h-4 bg-gray-600 rounded mb-2"></div>
                        <div className="h-10 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recommendations.length > 0 ? (
                  recommendations.map((rec) => (
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
                  ))
                ) : (
                  // No recommendations state
                  <div className="col-span-full text-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-xl font-semibold text-[#7CC379] mb-2">AI Recommendations</h3>
                    <p className="text-gray-300">Select a mood to get personalized wellness recommendations</p>
                  </div>
                )}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;