"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/db/schema";
import ProductCard, { COLOR_HEX } from "@/components/product-card";

const PAGE_SIZE = 8;

const PRICE_RANGES = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹1,999", min: 1000, max: 1999 },
  { label: "₹2,000 – ₹2,999", min: 2000, max: 2999 },
  { label: "₹3,000 & above", min: 3000, max: Infinity },
];

const SORTS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "asc" },
  { label: "Price: High to Low", value: "desc" },
  { label: "On Sale First", value: "sale" },
] as const;

interface Props {
  title: string;
  subtitle: string;
  breadcrumb: { label: string; href?: string }[];
  products: Product[];
}

export default function ListingClient({
  title,
  subtitle,
  breadcrumb,
  products,
}: Props) {
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("featured");
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  const allCats = useMemo(
    () => Array.from(new Set(products.map((p) => p.category))),
    [products]
  );
  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.sizes))),
    [products]
  );
  const allColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => p.colors))),
    [products]
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (sizes.length && !p.sizes.some((s) => sizes.includes(s)))
        return false;
      if (colors.length && !p.colors.some((c) => colors.includes(c)))
        return false;
      if (prices.length) {
        const eff = p.salePrice ?? p.price;
        const ok = prices.some((ri) => {
          const r = PRICE_RANGES[ri];
          return eff >= r.min && eff <= r.max;
        });
        if (!ok) return false;
      }
      return true;
    });
    if (sort === "asc")
      list = [...list].sort(
        (a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price)
      );
    if (sort === "desc")
      list = [...list].sort(
        (a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price)
      );
    if (sort === "sale")
      list = [...list].sort(
        (a, b) => Number(b.salePrice != null) - Number(a.salePrice != null)
      );
    return list;
  }, [products, cats, sizes, colors, prices, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const activeFilterCount =
    cats.length + sizes.length + colors.length + prices.length;

  const clearAll = () => {
    setCats([]);
    setSizes([]);
    setColors([]);
    setPrices([]);
    setPage(1);
  };

  const toggle = (
    arr: string[],
    setArr: (v: string[]) => void,
    v: string
  ) => {
    setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    setPage(1);
  };

  const FilterBody = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-[13px] uppercase tracking-hero">Category</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setCats([]);
              setPage(1);
            }}
            className={`rounded-full border px-4 py-1.5 text-[13px] capitalize ${
              cats.length === 0
                ? "border-black bg-black text-white"
                : "border-hairline hover:border-black"
            }`}
          >
            All
          </button>
          {allCats.map((c) => (
            <button
              key={c}
              onClick={() => toggle(cats, setCats, c)}
              className={`rounded-full border px-4 py-1.5 text-[13px] capitalize ${
                cats.includes(c)
                  ? "border-black bg-black text-white"
                  : "border-hairline hover:border-black"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] uppercase tracking-hero">Size</p>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button
              key={s}
              onClick={() => toggle(sizes, setSizes, s)}
              className={`flex h-9 min-w-9 items-center justify-center border px-2 text-[13px] ${
                sizes.includes(s)
                  ? "border-black bg-black text-white"
                  : "border-hairline hover:border-black"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] uppercase tracking-hero">Colour</p>
        <div className="flex flex-wrap gap-2">
          {allColors.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => toggle(colors, setColors, c)}
              className={`h-7 w-7 border ${
                colors.includes(c)
                  ? "border-2 border-black"
                  : "border-hairline hover:border-black"
              }`}
              style={{ backgroundColor: COLOR_HEX[c] ?? "#dadada" }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[13px] uppercase tracking-hero">Price</p>
        <div className="space-y-2">
          {PRICE_RANGES.map((r, i) => (
            <label
              key={r.label}
              className="flex cursor-pointer items-center gap-2.5 text-[14px]"
            >
              <input
                type="checkbox"
                checked={prices.includes(i)}
                onChange={() => {
                  setPrices(
                    prices.includes(i)
                      ? prices.filter((x) => x !== i)
                      : [...prices, i]
                  );
                  setPage(1);
                }}
                className="h-4 w-4 appearance-none border border-hairline checked:border-black checked:bg-black"
              />
              {r.label}
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAll}
          className="text-[13px] text-quiet underline underline-offset-4 hover:text-black"
        >
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-quiet">
        {breadcrumb.map((b, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} strokeWidth={1.5} />}
            {b.href ? (
              <Link href={b.href} className="hover:text-black hover:underline">
                {b.label}
              </Link>
            ) : (
              <span className="text-black">{b.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] uppercase tracking-hero">{title}</h1>
          <p className="mt-1 text-[13px] text-quiet">
            {subtitle} · {filtered.length} item{filtered.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-10 items-center gap-2 border border-hairline px-3 text-[13px] uppercase tracking-hero hover:border-black lg:hidden"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filters
            {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
          </button>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as (typeof SORTS)[number]["value"])
              }
              className="h-10 appearance-none border border-hairline bg-white pl-3 pr-9 text-[13px] outline-none hover:border-black"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              strokeWidth={1.5}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[120px] border-r border-hairline pr-8">
            {FilterBody}
          </div>
        </aside>

        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center border border-hairline py-20">
              <p className="text-[16px]">No products match your filters.</p>
              <button
                onClick={clearAll}
                className="mt-4 border border-black px-6 py-2.5 text-[13px] uppercase tracking-hero hover:bg-surface"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {visible.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="flex h-10 items-center border border-hairline px-4 text-[13px] uppercase tracking-hero hover:border-black disabled:opacity-30"
              >
                Prev
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-10 w-10 border text-[13px] ${
                    n === safePage
                      ? "border-black bg-black text-white"
                      : "border-hairline hover:border-black"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                disabled={safePage === pages}
                onClick={() => setPage(safePage + 1)}
                className="flex h-10 items-center border border-hairline px-4 text-[13px] uppercase tracking-hero hover:border-black disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFilters && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFilters(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto border-t border-hairline bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[14px] uppercase tracking-hero">Filters</p>
              <button
                aria-label="Close filters"
                onClick={() => setMobileFilters(false)}
                className="flex h-9 w-9 items-center justify-center hover:bg-surface"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            {FilterBody}
            <button
              onClick={() => setMobileFilters(false)}
              className="mt-6 flex h-11 w-full items-center justify-center bg-black text-[14px] uppercase tracking-hero text-white"
            >
              View {filtered.length} items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
