import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    }
  });

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { data, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};
