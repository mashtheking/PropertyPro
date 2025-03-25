import { 
  users, 
  properties, 
  clients, 
  appointments, 
  subscriptions, 
  User, 
  InsertUser, 
  Property, 
  InsertProperty, 
  Client, 
  InsertClient, 
  Appointment, 
  InsertAppointment, 
  Subscription, 
  InsertSubscription 
} from "@shared/schema";
import { createClient, SupabaseClient, PostgrestError } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://ewmjparrdpjurafbkklb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bWpwYXJyZHBqdXJhZmJra2xiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MDkxNDQsImV4cCI6MjA1ODI4NTE0NH0.fEDsOQkjwOQUoFJRGClWrIra40MbNygpDu37xGZJMz4';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Test and log database connection
supabase.from('users').select('count', { count: 'exact' })
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Property methods
  getProperties(userId: number): Promise<Property[]>;
  getProperty(id: number, userId: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, userId: number, propertyData: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number, userId: number): Promise<boolean>;
  
  // Client methods
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number, userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, userId: number, clientData: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number, userId: number): Promise<boolean>;
  
  // Appointment methods
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number, userId: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, userId: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number, userId: number): Promise<boolean>;
  
  // Subscription methods
  getSubscription(id: number): Promise<Subscription | undefined>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Reward methods
  addRewardUnits(userId: number, amount: number): Promise<User | undefined>;
  useRewardUnits(userId: number, amount: number): Promise<User | undefined>;
}

export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Add emailVerified field to the user data
    const userData = {
      ...user,
      emailVerified: false,
      rewardUnits: 5 // Start with 5 reward units
    };
    
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  // Property methods
  async getProperties(userId: number): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data as Property[];
  }

  async getProperty(id: number, userId: number): Promise<Property | undefined> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();
    
    if (error || !data) return undefined;
    return data as Property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert([property])
      .select()
      .single();
    
    if (error) throw error;
    return data as Property;
  }

  async updateProperty(id: number, userId: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const { data, error } = await supabase
      .from('properties')
      .update(propertyData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Property;
  }

  async deleteProperty(id: number, userId: number): Promise<boolean> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
      .eq('userId', userId);
    
    return !error;
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data as Client[];
  }

  async getClient(id: number, userId: number): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();
    
    if (error || !data) return undefined;
    return data as Client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .insert([client])
      .select()
      .single();
    
    if (error) throw error;
    return data as Client;
  }

  async updateClient(id: number, userId: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const { data, error } = await supabase
      .from('clients')
      .update(clientData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Client;
  }

  async deleteClient(id: number, userId: number): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('userId', userId);
    
    return !error;
  }

  // Appointment methods
  async getAppointments(userId: number): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('userId', userId);
    
    if (error) throw error;
    return data as Appointment[];
  }

  async getAppointment(id: number, userId: number): Promise<Appointment | undefined> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .eq('userId', userId)
      .single();
    
    if (error || !data) return undefined;
    return data as Appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    
    if (error) throw error;
    return data as Appointment;
  }

  async updateAppointment(id: number, userId: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const { data, error } = await supabase
      .from('appointments')
      .update(appointmentData)
      .eq('id', id)
      .eq('userId', userId)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Appointment;
  }

  async deleteAppointment(id: number, userId: number): Promise<boolean> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .eq('userId', userId);
    
    return !error;
  }

  // Subscription methods
  async getSubscription(id: number): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as Subscription;
  }

  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('userId', userId)
      .eq('status', 'active')
      .single();
    
    if (error || !data) return undefined;
    return data as Subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscription])
      .select()
      .single();
    
    if (error) throw error;
    return data as Subscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) return undefined;
    return data as Subscription;
  }

  // Reward methods
  async addRewardUnits(userId: number, amount: number): Promise<User | undefined> {
    // Get current reward units
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const newAmount = (user.rewardUnits || 0) + amount;
    
    return this.updateUser(userId, { rewardUnits: newAmount });
  }

  async useRewardUnits(userId: number, amount: number): Promise<User | undefined> {
    // Get current reward units
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    if ((user.rewardUnits || 0) < amount) {
      throw new Error('Not enough reward units');
    }
    
    const newAmount = (user.rewardUnits || 0) - amount;
    
    return this.updateUser(userId, { rewardUnits: newAmount });
  }
}

export const storage = new SupabaseStorage();
