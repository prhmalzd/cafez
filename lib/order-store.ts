import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cafes } from "@/lib/data";
import { isSameTehranDay, resolvePickupTime } from "@/lib/tehran-time";
import type { OrderSettings, PickupOrder, PickupOrderStatus } from "@/lib/types";

type NewOrderItem = { menuItemId: string; quantity: number };
type InternalOrder = PickupOrder & { anonymousIdHash: string; networkHash: string };

const globalStore = globalThis as typeof globalThis & { __cafezOrders?: Map<string, InternalOrder> };
const orders = globalStore.__cafezOrders ?? new Map<string, InternalOrder>();
globalStore.__cafezOrders = orders;

export const defaultOrderSettings: OrderSettings = {
  enabled: true, minimumPrepMinutes: 15, slotIntervalMinutes: 15, capacityPerSlot: 5, acceptanceTimeoutMinutes: 5, opensAt: "08:00", closesAt: "22:30",
};

const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const code = () => Array.from(randomBytes(8), (byte) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[byte % 32]).join("");

function expireStale(now = new Date()) {
  for (const order of orders.values()) {
    if (order.status === "pending" && new Date(order.expiresAt) <= now) order.status = "expired";
  }
}

export function createDemoOrder(input: { cafeId: string; anonymousId: string; networkHash: string; pickupTime?: string; note?: string; items: NewOrderItem[] }, now = new Date()) {
  expireStale(now);
  const cafe = cafes.find((item) => item.id === input.cafeId && item.status === "approved");
  if (!cafe) throw new Error("کافه در دسترس نیست.");
  const settings = cafe.orderSettings ?? defaultOrderSettings;
  if (!settings.enabled) throw new Error("سفارش‌گیری این کافه موقتاً متوقف است.");
  if (!Array.isArray(input.items) || !input.items.length) throw new Error("سبد سفارش خالی است.");
  const units = input.items.reduce((total, item) => total + Number(item.quantity), 0);
  if (units < 1 || units > 10) throw new Error("هر سفارش می‌تواند حداکثر ۱۰ آیتم داشته باشد.");
  const anonymousIdHash = hash(input.anonymousId);
  if ([...orders.values()].some((order) => order.cafeId === cafe.id && order.anonymousIdHash === anonymousIdHash && ["pending", "accepted", "ready"].includes(order.status))) throw new Error("شما یک سفارش باز در این کافه دارید.");
  if ([...orders.values()].filter((order) => order.networkHash === input.networkHash && now.getTime() - new Date(order.createdAt).getTime() < 30 * 60_000).length >= 5) throw new Error("تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.");
  const requestedFor = resolvePickupTime(input.pickupTime, settings.minimumPrepMinutes, settings.slotIntervalMinutes, now);
  if (!isSameTehranDay(requestedFor, now)) throw new Error("در پایلوت فقط سفارش همان‌روز پذیرفته می‌شود.");
  const requestedClock = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(requestedFor));
  if (requestedClock < settings.opensAt || requestedClock > settings.closesAt) throw new Error("زمان انتخاب‌شده خارج از ساعت سفارش‌گیری است.");
  if ([...orders.values()].filter((order) => order.cafeId === cafe.id && order.requestedFor === requestedFor && ["pending", "accepted", "ready"].includes(order.status)).length >= settings.capacityPerSlot) throw new Error("ظرفیت این بازه تکمیل شده است.");

  const snapshots = input.items.map((requestItem) => {
    const menuItem = cafe.menu.flatMap((category) => category.items).find((item) => item.id === requestItem.menuItemId);
    const quantity = Number(requestItem.quantity);
    if (!menuItem || !menuItem.available || menuItem.orderable === false) throw new Error("یکی از آیتم‌ها دیگر قابل سفارش نیست.");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error("تعداد آیتم معتبر نیست.");
    return { menuItemId: menuItem.id, name: menuItem.name, unitPrice: menuItem.price, quantity };
  });
  const accessToken = randomBytes(24).toString("hex");
  const createdAt = now.toISOString();
  const order: InternalOrder = {
    id: randomUUID(), cafeId: cafe.id, cafeName: cafe.name, code: code(), accessToken, status: "pending", requestedFor,
    note: String(input.note ?? "").slice(0, 200), items: snapshots,
    totalPrice: snapshots.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), createdAt,
    expiresAt: new Date(now.getTime() + settings.acceptanceTimeoutMinutes * 60_000).toISOString(), anonymousIdHash, networkHash: input.networkHash,
  };
  orders.set(order.id, order);
  return order;
}

export function getDemoOrder(codeValue: string, token: string) {
  expireStale();
  return [...orders.values()].find((order) => order.code === codeValue.toUpperCase() && order.accessToken === token);
}

export function listDemoOrders(cafeId: string) {
  expireStale();
  return [...orders.values()].filter((order) => order.cafeId === cafeId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const allowed: Record<PickupOrderStatus, PickupOrderStatus[]> = {
  pending: ["accepted", "rejected", "expired"], accepted: ["ready", "cancelled", "no_show"], ready: ["collected", "no_show"],
  collected: [], rejected: [], cancelled: [], expired: [], no_show: [],
};

export function transitionDemoOrder(id: string, status: PickupOrderStatus, promisedFor?: string, rejectionReason?: string) {
  expireStale();
  const order = orders.get(id);
  if (!order) throw new Error("سفارش پیدا نشد.");
  if (!allowed[order.status].includes(status)) throw new Error("این تغییر وضعیت مجاز نیست.");
  order.status = status;
  if (status === "accepted") order.promisedFor = promisedFor ?? order.requestedFor;
  if (status === "rejected") order.rejectionReason = rejectionReason?.slice(0, 160) || "امکان آماده‌سازی سفارش وجود ندارد.";
  return order;
}
