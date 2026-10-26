import { randomUUID } from "node:crypto";
import { promotions as seed } from "@/lib/data";
import type { Promotion } from "@/lib/types";

const globalStore = globalThis as typeof globalThis & { __cafezPromotions?: Map<string, Promotion> };
const store = globalStore.__cafezPromotions ?? new Map(seed.map((promotion) => [promotion.id, promotion]));
globalStore.__cafezPromotions = store;

export function listDemoPromotions(cafeId?: string) {
  return [...store.values()].filter((promotion) => !cafeId || promotion.cafeId === cafeId);
}

export function createDemoPromotion(input: Omit<Promotion, "id" | "status">) {
  const promotion: Promotion = { ...input, id: randomUUID(), status: "requested", impressions: 0, clicks: 0 };
  store.set(promotion.id, promotion);
  return promotion;
}

export function updateDemoPromotion(id: string, update: Partial<Promotion>) {
  const current = store.get(id);
  if (!current) throw new Error("درخواست تبلیغ پیدا نشد.");
  const next = { ...current, ...update, id: current.id, cafeId: current.cafeId };
  store.set(id, next);
  return next;
}
