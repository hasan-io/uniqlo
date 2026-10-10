import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import PdpClient from "@/components/pdp-client";
import ProductCard from "@/components/product-card";
import { getProduct, getRecommendations } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  return { title: product ? `UNIQLO | ${product.name}` : "UNIQLO" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const recommendations = await getRecommendations(product, 4);

  const crumbs = [
    { label: "Home", href: "/" },
    {
      label: product.gender.charAt(0).toUpperCase() + product.gender.slice(1),
      href: `/category/${product.gender}`,
    },
    {
      label:
        product.category.charAt(0).toUpperCase() + product.category.slice(1),
      href: `/category/${product.category}`,
    },
    { label: product.name },
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-[13px] text-quiet">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} strokeWidth={1.5} />}
            {c.href ? (
              <Link href={c.href} className="hover:text-black hover:underline">
                {c.label}
              </Link>
            ) : (
              <span className="max-w-[220px] truncate text-black">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      <PdpClient product={product} />

      {/* You might also like */}
      <section className="mt-16">
        <h2 className="mb-6 text-[18px] uppercase tracking-hero">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {recommendations.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
