"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useShop } from "@/components/shop-provider";

const NAV = [
  { label: "Women", href: "/category/women" },
  { label: "Men", href: "/category/men" },
  { label: "Kids", href: "/category/kids" },
  { label: "Baby", href: "/category/baby" },
  { label: "UT", href: "/category/ut", red: true },
  { label: "Sale", href: "/category/sale" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { cartCount, wishlist, hydrated } = useShop();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="flex h-8 items-center justify-center bg-surface px-4">
        <p className="text-[12px] text-black">
          Free shipping on orders above ₹2000&nbsp;&nbsp;|&nbsp;&nbsp;Easy
          returns
        </p>
      </div>

      {/* Main navbar */}
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 lg:px-10">
          {/* Hamburger (mobile) */}
          <button
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-10 w-10 flex-col items-center justify-center bg-brand leading-none text-white">
              <span className="text-[9px] uppercase tracking-hero">UNI</span>
              <span className="text-[9px] uppercase tracking-hero">QLO</span>
            </span>
            <span className="hidden text-[18px] uppercase tracking-hero text-black sm:block">
              UNIQLO
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden flex-1 items-center gap-6 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-[16px] ${
                  item.red ? "text-brand" : "text-black"
                } hover:underline hover:underline-offset-4 ${
                  pathname === item.href ? "underline underline-offset-4" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <Link
              href="/search"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center hover:bg-surface"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <div className="relative">
              <button
                aria-label="Account"
                className="flex h-10 w-10 items-center justify-center hover:bg-surface"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <User size={20} strokeWidth={1.5} />
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-11 w-56 border border-hairline bg-white">
                  <Link
                    href="/style-quiz"
                    onClick={() => setAccountOpen(false)}
                    className="block border-b border-hairline px-4 py-3 text-[14px] hover:bg-surface"
                  >
                    Personalise my style
                  </Link>
                  <Link
                    href="/order-confirmation"
                    onClick={() => setAccountOpen(false)}
                    className="block border-b border-hairline px-4 py-3 text-[14px] hover:bg-surface"
                  >
                    Order history
                  </Link>
                  <span className="block px-4 py-3 text-[13px] text-quiet">
                    Sign in coming soon
                  </span>
                </div>
              )}
            </div>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-10 w-10 items-center justify-center hover:bg-surface"
            >
              <Heart size={20} strokeWidth={1.5} />
              {hydrated && wishlist.length > 0 && (
                <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[10px] text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center hover:bg-surface"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              {hydrated && cartCount > 0 && (
                <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-hairline bg-white">
            <div className="flex h-16 items-center justify-between border-b border-hairline px-4">
              <span className="flex h-9 w-9 flex-col items-center justify-center bg-brand leading-none text-white">
                <span className="text-[9px] uppercase tracking-hero">UNI</span>
                <span className="text-[9px] uppercase tracking-hero">QLO</span>
              </span>
              <button
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center"
                onClick={() => setMenuOpen(false)}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`border-b border-hairline px-5 py-4 text-[16px] ${
                    item.red ? "text-brand" : "text-black"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/style-quiz"
                onClick={() => setMenuOpen(false)}
                className="border-b border-hairline px-5 py-4 text-[16px]"
              >
                Style Quiz
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
