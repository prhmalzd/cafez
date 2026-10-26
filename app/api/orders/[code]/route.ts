import { NextRequest, NextResponse } from "next/server";
import { getDemoOrder } from "@/lib/order-store";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!token) return NextResponse.json({ error: "لینک خصوصی سفارش کامل نیست." }, { status: 403 });
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin.rpc("get_pickup_order", { p_code: code, p_access_token: token });
    if (error || !data) return NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
    return NextResponse.json({ order: { ...data, accessToken: token } });
  }
  const order = getDemoOrder(code, token);
  return order ? NextResponse.json({ order }) : NextResponse.json({ error: "سفارش پیدا نشد." }, { status: 404 });
}
