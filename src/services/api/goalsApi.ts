import { BaseApi, ApiConfig } from './apiUtils';
import { Goal } from '../../types/goals';
import { Challenge } from '../../types/sharedTypes';

export class GoalsApi extends BaseApi {
  constructor(config: ApiConfig = {}) {
    super(config);
  }

  async getGoals(): Promise<Goal[]> {
    const response = await this.fetchWithAuth('/goals/');
    return response.json();
  }

  async createGoal(challenge: Challenge): Promise<Goal> {
    // Calculate end_date from duration (e.g., "7 days" -> 7 days from now)
    let endDate = null;
    if (challenge.duration && challenge.duration.includes('day')) {
      try {
        const days = parseInt(challenge.duration.split(' ')[0]);
        const end = new Date();
        end.setDate(end.getDate() + days);
        endDate = end.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } catch (error) {
        console.warn('Could not parse duration:', challenge.duration);
      }
    }

    const goalData = {
      title: challenge.title,
      description: challenge.description,
      substance_type: challenge.substance_type,
      duration: challenge.duration,
      benefits: challenge.benefits,
      status: 'active',
      progress: 0,
      challenge: challenge.id,
      // Add the missing fields with sensible defaults
      target_value: 100,
      target_unit: '%',
      current_value: 0,
      end_date: endDate
    };

    const response = await this.fetchWithAuth('/goals/', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create goal: ${error}`);
    }

    return response.json();
  }

  async updateGoal(id: string, goal: Partial<Goal>): Promise<Goal> {
    const response = await this.fetchWithAuth(`/goals/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(goal),
    });
    return response.json();
  }

  async updateGoalProgress(id: string, progress: number): Promise<Goal> {
    return this.updateGoal(id, { progress });
  }

  async deleteGoal(id: string): Promise<void> {
    await this.fetchWithAuth(`/goals/${id}/`, {
      method: 'DELETE',
    });
  }
}