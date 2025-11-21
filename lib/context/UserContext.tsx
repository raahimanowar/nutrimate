'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  role: string;
  height?: number;
  weight?: number;
  dateOfBirth?: string;
  profilePic?: string;
  householdSize?: number;
  address?: {
    country?: string;
    city?: string;
  };
  budgetPreferences?: {
    monthlyBudget?: number;
    spendingCategories?: {
      groceries?: number;
      diningOut?: number;
      supplements?: number;
      other?: number;
    };
  };
  dietaryNeeds?: {
    dietType?: 'balanced' | 'plantBased' | 'lowCarb' | 'highProtein';
    allergies?: string[];
    caloriesPerDay?: number;
    macroTargets?: {
      protein?: number;
      carbs?: number;
      fats?: number;
    };
    waterIntakeGoal?: number;
    avoidIngredients?: string[];
  };
}

interface UserContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  fetchUserInfo: () => Promise<void>;
  updateUserInfo: (updatedUser: Partial<UserInfo>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Fetch user info from backend using token
  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'Failed to fetch user info';
      setError(errorMessage);
      setIsAuthenticated(false);
      // Clear token if it's invalid
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        localStorage.removeItem('authToken');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update user info in state
  const updateUserInfo = (updatedUser: Partial<UserInfo>) => {
    setUser((prevUser) => {
      if (prevUser) {
        return { ...prevUser, ...updatedUser };
      }
      return prevUser;
    });
  };

  // Clear user data
  const clearUser = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('rememberMe');
  };

  // Fetch user info on mount and when token changes
  useEffect(() => {
    fetchUserInfo();
  }, []);

  const value: UserContextType = {
    user,
    loading,
    error,
    fetchUserInfo,
    updateUserInfo,
    clearUser,
    isAuthenticated,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook to use UserContext
export const useUserInfo = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
};
