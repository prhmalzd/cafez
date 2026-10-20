import { NextResponse } from "next/server";
import { createDemoClaim } from "@/lib/claim-store";
import { offers } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const messages: Record<string, string> = {
  CLAIM_LIMIT: "برای این پیشنهاد در ۲۴ ساعت گذشته کد گرفته‌اید.", DAILY_CAP: "ظرفیت امروز این پیشنهاد تکمیل شده است.", OFFER_EXPIRED: "زمان این پیشنهاد به پایان رسیده است.",
};

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { anonymousId } = await request.json().catch(() => ({}));
  if (typeof anonymousId !== "string" || anonymousId.length < 16 || anonymousId.length > 100) return NextResponse.json({ error: "شناسه دستگاه معتبر نیست." }, { status: 400 });
  const offerId = (await params).id;
  const offer = offers.find((item) => item.id === offerId && item.status === "active");
  if (!offer) return NextResponse.json({ error: "پیشنهاد فعال پیدا نشد." }, { status: 404 });
  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase.rpc("claim_offer", { p_offer_id: offerId, p_anonymous_id: anonymousId });
      if (error) throw error;
      const claim = Array.isArray(data) ? data[0] : data;
      return NextResponse.json({ claim, mode: "supabase" });
    }
    return NextResponse.json({ claim: createDemoClaim(offer, anonymousId), mode: "demo" });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    return NextResponse.json({ error: messages[code] ?? "امکان ساخت کد وجود ندارد. دوباره تلاش کنید." }, { status: 409 });
  }
}
