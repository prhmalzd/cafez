import { randomUUID } from "node:crypto";
import { offers as seedOffers } from "@/lib/data";
import type { Offer } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & { __cafezOffers?: Map<string, Offer> };
const store = globalStore.__cafezOffers ?? new Map(seedOffers.map((offer) => [offer.id, { ...offer }]));
globalStore.__cafezOffers = store;
export const listDemoOffers = (cafeId: string) => [...store.values()].filter((offer) => offer.cafeId === cafeId);

export function saveDemoOffer(input: Partial<Offer> & Pick<Offer, "cafeId" | "title">) {
  const current = input.id ? store.get(input.id) : undefined;
  const item: Offer = {
    id: current?.id ?? randomUUID(), cafeId: input.cafeId, slug: input.slug || current?.slug || `offer-${Date.now()}`,
    title: input.title, description: input.description ?? current?.description ?? "", terms: input.terms ?? current?.terms ?? "",
    badge: input.badge ?? current?.badge ?? "پیشنهاد ویژه", image: input.image ?? current?.image ?? "/icons/cafez.svg",
    startsAt: input.startsAt ?? current?.startsAt ?? new Date().toISOString(), endsAt: input.endsAt ?? current?.endsAt ?? new Date(Date.now() + 7 * 86400_000).toISOString(),
    validFrom: input.validFrom ?? current?.validFrom, validUntil: input.validUntil ?? current?.validUntil, dailyCap: input.dailyCap ?? current?.dailyCap,
    claimedToday: current?.claimedToday ?? 0, status: input.status ?? current?.status ?? "active",
  };
  store.set(item.id, item); return item;
}
