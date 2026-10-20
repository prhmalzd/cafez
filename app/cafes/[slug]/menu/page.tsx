import type { Metadata } from "next";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { MenuBrowser } from "@/components/menu-browser";
import { PublicShell } from "@/components/public-shell";
import { getCafeBySlug } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const cafe = getCafeBySlug((await params).slug);
  return cafe ? { title: `منوی ${cafe.name}`, description: `قیمت و موجودی به‌روز منوی ${cafe.name}` } : {};
}

export default async function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const cafe = getCafeBySlug((await params).slug);
  if (!cafe) notFound();
  return <PublicShell><AnalyticsBeacon eventType="menu_view" cafeId={cafe.id} /><header className="page-hero container"><Link href={`/cafes/${cafe.slug}`} className="eyebrow"><ArrowRight size={14} style={{ display: "inline" }} /> بازگشت به صفحه کافه</Link><h1>منوی {cafe.name}</h1><p><Search size={16} style={{ display: "inline" }} /> قیمت‌ها و موجودی همین حالا توسط کافه به‌روز می‌شوند.</p></header><div className="container" style={{ paddingBottom: 70 }}><MenuBrowser categories={cafe.menu} /></div></PublicShell>;
}
