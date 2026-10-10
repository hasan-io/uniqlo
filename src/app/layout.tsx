import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ShopProvider } from "@/components/shop-provider";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export const metadata: Metadata = {
  title: "UNIQLO | LifeWear — Simple Made Better",
  description:
    "UNIQLO LifeWear. Thoughtfully designed, everyday clothing for women, men, kids and baby. Free shipping on orders above ₹2000.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <ShopProvider>
          <SiteHeader />
          <main className="min-h-[60vh]">{children}</main>
          <SiteFooter />
        </ShopProvider>
      </body>
    </html>
  );
}
