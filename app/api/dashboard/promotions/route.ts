import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { cafes } from "@/lib/data";
import { createDemoPromotion, listDemoPromotions } from "@/lib/promotion-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PromotionPlacement } from "@/lib/types";

const placements = new Set<PromotionPlacement>(["home_hero", "home_card", "cafes_card", "offers_banner"]);

export async function GET(request: NextRequest) {
  const cafeId = request.nextUrl.searchParams.get("cafeId") ?? "";
  try {
    await requireCafeMember(cafeId);
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ promotions: listDemoPromotions(cafeId), mode: "demo" });
    const { data, error } = await admin.from("promotions").select("*, cafes(name)").eq("cafe_id", cafeId).order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ promotions: (data ?? []).map((item) => ({ id: item.id, cafeId: item.cafe_id, cafeName: item.cafes?.name ?? "کافه", placement: item.placement, title: item.title, image: item.image_url, targetUrl: item.target_url, startsAt: item.starts_at, endsAt: item.ends_at, status: item.is_paused ? "paused" : item.status })) });
  } catch (error) { const auth = authError(error); return NextResponse.json({ error: auth?.message ?? "دریافت تبلیغات انجام نشد." }, { status: auth?.status ?? 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cafeId = String(body.cafeId ?? "");
    await requireCafeMember(cafeId);
    if (!placements.has(body.placement) || typeof body.title !== "string" || typeof body.targetUrl !== "string" || !/^\/(cafes|offers)\//.test(body.targetUrl)) return NextResponse.json({ error: "اطلاعات جایگاه یا مقصد معتبر نیست." }, { status: 400 });
    const startsAt = new Date(`${body.weekStart}T00:00:00+03:30`);
    const endsAt = new Date(startsAt.getTime() + 7 * 24 * 60 * 60_000);
    if (!Number.isFinite(startsAt.getTime())) return NextResponse.json({ error: "تاریخ شروع معتبر نیست." }, { status: 400 });
    const admin = getSupabaseAdmin();
    if (!admin) {
      const cafe = cafes.find((item) => item.id === cafeId)!;
      return NextResponse.json({ promotion: createDemoPromotion({ cafeId, cafeName: cafe.name, placement: body.placement, title: body.title.slice(0, 120), image: body.image || cafe.cover, targetUrl: body.targetUrl, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }), mode: "demo" }, { status: 201 });
    }
    const { data, error } = await admin.from("promotions").insert({ cafe_id: cafeId, placement: body.placement, title: body.title.slice(0, 120), image_url: body.image, target_url: body.targetUrl, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), status: "requested" }).select().single();
    if (error) throw error;
    return NextResponse.json({ promotion: data }, { status: 201 });
  } catch (error) { const auth = authError(error); return NextResponse.json({ error: auth?.message ?? "ثبت درخواست تبلیغ انجام نشد." }, { status: auth?.status ?? 500 }); }
}
