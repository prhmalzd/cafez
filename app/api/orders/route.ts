import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { cafes } from "@/lib/data";
import { createDemoOrder } from "@/lib/order-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolvePickupTime } from "@/lib/tehran-time";
import { notifyCafeStaff } from "@/lib/web-push";

function messageFor(error: unknown) {
  const value = error instanceof Error ? error.message : String(error);
  const known: Record<string, string> = {
    CAFE_NOT_AVAILABLE: "کافه در دسترس نیست.", ORDERING_DISABLED: "سفارش‌گیری این کافه موقتاً متوقف است.", TOO_SOON: "زمان انتخاب‌شده برای آماده‌سازی کافی نیست.",
    SAME_DAY_ONLY: "در پایلوت فقط سفارش همان‌روز پذیرفته می‌شود.", OUTSIDE_ORDER_HOURS: "زمان انتخاب‌شده خارج از ساعت سفارش‌گیری است.", EMPTY_ORDER: "سبد سفارش خالی است.", OPEN_ORDER_EXISTS: "شما یک سفارش باز در این کافه دارید.",
    RATE_LIMIT: "تعداد درخواست‌ها بیش از حد مجاز است. کمی بعد دوباره تلاش کنید.", ITEM_UNAVAILABLE: "یکی از آیتم‌ها دیگر قابل سفارش نیست.",
    INVALID_QUANTITY: "تعداد آیتم معتبر نیست.", TOO_MANY_ITEMS: "هر سفارش می‌تواند حداکثر ۱۰ آیتم داشته باشد.", SLOT_FULL: "ظرفیت این بازه تکمیل شده است.",
  };
  return Object.entries(known).find(([key]) => value.includes(key))?.[1] ?? value;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.cafeId !== "string" || !Array.isArray(body.items) || (body.note && typeof body.note !== "string")) return NextResponse.json({ error: "اطلاعات سفارش کامل نیست." }, { status: 400 });
    const existingDevice = request.cookies.get("cafez_device")?.value;
    const deviceId = existingDevice && existingDevice.length >= 20 ? existingDevice : randomUUID();
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
    const networkHash = createHmac("sha256", process.env.ORDER_RATE_LIMIT_SECRET ?? "cafez-local-rate-limit").update(forwarded).digest("hex");
    const admin = getSupabaseAdmin();
    let order;
    if (admin) {
      const { data: settings } = await admin.from("order_settings").select("minimum_prep_minutes,slot_interval_minutes").eq("cafe_id", body.cafeId).maybeSingle();
      const requestedFor = resolvePickupTime(body.pickupTime, settings?.minimum_prep_minutes ?? 15, settings?.slot_interval_minutes ?? 15);
      const { data, error } = await admin.rpc("create_pickup_order", {
        p_cafe_id: body.cafeId, p_anonymous_id: deviceId, p_network_hash: networkHash, p_requested_for: requestedFor,
        p_note: body.note ?? "", p_items: body.items,
      });
      if (error) throw error;
      const cafe = cafes.find((item) => item.id === body.cafeId);
      order = { ...data, cafeId: body.cafeId, cafeName: cafe?.name ?? "کافه", note: body.note ?? "", items: [], createdAt: new Date().toISOString() };
    } else {
      order = createDemoOrder({ cafeId: body.cafeId, anonymousId: deviceId, networkHash, pickupTime: body.pickupTime, note: body.note, items: body.items });
    }
    await notifyCafeStaff(body.cafeId);
    const response = NextResponse.json({ order, statusUrl: `/orders/${order.code}?token=${order.accessToken}` }, { status: 201 });
    response.cookies.set("cafez_device", deviceId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
    return response;
  } catch (error) {
    return NextResponse.json({ error: messageFor(error) }, { status: 400 });
  }
}
