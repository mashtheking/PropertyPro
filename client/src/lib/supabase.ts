import { createClient } from '@supabase/supabase-js';
import type { User, InsertUser } from '@shared/schema';

const supabaseUrl = 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Auth functions
export async function signUpUser(email: string, password: string, firstName: string, lastName: string): Promise<User> {
  // First, create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // Next, create the user record in our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([
      {
        email,
        first_name: firstName,
        last_name: lastName,
        password: '', // We store the hashed password in auth, not here
        is_premium: false,
        reward_units: 5, // Give new users 5 reward units to start
      },
    ])
    .select()
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return userData as User;
}

export async function signInUser(email: string, password: string, rememberMe: boolean = false): Promise<User> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  // Get the user record from our users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (userError) {
    throw new Error(userError.message);
  }

  return userData as User;
}

export async function signOutUser(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !sessionData.session) {
    return null;
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', sessionData.session.user.email)
    .single();

  if (userError) {
    return null;
  }

  return userData as User;
}

// Real-time subscription setup
export function setupRealtimeSubscription(
  table: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
      callback(payload);
    })
    .subscribe();
}

// User premium status functions
export async function upgradeUserToPremium(userId: number, subscriptionId: string, endDate: Date): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      is_premium: true,
      premium_until: endDate.toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  // Also create a record in the subscriptions table
  const { error: subError } = await supabase
    .from('subscriptions')
    .insert([
      {
        user_id: userId,
        paypal_subscription_id: subscriptionId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      },
    ]);

  if (subError) {
    throw new Error(subError.message);
  }
}

// Ad reward units functions
export async function updateUserRewardUnits(userId: number, units: number): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({
      reward_units: units,
    })
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function incrementUserRewardUnits(userId: number, amount: number = 1): Promise<number> {
  const { data: userData, error: getUserError } = await supabase
    .from('users')
    .select('reward_units')
    .eq('id', userId)
    .single();

  if (getUserError) {
    throw new Error(getUserError.message);
  }

  const currentUnits = userData.reward_units;
  const newUnits = currentUnits + amount;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      reward_units: newUnits,
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return newUnits;
}

export async function decrementUserRewardUnits(userId: number, amount: number = 1): Promise<number> {
  const { data: userData, error: getUserError } = await supabase
    .from('users')
    .select('reward_units')
    .eq('id', userId)
    .single();

  if (getUserError) {
    throw new Error(getUserError.message);
  }

  const currentUnits = userData.reward_units;
  if (currentUnits < amount) {
    throw new Error('Not enough reward units');
  }

  const newUnits = currentUnits - amount;

  const { error: updateError } = await supabase
    .from('users')
    .update({
      reward_units: newUnits,
    })
    .eq('id', userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return newUnits;
}
