import Link from "next/link";
import { Smartphone, Globe } from "lucide-react";
import type { SVGProps } from "react";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4l16 16" />
      <path d="M20 4L4 20" />
    </svg>
  );
}
function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

const COLUMNS: { title: string; links: string[] }[] = [
  {
    title: "Customer Service",
    links: [
      "Help Centre",
      "Contact Us",
      "Shipping Information",
      "Returns & Exchanges",
      "Order Status",
      "Size Chart",
      "FAQs",
    ],
  },
  {
    title: "Company Info",
    links: [
      "About UNIQLO",
      "LifeWear Philosophy",
      "Careers",
      "Sustainability",
      "Press",
      "Store Locator",
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-hairline bg-white">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-4 py-12 md:grid-cols-4 lg:px-10">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-[14px] uppercase tracking-hero">
              {col.title}
            </h3>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <Link
                    href="#"
                    className="text-[13px] text-quiet hover:text-black hover:underline hover:underline-offset-4"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-[14px] uppercase tracking-hero">
            Social Media
          </h3>
          <ul className="space-y-2.5">
            {[
              { icon: InstagramIcon, label: "Instagram" },
              { icon: FacebookIcon, label: "Facebook" },
              { icon: XIcon, label: "X (Twitter)" },
              { icon: YoutubeIcon, label: "YouTube" },
            ].map(({ icon: Icon, label }) => (
              <li key={label}>
                <Link
                  href="#"
                  className="flex items-center gap-2 text-[13px] text-quiet hover:text-black"
                >
                  <Icon />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[14px] uppercase tracking-hero">
            App Download
          </h3>
          <p className="mb-4 text-[13px] text-quiet">
            Shop faster and get app-only offers.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="#"
              className="flex h-10 w-44 items-center justify-center gap-2 border border-black text-[13px] uppercase tracking-hero hover:bg-surface"
            >
              <Smartphone size={15} strokeWidth={1.5} />
              App Store
            </Link>
            <Link
              href="#"
              className="flex h-10 w-44 items-center justify-center gap-2 border border-black text-[13px] uppercase tracking-hero hover:bg-surface"
            >
              <Smartphone size={15} strokeWidth={1.5} />
              Google Play
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-3 px-4 py-5 md:flex-row md:items-center lg:px-10">
          <p className="text-[12px] text-quiet">
            © 2026 UNIQLO Co., Ltd. All Rights Reserved. LifeWear — Simple made
            better.{" "}
            <a
              href="https://stackwise-magic.lovable.app"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-block text-[12px] text-quiet hover:text-black"
            >
              Admin Portal
            </a>
          </p>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[12px] text-quiet">
              <Globe size={13} strokeWidth={1.5} />
              India (English)
            </span>
            <Link
              href="#"
              className="text-[12px] text-quiet hover:text-black"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-[12px] text-quiet hover:text-black"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
