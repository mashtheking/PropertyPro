import { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getCurrentUser, getSession, signIn, signOut, signUp } from '@/lib/supabase';

export const useSupabase = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize session and user
  useEffect(() => {
    const initSession = async () => {
      setLoading(true);
      try {
        // Get current session
        const { data, error } = await getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (err: any) {
        console.error('Error getting session:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string, rememberMe?: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await signIn(email, password);
        
        if (error) {
          throw error;
        }
        
        if (data?.user) {
          setUser(data.user);
          setSession(data.session);
        }
        
        return { success: true, data };
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Register function
  const register = useCallback(
    async (email: string, password: string, userData: any) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await signUp(email, password, userData);
        
        if (error) {
          throw error;
        }
        
        return { success: true, data };
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(err.message);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      return { success: true };
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user profile from the database
  const fetchUserProfile = useCallback(async () => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  }, [user]);

  return {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    fetchUserProfile,
  };
};
