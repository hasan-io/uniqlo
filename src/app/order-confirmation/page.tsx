"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Check } from "lucide-react";

function ConfirmationInner() {
  const params = useSearchParams();
  const orderId = params.get("id");

  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center border border-black">
        <Check size={30} strokeWidth={1.5} />
      </span>
      <h1 className="mt-6 text-[24px] uppercase tracking-hero">
        Thank you for your order
      </h1>
      <p className="mt-3 text-[14px] text-quiet">
        Your payment was successful and your order is confirmed. A receipt has
        been sent to your email address.
      </p>
      {orderId && (
        <div className="mt-6 w-full border border-hairline px-6 py-5">
          <p className="text-[12px] uppercase tracking-hero text-quiet">
            Order ID
          </p>
          <p className="mt-1 text-[18px] uppercase tracking-hero">{orderId}</p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/category/all"
          className="flex h-11 items-center justify-center bg-black px-8 text-[14px] uppercase tracking-hero text-white hover:bg-[#222]"
        >
          Continue shopping
        </Link>
        <Link
          href="/"
          className="flex h-11 items-center justify-center border border-black px-8 text-[14px] uppercase tracking-hero hover:bg-surface"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-[640px] px-4 py-20" />}
    >
      <ConfirmationInner />
    </Suspense>
  );
}
