// services/api/apiUtils.ts
export interface ApiConfig {
  baseUrl?: string;
  token?: string | null;
}

export const getAuthHeaders = (token: string | null) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Token ${token}`; // ✅ FIXED: Changed from "Bearer" to "Token"
  }

  return headers;
};

export class BaseApi {
  protected baseUrl: string;
  protected token: string | null;

  constructor(config: ApiConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    // ✅ FIXED: Get token from storage if not provided in config
    this.token = config.token || this.getStoredToken();
  }

  // ✅ NEW: Method to get token from storage
  private getStoredToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  protected async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // ✅ FIXED: Always get fresh token from storage
    const currentToken = this.token || this.getStoredToken();
    const headers = getAuthHeaders(currentToken);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized. Please log in again.');
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. You do not have permission for this action.');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }
}

export async function requestPasswordChange(token: string) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/request-password-change/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to request password change');
  return data;
}

export async function confirmPasswordChange(token: string, code: string, newPassword: string) {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/confirm-password-change/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify({ code, new_password: newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to change password');
  return data;
}