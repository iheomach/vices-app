import { JournalEntry, Stats, SubstanceType } from './tracking';
import { Goal } from './goals';
// Basic types


export interface Insight {
  id: string;
  user: string;
  type: 'pattern' | 'health' | 'achievement' | 'optimization';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'tip';
  created_at: string;
  goal_id: string;
  actionable: boolean;
  expires_at?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  substance_type: SubstanceType;
  duration: string;
  difficulty: string;
  participants: number;
  features: string[];
  benefits: string[];
  color: string;
}

// Component Props
export interface DashboardProps {
  goals: Goal[];
  insights: Insight[];
  stats: Stats;
}

export interface JournalEntryProps {
  journalEntries: JournalEntry[];
  onSaveEntry: (entry: Omit<JournalEntry, 'id' | 'user' | 'timestamp'>) => Promise<void>;
}

export type GoalAction = 'pause' | 'resume' | 'complete' | 'checkin';

export interface GoalsAndChallengesProps {
  userGoals: Goal[];
  onStartChallenge: (challenge: Challenge) => Promise<void>;
  onUpdateGoal: (goalId: string, action: GoalAction) => Promise<void>;
}
export interface AIInsightsProps {
  insights: Insight[];
  personalizedRecommendations: Array<{
    type: 'pattern' | 'health' | 'optimization';
    title: string;
    description: string;
    implementation: string;
    impact: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  onRequestAnalysis: (timeframe: string) => Promise<void>;
}
