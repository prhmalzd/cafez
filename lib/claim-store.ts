import { randomBytes, randomUUID } from "node:crypto";
import type { ClaimRecord, Offer } from "@/lib/types";

const claims = new Map<string, ClaimRecord>();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode() {
  const bytes = randomBytes(6);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function expireOld(now: Date) {
  for (const claim of claims.values()) {
    if (claim.status === "active" && new Date(claim.expiresAt) <= now) claim.status = "expired";
  }
}

export function createDemoClaim(offer: Offer, anonymousId: string, now = new Date()): ClaimRecord {
  expireOld(now);
  const last24Hours = now.getTime() - 24 * 60 * 60 * 1000;
  const existing = [...claims.values()].find((claim) => claim.offerId === offer.id && claim.anonymousId === anonymousId && new Date(claim.createdAt).getTime() > last24Hours && claim.status !== "rejected");
  if (existing) {
    if (existing.status === "active") return existing;
    throw new Error("CLAIM_LIMIT");
  }
  const redeemedToday = [...claims.values()].filter((claim) => claim.offerId === offer.id && claim.status === "redeemed" && new Date(claim.createdAt).toDateString() === now.toDateString()).length;
  if (offer.dailyCap && redeemedToday >= offer.dailyCap) throw new Error("DAILY_CAP");
  const offerEnd = new Date(offer.endsAt).getTime();
  const expiresAt = new Date(Math.min(now.getTime() + 2 * 60 * 60 * 1000, offerEnd));
  if (expiresAt <= now) throw new Error("OFFER_EXPIRED");
  let code = generateCode();
  while ([...claims.values()].some((claim) => claim.code === code && claim.status === "active")) code = generateCode();
  const claim: ClaimRecord = { id: randomUUID(), offerId: offer.id, cafeId: offer.cafeId, anonymousId, code, status: "active", createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() };
  claims.set(claim.id, claim);
  return claim;
}

export function redeemDemoClaim(code: string, cafeId: string, now = new Date()): ClaimRecord {
  expireOld(now);
  const normalized = code.trim().toUpperCase();
  const claim = [...claims.values()].find((item) => item.code === normalized);
  if (!claim) throw new Error("NOT_FOUND");
  if (claim.cafeId !== cafeId) throw new Error("WRONG_CAFE");
  if (claim.status === "redeemed") throw new Error("ALREADY_REDEEMED");
  if (claim.status !== "active" || new Date(claim.expiresAt) <= now) throw new Error("EXPIRED");
  claim.status = "redeemed";
  claim.redeemedAt = now.toISOString();
  claims.set(claim.id, claim);
  return claim;
}

export function clearDemoClaims() { claims.clear(); }
