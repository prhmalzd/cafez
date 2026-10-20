import { Check } from "lucide-react";
import Link from "next/link";
import { PublicShell } from "@/components/public-shell";

const plans = [
  { name: "رایگان", price: "۰", suffix: "همیشه", highlighted: false, features: ["صفحه تاییدشده کافه", "منوی کامل و QR", "یک پیشنهاد فعال", "آمار پایه"] },
  { name: "رشد", price: "۲۹۹٬۰۰۰", suffix: "تومان / ماه", highlighted: true, features: ["پیشنهادهای زمان‌بندی‌شده", "آمار و قیف پیشرفته", "شخصی‌سازی بیشتر", "پشتیبانی اولویت‌دار"] },
  { name: "دیده‌شدن", price: "۱۴۹٬۰۰۰", suffix: "تومان / هفته", highlighted: false, features: ["جایگاه ویژه در شهر", "نمایش در صفحه اصلی", "گزارش نمایش و کلیک", "ظرفیت محدود هر محله"] },
];
export default function PricingPage() { return <PublicShell><header className="page-hero container" style={{ textAlign: "center" }}><span className="eyebrow">شفاف و بدون غافلگیری</span><h1>اول ارزش بساز، بعد رشد کن</h1><p style={{ marginInline: "auto" }}>صفحه و منوی اصلی همیشه رایگان می‌ماند. قیمت‌های پولی فعلاً فرضیه آزمایشی هستند و پرداخت در MVP فعال نیست.</p></header><div className="container grid-3" style={{ paddingBottom: 80 }}>{plans.map((plan) => <article className="content-card" key={plan.name} style={plan.highlighted ? { borderColor: "#ef5b2a", boxShadow: "var(--shadow)", transform: "translateY(-8px)" } : undefined}><span className="eyebrow">{plan.name}</span><h2 style={{ fontSize: "2rem", margin: "14px 0 4px" }}>{plan.price}</h2><span className="muted">{plan.suffix}</span><div style={{ borderTop: "1px solid var(--line)", marginTop: 20, paddingTop: 15 }}>{plan.features.map((feature) => <p key={feature} style={{ color: "var(--ink)", fontSize: ".82rem" }}><Check size={15} color="#3d8a69" style={{ display: "inline" }} /> {feature}</p>)}</div><Link href="/dashboard/onboarding" className={`button ${plan.highlighted ? "button-primary" : "button-outline"}`} style={{ width: "100%" }}>{plan.name === "رایگان" ? "شروع رایگان" : "ثبت علاقه‌مندی"}</Link></article>)}</div></PublicShell>; }
