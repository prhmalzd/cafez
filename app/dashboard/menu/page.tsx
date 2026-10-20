import { DashboardShell } from "@/components/dashboard-shell";
import { MenuManager } from "@/components/menu-manager";
import { cafes } from "@/lib/data";
export default function DashboardMenuPage() { return <DashboardShell><MenuManager initialCategories={cafes[0].menu} cafeId={cafes[0].id} /></DashboardShell>; }
