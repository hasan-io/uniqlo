"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useShop } from "@/components/shop-provider";
import { formatINR } from "@/lib/format";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, hydrated } = useShop();

  if (!hydrated) {
    return <div className="mx-auto max-w-[1200px] px-4 py-16 lg:px-10" />;
  }

  if (wishlist.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1200px] flex-col items-center px-4 py-24 lg:px-10">
        <Heart size={40} strokeWidth={1} />
        <h1 className="mt-5 text-[22px] uppercase tracking-hero">
          Your wishlist is empty
        </h1>
        <p className="mt-2 text-[14px] text-quiet">
          Tap the heart on any product to save it here.
        </p>
        <Link
          href="/category/all"
          className="mt-6 flex h-11 items-center bg-black px-8 text-[14px] uppercase tracking-hero text-white hover:bg-[#222]"
        >
          Discover products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-10 lg:px-10">
      <h1 className="text-[24px] uppercase tracking-hero">
        Wishlist{" "}
        <span className="text-[14px] normal-case text-quiet">
          ({wishlist.length} item{wishlist.length === 1 ? "" : "s"})
        </span>
      </h1>
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {wishlist.map((item) => (
          <div key={item.id} className="relative border border-hairline bg-white">
            <button
              aria-label="Remove from wishlist"
              onClick={() =>
                toggleWishlist({
                  id: item.id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  originalPrice: item.originalPrice,
                })
              }
              className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-hairline bg-white hover:border-black"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
            <Link href={`/product/${item.id}`} className="block">
              <span className="block aspect-[3/4] overflow-hidden bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </span>
              <span className="block border-t border-hairline p-3">
                <span className="block text-[14px]">{item.name}</span>
                <span className="mt-1 block text-[14px]">
                  {formatINR(item.price)}
                  {item.originalPrice > item.price && (
                    <span className="ml-2 text-[13px] text-quiet line-through">
                      {formatINR(item.originalPrice)}
                    </span>
                  )}
                </span>
              </span>
            </Link>
            <div className="border-t border-hairline p-3">
              <Link
                href={`/product/${item.id}`}
                className="flex h-10 items-center justify-center border border-black text-[13px] uppercase tracking-hero hover:bg-surface"
              >
                Select size
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
