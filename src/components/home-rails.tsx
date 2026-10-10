"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/db/schema";
import ProductCard from "@/components/product-card";
import { getQuizPrefs, PREFS_EVENT, type QuizPrefs } from "@/lib/prefs";

function scoreProduct(p: Product, prefs: QuizPrefs | null): number {
  if (!prefs) return 0;
  let s = 0;
  if (prefs.style && p.tags.includes(prefs.style)) s += 3;
  if (prefs.occasion && p.tags.includes(prefs.occasion)) s += 2;
  if (prefs.audience === "kids" && (p.gender === "kids" || p.gender === "baby"))
    s += 4;
  if (prefs.audience === "partner" && p.gender === "women") s += 2;
  if (
    prefs.audience === "myself" &&
    (p.gender === "men" || p.gender === "women")
  )
    s += 1;
  if (prefs.audience === "family") s += 1;
  return s;
}

function personalised(list: Product[], prefs: QuizPrefs | null): Product[] {
  if (!prefs) return list;
  return [...list].sort(
    (a, b) => scoreProduct(b, prefs) - scoreProduct(a, prefs)
  );
}

function Rail({
  title,
  subtitle,
  products,
  viewAll,
}: {
  title: string;
  subtitle: string;
  products: Product[];
  viewAll: string;
}) {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-[18px] uppercase tracking-hero">{title}</h2>
          <p className="mt-1 text-[13px] text-quiet">{subtitle}</p>
        </div>
        <Link
          href={viewAll}
          className="border-b border-black text-[13px] uppercase tracking-hero hover:text-quiet"
        >
          View All
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default function HomeRails({ products }: { products: Product[] }) {
  const [prefs, setPrefs] = useState<QuizPrefs | null>(null);

  useEffect(() => {
    setPrefs(getQuizPrefs());
    const handler = () => setPrefs(getQuizPrefs());
    window.addEventListener(PREFS_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(PREFS_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const arrivals = useMemo(
    () => personalised(products.filter((p) => p.isNew), prefs).slice(0, 4),
    [products, prefs]
  );
  const trending = useMemo(
    () =>
      personalised(
        products.filter((p) => p.isTrending),
        prefs
      ).slice(0, 4),
    [products, prefs]
  );

  return (
    <>
      {prefs && (
        <div className="border-y border-hairline bg-surface">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 lg:px-10">
            <p className="text-[13px] text-black">
              Personalised for you —{" "}
              <span className="capitalize">{prefs.style}</span> ·{" "}
              <span className="capitalize">{prefs.occasion}</span>
            </p>
            <Link
              href="/style-quiz"
              className="text-[13px] underline underline-offset-4 hover:text-quiet"
            >
              Retake quiz
            </Link>
          </div>
        </div>
      )}
      <Rail
        title="New Arrivals"
        subtitle="Fresh LifeWear essentials, just landed"
        products={arrivals}
        viewAll="/category/all"
      />
      <Rail
        title="Trending Now"
        subtitle="Most-loved styles this week"
        products={trending}
        viewAll="/category/sale"
      />
    </>
  );
}
