import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authError, requireCafeMember } from "@/lib/authz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cafeId = (await params).id;
  try {
    await requireCafeMember(cafeId);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0 || file.size > 2 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) return NextResponse.json({ error: "تصویر باید JPG، PNG یا WebP و کوچک‌تر از ۲ مگابایت باشد." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const admin = getSupabaseAdmin();
    if (!admin) return NextResponse.json({ url: `data:${file.type};base64,${bytes.toString("base64")}`, mode: "demo" });
    const extension = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${cafeId}/promotions/${randomUUID()}.${extension}`;
    const { error: uploadError } = await admin.storage.from("cafe-media").upload(path, bytes, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { data } = admin.storage.from("cafe-media").getPublicUrl(path);
    await admin.from("media_assets").insert({ cafe_id: cafeId, storage_path: data.publicUrl, kind: "promotion", alt_text: "بنر تبلیغاتی کافه" });
    return NextResponse.json({ url: data.publicUrl });
  } catch (error) { const auth = authError(error); return NextResponse.json({ error: auth?.message ?? "بارگذاری تصویر انجام نشد." }, { status: auth?.status ?? 500 }); }
}
