import { NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { listDemoOffers, saveDemoOffer } from "@/lib/offer-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const clean = (value: unknown, max: number) => String(value ?? "").trim().slice(0, max);
export async function GET(request: Request) {
  const cafeId = new URL(request.url).searchParams.get("cafeId") ?? "";
  try { const auth = await requireCafeMember(cafeId); if (auth.demo) return NextResponse.json({ offers: listDemoOffers(cafeId) }); const supabase = await createSupabaseServerClient(); const { data, error } = await supabase!.from("offers").select("*").eq("cafe_id", cafeId).order("created_at", { ascending: false }); if (error) throw error; return NextResponse.json({ offers: data }); }
  catch (error) { const known = authError(error); return NextResponse.json({ error: known?.message ?? "دریافت پیشنهادها ناموفق بود." }, { status: known?.status ?? 400 }); }
}
export async function POST(request: Request) {
  const body = await request.json(); const cafeId = clean(body.cafeId, 60);
  try {
    const auth = await requireCafeMember(cafeId); const title = clean(body.title, 90); const startsAt = new Date(body.startsAt); const endsAt = new Date(body.endsAt);
    if (!title || !Number.isFinite(startsAt.getTime()) || !Number.isFinite(endsAt.getTime()) || endsAt <= startsAt) throw new Error("زمان و عنوان پیشنهاد را درست وارد کنید.");
    const status = ["draft", "active", "paused"].includes(body.status) ? body.status : "active";
    const payload = { cafe_id: cafeId, slug: clean(body.slug, 80) || `offer-${Date.now()}`, title, description: clean(body.description, 500), terms: clean(body.terms, 800), badge: clean(body.badge, 40) || "پیشنهاد ویژه", image_url: clean(body.image, 500) || null, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString(), valid_from: body.validFrom || null, valid_until: body.validUntil || null, daily_cap: body.dailyCap ? Math.max(1, Number(body.dailyCap)) : null, status };
    if (auth.demo) return NextResponse.json({ offer: saveDemoOffer({ ...body, cafeId, title, startsAt: payload.starts_at, endsAt: payload.ends_at, status }) });
    const supabase = await createSupabaseServerClient(); const query = body.id ? supabase!.from("offers").update(payload).eq("id", body.id).eq("cafe_id", cafeId) : supabase!.from("offers").insert(payload); const { data, error } = await query.select().single(); if (error) throw error; return NextResponse.json({ offer: data });
  } catch (error) { const known = authError(error); return NextResponse.json({ error: known?.message ?? (error instanceof Error ? error.message : "ذخیره پیشنهاد ناموفق بود.") }, { status: known?.status ?? 400 }); }
}
