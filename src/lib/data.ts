import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { products as productsTable, type Product } from "@/db/schema";
import { SEED_PRODUCTS } from "@/lib/products";

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  const rows = await db.select({ value: count() }).from(productsTable);
  if (Number(rows[0]?.value ?? 0) === 0) {
    await db.insert(productsTable).values(SEED_PRODUCTS).onConflictDoNothing();
  }
  seeded = true;
}

const seedOrder = new Map(SEED_PRODUCTS.map((p, i) => [p.id, i]));

export async function getAllProducts(): Promise<Product[]> {
  await ensureSeeded();
  const rows = await db.select().from(productsTable);
  return rows.sort(
    (a, b) => (seedOrder.get(a.id) ?? 999) - (seedOrder.get(b.id) ?? 999)
  );
}

export async function getProduct(id: string): Promise<Product | null> {
  await ensureSeeded();
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getRecommendations(
  current: Product,
  take = 4
): Promise<Product[]> {
  const all = await getAllProducts();
  const sameCategory = all.filter(
    (p) => p.id !== current.id && p.category === current.category
  );
  const sameGender = all.filter(
    (p) =>
      p.id !== current.id &&
      p.category !== current.category &&
      p.gender === current.gender
  );
  return [...sameCategory, ...sameGender].slice(0, take);
}
