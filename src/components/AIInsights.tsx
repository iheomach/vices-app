import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Zap, Shield, Target } from 'lucide-react';
import { safeArray } from '../utils/safeArray'; // Adjust the import path as necessary
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
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, personalizedRecommendations, onRequestAnalysis }) => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const timeframes = [
    { id: 'week', name: '7 Days', icon: '📅' },
    { id: 'month', name: '30 Days', icon: '🗓️' },
    { id: 'quarter', name: '3 Months', icon: '📊' },
    { id: 'all', name: 'All Time', icon: '🕐' }
  ];

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

  const generateNewInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      await onRequestAnalysis(selectedTimeframe);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const mockAIAnalysis = `Based on your ${selectedTimeframe === 'week' ? '7-day' : selectedTimeframe === 'month' ? '30-day' : 'long-term'} data, you've shown excellent consistency in mindful consumption. Your sleep quality has improved by 18% since starting the optimization challenge. Consider maintaining your current weekend routine as it correlates with your best mood scores.

Key patterns identified:
• Cannabis use on weekends correlates with 23% better social satisfaction
• Alcohol consumption after 8 PM reduces sleep quality by 15%
• Your optimal dosing appears to be 5-7.5mg THC for desired effects
• Hydration levels significantly impact next-day mood (+2.1 points average)`;

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
            onClick={generateNewInsights}
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
        
        <div className="flex space-x-2">
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
            {mockAIAnalysis}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500/20 rounded-lg p-3 text-center border border-green-400/30">
            <div className="text-2xl font-bold text-green-400">87%</div>
            <div className="text-sm text-green-200/60">Goal Adherence</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-400/30">
            <div className="text-2xl font-bold text-blue-400">+2.3</div>
            <div className="text-sm text-green-200/60">Mood Improvement</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-3 text-center border border-purple-400/30">
            <div className="text-2xl font-bold text-purple-400">18%</div>
            <div className="text-sm text-green-200/60">Sleep Quality ↑</div>
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
                const usage = [20, 15, 10, 25, 40, 80, 75][index]; // Mock data
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
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-100/70">Cannabis → Relaxation</span>
                <span className="text-green-400 font-medium">92%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-100/70">Alcohol → Social</span>
                <span className="text-blue-400 font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-100/70">Weekend → Better Mood</span>
                <span className="text-purple-400 font-medium">78%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-100/70">Evening Use → Sleep</span>
                <span className="text-yellow-400 font-medium">65%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;