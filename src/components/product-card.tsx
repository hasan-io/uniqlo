"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/db/schema";
import { formatINR } from "@/lib/format";
import { useShop } from "@/components/shop-provider";

const COLOR_HEX: Record<string, string> = {
  Black: "#1a1a1a",
  White: "#ffffff",
  Grey: "#9a9a9a",
  Navy: "#1f2a44",
  Beige: "#d8cfc0",
  Brown: "#7a5c46",
  Blue: "#3f6699",
  Olive: "#5a5b3a",
  Pink: "#e4b8c0",
  Purple: "#6b4a7a",
};

export default function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isWishlisted, hydrated } = useShop();
  const onSale = product.salePrice != null;
  const effective = product.salePrice ?? product.price;
  const wished = hydrated && isWishlisted(product.id);

  return (
    <div className="group relative border border-hairline bg-white">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-surface">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {onSale && (
            <span className="absolute left-0 top-3 bg-brand px-2 py-1 text-[11px] uppercase tracking-hero text-white">
              SALE
            </span>
          )}
        </div>
      </Link>

      <button
        aria-label="Add to wishlist"
        onClick={() =>
          toggleWishlist({
            id: product.id,
            name: product.name,
            image: product.image,
            price: effective,
            originalPrice: product.price,
          })
        }
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-hairline bg-white hover:border-black"
      >
        <Heart
          size={15}
          strokeWidth={1.5}
          fill={wished ? "#000000" : "none"}
        />
      </button>

      <div className="border-t border-hairline p-3">
        <Link href={`/product/${product.id}`} className="block">
          <p className="text-[14px] leading-snug text-black hover:underline hover:underline-offset-4">
            {product.name}
          </p>
          <p className="mt-1 text-[13px] capitalize text-quiet">
            {product.gender} · {product.category}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-[14px] ${onSale ? "text-brand" : "text-black"}`}
            >
              {formatINR(effective)}
            </span>
            {onSale && (
              <span className="text-[13px] text-quiet line-through">
                {formatINR(product.price)}
              </span>
            )}
          </div>
          <div className="mt-2 flex gap-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c}
                title={c}
                className="h-3 w-3 border border-hairline"
                style={{ backgroundColor: COLOR_HEX[c] ?? "#dadada" }}
              />
            ))}
          </div>
        </Link>
      </div>
    </div>
  );
}

export { COLOR_HEX };
