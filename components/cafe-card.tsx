import { MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import type { Cafe } from "@/lib/types";
import { cn, getOpenLabel, isOpenAt } from "@/lib/utils";

export function CafeCard({ cafe }: { cafe: Cafe }) {
  const open = isOpenAt(cafe.hours);
  return (
    <article className="cafe-card">
      <div className="card-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cafe.cover} alt={`فضای ${cafe.name}`} loading="lazy" />
        <div className="card-badges">
          {cafe.sponsored && <span className="badge badge-sponsored">تبلیغ</span>}
          {cafe.offerIds.length > 0 && <span className="badge"><Sparkles size={13} /> پیشنهاد فعال</span>}
        </div>
        <FavoriteButton cafeId={cafe.id} floating />
      </div>
      <Link href={`/cafes/${cafe.slug}`} className="card-body">
        <div className="card-title-row"><h3>{cafe.name}</h3><span className={cn(open ? "open" : "closed")}>{getOpenLabel(cafe)}</span></div>
        <p>{cafe.shortDescription}</p>
        <div className="card-meta"><span><MapPin size={13} style={{ display: "inline", verticalAlign: "middle" }} /> {cafe.neighborhood}</span><span>{cafe.type} · {cafe.priceRange}</span></div>
      </Link>
    </article>
  );
}
