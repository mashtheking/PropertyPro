import { 
  users, 
  properties, 
  clients, 
  appointments, 
  subscriptions,
  type User, 
  type InsertUser,
  type Property, 
  type InsertProperty,
  type Client, 
  type InsertClient,
  type Appointment, 
  type InsertAppointment,
  type Subscription,
  type InsertSubscription
} from "@shared/schema";
import { compare, hash } from "bcrypt";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateUserRewardUnits(userId: number, units: number): Promise<void>;
  updateUserPremiumStatus(userId: number, isPremium: boolean, premiumUntil: Date | null): Promise<void>;
  
  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getUserProperties(userId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getUserClients(userId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<void>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  getClientAppointments(clientId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;
  getUpcomingAppointmentsNeedingReminders(): Promise<Appointment[]>;
  markReminderSent(id: number): Promise<void>;
  
  // Subscription methods
  getCurrentSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  cancelSubscription(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private clients: Map<number, Client>;
  private appointments: Map<number, Appointment>;
  private subscriptions: Map<number, Subscription>;
  currentUserId: number;
  currentPropertyId: number;
  currentClientId: number;
  currentAppointmentId: number;
  currentSubscriptionId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.clients = new Map();
    this.appointments = new Map();
    this.subscriptions = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentClientId = 1;
    this.currentAppointmentId = 1;
    this.currentSubscriptionId = 1;

    // Add some demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      email: "demo@example.com",
      password: await hash("password", 10),
      first_name: "John",
      last_name: "Doe"
    };
    
    const user = await this.createUser(demoUser);
    
    // Add some reward units
    await this.updateUserRewardUnits(user.id, 5);
    
    // Create some properties
    const property1: InsertProperty = {
      user_id: user.id,
      name: "Modern Family Home",
      address: "123 Main St, Anytown, CA",
      price: 750000,
      description: "Beautiful modern family home with spacious rooms and a large backyard.",
      type: "House",
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2400,
      images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"]
    };
    
    const property2: InsertProperty = {
      user_id: user.id,
      name: "Downtown Luxury Apartment",
      address: "456 Park Ave, Downtown, NY",
      price: 550000,
      description: "Luxurious apartment in the heart of downtown with amazing city views.",
      type: "Apartment",
      bedrooms: 2,
      bathrooms: 2,
      square_feet: 1200,
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"]
    };
    
    await this.createProperty(property1);
    await this.createProperty(property2);
    
    // Create some clients
    const client1: InsertClient = {
      user_id: user.id,
      first_name: "Sarah",
      last_name: "Johnson",
      email: "sarah@example.com",
      phone: "555-123-4567",
      notes: "Interested in family homes in the suburbs."
    };
    
    const client2: InsertClient = {
      user_id: user.id,
      first_name: "Michael",
      last_name: "Smith",
      email: "michael@example.com",
      phone: "555-987-6543",
      notes: "Looking for downtown apartments with good investment potential."
    };
    
    const createdClient1 = await this.createClient(client1);
    const createdClient2 = await this.createClient(client2);
    
    // Create some appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const appointment1: InsertAppointment = {
      user_id: user.id,
      title: "Property Viewing",
      date: today.toISOString().split('T')[0],
      time: "14:00:00",
      location: "123 Main St, Anytown, CA",
      notes: "Show the kitchen and yard improvements.",
      client_id: createdClient1.id,
      property_id: 1,
      reminder_sent: false
    };
    
    const appointment2: InsertAppointment = {
      user_id: user.id,
      title: "Client Meeting",
      date: tomorrow.toISOString().split('T')[0],
      time: "10:00:00",
      location: "Downtown Office",
      notes: "Discuss financing options.",
      client_id: createdClient2.id,
      property_id: 2,
      reminder_sent: false
    };
    
    const appointment3: InsertAppointment = {
      user_id: user.id,
      title: "Contract Signing",
      date: dayAfterTomorrow.toISOString().split('T')[0],
      time: "16:00:00",
      location: "Legal Office",
      notes: "Bring all documentation.",
      client_id: createdClient1.id,
      property_id: 1,
      reminder_sent: false
    };
    
    await this.createAppointment(appointment1);
    await this.createAppointment(appointment2);
    await this.createAppointment(appointment3);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await hash(insertUser.password, 10);
    const id = this.currentUserId++;
    const now = new Date();
    
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword,
      is_premium: false,
      reward_units: 0,
      premium_until: null,
      created_at: now.toISOString(),
    };
    
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const passwordMatch = await compare(password, user.password);
    
    if (!passwordMatch) {
      return null;
    }
    
    return user;
  }

  async updateUserRewardUnits(userId: number, units: number): Promise<void> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...user,
      reward_units: units
    };
    
    this.users.set(userId, updatedUser);
  }

  async updateUserPremiumStatus(userId: number, isPremium: boolean, premiumUntil: Date | null): Promise<void> {
    const user = await this.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser: User = {
      ...user,
      is_premium: isPremium,
      premium_until: premiumUntil ? premiumUntil.toISOString() : null
    };
    
    this.users.set(userId, updatedUser);
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getUserProperties(userId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.user_id === userId,
    );
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const now = new Date();
    
    const property: Property = {
      ...insertProperty,
      id,
      created_at: now.toISOString(),
    };
    
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyUpdate: Partial<Property>): Promise<Property> {
    const property = await this.getProperty(id);
    
    if (!property) {
      throw new Error('Property not found');
    }
    
    const updatedProperty: Property = {
      ...property,
      ...propertyUpdate,
    };
    
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    if (!this.properties.has(id)) {
      throw new Error('Property not found');
    }
    
    this.properties.delete(id);
  }

  // Client methods
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getUserClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.user_id === userId,
    );
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const now = new Date();
    
    const client: Client = {
      ...insertClient,
      id,
      created_at: now.toISOString(),
    };
    
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientUpdate: Partial<Client>): Promise<Client> {
    const client = await this.getClient(id);
    
    if (!client) {
      throw new Error('Client not found');
    }
    
    const updatedClient: Client = {
      ...client,
      ...clientUpdate,
    };
    
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<void> {
    if (!this.clients.has(id)) {
      throw new Error('Client not found');
    }
    
    this.clients.delete(id);
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.user_id === userId,
    );
  }

  async getClientAppointments(clientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.client_id === clientId,
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const now = new Date();
    
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      reminder_sent: false,
      created_at: now.toISOString(),
    };
    
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.getAppointment(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    const updatedAppointment: Appointment = {
      ...appointment,
      ...appointmentUpdate,
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    if (!this.appointments.has(id)) {
      throw new Error('Appointment not found');
    }
    
    this.appointments.delete(id);
  }

  async getUpcomingAppointmentsNeedingReminders(): Promise<Appointment[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format the date to YYYY-MM-DD format
    const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
    
    return Array.from(this.appointments.values()).filter(appointment => {
      return (
        appointment.date === tomorrowDateStr &&
        !appointment.reminder_sent
      );
    });
  }

  async markReminderSent(id: number): Promise<void> {
    const appointment = await this.getAppointment(id);
    
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    const updatedAppointment: Appointment = {
      ...appointment,
      reminder_sent: true,
    };
    
    this.appointments.set(id, updatedAppointment);
  }

  // Subscription methods
  async getCurrentSubscription(userId: number): Promise<Subscription | undefined> {
    const userSubscriptions = Array.from(this.subscriptions.values()).filter(
      (subscription) => subscription.user_id === userId && subscription.status === 'active',
    );
    
    if (userSubscriptions.length === 0) {
      return undefined;
    }
    
    // Sort by start date descending to get the most recent subscription
    userSubscriptions.sort((a, b) => {
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
    
    return userSubscriptions[0];
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentSubscriptionId++;
    const now = new Date();
    
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      created_at: now.toISOString(),
    };
    
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async cancelSubscription(id: number): Promise<void> {
    const subscription = this.subscriptions.get(id);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }
    
    const updatedSubscription: Subscription = {
      ...subscription,
      status: 'cancelled',
      end_date: new Date().toISOString(),
    };
    
    this.subscriptions.set(id, updatedSubscription);
  }
}

// Create and export the storage instance
export const storage = new MemStorage();
