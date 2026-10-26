"use client";

import { Menu, Store, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <nav className="nav container" aria-label="منوی اصلی">
        <Logo />
        <div className="nav-links">
          <Link href="/cafes">کافه‌ها</Link><Link href="/#offers">پیشنهادهای امروز</Link><Link href="/#why">چرا کافه‌ز؟</Link>
        </div>
        <div className="nav-actions">
          <Link href="/dashboard/login" className="button button-outline button-small">ورود مدیر کافه</Link>
          <Link href="/dashboard/onboarding" className="button button-primary button-small"><Store size={16} /> ثبت کافه</Link>
          <button className="icon-button mobile-menu" aria-label={open ? "بستن منو" : "بازکردن منو"} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </nav>
      {open && <div className="mobile-nav"><Link onClick={close} href="/cafes">کافه‌ها</Link><Link onClick={close} href="/#offers">پیشنهادهای امروز</Link><Link onClick={close} href="/pricing">تعرفه‌ها</Link><Link onClick={close} href="/dashboard/login">ورود مدیر کافه</Link></div>}
    </header>
  );
}
