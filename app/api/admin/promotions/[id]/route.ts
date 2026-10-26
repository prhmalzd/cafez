import { NextRequest, NextResponse } from "next/server";
import { authError, requireAdmin } from "@/lib/authz";
import { updateDemoPromotion } from "@/lib/promotion-store";
import { listDemoPromotions } from "@/lib/promotion-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const id = (await params).id;
    const body = await request.json();
    const allowed = new Set(["scheduled", "active", "paused", "completed", "rejected"]);
    if (!allowed.has(body.status)) return NextResponse.json({ error: "وضعیت معتبر نیست." }, { status: 400 });
    const admin = getSupabaseAdmin();
    if (!admin) {
      const target = listDemoPromotions().find((item) => item.id === id);
      if (!target) return NextResponse.json({ error: "درخواست پیدا نشد." }, { status: 404 });
      if (body.status === "active" && listDemoPromotions().filter((item) => item.id !== id && item.placement === target.placement && item.status === "active" && item.startsAt < target.endsAt && item.endsAt > target.startsAt).length >= 3) return NextResponse.json({ error: "ظرفیت این جایگاه در هفته انتخابی تکمیل است." }, { status: 409 });
      return NextResponse.json({ promotion: updateDemoPromotion(id, { status: body.status }), mode: "demo" });
    }
    if (body.status === "active") {
      const { data: target } = await admin.from("promotions").select("placement,starts_at,ends_at").eq("id", id).single();
      if (!target) return NextResponse.json({ error: "درخواست پیدا نشد." }, { status: 404 });
      const { count } = await admin.from("promotions").select("id", { count: "exact", head: true }).neq("id", id).eq("placement", target.placement).eq("status", "active").eq("is_paused", false).lt("starts_at", target.ends_at).gt("ends_at", target.starts_at);
      if ((count ?? 0) >= 3) return NextResponse.json({ error: "ظرفیت این جایگاه در هفته انتخابی تکمیل است." }, { status: 409 });
    }
    const payload = body.status === "paused" ? { is_paused: true } : { status: body.status, is_paused: false, rejection_note: body.rejectionNote ?? null };
    const { data, error } = await admin.from("promotions").update(payload).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json({ promotion: data });
  } catch (error) { const auth = authError(error); return NextResponse.json({ error: auth?.message ?? "به‌روزرسانی تبلیغ انجام نشد." }, { status: auth?.status ?? 500 }); }
}
