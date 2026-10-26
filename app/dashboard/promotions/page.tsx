import { DashboardShell } from "@/components/dashboard-shell";
import { PromotionManager } from "@/components/promotion-manager";
import { getManagedCafe } from "@/lib/cafe-live";

export default async function PromotionsPage() {
  const cafe = await getManagedCafe();
  return <DashboardShell><PromotionManager cafeId={cafe.id} cafeSlug={cafe.slug} /></DashboardShell>;
}
