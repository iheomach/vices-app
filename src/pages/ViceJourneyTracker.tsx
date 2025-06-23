import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Import components
import Dashboard from '../components/Dashboard';
import DailyJournal from '../components/DailyJournal';
import GoalsAndChallenges from '../components/GoalsAndChallenges';
import AIInsights from '../components/AIInsights';
import Header from '../components/Header';

// Import API services
import { TrackingApi } from '../services/api/trackingApi';
import { GoalsApi } from '../services/api/goalsApi';

// Import utilities
import { safeGoals, safeJournalEntries, safeInsights, safeArray } from '../utils/safeArray';

// Import types
import { JournalEntry, Stats } from '../types/tracking';
import {
  Insight,
  Challenge,
  GoalAction
} from '../types/sharedTypes';
import { Goal } from '../types/goals';

interface UserData {
  goals: Goal[];
  journalEntries: JournalEntry[];
  insights: Insight[];
  stats: Stats;
}

const defaultUserData: UserData = {
  goals: [],
  journalEntries: [],
  insights: [],
  stats: {
    id: undefined,
    user: undefined,
    mindful_days: 0,
    sleep_quality: 0,
    sleep_improvement: 0,
    mood_average: 0,
    mood_trend: 'stable',
    last_calculated: new Date().toISOString()
  }
};

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

const ViceJourneyTracker: React.FC = () => {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'goals' | 'insights'>('dashboard');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const trackingApi = new TrackingApi();
  const goalsApi = new GoalsApi();

  useEffect(() => {
    console.log('🔄 useEffect triggered, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('❌ User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Starting data fetch...');
        
        // Test individual API calls first
        console.log('📡 Testing journal API call...');
        try {
          const journalTest = await trackingApi.getJournalEntries();
          console.log('✅ Journal API test successful:', journalTest);
          console.log('📊 Journal response type:', typeof journalTest);
          console.log('📊 Journal response is array:', Array.isArray(journalTest));
          console.log('📊 Journal response length:', journalTest?.length);
        } catch (journalError) {
          console.error('❌ Journal API test failed:', journalError);
        }

        const [goalsResponse, journalResponse, insightsResponse, statsResponse] = await Promise.all([
          goalsApi.getGoals().catch((err) => {
            console.error('❌ Goals API error:', err);
            return [];
          }),
          trackingApi.getJournalEntries().catch((err) => {
            console.error('❌ Journal API error:', err);
            console.error('❌ Journal error details:', err.message, err.stack);
            return [];
          }),
          trackingApi.getInsights().catch((err) => {
            console.error('❌ Insights API error:', err);
            return [];
          }),
          trackingApi.getStats().catch((err) => {
            console.error('❌ Stats API error:', err);
            return defaultUserData.stats;
          })
        ]);

        console.log('📊 Raw API Responses:');
        console.log('  🎯 Goals:', goalsResponse);
        console.log('  📝 Journal (RAW):', journalResponse);
        console.log('  🧠 Insights:', insightsResponse);
        console.log('  📈 Stats:', statsResponse);

        // Check if journal response has a nested structure
        console.log('🔍 Analyzing journal response structure:');
        if (journalResponse) {
          console.log('  📊 Journal keys:', Object.keys(journalResponse));
          console.log('  📊 Journal.results exists:', 'results' in journalResponse);
          console.log('  📊 Journal.data exists:', 'data' in journalResponse);
          console.log('  📊 Journal is array:', Array.isArray(journalResponse));
        }

        // Process the data safely
        const safeGoalsData = safeGoals(goalsResponse);
        const safeJournalData = safeJournalEntries(journalResponse);
        const safeInsightsData = safeInsights(insightsResponse);
        const safeStats = statsResponse || defaultUserData.stats;

        console.log('✅ Processed data:');
        console.log('  🎯 Safe goals:', safeGoalsData);
        console.log('  📝 Safe journal:', safeJournalData);
        console.log('  📝 Safe journal length:', safeJournalData?.length);
        console.log('  🧠 Safe insights:', safeInsightsData);
        console.log('  📈 Safe stats:', safeStats);

        // Check what safeJournalEntries is doing
        console.log('🔧 Testing safeJournalEntries function:');
        console.log('  Input:', journalResponse);
        console.log('  Output:', safeJournalData);

        const newUserData = {
          goals: safeGoalsData,
          journalEntries: safeJournalData,
          insights: safeInsightsData,
          stats: safeStats
        };

        console.log('💾 Setting new user data:', newUserData);
        setUserData(newUserData);
        
        // Verify the state was set correctly
        setTimeout(() => {
          console.log('🔍 Verifying state after update...');
        }, 100);
        
      } catch (err) {
        console.error('❌ Fetch error:', err);
        if (err instanceof Error) {
          console.error('❌ Error stack:', err.stack);
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
        console.log('✅ Loading complete');
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  // Add a separate effect to monitor userData changes
  useEffect(() => {
    console.log('📊 userData changed:', userData);
    console.log('📝 Journal entries count:', userData.journalEntries?.length);
    console.log('📝 Journal entries:', userData.journalEntries);
  }, [userData]);

  const handleSaveJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'user' | 'timestamp'>): Promise<void> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('💾 Saving journal entry:', entryData);
      console.log('📋 Current journal entries before save:', userData.journalEntries);

      const savedEntry = await trackingApi.createJournalEntry({
        ...entryData,
        user: user.id
      });

      console.log('✅ Saved entry response:', savedEntry);

      setUserData(prev => {
        const currentEntries = safeJournalEntries(prev.journalEntries);
        console.log('🔄 Updating with current entries:', currentEntries);
        
        const newData = {
          ...prev,
          journalEntries: [...currentEntries, savedEntry]
        };
        
        console.log('📝 New userData after save:', newData);
        return newData;
      });

      console.log('✅ Journal entry saved successfully');
    } catch (err) {
      console.error('❌ Failed to save journal entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save journal entry');
    }
  };

  const handleStartChallenge = async (challenge: Challenge): Promise<void> => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const newGoal: Omit<Goal, 'id'> = {
        user: user.id,
        duration: challenge.duration,
        challenge: challenge.title,
        title: challenge.title,
        description: challenge.description,
        substance_type: challenge.substance_type,
        target_value: 100,
        target_unit: '%',
        current_value: 0,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        progress: 0,
        benefits: challenge.expected_benefits
      };

      const savedGoal = await goalsApi.createGoal(newGoal);

      setUserData(prev => ({
        ...prev,
        goals: [...safeGoals(prev.goals), savedGoal]
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start challenge');
    }
  };

  const handleUpdateGoal = async (goalId: string, action: GoalAction): Promise<void> => {
    try {
      const status = action === 'pause' ? 'paused' : action === 'complete' ? 'completed' : 'active';
      
      const updatedGoal = await goalsApi.updateGoal(goalId, { status });

      setUserData(prev => ({
        ...prev,
        goals: safeGoals(prev.goals).map(goal => 
          goal.id === goalId ? updatedGoal : goal
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  };

  const handleUpdateGoalProgress = async (goalId: string, progress: number): Promise<void> => {
    try {
      const updatedGoal = await goalsApi.updateGoalProgress(goalId, progress);

      setUserData(prev => ({
        ...prev,
        goals: safeGoals(prev.goals).map(goal =>
          goal.id === goalId ? updatedGoal : goal
        )
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal progress');
    }
  };

  const handleRequestAnalysis = async (timeframe: string): Promise<void> => {
    try {
      const [stats, insights] = await Promise.all([
        trackingApi.getStats(),
        trackingApi.getInsights()
      ]);

      setUserData(prev => ({
        ...prev,
        stats: stats || prev.stats,
        insights: safeInsights(insights)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request analysis');
    }
  };

  // Navigation tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'journal', label: 'Daily Journal', icon: '📝' },
    { id: 'goals', label: 'Goals & Challenges', icon: '🎯' },
    { id: 'insights', label: 'AI Insights', icon: '🧠' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B272C] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CC379] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-[#7CC379]">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1B272C] text-white flex items-center justify-center">
        <div className="text-center max-w-md">
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
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            goals={userData.goals}
            insights={userData.insights}
            stats={userData.stats}
          />
        );
      case 'journal':
        return (
          <DailyJournal
            journalEntries={userData.journalEntries}
            onSaveEntry={handleSaveJournalEntry}
            isLoading={loading}
          />
        );
      case 'goals':
        return (
          <GoalsAndChallenges
            userGoals={userData.goals}
            onStartChallenge={handleStartChallenge}
            onUpdateGoal={handleUpdateGoal}
          />
        );
      case 'insights':
        return (
          <AIInsights
            insights={userData.insights}
            personalizedRecommendations={[]}
            onRequestAnalysis={handleRequestAnalysis}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col">
      <Header />

      {/* Debug info - remove in production */}
      <div className="bg-red-900/20 text-red-200 p-2 text-xs">
        Debug: Journal Entries Count: {userData.journalEntries?.length || 0} | 
        Loading: {loading.toString()} | 
        Auth: {isAuthenticated.toString()}
      </div>

      <main className="flex-1 pt-20">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-[#7CC379] to-[#7CC379]/80 bg-clip-text text-transparent">
              {getTimeBasedGreeting()}, {user?.first_name || 'Friend'}!
            </h1>
            <p className="text-gray-300 text-lg">
              Track your wellness journey with AI-powered insights
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-[#7CC379]/20">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#7CC379] to-[#6BB369] text-white shadow-lg shadow-[#7CC379]/25'
                      : 'text-gray-300 hover:text-white hover:bg-[#7CC379]/10'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="transition-all duration-300">
            {renderActiveTab()}
          </div>

          <div className="mt-8 bg-black/20 backdrop-blur-sm rounded-2xl p-6 border border-[#7CC379]/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#7CC379]">{safeJournalEntries(userData.journalEntries).length}</div>
                <div className="text-sm text-gray-300">Journal Entries</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#7CC379]">{safeGoals(userData.goals).length}</div>
                <div className="text-sm text-gray-300">Active Goals</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#7CC379]">{safeInsights(userData.insights).length}</div>
                <div className="text-sm text-gray-300">AI Insights</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-[#7CC379]">{userData.stats?.mindful_days || 0}</div>
                <div className="text-sm text-gray-300">Mindful Days</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViceJourneyTracker;