import React from 'react';
import { CheckCircle, Moon, Heart, Target, TrendingUp, Award, BarChart3, Brain } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  duration: string;
  progress: number;
  challenge: string;
}

interface Insight {
  type: string;
  title: string;
  message: string;
  severity: string;
}

interface Stats {
  mindfulDays?: number;
  sleepQuality?: number;
  sleepImprovement?: number;
  moodAverage?: number;
  moodTrend?: string;
}

interface DashboardProps {
  goals: Goal[];
  insights: Insight[];
  stats: Stats;
}

const Dashboard: React.FC<DashboardProps> = ({ goals, insights, stats }) => {
  const quickStats = [
    {
      label: 'This Week',
      value: `${stats?.mindfulDays || 5} days`,
      subtitle: 'Mindful usage',              icon: <CheckCircle className="w-8 h-8 text-[#7CC379]" />,
      color: 'text-[#7CC379]'
    },
    {
      label: 'Sleep Quality',
      value: `${stats?.sleepQuality || 7.2}/10`,
      subtitle: `+${stats?.sleepImprovement || 0.8} vs last week`,
      icon: <Moon className="w-8 h-8 text-blue-400" />,
      color: 'text-blue-400'
    },
    {
      label: 'Mood Average',
      value: `${stats?.moodAverage || 7.5}/10`,
      subtitle: stats?.moodTrend || 'Stable',
      icon: <Heart className="w-8 h-8 text-purple-400" />,
      color: 'text-purple-400'
    },
    {
      label: 'Active Goals',
      value: `${goals?.length || 3}`,
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
          {goals.map((goal) => (
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
          ))}
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-green-100">Recent Insights</h3>
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight, index) => (
            <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg border ${getInsightBgColor(insight.severity)}`}>
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <h4 className="font-medium text-sm text-white">{insight.title}</h4>
                <p className="text-green-100/70 text-sm">{insight.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;