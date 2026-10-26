import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = body.subscription?.endpoint;
    const p256dh = body.subscription?.keys?.p256dh;
    const auth = body.subscription?.keys?.auth;
    if (typeof endpoint !== "string" || typeof p256dh !== "string" || typeof auth !== "string" || !endpoint.startsWith("https://")) return NextResponse.json({ error: "اشتراک اعلان معتبر نیست." }, { status: 400 });
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ ok: true, mode: "demo" });
    if (body.purpose === "staff" && typeof body.cafeId === "string") {
      const member = await requireCafeMember(body.cafeId);
      const { error } = await admin.from("push_subscriptions").upsert({ cafe_id: body.cafeId, user_id: member.userId, endpoint, p256dh, auth, purpose: "staff" }, { onConflict: "endpoint" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    if (body.purpose === "customer" && typeof body.orderId === "string" && typeof body.accessToken === "string") {
      const { data: order } = await admin.from("pickup_orders").select("public_code").eq("id", body.orderId).maybeSingle();
      if (!order) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
      const { error: tokenError } = await admin.rpc("get_pickup_order", { p_code: order.public_code, p_access_token: body.accessToken });
      if (tokenError) return NextResponse.json({ error: "دسترسی سفارش معتبر نیست." }, { status: 403 });
      const { error } = await admin.from("push_subscriptions").upsert({ order_id: body.orderId, endpoint, p256dh, auth, purpose: "customer" }, { onConflict: "endpoint" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "نوع اعلان معتبر نیست." }, { status: 400 });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json({ error: auth?.message ?? "فعال‌سازی اعلان انجام نشد." }, { status: auth?.status ?? 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get("endpoint");
  const admin = getSupabaseAdmin();
  if (!endpoint || !admin) return NextResponse.json({ ok: true });
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}
