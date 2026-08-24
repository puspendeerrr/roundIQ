'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { apiClient } from '../lib/api-client';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('roundiq_access_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const response: any = await apiClient.get('/auth/me');
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      localStorage.removeItem('roundiq_access_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem('roundiq_access_token', accessToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('roundiq_access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
