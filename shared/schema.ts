import { pgTable, text, serial, integer, boolean, timestamp, date, time, foreignKey, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  is_premium: boolean("is_premium").default(false).notNull(),
  reward_units: integer("reward_units").default(0).notNull(),
  premium_until: timestamp("premium_until"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  first_name: true,
  last_name: true,
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  square_feet: integer("square_feet").notNull(),
  images: text("images").array(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertPropertySchema = createInsertSchema(properties).pick({
  user_id: true,
  name: true,
  address: true,
  price: true,
  description: true,
  type: true,
  bedrooms: true,
  bathrooms: true,
  square_feet: true,
  images: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  user_id: true,
  first_name: true,
  last_name: true,
  email: true,
  phone: true,
  notes: true,
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: date("date").notNull(),
  time: time("time").notNull(),
  location: text("location"),
  notes: text("notes"),
  client_id: integer("client_id").references(() => clients.id),
  property_id: integer("property_id").references(() => properties.id),
  reminder_sent: boolean("reminder_sent").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  user_id: true,
  title: true,
  date: true,
  time: true,
  location: true,
  notes: true,
  client_id: true,
  property_id: true,
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull().references(() => users.id),
  paypal_subscription_id: text("paypal_subscription_id").notNull(),
  status: text("status").notNull(),
  start_date: timestamp("start_date").notNull(),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  user_id: true,
  paypal_subscription_id: true,
  status: true,
  start_date: true,
  end_date: true,
});

// Set up types for all schemas
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
