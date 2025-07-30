// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// User interface matching your Django User model
interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string;
  
  // Location preferences
  city: string;
  province: string;
  postal_code: string;
  latitude: number | null;
  longitude: number | null;
  
  // Consumption preferences
  preferred_categories: string[];
  tolerance_level: string;
  favorite_effects: string[];
  account_tier: string;
  consumption_goals: string[];

  // Preferences
  receive_deal_notifications: boolean;
  
  // Account info
  is_verified: boolean;
  date_of_birth: string | null; // ISO date string
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, remember_me?: boolean) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  setUser: (user: User) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on app start
  useEffect(() => {
    // First, check localStorage (remember me was checked)
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('userData');
    
    // Then check sessionStorage (remember me was not checked)
    const sessionToken = sessionStorage.getItem('authToken');
    const sessionUser = sessionStorage.getItem('userData');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoading(false);
    } else if (sessionToken && sessionUser) {
      setToken(sessionToken);
      setUser(JSON.parse(sessionUser));
      setIsLoading(false);
    } else {
      // No saved authentication
      setIsLoading(false);
    }
  }, []);

  // Debug middleware to check authentication state changes
  useEffect(() => {
    console.log('Auth state changed:', {
      isAuthenticated: !!user, 
      user, 
      token, 
      isLoading 
    });
  }, [user, token, isLoading]);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/`, {
        headers: { 
          'Authorization': `Token ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // If backend doesn't return account_tier, preserve existing value or default to 'free'
        const currentUser = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const updatedUser = {
          ...currentUser,
          ...userData,
          account_tier: userData.account_tier || currentUser.account_tier || 'free'
        };
        setUser(updatedUser);
      } else {
        // Token is invalid, logout
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Format the data to match backend expectations
      const formattedData = {
        firstName: userData.first_name,
        lastName: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        location: userData.city || 'Unknown', // Backend requires a location field
        date_of_birth: userData.date_of_birth
      };
      
      // console.log('Sending registration data:', formattedData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      const data = await response.json();
      // console.log('Registration response:', data);

      if (response.ok) {
        // Create a temporary token since the backend doesn't provide one yet
        setToken(data.token);
        setUser(data.user);
        
        // For registration, we default to using localStorage (similar to remember me)
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, remember_me: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // console.log('Login attempt with:', { email, password });
      
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/login/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ 
            email, 
            password 
          })
        });

        // console.log('Login response status:', response.status);
        const data = await response.json();
        console.log('🔍 Full login response data:', JSON.stringify(data, null, 2));
        console.log('🔍 Backend user data:', data.user);
        console.log('🔍 All user keys:', Object.keys(data.user || {}));
        console.log('🔍 Backend account_tier:', data.user?.account_tier);
        console.log('🔍 account_tier type:', typeof data.user?.account_tier);

        if (response.ok) {
          // Extract the user from the backend response
          const userData: User = {
            id: data.user.id,
            email: data.user.email,
            username: data.user.email, // Using email as username
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            phone: '',
            city: '',
            province: '',
            postal_code: '',
            latitude: null,
            longitude: null,
            preferred_categories: [],
            tolerance_level: '',
            favorite_effects: [],
            account_tier: data.user.account_tier || 'free', // ✅ USE BACKEND DATA
            consumption_goals: [],
            receive_deal_notifications: true,
            is_verified: true, // Assuming the user is verified upon successful login
            date_of_birth: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('🔍 Created userData object:', userData);
          console.log('🔍 Final account_tier value:', userData.account_tier);
          console.log('🔍 Account tier source:', {
            from_backend: data.user?.account_tier,
            fallback_used: !data.user?.account_tier,
            final_value: userData.account_tier
          });
          
          setUser(userData);
          
          // Since we're not using tokens yet in the backend, we'll create a simple token
          setToken(data.token);
          
          // Store authentication info based on remember_me option
          if (remember_me) {
            // Store in localStorage (persists even when browser is closed)
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(userData));
            // console.log('Credentials stored in localStorage (Remember Me enabled)');
          } else {
            // Store in sessionStorage (cleared when browser is closed)
            sessionStorage.setItem('authToken', data.token);
            sessionStorage.setItem('userData', JSON.stringify(userData));
            // console.log('Credentials stored in sessionStorage (Remember Me disabled)');
          }
          
          console.log('Login successful, user set to:', userData);
        } else {
          console.error('Login failed:', data.error || 'Unknown error');
          throw new Error(data.error || 'Login failed: ' + response.status);
        }
      } catch (fetchError) {
        console.error('Network error during login:', fetchError);
        throw new Error('Network error. Please check your connection and try again.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!token) throw new Error('No auth token');

    setError(null);
    
    try {
      console.log('Sending update request with data:', userData);
      console.log('Data type check:', typeof userData, Object.keys(userData));
      console.log('JSON stringified data:', JSON.stringify(userData));
      console.log('Using token:', token);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile/`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(userData)
      });

      console.log('Update response status:', response.status);
      console.log('Response headers available:', response.headers);
      
      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Update successful, received user:', updatedUser);
        setUser(updatedUser);
        
        // Update stored user data in localStorage/sessionStorage
        const currentStoredToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        if (currentStoredToken) {
          if (localStorage.getItem('authToken')) {
            localStorage.setItem('userData', JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem('userData', JSON.stringify(updatedUser));
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Update failed with error data:', errorData);
        console.error('Full response details:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          errorData
        });
        throw new Error(errorData.message || errorData.error || errorData.detail || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update user catch block error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setError(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    
    // Clear both localStorage and sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    console.log('Logged out, all auth data cleared');
  };

  const clearError = () => {
    setError(null);
  };

  // Helper function to update user and persist to storage
  const updateUserDirectly = (updatedUser: User) => {
    setUser(updatedUser);
    
    // Update stored user data in localStorage/sessionStorage
    const currentStoredToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (currentStoredToken) {
      if (localStorage.getItem('authToken')) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      } else {
        sessionStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    }
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    updateUser,
    setUser: updateUserDirectly,
    isLoading,
    isAuthenticated: !!user,
    isVerified: user?.is_verified || false,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types for other components to use
export type { User, RegisterData };