import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let amount: number | null = null;
  try {
    const body = (await req.json()) as { amount?: number };
    if (typeof body.amount === "number" && body.amount > 0) {
      amount = Math.round(body.amount);
    }
  } catch {
    /* fall through */
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!amount || !keyId || !secret) {
    return NextResponse.json({ orderId: null });
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${keyId}:${secret}`).toString("base64"),
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `lw_${Date.now()}`,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ orderId: null });
    }
    const data = (await res.json()) as { id?: string };
    return NextResponse.json({ orderId: data.id ?? null });
  } catch {
    // Network unavailable (e.g. sandboxed preview) — client falls back
    return NextResponse.json({ orderId: null });
  }
}
