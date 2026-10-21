import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const subscribers = pgTable("subscribers", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const trackHype = pgTable("track_hype", {
  track: text().primaryKey(),
  count: integer().notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});
