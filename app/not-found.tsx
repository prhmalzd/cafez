import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
export default function NotFound() { return <PublicShell><div className="not-found"><div><span className="eyebrow">خطای ۴۰۴</span><h1>این میز خالی است!</h1><p className="muted">صفحه‌ای که دنبالش بودید پیدا نشد.</p><Link href="/" className="button button-primary">بازگشت به صفحه اصلی</Link></div></div></PublicShell>; }
