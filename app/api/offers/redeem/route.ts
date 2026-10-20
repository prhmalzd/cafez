import { NextResponse } from "next/server";
import { redeemDemoClaim } from "@/lib/claim-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const messages: Record<string, string> = { NOT_FOUND: "این کد پیدا نشد.", WRONG_CAFE: "این کد متعلق به کافه دیگری است.", ALREADY_REDEEMED: "این کد قبلاً استفاده شده است.", EXPIRED: "مهلت استفاده از این کد تمام شده است." };

export async function POST(request: Request) {
  const { code, cafeId } = await request.json().catch(() => ({}));
  if (typeof code !== "string" || !/^[A-Z2-9]{6}$/i.test(code) || typeof cafeId !== "string") return NextResponse.json({ error: "کد شش‌کاراکتری معتبر وارد کنید." }, { status: 400 });
  try {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: "برای اعتبارسنجی وارد حساب مدیر شوید." }, { status: 401 });
      const { data, error } = await supabase.rpc("redeem_offer_claim", { p_code: code.toUpperCase(), p_cafe_id: cafeId });
      if (error) throw error;
      return NextResponse.json({ claim: Array.isArray(data) ? data[0] : data, mode: "supabase" });
    }
    return NextResponse.json({ claim: redeemDemoClaim(code, cafeId), mode: "demo" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: messages[message] ?? "کد قابل استفاده نیست." }, { status: 409 });
  }
}
