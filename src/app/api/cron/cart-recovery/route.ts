import { NextResponse } from "next/server";
import { db } from "@/db";
import { abandonedCheckouts } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";

const VAPI_ENDPOINT = "https://api.vapi.ai/call/phone";

function normalizeIndianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length > 10) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length > 10) digits = digits.slice(1);
  if (digits.length < 10 || digits.length > 15) return null;
  return `+91${digits}`;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Security check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔍 Checking for pending cart recovery calls...");

    // सब pending checkouts जिनका scheduledAt time हो गया
    const pendingJobs = await db
      .select()
      .from(abandonedCheckouts)
      .where(
        and(
          eq(abandonedCheckouts.status, "pending"),
          lte(abandonedCheckouts.scheduledAt, new Date())
        )
      );

    console.log(`Found ${pendingJobs.length} pending cart recovery calls`);

    let successCount = 0;
    let failureCount = 0;

    for (const job of pendingJobs) {
      try {
        // Mark as calling
        await db
          .update(abandonedCheckouts)
          .set({ status: "calling" })
          .where(eq(abandonedCheckouts.token, job.token));

        const number = normalizeIndianPhone(job.customerPhone);
        if (!number) {
          await db
            .update(abandonedCheckouts)
            .set({ status: "failed", error: "Invalid phone number format" })
            .where(eq(abandonedCheckouts.token, job.token));
          failureCount++;
          continue;
        }

        const apiKey = process.env.VAPI_API_KEY;
        if (!apiKey) {
          await db
            .update(abandonedCheckouts)
            .set({ status: "failed", error: "VAPI_API_KEY not configured" })
            .where(eq(abandonedCheckouts.token, job.token));
          failureCount++;
          continue;
        }

        // Call Vapi
        const response = await fetch(VAPI_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
          }),
          cache: "no-store",
        });

        if (response.ok) {
          await db
            .update(abandonedCheckouts)
            .set({ status: "called", calledAt: new Date(), error: null })
            .where(eq(abandonedCheckouts.token, job.token));
          console.log(`✅ Call sent for token: ${job.token}`);
          successCount++;
        } else {
          const errorText = await response.text();
          await db
            .update(abandonedCheckouts)
            .set({ status: "failed", error: `Vapi error: ${errorText.slice(0, 200)}` })
            .where(eq(abandonedCheckouts.token, job.token));
          console.error(`❌ Vapi returned ${response.status}`);
          failureCount++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        await db
          .update(abandonedCheckouts)
          .set({ status: "failed", error: errorMsg.slice(0, 200) })
          .where(eq(abandonedCheckouts.token, job.token));
        console.error(`❌ Error processing token ${job.token}:`, error);
        failureCount++;
      }
    }

    return NextResponse.json({
      status: "success",
      processed: pendingJobs.length,
      success: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Cron job failed:", error);
    return NextResponse.json(
      { error: "Cron job failed", details: String(error) },
      { status: 500 }
    );
  }
}