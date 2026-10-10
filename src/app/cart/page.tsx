"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { formatINR, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/format";

export default function CartPage() {
  const { cart, subtotal, updateQty, removeFromCart, hydrated } = useShop();

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (!hydrated) {
    return <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-10" />;
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-24 lg:px-10">
        <ShoppingBag size={40} strokeWidth={1} />
        <h1 className="mt-5 text-[22px] uppercase tracking-hero">
          Your cart is empty
        </h1>
        <p className="mt-2 text-[14px] text-quiet">
          Add some LifeWear essentials to get started.
        </p>
        <Link
          href="/category/all"
          className="mt-6 flex h-11 items-center bg-black px-8 text-[14px] uppercase tracking-hero text-white hover:bg-[#222]"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 lg:px-10">
      <h1 className="text-[24px] uppercase tracking-hero">
        Shopping Cart{" "}
        <span className="text-[14px] normal-case text-quiet">
          ({cart.length} item{cart.length === 1 ? "" : "s"})
        </span>
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div>
          <div className="hidden border-b border-hairline pb-3 text-[12px] uppercase tracking-hero text-quiet sm:grid sm:grid-cols-[1fr_120px_100px]">
            <span>Item</span>
            <span className="text-center">Quantity</span>
            <span className="text-right">Total</span>
          </div>
          <ul>
            {cart.map((item) => (
              <li
                key={item.key}
                className="grid gap-4 border-b border-hairline py-5 sm:grid-cols-[1fr_120px_100px]"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/product/${item.id}`}
                    className="block h-32 w-24 shrink-0 overflow-hidden border border-hairline bg-surface"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/product/${item.id}`}
                      className="text-[14px] hover:underline hover:underline-offset-4"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-[13px] text-quiet">
                      Size {item.size} · {item.color}
                    </p>
                    <p className="mt-1 text-[13px]">
                      {formatINR(item.price)}
                      {item.originalPrice > item.price && (
                        <span className="ml-2 text-quiet line-through">
                          {formatINR(item.originalPrice)}
                        </span>
                      )}
                    </p>
                    <button
                      aria-label="Remove item"
                      onClick={() => removeFromCart(item.key)}
                      className="mt-2 flex items-center gap-1 text-[13px] text-quiet hover:text-black"
                    >
                      <X size={13} strokeWidth={1.5} /> Remove
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-start sm:justify-center">
                  <div className="flex border border-hairline">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => updateQty(item.key, item.qty - 1)}
                      className="flex h-9 w-9 items-center justify-center hover:bg-surface"
                    >
                      <Minus size={13} strokeWidth={1.5} />
                    </button>
                    <span className="flex h-9 w-10 items-center justify-center border-x border-hairline text-[14px]">
                      {item.qty}
                    </span>
                    <button
                      aria-label="Increase quantity"
                      onClick={() => updateQty(item.key, item.qty + 1)}
                      className="flex h-9 w-9 items-center justify-center hover:bg-surface"
                    >
                      <Plus size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <p className="text-right text-[14px] sm:self-start">
                  {formatINR(item.price * item.qty)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-hairline p-6">
          <h2 className="text-[14px] uppercase tracking-hero">
            Order Summary
          </h2>
          <dl className="mt-4 space-y-3 border-b border-hairline pb-4">
            <div className="flex justify-between text-[14px]">
              <dt className="text-quiet">Subtotal</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-[14px]">
              <dt className="text-quiet">Shipping</dt>
              <dd>{shipping === 0 ? "FREE" : formatINR(shipping)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between text-[16px] uppercase tracking-hero">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          {shipping > 0 && (
            <p className="mt-3 text-[12px] text-quiet">
              Add {formatINR(FREE_SHIPPING_THRESHOLD - subtotal)} more to unlock
              free shipping.
            </p>
          )}
          <Link
            href="/checkout"
            className="mt-5 flex h-11 items-center justify-center bg-black text-[14px] uppercase tracking-hero text-white hover:bg-[#222]"
          >
            Proceed to checkout
          </Link>
          <Link
            href="/category/all"
            className="mt-3 block text-center text-[13px] text-quiet underline underline-offset-4 hover:text-black"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
