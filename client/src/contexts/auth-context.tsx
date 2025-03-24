import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/use-supabase';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean, error?: string }>;
  register: (userData: any) => Promise<{ success: boolean, error?: string }>;
  logout: () => Promise<{ success: boolean, error?: string }>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: supabaseLoading, error: supabaseError, login: supabaseLogin, register: supabaseRegister, logout: supabaseLogout } = useSupabase();
  
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile whenever user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest('GET', '/api/profile', undefined);
        const userData = await response.json();
        setProfile(userData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!supabaseLoading) {
      fetchProfile();
    }
  }, [user, supabaseLoading]);

  const login = async (email: string, password: string, rememberMe?: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await supabaseLogin(email, password, rememberMe);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const { email, password, fullName, username } = userData;
      
      const result = await supabaseRegister(email, password, { fullName, username });
      
      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Create the user profile in our database
      await apiRequest('POST', '/api/users', { email, fullName, username });
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await supabaseLogout();
      
      if (!result.success) {
        throw new Error(result.error || 'Logout failed');
      }
      
      setProfile(null);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (!user) return;
    
    try {
      const response = await apiRequest('GET', '/api/profile', undefined);
      const userData = await response.json();
      setProfile(userData);
    } catch (err: any) {
      console.error('Error refetching profile:', err);
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: profile,
        profile,
        isLoading: isLoading || supabaseLoading,
        error: error || supabaseError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refetchProfile,
      }}
    >
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
