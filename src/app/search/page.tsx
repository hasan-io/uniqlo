import { Search } from "lucide-react";
import ProductCard from "@/components/product-card";
import { getAllProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "UNIQLO | Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const all = await getAllProducts();

  const results = query
    ? all.filter((p) => {
        const hay =
          `${p.name} ${p.gender} ${p.category} ${p.tags.join(" ")}`.toLowerCase();
        return query
          .toLowerCase()
          .split(/\s+/)
          .every((word) => hay.includes(word));
      })
    : [];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 lg:px-10">
      <h1 className="text-[24px] uppercase tracking-hero">Search</h1>
      <form action="/search" method="GET" className="mt-6 flex max-w-[560px]">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search for t-shirts, HEATTECH, dresses…"
          className="h-11 flex-1 border border-hairline px-3 text-[14px] outline-none placeholder:text-quiet focus:border-black"
        />
        <button
          aria-label="Search"
          className="flex h-11 w-12 items-center justify-center bg-black text-white hover:bg-[#222]"
        >
          <Search size={18} strokeWidth={1.5} />
        </button>
      </form>

      {query ? (
        <div className="mt-10">
          <p className="text-[13px] uppercase tracking-hero text-quiet">
            {results.length} result{results.length === 1 ? "" : "s"} for “
            {query}”
          </p>
          {results.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="mt-6 border border-hairline py-16 text-center">
              <p className="text-[16px]">
                We couldn't find anything for “{query}”.
              </p>
              <p className="mt-2 text-[13px] text-quiet">
                Try a different keyword or browse the categories above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-10">
          <p className="text-[13px] uppercase tracking-hero text-quiet">
            Popular right now
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {all
              .filter((p) => p.isTrending)
              .slice(0, 4)
              .map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
