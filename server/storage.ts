import { 
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  clients, type Client, type InsertClient,
  appointments, type Appointment, type InsertAppointment,
  activities, type Activity, type InsertActivity,
  subscriptions, type Subscription, type InsertSubscription
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Property methods
  getProperties(userId: number): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Client methods
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Appointment methods
  getAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getUpcomingAppointments(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  markAppointmentReminderSent(id: number): Promise<Appointment | undefined>;
  
  // Activity methods
  getActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Subscription methods
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private clients: Map<number, Client>;
  private appointments: Map<number, Appointment>;
  private activities: Map<number, Activity>;
  private subscriptions: Map<number, Subscription>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private clientIdCounter: number;
  private appointmentIdCounter: number;
  private activityIdCounter: number;
  private subscriptionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.clients = new Map();
    this.appointments = new Map();
    this.activities = new Map();
    this.subscriptions = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.clientIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.activityIdCounter = 1;
    this.subscriptionIdCounter = 1;
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
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false,
      rewardUnits: 0,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperties(userId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.userId === userId
    );
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date();
    const property: Property = {
      ...insertProperty,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const property = await this.getProperty(id);
    if (!property) return undefined;
    
    const now = new Date();
    const updatedProperty = { ...property, ...propertyData, updatedAt: now };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Client methods
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId
    );
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const now = new Date();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, clientData: Partial<Client>): Promise<Client | undefined> {
    const client = await this.getClient(id);
    if (!client) return undefined;
    
    const now = new Date();
    const updatedClient = { ...client, ...clientData, updatedAt: now };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Appointment methods
  async getAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getUpcomingAppointments(userId: number): Promise<Appointment[]> {
    const now = new Date();
    return Array.from(this.appointments.values())
      .filter(appointment => 
        appointment.userId === userId && 
        (new Date(`${appointment.date}T${appointment.time}`).getTime() > now.getTime())
      )
      .sort((a, b) => 
        new Date(`${a.date}T${a.time}`).getTime() - 
        new Date(`${b.date}T${b.time}`).getTime()
      );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const now = new Date();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      reminderSent: false,
      createdAt: now,
      updatedAt: now
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const now = new Date();
    const updatedAppointment = { ...appointment, ...appointmentData, updatedAt: now };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  async markAppointmentReminderSent(id: number): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, reminderSent: true };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  // Activity methods
  async getActivities(userId: number, limit?: number): Promise<Activity[]> {
    let activities = Array.from(this.activities.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      activities = activities.slice(0, limit);
    }
    
    return activities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = {
      ...insertActivity,
      id,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }

  // Subscription methods
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values()).find(
      (subscription) => subscription.userId === userId
    );
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const id = this.subscriptionIdCounter++;
    const now = new Date();
    const subscription: Subscription = {
      ...insertSubscription,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async updateSubscription(userId: number, subscriptionData: Partial<Subscription>): Promise<Subscription | undefined> {
    const subscription = await this.getSubscription(userId);
    if (!subscription) return undefined;
    
    const now = new Date();
    const updatedSubscription = { ...subscription, ...subscriptionData, updatedAt: now };
    this.subscriptions.set(subscription.id, updatedSubscription);
    return updatedSubscription;
  }
}

export const storage = new MemStorage();
