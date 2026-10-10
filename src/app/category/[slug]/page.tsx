import { notFound } from "next/navigation";
import type { Product } from "@/db/schema";
import ListingClient from "@/components/listing-client";
import { getAllProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

interface CategoryDef {
  title: string;
  subtitle: string;
  crumbs: string[];
  filter: (p: Product) => boolean;
}

const CATEGORIES: Record<string, CategoryDef> = {
  women: {
    title: "Women",
    subtitle: "LifeWear for her",
    crumbs: ["Women"],
    filter: (p) => p.gender === "women",
  },
  men: {
    title: "Men",
    subtitle: "LifeWear for him",
    crumbs: ["Men"],
    filter: (p) => p.gender === "men",
  },
  kids: {
    title: "Kids",
    subtitle: "Built for play",
    crumbs: ["Kids"],
    filter: (p) => p.gender === "kids",
  },
  baby: {
    title: "Baby",
    subtitle: "Gentle on new skin",
    crumbs: ["Baby"],
    filter: (p) => p.gender === "baby",
  },
  tops: {
    title: "Tops",
    subtitle: "T-shirts, shirts & hoodies",
    crumbs: ["Shop", "Tops"],
    filter: (p) => p.category === "tops",
  },
  bottoms: {
    title: "Bottoms",
    subtitle: "Jeans, chinos, cargos & trousers",
    crumbs: ["Shop", "Bottoms"],
    filter: (p) => p.category === "bottoms",
  },
  outerwear: {
    title: "Outerwear",
    subtitle: "Jackets, down & fleece",
    crumbs: ["Shop", "Outerwear"],
    filter: (p) => p.category === "outerwear",
  },
  knitwear: {
    title: "Knitwear",
    subtitle: "Merino & ribbed knits",
    crumbs: ["Shop", "Knitwear"],
    filter: (p) => p.category === "knitwear",
  },
  dresses: {
    title: "Dresses",
    subtitle: "Shirt dresses & slip dresses",
    crumbs: ["Shop", "Dresses"],
    filter: (p) => p.category === "dresses",
  },
  skirts: {
    title: "Skirts",
    subtitle: "Midi & flared skirts",
    crumbs: ["Shop", "Skirts"],
    filter: (p) => p.category === "skirts",
  },
  innerwear: {
    title: "Innerwear",
    subtitle: "HEATTECH & base layers",
    crumbs: ["Shop", "Innerwear"],
    filter: (p) => p.category === "innerwear",
  },
  heattech: {
    title: "HEATTECH",
    subtitle: "Bio-warming technology",
    crumbs: ["Collections", "HEATTECH"],
    filter: (p) => p.tags.includes("heattech"),
  },
  airism: {
    title: "AIRism",
    subtitle: "Cool, dry, breathable",
    crumbs: ["Collections", "AIRism"],
    filter: (p) => p.tags.includes("airism"),
  },
  ut: {
    title: "UT",
    subtitle: "Graphic T-shirt archive",
    crumbs: ["Collections", "UT"],
    filter: (p) => p.tags.includes("ut"),
  },
  sale: {
    title: "Sale",
    subtitle: "Limited-time offers",
    crumbs: ["Sale"],
    filter: (p) => p.salePrice != null,
  },
  all: {
    title: "All Products",
    subtitle: "The full LifeWear range",
    crumbs: ["Shop", "All Products"],
    filter: () => true,
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = CATEGORIES[slug];
  return { title: def ? `UNIQLO | ${def.title}` : "UNIQLO" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = CATEGORIES[slug];
  if (!def) notFound();

  const all = await getAllProducts();
  const products = all.filter(def.filter);

  return (
    <ListingClient
      title={def.title}
      subtitle={def.subtitle}
      breadcrumb={[
        { label: "Home", href: "/" },
        ...def.crumbs.map((label) => ({ label })),
      ]}
      products={products}
    />
  );
}
