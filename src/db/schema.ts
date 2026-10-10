import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gender: text("gender").notNull(), // women | men | kids | baby
  category: text("category").notNull(), // tops | bottoms | outerwear | knitwear | dresses | skirts | innerwear
  price: integer("price").notNull(), // in rupees
  salePrice: integer("sale_price"), // in rupees, null when not on sale
  image: text("image").notNull(),
  colors: text("colors").array().notNull(),
  sizes: text("sizes").array().notNull(),
  description: text("description").notNull(),
  fabric: text("fabric").notNull(),
  care: text("care").notNull(),
  tags: text("tags").array().notNull(),
  isNew: boolean("is_new").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
});

export const abandonedCheckouts = pgTable("abandoned_checkouts", {
  token: text("token").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  productName: text("product_name").notNull(),
  status: text("status").notNull().default("pending"), // pending | calling | called | cancelled | failed
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  calledAt: timestamp("called_at", { withTimezone: true }),
  error: text("error"),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  email: text("email"),
  amount: integer("amount").notNull(), // in paise
  items: jsonb("items").notNull(),
  status: text("status").notNull().default("paid"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
