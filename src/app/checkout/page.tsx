"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Lock, ShoppingBag } from "lucide-react";
import { useShop, type CartItem } from "@/components/shop-provider";
import { formatINR, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "@/lib/format";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

interface StoredCheckout {
  token?: string;
  customer_name?: string;
  customer_phone?: string;
  cart_item_name?: string;
}

const ABANDONMENT_STORAGE_KEY = "lifewear-abandoned-checkout";
const ABANDONMENT_ENDPOINT = "/api/checkout-abandonment";

function createCheckoutToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCartItemName(items: CartItem[]): string {
  return items
    .map((item) => `${item.name}${item.qty > 1 ? ` × ${item.qty}` : ""}`)
    .join(", ");
}

function readStoredCheckout(): StoredCheckout | null {
  try {
    const value = localStorage.getItem(ABANDONMENT_STORAGE_KEY);
    return value ? (JSON.parse(value) as StoredCheckout) : null;
  } catch {
    return null;
  }
}

function persistCheckout(
  token: string,
  form: CheckoutForm,
  items: CartItem[]
) {
  try {
    localStorage.setItem(
      ABANDONMENT_STORAGE_KEY,
      JSON.stringify({
        token,
        customer_name: form.name,
        customer_phone: form.phone,
        cart_item_name: getCartItemName(items),
      } satisfies StoredCheckout)
    );
  } catch {
    // Checkout remains usable if browser storage is disabled or full.
  }
}

function scheduleAbandonedCheckout(
  token: string | null,
  form: CheckoutForm,
  items: CartItem[],
  alreadyScheduled: { current: boolean }
) {
  if (
    typeof window === "undefined" ||
    alreadyScheduled.current ||
    !token ||
    !form.name.trim() ||
    !form.phone.trim()
  ) {
    return;
  }

  const cartItemName = getCartItemName(items);
  if (!cartItemName) return;

  persistCheckout(token, form, items);
  alreadyScheduled.current = true;

  const body = JSON.stringify({
    action: "schedule",
    token,
    customer_name: form.name.trim(),
    customer_phone: form.phone.trim(),
    cart_item_name: cartItemName,
  });

  // sendBeacon survives tab close and document navigation. For browsers that
  // reject the beacon, a keepalive fetch is a best-effort fallback.
  if (typeof navigator.sendBeacon === "function") {
    const accepted = navigator.sendBeacon(
      ABANDONMENT_ENDPOINT,
      new Blob([body], { type: "application/json" })
    );
    if (accepted) return;
  }

  void fetch(ABANDONMENT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {
    // The shopper's navigation should never be blocked by recovery scheduling.
  });
}

function cancelAbandonedCheckout(token: string | null): Promise<void> {
  if (!token || typeof window === "undefined") return Promise.resolve();
  return fetch(ABANDONMENT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "cancel", token }),
    keepalive: true,
  })
    .then(() => undefined)
    .catch(() => undefined);
}

const inputCls =
  "h-11 w-full border border-hairline bg-white px-3 text-[14px] outline-none placeholder:text-quiet focus:border-black";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart, hydrated } = useShop();
  const [form, setForm] = useState<CheckoutForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formRef = useRef(form);
  const cartRef = useRef(cart);
  const tokenRef = useRef<string | null>(null);
  const mountedRef = useRef(false);
  const exitScheduledRef = useRef(false);
  const paymentCompleteRef = useRef(false);

  // Keep lifecycle callbacks current without re-registering page-exit handlers.
  formRef.current = form;
  cartRef.current = cart;

  useEffect(() => {
    if (!hydrated) return;

    const saved = readStoredCheckout();
    if (saved?.token) {
      // A shopper returning to checkout before the delay should not receive a call.
      void cancelAbandonedCheckout(saved.token);
    }

    if (saved) {
      const restored: CheckoutForm = {
        ...formRef.current,
        name: saved.customer_name ?? formRef.current.name,
        phone: saved.customer_phone ?? formRef.current.phone,
      };
      formRef.current = restored;
      setForm(restored);
    }

    const token = createCheckoutToken();
    tokenRef.current = token;
    exitScheduledRef.current = false;
    paymentCompleteRef.current = false;
    persistCheckout(token, formRef.current, cartRef.current);
    mountedRef.current = true;

    const onPageHide = () => {
      if (paymentCompleteRef.current) return;
      scheduleAbandonedCheckout(
        tokenRef.current,
        formRef.current,
        cartRef.current,
        exitScheduledRef
      );
    };

    window.addEventListener("pagehide", onPageHide);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      mountedRef.current = false;
      // Deferring the cleanup lets React Strict Mode's development-only
      // setup/cleanup replay mount again before treating it as a real exit.
      queueMicrotask(() => {
        if (mountedRef.current || paymentCompleteRef.current) return;
        scheduleAbandonedCheckout(
          tokenRef.current,
          formRef.current,
          cartRef.current,
          exitScheduledRef
        );
      });
    };
  }, [hydrated]);

  // Persist name and phone synchronously in the input handler, not on blur.
  const set = (key: keyof CheckoutForm) => (event: { target: { value: string } }) => {
    const next = { ...formRef.current, [key]: event.target.value };
    formRef.current = next;
    setForm(next);

    if (!tokenRef.current) tokenRef.current = createCheckoutToken();
    persistCheckout(tokenRef.current, next, cartRef.current);
  };

  // Refresh the locally stored cart item when cart hydration or contents change.
  useEffect(() => {
    if (paymentCompleteRef.current) {
      try {
        localStorage.removeItem(ABANDONMENT_STORAGE_KEY);
      } catch {
        // Ignore disabled storage.
      }
      return;
    }
    if (!hydrated || !tokenRef.current) return;
    persistCheckout(tokenRef.current, formRef.current, cart);
  }, [cart, hydrated]);

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const saveOrder = async (payment: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
  }) => {
    // Mark success before route changes so unmount cannot schedule a recovery call.
    paymentCompleteRef.current = true;
    exitScheduledRef.current = true;
    await cancelAbandonedCheckout(tokenRef.current);
    try {
      localStorage.removeItem(ABANDONMENT_STORAGE_KEY);
    } catch {
      // Ignore disabled storage.
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          amount: total * 100,
          email: formRef.current.email,
          name: formRef.current.name,
          razorpayOrderId: payment.razorpay_order_id ?? null,
          razorpayPaymentId: payment.razorpay_payment_id ?? null,
        }),
      });
      if (!res.ok) throw new Error("Order could not be saved");
      const data = (await res.json()) as { id: string };
      clearCart();
      router.push(`/order-confirmation?id=${encodeURIComponent(data.id)}`);
    } catch {
      setError(
        "Payment succeeded but we couldn't save the order. Please contact support with your payment ID."
      );
      setPaying(false);
    }
  };

  const handlePay = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.pincode.trim()) {
      setError("Please fill in your name, phone number and PIN code.");
      return;
    }
    setError(null);
    setPaying(true);

    // Create a Razorpay order server-side (falls back to order-less checkout)
    let orderId: string | null = null;
    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total * 100 }),
      });
      const data = (await res.json()) as { orderId: string | null };
      orderId = data.orderId;
    } catch {
      orderId = null;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      // Offline / blocked-script fallback: complete as a demo payment
      await saveOrder({});
      return;
    }

    const options: Record<string, unknown> = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: total * 100,
      currency: "INR",
      name: "LIFEWEAR STORE",
      description: `${cart.length} LifeWear item${cart.length === 1 ? "" : "s"}`,
      ...(orderId ? { order_id: orderId } : {}),
      prefill: {
        name: form.name,
        email: form.email,
        contact: form.phone,
      },
      notes: { address: `${form.address}, ${form.city} ${form.pincode}` },
      theme: { color: "#000000" },
      modal: { ondismiss: () => setPaying(false) },
      handler: (response: {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
      }) => {
        void saveOrder(response);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      setError("Payment failed. Please try again.");
      setPaying(false);
    });
    rzp.open();
  };

  if (!hydrated) {
    return <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-10" />;
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-24 lg:px-10">
        <ShoppingBag size={40} strokeWidth={1} />
        <h1 className="mt-5 text-[22px] uppercase tracking-hero">
          Nothing to check out
        </h1>
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
      <h1 className="text-[24px] uppercase tracking-hero">Checkout</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div>
          <h2 className="text-[14px] uppercase tracking-hero">
            Contact & Shipping
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <input
              className={inputCls}
              placeholder="Full name *"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
            />
            <input
              className={inputCls}
              placeholder="Phone number *"
              inputMode="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={set("phone")}
            />
            <input
              className={`${inputCls} sm:col-span-2`}
              placeholder="Email address (for order updates)"
              inputMode="email"
              autoComplete="email"
              value={form.email}
              onChange={set("email")}
            />
            <input
              className={`${inputCls} sm:col-span-2`}
              placeholder="Street address"
              autoComplete="street-address"
              value={form.address}
              onChange={set("address")}
            />
            <input
              className={inputCls}
              placeholder="City"
              autoComplete="address-level2"
              value={form.city}
              onChange={set("city")}
            />
            <input
              className={inputCls}
              placeholder="PIN code *"
              inputMode="numeric"
              autoComplete="postal-code"
              value={form.pincode}
              onChange={set("pincode")}
            />
          </div>

          {error && <p className="mt-4 text-[14px] text-brand">{error}</p>}

          <div className="mt-6 flex items-center gap-2 border border-hairline bg-surface px-4 py-3">
            <Lock size={14} strokeWidth={1.5} />
            <p className="text-[13px] text-quiet">
              Payments are processed securely by Razorpay. We never store your
              card details.
            </p>
          </div>
          <p className="mt-3 text-[12px] text-quiet">
            If you leave before completing payment, our team may call to help
            with your order.
          </p>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-hairline p-6">
          <h2 className="text-[14px] uppercase tracking-hero">Your Order</h2>
          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto border-b border-hairline pb-4">
            {cart.map((item) => (
              <li key={item.key} className="flex items-center gap-3">
                <span className="h-14 w-11 shrink-0 overflow-hidden border border-hairline bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px]">{item.name}</span>
                  <span className="text-[12px] text-quiet">
                    {item.size} · {item.color} × {item.qty}
                  </span>
                </span>
                <span className="text-[13px]">
                  {formatINR(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>
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
          <button
            onClick={handlePay}
            disabled={paying}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 bg-black text-[14px] uppercase tracking-hero text-white hover:bg-[#222] disabled:bg-hairline disabled:text-quiet"
          >
            <Lock size={14} strokeWidth={1.5} />
            {paying ? "Opening Razorpay…" : `Pay ${formatINR(total)}`}
          </button>
          <p className="mt-3 text-center text-[12px] text-quiet">
            Powered by Razorpay · UPI, cards, netbanking & wallets
          </p>
        </aside>
      </div>
    </div>
  );
}
