import { Menu, Store } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <nav className="nav container" aria-label="منوی اصلی">
        <Logo />
        <div className="nav-links">
          <Link href="/cafes">کافه‌ها</Link>
          <Link href="/#offers">پیشنهادهای امروز</Link>
          <Link href="/#why">چرا کافه‌ز؟</Link>
        </div>
        <div className="nav-actions">
          <Link href="/dashboard/login" className="button button-outline button-small">ورود مدیر کافه</Link>
          <Link href="/dashboard/onboarding" className="button button-primary button-small"><Store size={16} /> ثبت کافه</Link>
          <button className="icon-button mobile-menu" aria-label="بازکردن منو"><Menu size={20} /></button>
        </div>
      </nav>
    </header>
  );
}
