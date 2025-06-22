import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Calendar, Target, Lightbulb } from 'lucide-react';

// Import all components
import Dashboard from '../components/Dashboard';
import DailyJournal from '../components/DailyJournal';
import GoalsAndChallenges from '../components/GoalsAndChallenges';
import AIInsights from '../components/AIInsights';
import Header from '../components/Header';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  progress: number;
  status: string;
  benefits: string[];
  challenge: string;
}

interface JournalEntry {
  date: string;
  mood: number;
  substance: string;
  amount: string;
  effects: string;
  sleepQuality: number;
  sleep?: number;
  notes: string;
  tags: string[];
}

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: string;
  actionable: boolean;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  implementation: string;
  impact: string;
  priority: string;
}

interface Stats {
  mindfulDays: number;
  sleepQuality: number;
  sleepImprovement: number;
  moodAverage: number;
  moodTrend: string;
}

interface UserData {
  goals: Goal[];
  journalEntries: JournalEntry[];
  insights: Insight[];
  personalizedRecommendations: Recommendation[];
  stats: Stats;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  difficulty: string;
  participants: number;
  features: string[];
  expectedBenefits: string[];
  color: string;
}

const ViceJourneyTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState<UserData>({
    goals: [],
    journalEntries: [],
    insights: [],
    personalizedRecommendations: [],
    stats: {
      mindfulDays: 0,
      sleepQuality: 0,
      sleepImprovement: 0,
      moodAverage: 0,
      moodTrend: ''
    }
  });

  // Mock data - in real app, this would come from API
  const initialData: UserData = {
    goals: [
      {
        id: 'reduce_tolerance',
        title: 'Reduce Cannabis Tolerance',
        description: 'Take a planned break to reset tolerance and improve effectiveness',
        type: 'cannabis',
        duration: '14 days',
        progress: 45,
        status: 'active',
        benefits: ['Lower costs', 'Better effects', 'Clearer thinking'],
        challenge: 'T-Break Challenge'
      },
      {
        id: 'mindful_drinking',
        title: 'Mindful Alcohol Consumption',
        description: 'Reduce alcohol intake and improve drinking awareness',
        type: 'alcohol',
        duration: '30 days',
        progress: 23,
        status: 'active',
        benefits: ['Better sleep', 'More energy', 'Weight loss'],
        challenge: 'Sober Curious'
      },
      {
        id: 'sleep_improvement',
        title: 'Better Sleep Quality',
        description: 'Optimize cannabis use for better sleep without dependency',
        type: 'wellness',
        duration: '21 days',
        progress: 67,
        status: 'active',
        benefits: ['Deeper sleep', 'Less groggy mornings', 'Natural rhythm'],
        challenge: 'Sleep Optimization'
      }
    ],
    journalEntries: [
      {
        date: '2025-06-21',
        mood: 8,
        substance: 'Cannabis',
        amount: '5mg edible',
        effects: 'Relaxed, creative',
        sleepQuality: 7.5,
        notes: 'Great evening, watched movies and felt very relaxed',
        tags: ['evening', 'creative', 'relaxed']
      },
      {
        date: '2025-06-20',
        mood: 6,
        substance: 'Alcohol',
        amount: '2 glasses wine',
        effects: 'Social, talkative',
        sleepQuality: 6,
        notes: 'Dinner party - had fun but sleep was interrupted',
        tags: ['social', 'dinner', 'interrupted_sleep']
      },
      {
        date: '2025-06-19',
        mood: 9,
        substance: 'Cannabis',
        amount: '7.5mg edible',
        effects: 'Very relaxed, euphoric',
        sleepQuality: 8.5,
        notes: 'Perfect dose for relaxation without being too much',
        tags: ['evening', 'relaxed', 'perfect_dose']
      }
    ],
    insights: [
      {
        type: 'pattern',
        title: 'Usage Pattern Detected',
        message: 'You tend to use cannabis more on weekends. Consider if this aligns with your goals.',
        severity: 'info',
        actionable: true
      },
      {
        type: 'health',
        title: 'Sleep Impact Notice',
        message: 'Alcohol consumption correlates with 20% worse sleep quality in your data.',
        severity: 'warning',
        actionable: true
      },
      {
        type: 'achievement',
        title: 'Goal Progress',
        message: 'You\'re 67% through your sleep optimization challenge!',
        severity: 'success',
        actionable: false
      },
      {
        type: 'optimization',
        title: 'Dosage Sweet Spot',
        message: 'Your data shows 5-7.5mg THC gives you optimal effects without overconsumption.',
        severity: 'tip',
        actionable: true
      }
    ],
    personalizedRecommendations: [
      {
        type: 'optimization',
        title: 'Timing Optimization',
        description: 'Try consuming cannabis 2-3 hours before bed instead of right before sleep for better REM cycles.',
        implementation: 'Set a reminder 3 hours before bedtime',
        impact: '+15% sleep quality',
        priority: 'medium'
      },
      {
        type: 'health',
        title: 'Hydration Focus',
        description: 'Your data shows better next-day mood when you hydrate well. Consider setting hydration reminders.',
        implementation: 'Drink 16oz water before and after consumption',
        impact: '+2.1 mood points average',
        priority: 'high'
      },
      {
        type: 'pattern',
        title: 'Mindfulness Practice',
        description: 'Adding 5 minutes of meditation before consumption could enhance your awareness and enjoyment.',
        implementation: 'Use a meditation app for 5-minute sessions',
        impact: 'Enhanced effects and awareness',
        priority: 'low'
      }
    ],
    stats: {
      mindfulDays: 5,
      sleepQuality: 7.2,
      sleepImprovement: 0.8,
      moodAverage: 7.5,
      moodTrend: 'Stable'
    }
  };

  useEffect(() => {
    // Initialize with mock data
    setUserData(initialData);
  }, []);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'journal', name: 'Daily Journal', icon: <Calendar className="w-4 h-4" /> },
    { id: 'goals', name: 'Goals & Challenges', icon: <Target className="w-4 h-4" /> },
    { id: 'insights', name: 'AI Insights', icon: <Lightbulb className="w-4 h-4" /> }
  ];

  // Event handlers
  const handleSaveJournalEntry = async (entryData: JournalEntry & { timestamp: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUserData(prev => ({
      ...prev,
      journalEntries: [entryData, ...prev.journalEntries]
    }));
    
    // Trigger insights update when new entry is added
    generateNewInsights();
  };

  const handleStartChallenge = (challenge: Challenge) => {
    const newGoal: Goal = {
      id: challenge.id + '_' + Date.now(),
      title: challenge.title.replace(/[^\w\s]/gi, ''), // Remove emojis for title
      description: challenge.description,
      type: challenge.type,
      duration: challenge.duration,
      progress: 0,
      status: 'active',
      benefits: challenge.expectedBenefits,
      challenge: challenge.title
    };
    
    setUserData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
    
    // Switch to dashboard to show new goal
    setActiveTab('dashboard');
  };

  const handleUpdateGoal = (goalId: string, action: string) => {
    setUserData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => {
        if (goal.id === goalId) {
          switch (action) {
            case 'pause':
              return { ...goal, status: 'paused' };
            case 'resume':
              return { ...goal, status: 'active' };
            case 'checkin':
              return { 
                ...goal, 
                progress: Math.min(goal.progress + 5, 100) // Increment progress
              };
            default:
              return goal;
          }
        }
        return goal;
      })
    }));
  };

  const handleRequestAnalysis = async (timeframe: string) => {
    // Simulate AI analysis generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real app, this would call OpenAI API
    generateNewInsights();
  };

  const generateNewInsights = () => {
    // Simulate generating new insights based on current data
    const newInsights: Insight[] = [
      {
        type: 'trend',
        title: 'Positive Trend Detected',
        message: 'Your consistency has improved 23% over the past week. Keep it up!',
        severity: 'success',
        actionable: false
      },
      ...userData.insights.slice(1) // Keep some existing insights
    ];
    
    setUserData(prev => ({
      ...prev,
      insights: newInsights
    }));
  };

  const renderCurrentTab = () => {
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
            personalizedRecommendations={userData.personalizedRecommendations}
            onRequestAnalysis={handleRequestAnalysis}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1B272C] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main content with padding-top to account for fixed header */}
      <main className="flex-1 pt-20"> {/* Add pt-20 for header space */}
        <div className="bg-[#1B272C] border-b border-[#7CC379]/20 p-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto">
              
            {/* Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 bg-black/40 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-2 px-2 py-2 rounded-lg transition-all text-sm ${
                    activeTab === tab.id
                      ? 'bg-[#7CC379]/30 text-white border border-[#7CC379]/50'
                      : 'text-[#7CC379]/70 hover:text-white hover:bg-[#7CC379]/10'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto p-6">
          {renderCurrentTab()}
        </div>
      </main>

      {/* Footer Stats */}
      <div className="bg-black/20 backdrop-blur-xl border-t border-white/10 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center space-x-6 text-green-100/60">
            <span>Total Entries: {userData.journalEntries.length}</span>
            <span>Active Goals: {userData.goals.filter(g => g.status === 'active').length}</span>
            <span>Insights Generated: {userData.insights.length}</span>
          </div>
          <div className="text-green-300">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViceJourneyTracker;