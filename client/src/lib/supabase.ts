import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';

// Create a Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication helpers
export const signUp = async (email: string, password: string, fullName: string, username: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username,
        }
      }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Real-time subscription setup
export const subscribeToTable = (tableName: string, callback: (payload: any) => void) => {
  const subscription = supabase
    .channel(`${tableName}-changes`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      payload => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
};
