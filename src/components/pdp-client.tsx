"use client";

import { useState } from "react";
import { Check, Heart, Ruler, Truck, RefreshCcw } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatINR } from "@/lib/format";
import { useShop } from "@/components/shop-provider";
import { COLOR_HEX } from "@/components/product-card";
import SizeAssistant from "@/components/size-assistant";

const VIEWS = [
  { pos: "center", zoom: false },
  { pos: "center 12%", zoom: false },
  { pos: "center 88%", zoom: false },
  { pos: "center", zoom: true },
];

const TABS = ["Description", "Fabric", "Care"] as const;

export default function PdpClient({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted, hydrated } = useShop();
  const [view, setView] = useState(0);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const onSale = product.salePrice != null;
  const effective = product.salePrice ?? product.price;
  const wished = hydrated && isWishlisted(product.id);

  const handleAdd = () => {
    if (!size) {
      setError("Please select a size");
      return;
    }
    setError(null);
    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      price: effective,
      originalPrice: product.price,
      size,
      color,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-14">
        {/* Gallery */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex gap-3 sm:flex-col">
            {VIEWS.map((v, i) => (
              <button
                key={i}
                onClick={() => setView(i)}
                className={`h-[76px] w-[60px] overflow-hidden border ${
                  view === i ? "border-black" : "border-hairline"
                }`}
                aria-label={`View ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: v.pos,
                    transform: v.zoom ? "scale(1.7)" : "none",
                  }}
                />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] flex-1 overflow-hidden border border-hairline bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              style={{
                objectPosition: VIEWS[view].pos,
                transform: VIEWS[view].zoom ? "scale(1.7)" : "none",
              }}
            />
            {onSale && (
              <span className="absolute left-0 top-4 bg-brand px-2.5 py-1 text-[12px] uppercase tracking-hero text-white">
                SALE
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[13px] capitalize text-quiet">
            {product.gender} · {product.category}
          </p>
          <h1 className="mt-1 text-[22px] leading-snug">{product.name}</h1>
          <p className="mt-1 text-[12px] uppercase text-quiet">
            Product ID: {product.id.toUpperCase()}
          </p>

          <div className="mt-4 flex items-baseline gap-3 border-y border-hairline py-4">
            <span
              className={`text-[18px] ${onSale ? "text-brand" : "text-black"}`}
            >
              {formatINR(effective)}
            </span>
            {onSale && (
              <>
                <span className="text-[14px] text-quiet line-through">
                  {formatINR(product.price)}
                </span>
                <span className="text-[12px] uppercase tracking-hero text-brand">
                  Limited-time offer
                </span>
              </>
            )}
            <span className="text-[12px] text-quiet">MRP incl. of all taxes</span>
          </div>

          {/* Colour */}
          <div className="mt-5">
            <p className="text-[13px]">
              Colour: <span className="text-quiet">{color}</span>
            </p>
            <div className="mt-2 flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  title={c}
                  aria-label={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 border ${
                    color === c ? "border-2 border-black" : "border-hairline"
                  }`}
                  style={{ backgroundColor: COLOR_HEX[c] ?? "#dadada" }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px]">
                Size:{" "}
                <span className="text-quiet">
                  {size ?? "Select a size"}
                </span>
              </p>
              <button
                onClick={() => setAssistantOpen(true)}
                className="flex items-center gap-1.5 border border-black px-3 py-1.5 text-[12px] uppercase tracking-hero hover:bg-surface"
              >
                <Ruler size={13} strokeWidth={1.5} />
                Find my size
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setError(null);
                  }}
                  className={`flex h-11 min-w-11 items-center justify-center border px-3 text-[14px] ${
                    size === s
                      ? "border-2 border-black"
                      : "border-hairline hover:border-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {error && <p className="mt-2 text-[13px] text-brand">{error}</p>}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={handleAdd}
              className={`flex h-11 items-center justify-center gap-2 text-[14px] uppercase tracking-hero ${
                added
                  ? "bg-black text-white"
                  : "bg-black text-white hover:bg-[#222222]"
              }`}
            >
              {added ? (
                <>
                  <Check size={16} strokeWidth={1.5} /> Added to cart
                </>
              ) : (
                "Add to cart"
              )}
            </button>
            <button
              onClick={() =>
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: effective,
                  originalPrice: product.price,
                })
              }
              className="flex h-11 items-center justify-center gap-2 border border-black text-[14px] uppercase tracking-hero hover:bg-surface"
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                fill={wished ? "#000" : "none"}
              />
              {wished ? "Saved to wishlist" : "Add to wishlist"}
            </button>
          </div>

          {/* delivery notes */}
          <div className="mt-6 space-y-2 border-t border-hairline pt-5">
            <p className="flex items-center gap-2 text-[13px] text-quiet">
              <Truck size={15} strokeWidth={1.5} />
              Free shipping on orders above ₹2000. Delivery in 3–5 days.
            </p>
            <p className="flex items-center gap-2 text-[13px] text-quiet">
              <RefreshCcw size={15} strokeWidth={1.5} />
              Easy 30-day returns, no questions asked.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 max-w-[900px]">
        <div className="flex border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`border-b-2 px-5 py-3 text-[13px] uppercase tracking-hero ${
                tab === t
                  ? "border-black text-black"
                  : "border-transparent text-quiet hover:text-black"
              }`}
            >
              {t === "Fabric" ? "Fabric Details" : t === "Care" ? "Care Instructions" : t}
            </button>
          ))}
        </div>
        <div className="py-6 text-[14px] leading-relaxed text-black">
          {tab === "Description" && <p>{product.description}</p>}
          {tab === "Fabric" && <p>{product.fabric}</p>}
          {tab === "Care" && <p>{product.care}</p>}
        </div>
      </div>

      <SizeAssistant
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        productName={product.name}
        sizes={product.sizes}
        onRecommend={(s) => {
          setSize(s);
          setError(null);
        }}
      />
    </div>
  );
}
