import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { contrastWithWhite, sanitizeTheme } from "@/lib/themes";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cafeId = (await params).id;
  try {
    await requireCafeMember(cafeId);
    const body = await request.json();
    const theme = sanitizeTheme(body.theme);
    if (body.theme?.primaryColor && contrastWithWhite(body.theme.primaryColor) < 4.5) return NextResponse.json({ error: "رنگ اصلی برای نوشته سفید کنتراست کافی ندارد." }, { status: 400 });
    const prep = Math.max(15, Math.min(180, Number(body.orderSettings?.minimumPrepMinutes ?? 15)));
    const interval = [15, 30, 60].includes(Number(body.orderSettings?.slotIntervalMinutes)) ? Number(body.orderSettings.slotIntervalMinutes) : 15;
    const capacity = Math.max(1, Math.min(100, Number(body.orderSettings?.capacityPerSlot ?? 5)));
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ ok: true, theme, orderSettings: { ...body.orderSettings, minimumPrepMinutes: prep, slotIntervalMinutes: interval, capacityPerSlot: capacity }, mode: "demo" });
    const cafeUpdate = { name: String(body.profile?.name ?? "").slice(0, 100), short_description: String(body.profile?.shortDescription ?? "").slice(0, 240), address: String(body.profile?.address ?? "").slice(0, 500), phone: String(body.profile?.phone ?? "").slice(0, 30), neighborhood: String(body.profile?.neighborhood ?? "").slice(0, 100) };
    const [{ error: cafeError }, { error: themeError }, { error: settingsError }] = await Promise.all([
      admin.from("cafes").update(cafeUpdate).eq("id", cafeId),
      admin.from("cafe_themes").upsert({ cafe_id: cafeId, preset: theme.preset, primary_color: theme.primaryColor, accent_color: theme.accentColor, mode: theme.mode, font: theme.font, tier: theme.tier }),
      admin.from("order_settings").upsert({ cafe_id: cafeId, enabled: Boolean(body.orderSettings?.enabled), minimum_prep_minutes: prep, slot_interval_minutes: interval, capacity_per_slot: capacity, acceptance_timeout_minutes: 5, order_opens_at: /^\d{2}:\d{2}$/.test(body.orderSettings?.opensAt) ? body.orderSettings.opensAt : "08:00", order_closes_at: /^\d{2}:\d{2}$/.test(body.orderSettings?.closesAt) ? body.orderSettings.closesAt : "22:30" }),
    ]);
    if (cafeError || themeError || settingsError) throw cafeError ?? themeError ?? settingsError;
    return NextResponse.json({ ok: true, theme, orderSettings: { ...body.orderSettings, minimumPrepMinutes: prep, slotIntervalMinutes: interval, capacityPerSlot: capacity } });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json({ error: auth?.message ?? "ذخیره تنظیمات انجام نشد." }, { status: auth?.status ?? 500 });
  }
}
