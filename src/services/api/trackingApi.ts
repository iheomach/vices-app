import { BaseApi, ApiConfig } from './apiUtils';
import { JournalEntry, Stats } from '../../types/tracking';
import { Insight } from '../../types/sharedTypes';

export class TrackingApi extends BaseApi {
  constructor(config: ApiConfig = {}) {
    super(config);
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const response = await this.fetchWithAuth('/tracking/journal/');
    return response.json();
  }

  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'>): Promise<JournalEntry> {
    const response = await this.fetchWithAuth('/tracking/journal/', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return response.json();
  }

  async updateJournalEntry(id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> {
    const response = await this.fetchWithAuth(`/tracking/journal/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(entry),
    });
    return response.json();
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await this.fetchWithAuth(`/tracking/journal/${id}/`, {
      method: 'DELETE',
    });
  }

  async getStats(): Promise<Stats> {
    const response = await this.fetchWithAuth('/tracking/stats/');
    return response.json();
  }

  async getInsights(): Promise<Insight[]> {
    const response = await this.fetchWithAuth('/tracking/insights/');
    return response.json();
  }

  async getConsumptionByDate(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const response = await this.fetchWithAuth(
      `/tracking/journal/?start_date=${startDate}&end_date=${endDate}`
    );
    return response.json();
  }
}
