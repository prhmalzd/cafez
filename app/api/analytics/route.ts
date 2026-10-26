import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const allowed = new Set(["profile_view", "menu_view", "contact_click", "directions_click", "offer_view", "promotion_impression", "promotion_click"]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!allowed.has(body.eventType) || (body.cafeId && typeof body.cafeId !== "string") || (body.offerId && typeof body.offerId !== "string") || (body.promotionId && typeof body.promotionId !== "string")) return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const anonymousHash = typeof body.anonymousId === "string" ? createHash("sha256").update(body.anonymousId).digest("hex") : null;
    const { error } = await supabase.from("analytics_events").insert({ cafe_id: body.cafeId ?? null, offer_id: body.offerId ?? null, promotion_id: body.promotionId ?? null, event_type: body.eventType, anonymous_id_hash: anonymousHash, source: typeof body.source === "string" ? body.source.slice(0, 80) : null });
    if (error) return NextResponse.json({ error: "Unable to record event" }, { status: 500 });
  }
  return NextResponse.json({ recorded: true });
}
