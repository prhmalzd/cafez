import type { Metadata } from "next";
import { AtSign, Clock3, ExternalLink, MapPin, Menu as MenuIcon, Phone, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsBeacon, TrackedAnchor } from "@/components/analytics-beacon";
import { FavoriteButton } from "@/components/favorite-button";
import { CafeThemeSurface } from "@/components/cafe-theme-surface";
import { OfferCard } from "@/components/offer-card";
import { PublicShell } from "@/components/public-shell";
import { getLiveCafeBySlug } from "@/lib/cafe-live";
import { getApprovedCafes, getOffersForCafe } from "@/lib/data";
import { getOpenLabel, isOpenAt, toPersianDigits } from "@/lib/utils";

export function generateStaticParams() { return getApprovedCafes().map((cafe) => ({ slug: cafe.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const cafe = await getLiveCafeBySlug((await params).slug);
  if (!cafe) return {};
  return { title: cafe.name, description: cafe.shortDescription, openGraph: { images: [cafe.cover] } };
}

export default async function CafePage({ params }: { params: Promise<{ slug: string }> }) {
  const cafe = await getLiveCafeBySlug((await params).slug);
  if (!cafe) notFound();
  const cafeOffers = getOffersForCafe(cafe.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const structuredData = { "@context": "https://schema.org", "@type": "CafeOrCoffeeShop", name: cafe.name, description: cafe.description, image: cafe.gallery, telephone: cafe.phone, priceRange: cafe.priceRange, address: { "@type": "PostalAddress", streetAddress: cafe.address, addressCountry: "IR" }, url: `${siteUrl}/cafes/${cafe.slug}`, menu: `${siteUrl}/cafes/${cafe.slug}/menu`, openingHours: cafe.hours.filter((h) => !h.closed && h.opensAt && h.closesAt).map((h) => `${h.label} ${h.opensAt}-${h.closesAt}`) };
  return (
    <PublicShell>
      <AnalyticsBeacon eventType="profile_view" cafeId={cafe.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <CafeThemeSurface cafeId={cafe.id} initialTheme={cafe.theme}><header className="cafe-cover">
        {/* eslint-disable-next-line @next/next/no-img-element */}<img src={cafe.cover} alt={`نمای ${cafe.name}`} />
        <div className="cafe-cover-content"><div className="container"><img className="cafe-logo" src={cafe.logo} alt={`نشان ${cafe.name}`} /><h1>{cafe.name}</h1><div className="cafe-cover-meta"><span><MapPin size={15} style={{ display: "inline" }} /> {cafe.neighborhood}</span><span>{cafe.type}</span><span className={isOpenAt(cafe.hours) ? "open" : "closed"}>{getOpenLabel(cafe)}</span></div></div></div>
      </header>
      <div className="container profile-grid">
        <div>
          <section className="content-card"><h2>درباره {cafe.name}</h2><p>{cafe.description}</p><div className="quick-filters">{cafe.amenities.map((amenity) => <span className="chip" key={amenity}>{amenity}</span>)}</div></section>
          {cafeOffers.length > 0 && <section><div className="section-head"><div><span className="eyebrow">ویژه‌ی کافه‌ز</span><h2>پیشنهاد فعال</h2></div></div><div className="grid-2">{cafeOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div></section>}
          <section className="content-card" style={{ marginTop: 20 }}><h2>چند قاب از کافه</h2><div className="gallery"><img src={cafe.gallery[0]} alt={`فضای ${cafe.name}`} /><div className="gallery-small">{cafe.gallery.slice(1,3).map((image, index) => <img src={image} alt={`تصویر ${toPersianDigits(index + 2)} از ${cafe.name}`} key={image} />)}</div></div></section>
        </div>
        <aside className="profile-sidebar">
          <div className="content-card"><h2>راه‌های ارتباطی</h2><div className="action-list"><Link className="button button-primary" href={`/cafes/${cafe.slug}/menu`}><MenuIcon size={18} /> دیدن منوی کامل</Link><TrackedAnchor className="button button-dark" href={cafe.mapUrl} eventType="directions_click" cafeId={cafe.id}><MapPin size={18} /> مسیریابی</TrackedAnchor><TrackedAnchor className="button button-outline" href={`tel:${cafe.phone}`} eventType="contact_click" cafeId={cafe.id}><Phone size={18} /> تماس با کافه</TrackedAnchor>{cafe.instagram && <a className="button button-outline" href={cafe.instagram} target="_blank" rel="noreferrer"><AtSign size={18} /> اینستاگرام</a>}<div style={{ display: "flex", justifyContent: "center", gap: 10 }}><FavoriteButton cafeId={cafe.id} /><button className="icon-button" aria-label="اشتراک‌گذاری"><Share2 size={18} /></button></div></div></div>
          <div className="content-card"><h2><Clock3 size={18} style={{ display: "inline", verticalAlign: "middle" }} /> ساعت کاری</h2><div className="hours-list">{cafe.hours.map((entry) => <div className="hours-row" key={entry.day}><strong>{entry.label}</strong><span>{entry.closed ? "تعطیل" : `${entry.opensAt} – ${entry.closesAt}`}</span></div>)}</div></div>
          <div className="content-card"><h2>نشانی</h2><p>{cafe.address}</p><a href={cafe.mapUrl} target="_blank" rel="noreferrer" className="eyebrow">بازکردن روی نقشه <ExternalLink size={13} style={{ display: "inline" }} /></a></div>
        </aside>
      </div></CafeThemeSurface>
    </PublicShell>
  );
}
