import { DashboardShell } from "@/components/dashboard-shell";
import { RedeemForm } from "@/components/redeem-form";
export default function RedeemPage() { return <DashboardShell><div className="dash-top"><div><h1>اعتبارسنجی پیشنهاد</h1><span className="muted">کد مشتری را پیش از ارائه تخفیف بررسی کنید.</span></div><span className="demo-pill">نسخه نمایشی</span></div><RedeemForm cafeId="cafe-1" /></DashboardShell>; }
