import React from 'react';
import { CheckCircle, Moon, Heart, Target, TrendingUp, Award, BarChart3, Brain } from 'lucide-react';
import { Goal } from '../types/goals'; // Adjust the import path as necessary
import { Insight } from '../types/sharedTypes'
import { Stats, JournalEntry } from '../types/tracking'; // Adjust the import path as necessary
import { safeArray, safeSlice } from '../utils/safeArray';


interface DashboardProps {
  goals: Goal[];
  insights: Insight[];
  stats: Stats;
  journalEntries: JournalEntry[];
}

const Dashboard: React.FC<DashboardProps> = ({ goals, insights, stats, journalEntries }) => {
  // Calculate real metrics from journal entries
  const calculateMindfulDays = (): number => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    
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
    
    return uniqueDays.size;
  };

  const calculateAverageSleepQuality = (): number => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    
    const totalSleepQuality = journalEntries.reduce((sum, entry) => 
      sum + (entry.sleep_quality || 0), 0
    );
    
    return Math.round((totalSleepQuality / journalEntries.length) * 10) / 10;
  };

  const calculateSleepImprovement = (): number => {
    if (!journalEntries || journalEntries.length < 7) return 0;
    
    // Sort entries by date
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 0;
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / olderEntries.length;
    
    return Math.round((recentAvg - olderAvg) * 10) / 10;
  };

  const calculateAverageMood = (): number => {
    if (!journalEntries || journalEntries.length === 0) return 0;
    
    const totalMood = journalEntries.reduce((sum, entry) => 
      sum + (entry.mood || 0), 0
    );
    
    return Math.round((totalMood / journalEntries.length) * 10) / 10;
  };

  const calculateMoodTrend = (): string => {
    if (!journalEntries || journalEntries.length < 7) return 'Stable';
    
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 'Stable';
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / olderEntries.length;
    
    const difference = recentAvg - olderAvg;
    
    if (difference > 1) return 'Improving';
    if (difference < -1) return 'Declining';
    return 'Stable';
  };

  const activeGoalsCount = goals?.filter(goal => goal.status === 'active').length || 0;

  const quickStats = [
    {
      label: 'This Week',
      value: `${calculateMindfulDays()} days`,
      subtitle: 'Mindful usage',
      icon: <CheckCircle className="w-8 h-8 text-[#7CC379]" />,
      color: 'text-[#7CC379]'
    },
    {
      label: 'Sleep Quality',
      value: `${calculateAverageSleepQuality()}/10`,
      subtitle: `${calculateSleepImprovement() > 0 ? '+' : ''}${calculateSleepImprovement()} vs last week`,
      icon: <Moon className="w-8 h-8 text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      label: 'Mood Average',
      value: `${calculateAverageMood()}/10`,
      subtitle: calculateMoodTrend(),
      icon: <Heart className="w-8 h-8 text-purple-400" />,
      color: 'text-purple-400'
    },
    {
      label: 'Active Goals',
      value: `${activeGoalsCount}`,
      subtitle: 'In progress',
      icon: <Target className="w-8 h-8 text-orange-400" />,
      color: 'text-orange-400'
    }
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Brain className="w-5 h-5 text-blue-400" />;
      case 'health':
        return <Heart className="w-5 h-5 text-red-400" />;
      case 'achievement':
        return <Award className="w-5 h-5 text-green-400" />;
      default:
        return <BarChart3 className="w-5 h-5 text-purple-400" />;
    }
  };

  const getInsightBgColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-red-500/10 border border-red-400/30';
      case 'success':
        return 'bg-green-500/10 border border-green-400/30';
      default:
        return 'bg-emerald-500/10 border border-emerald-400/30';
    }
  };

  // ✅ Safe array handling
  const safeGoals = Array.isArray(goals) ? goals : [];
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-[#1B272C]/80 border border-[#7CC379]/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100/60 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className={`${stat.color} text-sm`}>{stat.subtitle}</p>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Active Goals */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-100">Active Challenges</h3>
        <div className="space-y-4">
          {safeGoals.filter(goal => goal.status === 'active').length > 0 ? safeGoals.filter(goal => goal.status === 'active').map(goal => (
            <div key={goal.id} className="bg-black/30 rounded-lg p-4 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{goal.title}</h4>
                <span className="text-sm text-green-200">{goal.duration}</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-100/70">{goal.progress}% complete</span>
                <span className="text-green-300">{goal.challenge}</span>
              </div>
            </div>
          )) : (
            <div className="text-center py-4 text-green-200/60">
              No goals available
            </div>
          )}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-100">Recent Insights</h3>
        <div className="space-y-3">
          {safeInsights.length > 0 ? (
            safeSlice(insights, 0, 3).map((insight, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getInsightBgColor(insight.severity)}`}>
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-white">{insight.title}</h4>
                  <p className="text-green-100/70 text-sm">{insight.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-green-200/60">
              No insights available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;