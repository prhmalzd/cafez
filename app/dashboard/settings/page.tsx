import { CafeSettings } from "@/components/cafe-settings";
import { DashboardShell } from "@/components/dashboard-shell";
import { getManagedCafe } from "@/lib/cafe-live";

export default async function SettingsPage() {
  const cafe = await getManagedCafe();
  return <DashboardShell><CafeSettings cafe={cafe} /></DashboardShell>;
}
