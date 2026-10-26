import { promotions } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Promotion, PromotionPlacement } from "@/lib/types";

export async function getActivePromotions(placement?: PromotionPlacement): Promise<Promotion[]> {
  const fallback = promotions.filter((item) => item.status === "active" && (!placement || item.placement === placement));
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallback;
  let query = supabase.from("promotions").select("*, cafes!inner(name,status)").eq("status", "active").eq("is_paused", false).eq("cafes.status", "approved").lte("starts_at", new Date().toISOString()).gte("ends_at", new Date().toISOString());
  if (placement) query = query.eq("placement", placement);
  const { data, error } = await query.limit(3);
  if (error || !data?.length) return fallback;
  return data.map((item) => ({ id: item.id, cafeId: item.cafe_id, cafeName: item.cafes.name, placement: item.placement, title: item.title, image: item.image_url, targetUrl: item.target_url, startsAt: item.starts_at, endsAt: item.ends_at, status: "active" }));
}
