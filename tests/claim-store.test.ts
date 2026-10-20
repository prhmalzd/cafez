import { beforeEach, describe, expect, it } from "vitest";
import { clearDemoClaims, createDemoClaim, redeemDemoClaim } from "@/lib/claim-store";
import type { Offer } from "@/lib/types";

const offer: Offer = {
  id: "offer-test", slug: "test", cafeId: "cafe-test", title: "تست", description: "", terms: "", badge: "", image: "",
  startsAt: "2026-01-01T00:00:00Z", endsAt: "2027-01-01T00:00:00Z", status: "active", dailyCap: 2,
};

describe("one-time offer claims", () => {
  beforeEach(clearDemoClaims);

  it("creates a six-character code expiring in two hours", () => {
    const now = new Date("2026-10-20T08:00:00Z");
    const claim = createDemoClaim(offer, "device-identifier-0001", now);
    expect(claim.code).toMatch(/^[A-Z2-9]{6}$/);
    expect(new Date(claim.expiresAt).getTime() - now.getTime()).toBe(7_200_000);
  });

  it("returns the same active claim for the same device", () => {
    const now = new Date("2026-10-20T08:00:00Z");
    const first = createDemoClaim(offer, "device-identifier-0001", now);
    expect(createDemoClaim(offer, "device-identifier-0001", new Date("2026-10-20T08:30:00Z")).id).toBe(first.id);
  });

  it("redeems atomically and rejects reuse", () => {
    const now = new Date("2026-10-20T08:00:00Z");
    const claim = createDemoClaim(offer, "device-identifier-0001", now);
    expect(redeemDemoClaim(claim.code, offer.cafeId, new Date("2026-10-20T08:10:00Z")).status).toBe("redeemed");
    expect(() => redeemDemoClaim(claim.code, offer.cafeId, new Date("2026-10-20T08:11:00Z"))).toThrow("ALREADY_REDEEMED");
  });

  it("rejects a code at another cafe", () => {
    const claim = createDemoClaim(offer, "device-identifier-0001", new Date("2026-10-20T08:00:00Z"));
    expect(() => redeemDemoClaim(claim.code, "other-cafe", new Date("2026-10-20T08:10:00Z"))).toThrow("WRONG_CAFE");
  });
});
