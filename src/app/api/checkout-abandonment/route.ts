import { NextResponse } from "next/server";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/db";
import { abandonedCheckouts } from "@/db/schema";

export const runtime = "nodejs";

const DELAY_MS = 2 * 60 * 1000;
const VAPI_ENDPOINT = "https://api.vapi.ai/call/phone";

interface RequestBody {
  action?: "schedule" | "cancel";
  token?: string;
  customer_name?: string;
  customer_phone?: string;
  cart_item_name?: string;
}

function normalizeIndianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);
  if (digits.length < 10 || digits.length > 15) return null;
  return `+91${digits}`;
}

async function initiateVapiCall(token: string) {
  // Claim the job atomically so multiple pagehide beacons cannot create calls.
  const claimed = await db
    .update(abandonedCheckouts)
    .set({ status: "calling" })
    .where(
      and(
        eq(abandonedCheckouts.token, token),
        eq(abandonedCheckouts.status, "pending"),
        lte(abandonedCheckouts.scheduledAt, new Date())
      )
    )
    .returning();

  const job = claimed[0];
  if (!job) return;

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    await db
      .update(abandonedCheckouts)
      .set({ status: "failed", error: "VAPI_API_KEY is not configured" })
      .where(eq(abandonedCheckouts.token, token));
    console.error("Cart recovery call skipped: VAPI_API_KEY is not configured");
    return;
  }

  const number = normalizeIndianPhone(job.customerPhone);
  if (!number) {
    await db
      .update(abandonedCheckouts)
      .set({ status: "failed", error: "Invalid customer phone number" })
      .where(eq(abandonedCheckouts.token, token));
    return;
  }

  const payload = {
    assistantId: "3de65269-cc4c-46e2-a11e-706bcfec7e57",
    phoneNumberId: "f89cec0e-d78c-46ff-8699-68ca4c732004",
    customer: {
      number,
      name: job.customerName,
    },
    assistantOverrides: {
      variableValues: {
        customer_name: job.customerName,
        product_name: job.productName,
      },
    },
  };

  try {
    const response = await fetch(VAPI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = (await response.text()).slice(0, 1000);
      await db
        .update(abandonedCheckouts)
        .set({ status: "failed", error: `Vapi returned ${response.status}: ${errorText}` })
        .where(eq(abandonedCheckouts.token, token));
      console.error(`Vapi cart recovery request failed (${response.status})`);
      return;
    }

    await db
      .update(abandonedCheckouts)
      .set({ status: "called", calledAt: new Date(), error: null })
      .where(eq(abandonedCheckouts.token, token));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown network error";
    await db
      .update(abandonedCheckouts)
      .set({ status: "failed", error: message.slice(0, 1000) })
      .where(eq(abandonedCheckouts.token, token));
    console.error("Vapi cart recovery request could not be sent");
  }
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token || token.length > 128) {
    return NextResponse.json({ error: "Invalid checkout token" }, { status: 400 });
  }

  if (body.action === "cancel") {
    try {
      await db
        .update(abandonedCheckouts)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(abandonedCheckouts.token, token),
            eq(abandonedCheckouts.status, "pending")
          )
        );
      return NextResponse.json({ cancelled: true });
    } catch (error) {
      console.error("Could not cancel cart recovery job:", error);
      return NextResponse.json({ error: "Could not cancel scheduled call" }, { status: 500 });
    }
  }

  if (body.action !== "schedule") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  const customerName = body.customer_name?.trim();
  const rawPhone = body.customer_phone?.trim();
  const phone = rawPhone ? normalizeIndianPhone(rawPhone) : null;
  const productName = body.cart_item_name?.trim();

  if (
    !customerName ||
    customerName.length > 120 ||
    !rawPhone ||
    !phone ||
    !productName ||
    productName.length > 500
  ) {
    return NextResponse.json(
      { error: "A valid customer name, phone number and cart item are required" },
      { status: 400 }
    );
  }

  const scheduledAt = new Date(Date.now() + DELAY_MS);
  try {
    await db
      .insert(abandonedCheckouts)
      .values({
        token,
        customerName,
        customerPhone: rawPhone,
        productName,
        status: "pending",
        scheduledAt,
      })
      .onConflictDoUpdate({
        target: abandonedCheckouts.token,
        set: {
          customerName,
          customerPhone: rawPhone,
          productName,
          status: "pending",
          scheduledAt,
          error: null,
        },
      });

    // The record is durable; this process timer dispatches it after the delay.
    // The database status check makes duplicate beacons and cancellation safe.
    setTimeout(() => {
      void initiateVapiCall(token).catch((error: unknown) => {
        console.error("Cart recovery timer failed:", error);
      });
    }, DELAY_MS);

    return NextResponse.json({ scheduled: true, scheduledAt: scheduledAt.toISOString() });
  } catch (error) {
    console.error("Could not schedule cart recovery call:", error);
    return NextResponse.json({ error: "Could not schedule call" }, { status: 500 });
  }
}
