import Link from "next/link";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div><Logo /><p>کافه‌ز راه ساده‌ی پیدا کردن کافه‌های خوب شهر، دیدن منوی واقعی و استفاده از پیشنهادهای معتبر است.</p></div>
          <div><strong>کشف شهر</strong><div className="footer-links"><Link href="/cafes">همه کافه‌ها</Link><Link href="/#offers">پیشنهادهای امروز</Link><Link href="/cafes?open=true">کافه‌های باز</Link></div></div>
          <div><strong>برای کافه‌ها</strong><div className="footer-links"><Link href="/dashboard/onboarding">ثبت رایگان کافه</Link><Link href="/dashboard/login">ورود به پنل</Link><Link href="/pricing">تعرفه‌ها</Link></div></div>
        </div>
        <div className="footer-bottom"><span>© ۱۴۰۵ کافه‌ز؛ ساخته‌شده برای کسب‌وکارهای محلی.</span><span>حریم خصوصی · قوانین استفاده</span></div>
      </div>
    </footer>
  );
}
