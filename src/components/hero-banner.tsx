import Link from "next/link";

interface HeroBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  heightClass?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export default function HeroBanner({
  image,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  heightClass = "h-[480px] lg:h-[640px]",
  secondaryLabel,
  secondaryHref,
}: HeroBannerProps) {
  return (
    <section className={`relative w-full overflow-hidden ${heightClass}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 flex flex-col items-start justify-start p-6 lg:p-14">
        <h1
          className="max-w-[720px] whitespace-pre-line text-[24px] leading-snug text-white lg:text-[32px] uppercase tracking-hero"
          style={{ textShadow: "0 0 24px rgba(0,0,0,0.35)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className="mt-3 max-w-[520px] text-[14px] text-white"
            style={{ textShadow: "0 0 18px rgba(0,0,0,0.4)" }}
          >
            {subtitle}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <Link
            href={ctaHref}
            className="flex h-11 items-center bg-black px-8 text-[14px] uppercase tracking-hero text-white hover:bg-[#222222]"
          >
            {ctaLabel}
          </Link>
          {secondaryLabel && secondaryHref && (
            <Link
              href={secondaryHref}
              className="flex h-11 items-center border border-white bg-transparent px-8 text-[14px] uppercase tracking-hero text-white hover:bg-white hover:text-black"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
