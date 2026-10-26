import { DashboardShell } from "@/components/dashboard-shell";
import { OrderQueue } from "@/components/order-queue";
import { getManagedCafe } from "@/lib/cafe-live";

export default async function OrdersDashboardPage() {
  const cafe = await getManagedCafe();
  return <DashboardShell><OrderQueue cafeId={cafe.id} /></DashboardShell>;
}
