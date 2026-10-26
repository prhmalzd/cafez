import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { transitionDemoOrder } from "@/lib/order-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PickupOrderStatus } from "@/lib/types";
import { notifyOrderCustomer } from "@/lib/web-push";

const transitions: Record<PickupOrderStatus, PickupOrderStatus[]> = {
  pending: ["accepted", "rejected", "expired"], accepted: ["ready", "cancelled", "no_show"], ready: ["collected", "no_show"],
  collected: [], rejected: [], cancelled: [], expired: [], no_show: [],
};

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const body = await request.json();
    const status = body.status as PickupOrderStatus;
    const cafeId = String(body.cafeId ?? "");
    if (!Object.hasOwn(transitions, status)) return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });
    await requireCafeMember(cafeId);
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ order: transitionDemoOrder(id, status, body.promisedFor, body.rejectionReason), mode: "demo" });
    const { data: current, error: readError } = await admin.from("pickup_orders").select("status,cafe_id").eq("id", id).single();
    if (readError || current.cafe_id !== cafeId) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    if (!transitions[current.status as PickupOrderStatus].includes(status)) return NextResponse.json({ error: "این تغییر وضعیت مجاز نیست." }, { status: 409 });
    const update: Record<string, unknown> = { status };
    if (status === "accepted") { update.promised_for = body.promisedFor; update.accepted_at = new Date().toISOString(); }
    if (status === "ready") update.ready_at = new Date().toISOString();
    if (status === "collected") update.collected_at = new Date().toISOString();
    if (status === "rejected") update.rejection_reason = String(body.rejectionReason ?? "امکان آماده‌سازی سفارش وجود ندارد.").slice(0, 160);
    const { data, error } = await admin.from("pickup_orders").update(update).eq("id", id).eq("status", current.status).select().single();
    if (error || !data) return NextResponse.json({ error: "وضعیت سفارش هم‌زمان تغییر کرده است." }, { status: 409 });
    await notifyOrderCustomer(id);
    return NextResponse.json({ order: data, mode: "supabase" });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json({ error: auth?.message ?? (error instanceof Error ? error.message : "خطا در به‌روزرسانی سفارش.") }, { status: auth?.status ?? 400 });
  }
}
