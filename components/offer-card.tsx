import { ArrowLeft, Clock3 } from "lucide-react";
import Link from "next/link";
import type { Offer } from "@/lib/types";
import { getCafeById } from "@/lib/data";

export function OfferCard({ offer }: { offer: Offer }) {
  const cafe = getCafeById(offer.cafeId);
  return (
    <article className="offer-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={offer.image} alt="" loading="lazy" />
      <div className="offer-content">
        <span className="offer-label">{offer.badge}</span>
        <h3>{offer.title}</h3>
        <p>{offer.description}</p>
        <div className="offer-footer"><span><Clock3 size={14} style={{ display: "inline", verticalAlign: "middle" }} /> {offer.validFrom} تا {offer.validUntil} · {cafe?.name}</span><Link href={`/offers/${offer.slug}`} className="icon-button" aria-label="مشاهده پیشنهاد"><ArrowLeft size={19} /></Link></div>
      </div>
    </article>
  );
}
