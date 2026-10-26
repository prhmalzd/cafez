import { DashboardShell } from "@/components/dashboard-shell";
import { MenuManager } from "@/components/menu-manager";
import { getManagedCafe } from "@/lib/cafe-live";
export default async function DashboardMenuPage() { const cafe = await getManagedCafe(); return <DashboardShell><MenuManager initialCategories={cafe.menu} cafeId={cafe.id} /></DashboardShell>; }
