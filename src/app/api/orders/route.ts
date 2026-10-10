import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";

function makeOrderId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LW-${stamp}-${rand}`;
}

export async function POST(req: Request) {
  let body: {
    items?: unknown;
    amount?: number;
    email?: string;
    name?: string;
    razorpayOrderId?: string | null;
    razorpayPaymentId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || typeof body.amount !== "number") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const id = makeOrderId();

  try {
    await db.insert(orders).values({
      id,
      razorpayOrderId: body.razorpayOrderId ?? null,
      razorpayPaymentId: body.razorpayPaymentId ?? null,
      email: body.email ?? null,
      amount: Math.round(body.amount),
      items: body.items,
      status: body.razorpayPaymentId ? "paid" : "created",
    });
    return NextResponse.json({ id, saved: true });
  } catch (err) {
    console.error("Order save failed:", err);
    // Still confirm to the shopper; order lands in logs for reconciliation
    return NextResponse.json({ id, saved: false });
  }
}
