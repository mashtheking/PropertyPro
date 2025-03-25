import { pgTable, text, serial, integer, boolean, timestamp, jsonb, uuid, numeric, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  profileImage: text("profile_image"),
  isPremium: boolean("is_premium").default(false).notNull(),
  rewardUnits: integer("reward_units").default(0).notNull(),
  emailVerified: boolean("email_verified").default(false),
  subscriptionStatus: text("subscription_status").default("free"),
  subscriptionId: text("subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    username: true,
    password: true,
    fullName: true,
  })
  .extend({
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  propertyType: text("property_type").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  price: numeric("price").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: numeric("bathrooms"),
  squareFeet: numeric("square_feet"),
  lotSize: numeric("lot_size"),
  yearBuilt: integer("year_built"),
  status: text("status").notNull().default("Active"),
  description: text("description"),
  images: jsonb("images").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(properties)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  clientType: text("client_type").notNull(), // Buyer, Seller, Both, Lead
  status: text("status").notNull().default("Active"),
  address: text("address"),
  preferences: text("preferences"),
  notes: text("notes"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  clientId: integer("client_id").references(() => clients.id),
  propertyId: integer("property_id").references(() => properties.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(), 
  location: text("location").notNull(),
  description: text("description"),
  emailReminder: boolean("email_reminder").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({
    id: true,
    reminderSent: true,
    createdAt: true,
    updatedAt: true,
  });

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  paypalSubscriptionId: text("paypal_subscription_id").notNull(),
  status: text("status").notNull(), // active, cancelled, suspended, expired
  planType: text("plan_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  lastBillingDate: timestamp("last_billing_date"),
  nextBillingDate: timestamp("next_billing_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Login = z.infer<typeof loginSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
