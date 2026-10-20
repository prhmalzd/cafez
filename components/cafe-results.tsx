"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { CafeCard } from "@/components/cafe-card";
import type { Cafe } from "@/lib/types";
import { isOpenAt, normalizePersian, toPersianDigits } from "@/lib/utils";

export function CafeResults({ cafes, initialQuery = "", initialOpen = false, initialOffer = false, initialAmenity = "" }: { cafes: Cafe[]; initialQuery?: string; initialOpen?: boolean; initialOffer?: boolean; initialAmenity?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [openNow, setOpenNow] = useState(initialOpen);
  const [offersOnly, setOffersOnly] = useState(initialOffer);
  const [neighborhood, setNeighborhood] = useState("");
  const [amenity, setAmenity] = useState(initialAmenity);
  const neighborhoods = [...new Set(cafes.map((cafe) => cafe.neighborhood))];

  const results = useMemo(() => cafes.filter((cafe) => {
    const haystack = normalizePersian([cafe.name, cafe.type, cafe.neighborhood, ...cafe.menu.flatMap((cat) => cat.items.map((item) => item.name))].join(" "));
    return (!query || haystack.includes(normalizePersian(query))) && (!openNow || isOpenAt(cafe.hours)) && (!offersOnly || cafe.offerIds.length > 0) && (!neighborhood || cafe.neighborhood === neighborhood) && (!amenity || cafe.amenities.includes(amenity));
  }), [amenity, cafes, neighborhood, offersOnly, openNow, query]);

  return (
    <div className="filter-layout">
      <aside className="filter-sidebar">
        <h3><SlidersHorizontal size={18} style={{ display: "inline", verticalAlign: "middle" }} /> فیلترها</h3>
        <div className="field"><label htmlFor="search">جست‌وجو</label><div className="search-wrap"><Search size={18} /><input id="search" className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="کافه یا آیتم منو" /></div></div>
        <div className="field"><label htmlFor="neighborhood">محله</label><select id="neighborhood" className="select" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)}><option value="">همه محله‌ها</option>{neighborhoods.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="amenity">امکانات</label><select id="amenity" className="select" value={amenity} onChange={(event) => setAmenity(event.target.value)}><option value="">همه امکانات</option><option>وای‌فای</option><option>فضای باز</option><option>دسترسی‌پذیر</option><option>پارکینگ</option><option>بیرون‌بر</option></select></div>
        <div className="checkbox-list"><label className="checkbox"><input type="checkbox" checked={openNow} onChange={(event) => setOpenNow(event.target.checked)} /> فقط کافه‌های باز</label><label className="checkbox"><input type="checkbox" checked={offersOnly} onChange={(event) => setOffersOnly(event.target.checked)} /> دارای پیشنهاد فعال</label></div>
      </aside>
      <section>
        <div className="results-head"><strong>{toPersianDigits(results.length)} کافه پیدا شد</strong><span className="muted">مرتب‌سازی: پیشنهاد کافه‌ز</span></div>
        {results.length ? <div className="grid-2">{results.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} />)}</div> : <div className="empty-state"><h3>کافه‌ای با این مشخصات پیدا نشد</h3><p>فیلترها را کمی بازتر کنید یا نام دیگری جست‌وجو کنید.</p></div>}
      </section>
    </div>
  );
}
