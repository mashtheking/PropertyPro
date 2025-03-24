import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  isPremium: boolean;
  rewardUnits: number;
  premiumExpiresAt?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status !== 401) {
          throw new Error('Failed to fetch user data');
        }
        setUser(null);
        return null;
      }

      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching current user:', error);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Register new user
  const register = async (email: string, password: string, fullName: string, username: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/register', {
        email,
        password,
        username,
        fullName,
      });
      
      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', {
        email,
        password,
      });
      
      const userData = await res.json();
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (profileData: { fullName?: string; email?: string }) => {
    try {
      const res = await apiRequest('PUT', `/api/users/${user?.id}`, profileData);
      const updatedUser = await res.json();
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    fetchCurrentUser,
  };
};
