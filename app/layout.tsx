import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "کافه‌ز | کافه‌های خوب شهر، یک‌جا", template: "%s | کافه‌ز" },
  description: "کافه‌های شهر را کشف کنید، منوی به‌روز ببینید و پیشنهادهای واقعی بگیرید.",
  openGraph: { title: "کافه‌ز", description: "کافه‌های خوب شهر، یک‌جا", locale: "fa_IR", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
