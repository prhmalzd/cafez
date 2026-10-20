import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsBeacon } from "@/components/analytics-beacon";
import { OfferClaim } from "@/components/offer-claim";
import { PublicShell } from "@/components/public-shell";
import { getCafeById, getOfferBySlug } from "@/lib/data";
import { formatPersianDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const offer = getOfferBySlug((await params).slug); return offer ? { title: offer.title, description: offer.description, openGraph: { images: [offer.image] } } : {}; }

export default async function OfferPage({ params }: { params: Promise<{ slug: string }> }) {
  const offer = getOfferBySlug((await params).slug); if (!offer) notFound();
  const cafe = getCafeById(offer.cafeId); if (!cafe) notFound();
  return <PublicShell><AnalyticsBeacon eventType="offer_view" cafeId={cafe.id} offerId={offer.id} /><div className="offer-detail"><div className="offer-photo"><img src={offer.image} alt={offer.title} /></div><div className="offer-panel"><div><Link href={`/cafes/${cafe.slug}`} className="eyebrow"><ArrowRight size={14} style={{ display: "inline" }} /> بازگشت به {cafe.name}</Link><div style={{ marginTop: 22 }}><span className="offer-label" style={{ color: "white" }}>{offer.badge}</span></div><h1>{offer.title}</h1><p className="muted" style={{ fontSize: "1rem", lineHeight: 2 }}>{offer.description}</p><div className="quick-filters"><span className="chip"><Clock3 size={14} /> {offer.validFrom} تا {offer.validUntil}</span><span className="chip"><CalendarDays size={14} /> تا {formatPersianDate(offer.endsAt)}</span><span className="chip"><MapPin size={14} /> {cafe.neighborhood}</span></div><div className="content-card" style={{ marginTop: 20 }}><strong>شرایط استفاده</strong><p style={{ fontSize: ".8rem", marginBottom: 0 }}>{offer.terms}</p></div><OfferClaim offerId={offer.id} /></div></div></div></PublicShell>;
}
