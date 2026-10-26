import { DashboardShell } from "@/components/dashboard-shell";
import { OfferManager } from "@/components/offer-manager";
import { getManagedCafe } from "@/lib/cafe-live";
import { listDemoOffers } from "@/lib/offer-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Offer } from "@/lib/types";

export default async function OffersDashboardPage() {
  const cafe = await getManagedCafe(); const supabase = await createSupabaseServerClient(); let items: Offer[] = listDemoOffers(cafe.id);
  if (supabase) { const { data } = await supabase.from("offers").select("*").eq("cafe_id", cafe.id).order("created_at", { ascending: false }); items = (data ?? []).map((item) => ({ id: item.id, cafeId: item.cafe_id, slug: item.slug, title: item.title, description: item.description, terms: item.terms, badge: item.badge, image: item.image_url || "/icons/cafez.svg", startsAt: item.starts_at, endsAt: item.ends_at, validFrom: item.valid_from, validUntil: item.valid_until, dailyCap: item.daily_cap, status: item.status })); }
  return <DashboardShell><OfferManager cafeId={cafe.id} initialOffers={items} /></DashboardShell>;
}
