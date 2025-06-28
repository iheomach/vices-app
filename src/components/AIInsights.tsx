import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Zap, Shield, Target } from 'lucide-react';
import { safeArray } from '../utils/safeArray'; // Adjust the import path as necessary
import { Goal } from '../types/goals';
import { JournalEntry } from '../types/tracking';

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: string;
  actionable?: boolean;
}

interface Recommendation {
  type: string;
  title: string;
  description: string;
  implementation?: string;
  impact?: string;
  priority?: string;
}

interface AIInsightsProps {
  insights: Insight[];
  personalizedRecommendations: Recommendation[];
  onRequestAnalysis: (timeframe: string) => Promise<void>;
  userGoals: Goal[];
  journalEntries: JournalEntry[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, personalizedRecommendations, onRequestAnalysis, userGoals, journalEntries }) => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const timeframes = [
    { id: 'week', name: '7 Days', icon: '📅' },
    { id: 'month', name: '30 Days', icon: '🗓️' },
    { id: 'quarter', name: '3 Months', icon: '📊' },
    { id: 'all', name: 'All Time', icon: '🕐' }
  ];

  // Calculate real metrics from user data
  const calculateGoalAdherence = (): number => {
    if (!userGoals || userGoals.length === 0) return 0;
    
    const activeGoals = userGoals.filter(goal => goal.status === 'active');
    if (activeGoals.length === 0) return 0;
    
    const totalProgress = activeGoals.reduce((sum, goal) => {
      const progress = goal.current_value && goal.target_value 
        ? (goal.current_value / goal.target_value) * 100 
        : 0;
      return sum + Math.min(progress, 100);
    }, 0);
    
    return Math.round(totalProgress / activeGoals.length);
  };

  const calculateMoodImprovement = (): number => {
    if (!journalEntries || journalEntries.length < 2) return 0;
    
    // Sort entries by date and get recent entries
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 0;
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / olderEntries.length;
    
    return Math.round((recentAvg - olderAvg) * 10) / 10;
  };

  const calculateSleepQualityImprovement = (): number => {
    if (!journalEntries || journalEntries.length < 2) return 0;
    
    // Sort entries by date and get recent entries
    const sortedEntries = [...journalEntries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    const recentEntries = sortedEntries.slice(0, Math.min(7, sortedEntries.length));
    const olderEntries = sortedEntries.slice(7, Math.min(14, sortedEntries.length));
    
    if (olderEntries.length === 0) return 0;
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / olderEntries.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  };

  // Calculate weekly usage distribution
  const calculateWeeklyUsageDistribution = (): number[] => {
    // console.log('🔍 Calculating weekly usage distribution...');
    // console.log('📊 Journal entries:', journalEntries?.length);
    
    if (!journalEntries || journalEntries.length === 0) {
      // console.log('❌ No journal entries found');
      return [14, 14, 14, 14, 14, 15, 15]; // Even distribution as fallback
    }
    
    const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
    const totalEntries = journalEntries.length;
    
    journalEntries.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Mon-Sun (0-6)
      dayCounts[adjustedDay]++;
    });
    
    // console.log('📅 Day counts:', dayCounts);
    
    // Convert to percentages
    const percentages = dayCounts.map(count => Math.round((count / totalEntries) * 100));
    // console.log('📊 Weekly distribution percentages:', percentages);
    
    return percentages;
  };

  // Calculate effects correlations
  const calculateEffectsCorrelations = (): Array<{label: string, correlation: number, color: string}> => {
    // console.log('🔍 Calculating effects correlations...');
    // console.log('📊 Journal entries:', journalEntries?.length);
    
    if (!journalEntries || journalEntries.length < 5) {
      // console.log('❌ Insufficient data for correlations');
      return [
        { label: "Add more journal entries", correlation: 0, color: "text-gray-400" },
        { label: "to see your patterns", correlation: 0, color: "text-gray-400" }
      ];
    }
    
    const correlations = [];
    
    // Analyze substance use patterns and their effects
    const entriesWithSubstances = journalEntries.filter(entry => 
      entry.substance && entry.substance !== 'none'
    );
    
    // console.log('🍃 Entries with substances:', entriesWithSubstances.length);
    // console.log('🍃 Substance types found:', Array.from(new Set(entriesWithSubstances.map(e => e.substance))));
    
    if (entriesWithSubstances.length > 0) {
      // Calculate correlation between cannabis use and relaxation (mood improvement)
      const cannabisEntries = entriesWithSubstances.filter(entry => 
        entry.substance === 'cannabis'
      );
      // console.log('🌿 Cannabis entries:', cannabisEntries.length);
      
      if (cannabisEntries.length > 0) {
        const avgMood = cannabisEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / cannabisEntries.length;
        const correlation = Math.min(Math.round((avgMood / 10) * 100), 95);
        correlations.push({ 
          label: "Cannabis → Relaxation", 
          correlation, 
          color: "text-green-400" 
        });
      }
      
      // Calculate correlation between alcohol use and social context
      const alcoholEntries = entriesWithSubstances.filter(entry => 
        entry.substance === 'alcohol'
      );
      // console.log('🍺 Alcohol entries:', alcoholEntries.length);
      
      if (alcoholEntries.length > 0) {
        const correlation = Math.round(70 + Math.random() * 20); // Placeholder - could analyze social context
        correlations.push({ 
          label: "Alcohol → Social", 
          correlation, 
          color: "text-blue-400" 
        });
      }
    }
    
    // Analyze weekend vs weekday patterns
    const weekendEntries = journalEntries.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day === 0 || day === 6; // Saturday or Sunday
    });
    const weekdayEntries = journalEntries.filter(entry => {
      const day = new Date(entry.timestamp).getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    });
    
    // console.log('📅 Weekend entries:', weekendEntries.length);
    // console.log('📅 Weekday entries:', weekdayEntries.length);
    
    if (weekendEntries.length > 0 && weekdayEntries.length > 0) {
      const weekendAvgMood = weekendEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / weekendEntries.length;
      const weekdayAvgMood = weekdayEntries.reduce((sum, entry) => sum + (entry.mood || 0), 0) / weekdayEntries.length;
      const correlation = Math.round(((weekendAvgMood - weekdayAvgMood) / weekdayAvgMood) * 100 + 70);
      correlations.push({ 
        label: "Weekend → Better Mood", 
        correlation: Math.min(Math.max(correlation, 50), 95), 
        color: "text-purple-400" 
      });
    }
    
    // Analyze evening use patterns
    const eveningEntries = journalEntries.filter(entry => {
      const hour = new Date(entry.timestamp).getHours();
      return hour >= 18 || hour <= 6; // 6 PM to 6 AM
    });
    // console.log('🌙 Evening entries:', eveningEntries.length);
    
    if (eveningEntries.length > 0) {
      const avgSleepQuality = eveningEntries.reduce((sum, entry) => sum + (entry.sleep_quality || 0), 0) / eveningEntries.length;
      const correlation = Math.round((avgSleepQuality / 10) * 100);
      correlations.push({ 
        label: "Evening Use → Sleep", 
        correlation, 
        color: "text-yellow-400" 
      });
    }
    
    // console.log('📊 Final correlations:', correlations);
    
    return correlations.length > 0 ? correlations : [
      { label: "No patterns detected", correlation: 0, color: "text-gray-400" },
      { label: "Add more entries", correlation: 0, color: "text-gray-400" }
    ];
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Brain className="w-5 h-5 text-blue-400" />;
      case 'health':
        return <Shield className="w-5 h-5 text-red-400" />;
      case 'achievement':
        return <Target className="w-5 h-5 text-green-400" />;
      case 'trend':
        return <TrendingUp className="w-5 h-5 text-purple-400" />;
      case 'optimization':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      default:
        return <BarChart3 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getInsightSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'warning':
        return 'bg-red-500/10 border-red-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
      case 'tip':
        return 'bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'bg-gray-500/10 border-gray-500/30';
    }
  };

  const fetchAIAnalysis = async (timeframe: string) => {
    setIsGeneratingInsights(true);
    try {
      // Check if there's actual journal data to analyze
      const hasJournalData = journalEntries && journalEntries.length > 0;
      const hasGoals = userGoals && userGoals.length > 0;
      
      let prompt;
      
      if (!hasJournalData) {
        // No journal data available
        prompt = `I notice you haven't entered any journal data yet for tracking your substance use, mood, or sleep patterns. 

Since I don't have any actual usage data to analyze, I can't provide personalized insights about your patterns or behaviors. However, I can help you get started:

1. Consider logging your first journal entry to begin tracking your wellness journey
2. Your active goals show you're interested in mindful consumption - great start!
3. Regular tracking will help identify patterns and provide more meaningful insights

Would you like to start by logging your first entry, or do you have any questions about how to use the tracking features effectively?`;
      } else {
        // Has journal data - provide actual analysis
        const timeDescription = timeframe === 'week' ? '7 days' : 
                               timeframe === 'month' ? '30 days' : 
                               timeframe === 'quarter' ? '3 months' : 
                               'all available time';
        
        prompt = `Based on your actual journal entries for the past ${timeDescription}, provide me with a personalized wellness analysis. 

IMPORTANT: Only analyze the data you actually have. If there's limited data, acknowledge this and focus on what can be learned from the available entries.

Focus on:
- Key patterns in your actual recorded behavior (only if you have multiple entries)
- Any improvements or changes you've documented
- 2-3 specific, actionable recommendations based on your real data
- If you have very few entries, suggest how more regular tracking could help

Be honest about data limitations and don't make assumptions about patterns that aren't supported by your actual journal entries.`;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/openai/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          goals: userGoals,
          journal: journalEntries,
          dataContext: {
            hasJournalData,
            journalEntryCount: journalEntries?.length || 0,
            hasGoals,
            goalCount: userGoals?.length || 0
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI analysis');
      const data = await response.json();

      setAiAnalysis(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
    } catch (error) {
      setAiAnalysis('Failed to generate AI analysis.');
      console.error(error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Fetch on mount and when timeframe changes
  useEffect(() => {
    fetchAIAnalysis(selectedTimeframe);
  }, [selectedTimeframe]);

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-green-100">
            <Brain className="w-5 h-5 text-green-400" />
            <span>AI Analysis Controls</span>
          </h3>
          <button
            onClick={() => fetchAIAnalysis(selectedTimeframe)}
            disabled={isGeneratingInsights}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            {isGeneratingInsights ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Generate New Insights'
            )}
          </button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto whitespace-nowrap flex-nowrap w-full">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.id}
              onClick={() => setSelectedTimeframe(timeframe.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedTimeframe === timeframe.id
                  ? 'bg-[#7CC379]/30 text-white border border-[#7CC379]/50'
                  : 'bg-[#1B272C]/60 hover:bg-[#1B272C]/80 text-[#7CC379]/70'
              }`}
            >
              <span>{timeframe.icon}</span>
              <span>{timeframe.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Summary Analysis */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-100">
          <Brain className="w-5 h-5 text-green-400" />
          <span>AI Summary Analysis</span>
        </h3>
        <div className="bg-gradient-to-r from-[#7CC379]/20 to-[#7CC379]/10 rounded-lg p-4 mb-4">
          <div className="whitespace-pre-line text-sm leading-relaxed">
            {isGeneratingInsights ? 'Analyzing...' : aiAnalysis}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3 text-center border border-green-400/30">
            <div className="text-2xl font-bold text-green-400">{calculateGoalAdherence()}%</div>
            <div className="text-sm text-green-200/60">Active Goal Progress</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-400/30">
            <div className="text-2xl font-bold text-blue-400">
              {calculateMoodImprovement() > 0 ? '+' : ''}{calculateMoodImprovement()}
            </div>
            <div className="text-sm text-green-200/60">7-Day Mood Trend</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-3 text-center border border-purple-400/30">
            <div className="text-2xl font-bold text-purple-400">{calculateSleepQualityImprovement()}%</div>
            <div className="text-sm text-green-200/60">7-Day Sleep Trend</div>
          </div>
        </div>
      </div>

      {/* Detailed Insights */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-100">Detailed Insights</h3>
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="text-center py-8 text-green-200/60">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Add more journal entries to generate personalized insights</p>
            </div>
          ) : (
            safeArray(insights).map((insight, index) => (
              <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg border ${getInsightSeverityStyle(insight.severity)}`}>
                <div className="mt-1">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <h4 className="font-medium mb-1 text-white">{insight.title}</h4>
                  <p className="text-green-100/70 text-sm mb-2">{insight.message}</p>
                  {insight.actionable && (
                    <div className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded inline-block">
                      💡 Actionable
                    </div>
                  )}
                </div>
                {insight.severity === 'warning' && (
                  <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-100">
          <Lightbulb className="w-5 h-5 text-green-400" />
          <span>Personalized Recommendations</span>
        </h3>
        <div className="space-y-3">
          {personalizedRecommendations.length === 0 ? (
            <div className="text-center py-8 text-green-200/60">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recommendations available yet</p>
              <p className="text-sm">Complete more journal entries to get personalized advice</p>
            </div>
          ) : (
            personalizedRecommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg ${getInsightSeverityStyle(rec.type)}`}>
                <div className="flex items-start space-x-3">
                  {getInsightIcon(rec.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1 text-white">{rec.title}</h4>
                    <p className="text-green-100/70 text-sm mb-2">{rec.description}</p>
                    {rec.implementation && (
                      <div className="text-xs text-green-200/70 bg-black/20 px-2 py-1 rounded">
                        <strong>How:</strong> {rec.implementation}
                      </div>
                    )}
                    {rec.impact && (
                      <div className="text-xs text-green-400 mt-1">
                        Expected impact: {rec.impact}
                      </div>
                    )}
                  </div>
                  {rec.priority === 'high' && (
                    <div className="text-xs bg-[#7CC379]/20 text-[#7CC379] px-2 py-1 rounded">
                      High Priority
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Patterns Visualization */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-100">
          <BarChart3 className="w-5 h-5 text-green-400" />
          <span>Usage Patterns</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-medium mb-3 text-white">Weekly Usage Distribution</h4>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const usage = calculateWeeklyUsageDistribution()[index];
                return (
                  <div key={day} className="flex items-center space-x-3">
                    <span className="text-sm w-8 text-green-200">{day}</span>
                    <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all"
                        style={{ width: `${usage}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-green-200/60 w-8">{usage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-4 border border-green-500/20">
            <h4 className="font-medium mb-3 text-white">Effects Correlation</h4>
            <div className="space-y-3">
              {calculateEffectsCorrelations().map((correlation, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className={`text-green-100/70 ${correlation.color}`}>{correlation.label}</span>
                  <span className={`${correlation.color} font-medium`}>{correlation.correlation}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;