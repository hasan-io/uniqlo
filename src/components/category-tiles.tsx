import Link from "next/link";
import {
  Venus,
  Mars,
  Smile,
  Baby,
  Shirt,
  Footprints,
  Snowflake,
  Percent,
  type LucideIcon,
} from "lucide-react";

const TILES: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Women", href: "/category/women", icon: Venus },
  { label: "Men", href: "/category/men", icon: Mars },
  { label: "Kids", href: "/category/kids", icon: Smile },
  { label: "Baby", href: "/category/baby", icon: Baby },
  { label: "Tops", href: "/category/tops", icon: Shirt },
  { label: "Bottoms", href: "/category/bottoms", icon: Footprints },
  { label: "Outerwear", href: "/category/outerwear", icon: Snowflake },
  { label: "Sale", href: "/category/sale", icon: Percent },
];

export default function CategoryTiles() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 lg:px-10">
      <h2 className="mb-6 text-[18px] uppercase tracking-hero">
        Shop by Category
      </h2>
      <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
        {TILES.map(({ label, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group flex aspect-square flex-col items-center justify-center gap-3 border border-hairline bg-white hover:border-black"
          >
            <Icon
              size={30}
              strokeWidth={1}
              className="text-black transition-transform duration-300 group-hover:-translate-y-1"
            />
            <span className="text-[13px] text-black">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
