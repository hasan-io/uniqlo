import HeroBanner from "@/components/hero-banner";
import CategoryTiles from "@/components/category-tiles";
import HomeRails from "@/components/home-rails";
import QuizModal from "@/components/quiz";
import { getAllProducts } from "@/lib/data";
import { HEROES } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <div>
      {/* Hero 1 — New Arrivals */}
      <HeroBanner
        image={HEROES.newArrivals}
        title={"NEW ARRIVALS\nLIFEWEAR FOR EVERY DAY"}
        subtitle="Simple, high-quality everyday clothing — thoughtfully made for how you live."
        ctaLabel="Shop New Arrivals"
        ctaHref="/category/all"
        secondaryLabel="Take the Style Quiz"
        secondaryHref="/style-quiz"
      />

      {/* Hero 2 — HEATTECH */}
      <div className="mx-auto max-w-[1440px] px-4 pt-4 lg:px-10">
        <HeroBanner
          image={HEROES.heattech}
          title={"HEATTECH COLLECTION\nSTAY WARM IN STYLE"}
          subtitle="Bio-warming fabric technology that turns moisture into heat."
          ctaLabel="Shop HEATTECH"
          ctaHref="/category/heattech"
          heightClass="h-[420px] lg:h-[520px]"
        />
      </div>

      {/* Category grid */}
      <CategoryTiles />

      {/* Product rails */}
      <HomeRails products={products} />

      {/* HEATTECH full-width banner */}
      <HeroBanner
        image={HEROES.heattechBanner}
        title={"HEATTECH\nWARMTH WITHOUT THE BULK"}
        subtitle="Our thinnest, warmest innerwear — from ₹790."
        ctaLabel="Explore HEATTECH"
        ctaHref="/category/heattech"
        heightClass="h-[400px] lg:h-[460px]"
      />

      {/* AIRism full-width banner */}
      <div className="mx-auto max-w-[1440px] px-4 pt-4 lg:px-10">
        <HeroBanner
          image={HEROES.airismBanner}
          title={"AIRISM COLLECTION\nCOOL. DRY. ALL DAY."}
          subtitle="Silky-smooth fabric that keeps you fresh from sunrise to sundown."
          ctaLabel="Explore AIRism"
          ctaHref="/category/airism"
          heightClass="h-[400px] lg:h-[460px]"
        />
      </div>

      {/* First-visit style quiz popup */}
      <QuizModal />
    </div>
  );
}
