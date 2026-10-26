import { BadgePercent, Coffee, LayoutDashboard, MenuSquare, QrCode, Settings, ShieldCheck, ShoppingBag, Store, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function DashboardShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const items = admin ? [
    ["/admin", "بررسی کافه‌ها", ShieldCheck], ["/admin#promotions", "جایگاه‌های تبلیغ", BadgePercent], ["/admin#taxonomy", "محله‌ها و دسته‌ها", Store], ["/", "مشاهده سایت", LayoutDashboard],
  ] : [
    ["/dashboard", "نمای کلی", LayoutDashboard], ["/dashboard/orders", "سفارش‌ها", ShoppingBag], ["/dashboard/menu", "مدیریت منو", MenuSquare], ["/dashboard/offers", "پیشنهادها", BadgePercent], ["/dashboard/promotions", "تبلیغات", LayoutDashboard], ["/dashboard/redeem", "اعتبارسنجی کد", QrCode], ["/dashboard/settings", "اطلاعات کافه", Settings], ["/", "مشاهده سایت", Coffee],
  ];
  return <div className="dashboard-shell"><aside className="dash-sidebar"><Logo dashboard /><nav className="dash-nav">{items.map(([href, label, Icon], index) => <Link href={href as string} key={label as string} className={index === 0 ? "active" : ""}><Icon size={18} /><span>{label as string}</span></Link>)}</nav>{admin && <div style={{ position: "absolute", bottom: 20, right: 18, color: "#91a299", fontSize: ".7rem" }}><Users size={14} style={{ display: "inline" }} /> مدیر پلتفرم</div>}</aside><main className="dash-main">{children}</main></div>;
}
