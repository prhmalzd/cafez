import type { Metadata } from "next";
import { CafeResults } from "@/components/cafe-results";
import { PublicShell } from "@/components/public-shell";
import { getApprovedCafes } from "@/lib/data";

export const metadata: Metadata = { title: "کشف کافه‌ها", description: "کافه‌های شهر را بر اساس محله، امکانات، ساعات کاری و پیشنهادها پیدا کنید." };

export default async function CafesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  return (
    <PublicShell>
      <header className="page-hero container"><span className="eyebrow">کافه‌ی بعدی تو</span><h1>کجای شهر قهوه بخوریم؟</h1><p>از میان کافه‌های تاییدشده، بر اساس محله، حال‌وهوا، امکانات و منوی واقعی انتخاب کن.</p></header>
      <div className="container"><CafeResults cafes={getApprovedCafes()} initialQuery={typeof params.q === "string" ? params.q : ""} initialOpen={params.open === "true"} initialOffer={params.offer === "true"} initialAmenity={typeof params.amenity === "string" ? params.amenity : ""} /></div>
    </PublicShell>
  );
}
