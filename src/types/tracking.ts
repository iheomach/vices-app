export type SubstanceType = 'cannabis' | 'alcohol' | 'wellness' | 'both' | 'none';

export interface JournalEntry {
  id?: string;
  user?: string;
  date: string;
  timestamp: string;
  substance?: SubstanceType;
  amount?: string;
  mood: number; // 1-10
  sleep_quality: number; // 1-10
  effects: string;
  notes: string;
  tags: string[];
  sleep?: number; // 1-24
}

export interface Stats {
  id?: string;
  user?: string;
  mindful_days: number;
  sleep_quality: number;
  sleep_improvement: number;
  mood_average: number;
  mood_trend: 'improving' | 'declining' | 'stable';
  last_calculated: string;
}
