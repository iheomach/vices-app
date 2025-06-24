import React, { useState, useEffect } from 'react';
import { Target, Trophy, Calendar, Users, Star, Play, Pause, CheckCircle } from 'lucide-react';
import { Goal } from '../types/goals'; // Adjust the import path as necessary
import { SubstanceType } from '../types/tracking';
import { Challenge, GoalAction, GoalsAndChallengesProps} from '../types/sharedTypes'; // Adjust the import path as necessary
import { safeArray } from '../utils/safeArray';
import { GoalsApi } from '../services/api/goalsApi';

const goalsApi = new GoalsApi();

const GoalsAndChallenges: React.FC<GoalsAndChallengesProps> = ({ userGoals, onStartChallenge, onUpdateGoal }) => {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  // --- Daily Check-in State ---
  // Structure: { [goalId]: 'YYYY-MM-DD' }
  const [checkinState, setCheckinState] = useState<{ [goalId: string]: string }>({});

  // Helper to get today's date as YYYY-MM-DD
  const getToday = () => new Date().toISOString().split('T')[0];

  // Load check-in state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('goalCheckins');
    if (stored) {
      setCheckinState(JSON.parse(stored));
    }
  }, []);

  // Save check-in state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('goalCheckins', JSON.stringify(checkinState));
  }, [checkinState]);

  // Handler for daily check-in
  const handleDailyCheckin = async (goal: Goal) => {
    if (checkinState[goal.id] === getToday()) return;
    const newCurrentValue = (goal.current_value || 0) + 1;
    const newProgress = Math.min(Math.round((newCurrentValue / (goal.target_value || 1)) * 100), 100);
    try {
      await goalsApi.updateGoal(goal.id, {
        current_value: newCurrentValue,
        progress: newProgress
      });
      setCheckinState(prev => ({ ...prev, [goal.id]: getToday() }));
    } catch (err) {
      console.error('Failed to check in:', err);
    }
  };

  const availableChallenges: Challenge[] = [
    {
      id: 't_break_7',
      title: '🌿 7-Day T-Break',
      description: 'Reset your cannabis tolerance with a guided 7-day break',
      substance_type: 'cannabis',
      duration: '7 days',
      difficulty: 'Medium',
      participants: 1247,
      target_value: 7,
      features: [
        'Daily check-ins and tips',
        'Alternative activity suggestions',
        'Craving management strategies',
        'Gradual reintroduction plan'
      ],
      benefits: [
        'Lower tolerance',
        'Clearer thinking',
        'Better sleep',
        'Money savings'
      ],
      color: 'green'
    },
    {
      id: 'dry_january',
      title: '🍷 Dry January',
      description: '31 days alcohol-free with daily support and tracking',
      substance_type: 'alcohol',
      duration: '31 days',
      difficulty: 'Hard',
      participants: 2156,
      target_value: 31,
      features: [
        'Mocktail recipes',
        'Health benefit tracking',
        'Community support',
        'Withdrawal guidance'
      ],
      benefits: [
        'Better sleep',
        'Weight loss',
        'Improved mood',
        'Liver recovery'
      ],
      color: 'blue'
    },
    {
      id: 'mindful_consumption',
      title: '🧘 Mindful Consumption',
      description: '21 days of intentional and conscious substance use',
      substance_type: 'both',
      duration: '21 days',
      difficulty: 'Easy',
      participants: 892,
      target_value: 21,
      features: [
        'Pre-consumption meditation',
        'Intention setting exercises',
        'Dosage optimization',
        'Reflection prompts'
      ],
      benefits: [
        'Enhanced effects',
        'Reduced waste',
        'Better awareness',
        'Intentional use'
      ],
      color: 'purple'
    },
    {
      id: 'weekend_warrior',
      title: '📅 Weekend Warrior',
      description: 'Limit consumption to weekends only for 30 days',
      substance_type: 'both',
      duration: '30 days',
      difficulty: 'Medium',
      participants: 567,
      target_value: 30,
      features: [
        'Weekday alternatives',
        'Motivation tracking',
        'Reward system',
        'Social support'
      ],
      benefits: [
        'Improved productivity',
        'Better weekdays',
        'Enhanced weekends',
        'Self-discipline'
      ],
      color: 'orange'
    }
  ];

  // Helper to get challenge by id
  const getChallengeById = (challengeId: string) => availableChallenges.find(c => c.id === challengeId);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-[#7CC379] bg-[#7CC379]/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Hard': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getChallengeColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'border-[#7CC379]/30 bg-[#7CC379]/10',
      blue: 'border-blue-400/30 bg-blue-400/10',
      purple: 'border-purple-400/30 bg-purple-400/10',
      orange: 'border-orange-400/30 bg-orange-400/10'
    };
    return colors[color] || 'border-gray-500/30 bg-gray-500/10';
  };

  const getButtonColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-[#7CC379] hover:bg-[#7CC379]/80',
      blue: 'bg-blue-500 hover:bg-blue-600',
      purple: 'bg-purple-500 hover:bg-purple-600',
      orange: 'bg-orange-500 hover:bg-orange-600'
    };
    return colors[color] || 'bg-gray-500 hover:bg-gray-600';
  };

  const handleStartChallenge = async (challenge: Challenge) => {
    try {
      // Pass the challenge with its target_value to onStartChallenge
      await onStartChallenge({ ...challenge, target_value: challenge.target_value });
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Failed to start challenge:', error);
      // Optionally add error handling UI here
    }
  };

  const handleGoalAction = async (goalId: string, action: GoalAction) => {
    await onUpdateGoal(goalId, action);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'paused':
        return <Pause className="w-5 h-5 text-yellow-400" />;
      case 'active':
      default:
        return <Play className="w-5 h-5 text-blue-400" />;
    }
  };

  // Handler to delete all goals
  const handleClearAllChallenges = async () => {
    if (!userGoals.length) return;
    setDeletingAll(true);
    try {
      await Promise.all(userGoals.map(goal => goalsApi.deleteGoal(goal.id)));
      // Optionally, refresh the UI or call a prop to reload goals
      window.location.reload(); // simplest way to refresh
    } catch (err) {
      console.error('Failed to delete all goals:', err);
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Clear All Challenges Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleClearAllChallenges}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
          disabled={deletingAll || !userGoals.length}
        >
          {deletingAll ? 'Clearing...' : 'Clear All Challenges'}
        </button>
      </div>
      {/* Available Challenges */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-green-100">
            <Trophy className="w-5 h-5 text-green-400" />
            <span>Popular Challenges</span>
          </h3>
          <div className="text-sm text-green-200/60">
            Join thousands of others on their journey
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableChallenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className={`rounded-lg p-4 border transition-all hover:scale-105 cursor-pointer ${getChallengeColor(challenge.color)}`}
              onClick={() => setSelectedChallenge(challenge)}
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-white mb-1">{challenge.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty}
                </span>
              </div>
              
              <p className="text-sm text-green-100/70 mb-3">{challenge.description}</p>
              
              <div className="flex items-center justify-between text-xs text-green-200/60 mb-3">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{challenge.duration}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{challenge.participants.toLocaleString()} joined</span>
                </span>
              </div>
              
              <ul className="text-xs text-green-100/60 space-y-1 mb-3">
                {challenge.features.slice(0, 3).map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
              
              <button 
                className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${getButtonColor(challenge.color)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartChallenge(challenge);
                }}
              >
                Start Challenge
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Current Goals Detail */}
      <div className="bg-black/20 backdrop-blur-lg border border-green-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-green-100">
          <Target className="w-5 h-5 text-green-400" />
          <span>Your Active Goals</span>
        </h3>
        
        {userGoals.length === 0 ? (
          <div className="text-center py-8 text-green-200/60">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active goals yet</p>
            <p className="text-sm">Start a challenge above to begin your journey</p>
          </div>
        ) : (
          <div className="space-y-4">
            {safeArray(userGoals).map((goal) => (
              <div key={goal.id} className="bg-black/30 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(goal.status)}
                    <h4 className="font-medium text-white">{goal.title}</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm px-3 py-1 bg-green-500/20 text-green-300 rounded-full border border-green-400/30">
                      Day {goal.current_value} of {goal.duration.split(' ')[0]}
                    </span>
                    <div className="flex space-x-1">
                      {goal.status === 'active' && (
                      <>
                        <button
                        onClick={() => handleGoalAction(goal.id, 'pause')}
                        className="p-1 bg-yellow-500/20 text-yellow-400 rounded hover:bg-yellow-500/30 border border-yellow-400/30"
                        title="Pause goal"
                        >
                        <Pause className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleGoalAction(goal.id, 'complete')}
                        className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 border border-green-400/30"
                        title="Mark as complete"
                        >
                        <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                        onClick={() => handleDailyCheckin(goal)}
                        className={`p-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 border border-blue-400/30 ${checkinState[goal.id] === getToday() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Daily check-in"
                        disabled={checkinState[goal.id] === getToday()}
                        >
                        <Calendar className="w-4 h-4" />
                        </button>
                      </>
                      )}
                      {goal.status === 'paused' && (
                      <>
                        <button
                        onClick={() => handleGoalAction(goal.id, 'resume')}
                        className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 border border-green-400/30"
                        title="Resume goal"
                        >
                        <Play className="w-4 h-4" />
                        </button>
                      </>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-green-100/70 text-sm mb-3">{goal.description}</p>
                
                <div className="w-full bg-slate-700/50 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-400 h-3 rounded-full transition-all"
                    style={{ width: `${goal.current_value / goal.target_value * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="text-green-100/70">{(goal.current_value / goal.target_value * 100).toFixed(1)}% complete</span>
                  {goal.status === 'active' && (
                    <span className="text-green-300 flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Keep going!</span>
                    </span>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-2 text-green-100">Expected Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {safeArray<string>(goal.benefits).map((benefit: string, index: number) => (
                      <span key={index} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-400/30">
                      {benefit}
                      </span>
                    ))}
                  </div>
                </div>
                
                {goal.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-100/70">Today's check-in:</span>
                      <button
                        onClick={() => handleDailyCheckin(goal)}
                        className={`bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-xs font-medium ${checkinState[goal.id] === getToday() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={checkinState[goal.id] === getToday()}
                      >
                        Complete Daily Check-in
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-800 to-green-900 border border-green-400/30 rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold text-white">{selectedChallenge.title}</h3>
              <button
                onClick={() => setSelectedChallenge(null)}
                className="text-green-200/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-green-100/70 mb-4">{selectedChallenge.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
                <div className="text-sm text-green-200/60">Duration</div>
                <div className="font-medium text-white">{selectedChallenge.duration}</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 border border-green-500/20">
                <div className="text-sm text-green-200/60">Difficulty</div>
                <div className={`font-medium ${getDifficultyColor(selectedChallenge.difficulty).split(' ')[0]}`}>
                  {selectedChallenge.difficulty}
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2 text-green-100">What's Included:</h4>
              <ul className="text-sm text-green-100/70 space-y-1">
                {selectedChallenge.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-green-100">Expected Benefits:</h4>
              <div className="flex flex-wrap gap-1">
                {selectedChallenge.benefits.map((benefit, index) => (
                  <span key={index} className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full border border-green-400/30">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedChallenge(null)}
                className="flex-1 bg-black/20 hover:bg-black/30 border border-green-500/20 py-2 rounded-lg font-medium text-green-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartChallenge(selectedChallenge)}
                className={`flex-1 py-2 rounded-lg font-medium ${getButtonColor(selectedChallenge.color)}`}
              >
                Start Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsAndChallenges;