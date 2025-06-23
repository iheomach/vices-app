import { BaseApi, ApiConfig } from './apiUtils';
import { Goal } from '../../types/goals';

export class GoalsApi extends BaseApi {
  constructor(config: ApiConfig = {}) {
    super(config);
  }

  async getGoals(): Promise<Goal[]> {
    const response = await this.fetchWithAuth('/goals/');
    return response.json();
  }

  async createGoal(goal: Omit<Goal, 'id'>): Promise<Goal> {
    const response = await this.fetchWithAuth('/goals/', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
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
