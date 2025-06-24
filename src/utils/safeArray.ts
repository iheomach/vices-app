// utils/safeArray.ts
export const safeArray = <T = any>(data: T[] | null | undefined | any): T[] => {
  return Array.isArray(data) ? data : [];
};

export const safeSlice = <T = any>(data: T[] | null | undefined | any, start: number, end?: number): T[] => {
  return safeArray<T>(data).slice(start, end);
};

// Alternative version with more explicit typing
export const safeCast = <T>(data: unknown): T[] => {
  return Array.isArray(data) ? data as T[] : [];
};

// Specific typed versions for your data types
import { Goal } from '../types/goals';
import { JournalEntry, Stats } from '../types/tracking';
import { Insight } from '../types/sharedTypes';

export const safeGoals = (data: any): Goal[] => {
  return Array.isArray(data) ? data : [];
};

export const safeJournalEntries = (data: any): JournalEntry[] => {
  return Array.isArray(data) ? data : [];
};

export const safeInsights = (insights: any): Insight[] => {
  if (!insights) return [];
  // If it's already an array, use it directly
  if (Array.isArray(insights)) return insights;
  // If it's a paginated response, use the results
  if (insights.results && Array.isArray(insights.results)) return insights.results;
  // Otherwise return empty array
  return [];
};

// Generic version that works with any type
export const ensureArray = <T>(data: T[] | T | null | undefined | any): T[] => {
  if (Array.isArray(data)) return data;
  if (data !== null && data !== undefined) return [data];
  return [];
};