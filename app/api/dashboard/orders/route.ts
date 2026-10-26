import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { listDemoOrders } from "@/lib/order-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const cafeId = request.nextUrl.searchParams.get("cafeId") ?? "";
  try {
    await requireCafeMember(cafeId);
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ orders: listDemoOrders(cafeId), mode: "demo" });
    const { data, error } = await admin.from("pickup_orders").select("*, cafes(name), pickup_order_items(*)").eq("cafe_id", cafeId).order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    const orders = (data ?? []).map((order) => ({
      id: order.id, cafeId: order.cafe_id, cafeName: order.cafes?.name ?? "کافه", code: order.public_code, accessToken: "", status: order.status,
      requestedFor: order.requested_for, promisedFor: order.promised_for, note: order.note, totalPrice: order.total_price_toman,
      createdAt: order.created_at, expiresAt: order.expires_at, rejectionReason: order.rejection_reason,
      items: (order.pickup_order_items ?? []).map((item: Record<string, unknown>) => ({ menuItemId: item.menu_item_id, name: item.item_name, unitPrice: item.unit_price_toman, quantity: item.quantity })),
    }));
    return NextResponse.json({ orders, mode: "supabase" });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json({ error: auth?.message ?? "خطا در دریافت سفارش‌ها." }, { status: auth?.status ?? 500 });
  }
}
