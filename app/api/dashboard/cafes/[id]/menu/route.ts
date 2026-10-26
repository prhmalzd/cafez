import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cafeId = (await params).id;
  try {
    await requireCafeMember(cafeId);
    const body = await request.json();
    if (!Array.isArray(body.categories) || body.categories.length > 100) return NextResponse.json({ error: "ساختار منو معتبر نیست." }, { status: 400 });
    const itemCount = body.categories.reduce((total: number, category: { items?: unknown[] }) => total + (Array.isArray(category.items) ? category.items.length : 0), 0);
    if (itemCount > 1000) return NextResponse.json({ error: "تعداد آیتم‌های منو بیش از حد مجاز است." }, { status: 400 });
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ ok: true, mode: "demo" });
    const { error } = await admin.rpc("replace_cafe_menu", { p_cafe_id: cafeId, p_categories: body.categories });
    if (error) throw error;
    return NextResponse.json({ ok: true, mode: "supabase" });
  } catch (error) {
    const auth = authError(error);
    return NextResponse.json({ error: auth?.message ?? "ذخیره منو انجام نشد." }, { status: auth?.status ?? 500 });
  }
}
