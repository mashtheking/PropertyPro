import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  isPremium: boolean("is_premium").default(false),
  rewardUnits: integer("reward_units").default(0),
  premiumExpiresAt: timestamp("premium_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Properties table
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  address: text("address").notNull(),
  price: doublePrecision("price").notNull(),
  description: text("description"),
  bedrooms: integer("bedrooms"),
  bathrooms: doublePrecision("bathrooms"),
  squareFeet: integer("square_feet"),
  status: text("status").default("Active"),
  images: jsonb("images"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

// Clients table
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  clientType: text("client_type").default("Buyer"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  appointmentType: text("appointment_type").default("Property Viewing"),
  clientId: integer("client_id").references(() => clients.id),
  propertyId: integer("property_id").references(() => properties.id),
  notes: text("notes"),
  sendReminder: boolean("send_reminder").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  reminderSent: true,
  createdAt: true,
});

// Subscription table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paypalSubscriptionId: text("paypal_subscription_id"),
  status: text("status").default("active"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

// Feature Access table
export const featureAccess = pgTable("feature_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  featureName: text("feature_name").notNull(),
  accessExpiresAt: timestamp("access_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFeatureAccessSchema = createInsertSchema(featureAccess).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type FeatureAccess = typeof featureAccess.$inferSelect;
export type InsertFeatureAccess = z.infer<typeof insertFeatureAccessSchema>;
