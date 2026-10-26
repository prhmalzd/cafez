import { describe, expect, it } from "vitest";
import { createDemoOrder, getDemoOrder, transitionDemoOrder } from "@/lib/order-store";
import { isSameTehranDay, resolvePickupTime } from "@/lib/tehran-time";

describe("pickup ordering", () => {
  it("rounds ASAP to a same-day Tehran slot", () => {
    const now = new Date("2026-10-26T06:02:00Z");
    const pickup = resolvePickupTime("asap", 15, 15, now);
    expect(isSameTehranDay(pickup, now)).toBe(true);
    expect(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(pickup))).toBe("10:00");
  });

  it("creates a private price snapshot and follows valid transitions", () => {
    const now = new Date("2099-10-26T06:00:00Z");
    const order = createDemoOrder({ cafeId: "cafe-1", anonymousId: "test-device-order-one", networkHash: "network-one", pickupTime: "asap", note: "بدون شکر", items: [{ menuItemId: "m1", quantity: 2 }] }, now);
    expect(order.totalPrice).toBe(296000);
    expect(transitionDemoOrder(order.id, "accepted", new Date(now.getTime() + 30 * 60_000).toISOString()).status).toBe("accepted");
    expect(getDemoOrder(order.code, "wrong-token")).toBeUndefined();
    expect(getDemoOrder(order.code, order.accessToken)?.note).toBe("بدون شکر");
    expect(transitionDemoOrder(order.id, "ready").status).toBe("ready");
    expect(transitionDemoOrder(order.id, "collected").status).toBe("collected");
    expect(() => transitionDemoOrder(order.id, "ready")).toThrow("مجاز نیست");
  });

  it("enforces one open order per anonymous browser", () => {
    const now = new Date("2099-10-26T06:00:00Z");
    createDemoOrder({ cafeId: "cafe-1", anonymousId: "test-device-order-two", networkHash: "network-two", pickupTime: "asap", items: [{ menuItemId: "m2", quantity: 1 }] }, now);
    expect(() => createDemoOrder({ cafeId: "cafe-1", anonymousId: "test-device-order-two", networkHash: "network-two", pickupTime: "asap", items: [{ menuItemId: "m3", quantity: 1 }] }, now)).toThrow("سفارش باز");
  });
});
