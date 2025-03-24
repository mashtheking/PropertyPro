import { 
  users, type User, type InsertUser, 
  properties, type Property, type InsertProperty,
  clients, type Client, type InsertClient,
  appointments, type Appointment, type InsertAppointment,
  subscriptions, type Subscription, type InsertSubscription,
  featureAccess, type FeatureAccess, type InsertFeatureAccess
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Property operations
  getProperties(userId: number): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Client operations
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Appointment operations
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUpcomingAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
  
  // Feature access operations
  getFeatureAccess(userId: number, featureName: string): Promise<FeatureAccess | undefined>;
  createFeatureAccess(featureAccess: InsertFeatureAccess): Promise<FeatureAccess>;
  deleteFeatureAccess(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private clients: Map<number, Client>;
  private appointments: Map<number, Appointment>;
  private subscriptions: Map<number, Subscription>;
  private featureAccesses: Map<number, FeatureAccess>;
  
  private userId: number;
  private propertyId: number;
  private clientId: number;
  private appointmentId: number;
  private subscriptionId: number;
  private featureAccessId: number;
  
  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.clients = new Map();
    this.appointments = new Map();
    this.subscriptions = new Map();
    this.featureAccesses = new Map();
    
    this.userId = 1;
    this.propertyId = 1;
    this.clientId = 1;
    this.appointmentId = 1;
    this.subscriptionId = 1;
    this.featureAccessId = 1;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = await this.getUser(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Property operations
  async getProperties(userId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(property => property.userId === userId);
  }
  
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }
  
  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyId++;
    const now = new Date();
    const property: Property = { ...insertProperty, id, createdAt: now };
    this.properties.set(id, property);
    return property;
  }
  
  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const existingProperty = await this.getProperty(id);
    if (!existingProperty) return undefined;
    
    const updatedProperty = { ...existingProperty, ...propertyData };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }
  
  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }
  
  // Client operations
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const now = new Date();
    const client: Client = { ...insertClient, id, createdAt: now };
    this.clients.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const existingClient = await this.getClient(id);
    if (!existingClient) return undefined;
    
    const updatedClient = { ...existingClient, ...clientData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  // Appointment operations
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.userId === userId);
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getUpcomingAppointments(userId: number): Promise<Appointment[]> {
    const now = new Date();
    return Array.from(this.appointments.values())
      .filter(appointment => appointment.userId === userId && new Date(appointment.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentId++;
    const now = new Date();
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      reminderSent: false, 
      createdAt: now 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }
  
  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const existingAppointment = await this.getAppointment(id);
    if (!existingAppointment) return undefined;
    
    const updatedAppointment = { ...existingAppointment, ...appointmentData };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
  
  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(sub => sub.userId === userId);
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionId++;
    const now = new Date();
    const subscription: Subscription = { ...insertSubscription, id, createdAt: now };
    this.subscriptions.set(id, subscription);
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const existingSubscription = await this.getSubscription(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription = { ...existingSubscription, ...subscriptionData };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Feature access operations
  async getFeatureAccess(userId: number, featureName: string): Promise<FeatureAccess | undefined> {
    return Array.from(this.featureAccesses.values())
      .find(access => access.userId === userId && access.featureName === featureName);
  }
  
  async createFeatureAccess(insertFeatureAccess: InsertFeatureAccess): Promise<FeatureAccess> {
    const id = this.featureAccessId++;
    const now = new Date();
    const featureAccess: FeatureAccess = { ...insertFeatureAccess, id, createdAt: now };
    this.featureAccesses.set(id, featureAccess);
    return featureAccess;
  }
  
  async deleteFeatureAccess(id: number): Promise<boolean> {
    return this.featureAccesses.delete(id);
  }
}

export const storage = new MemStorage();
