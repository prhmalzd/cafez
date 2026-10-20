import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OnboardingForm } from "@/components/onboarding-form";

export default function OnboardingPage() { return <main style={{ minHeight: "100vh", padding: "38px 20px 70px", background: "#eee8dc" }}><div style={{ width: "min(680px, 100%)", margin: "0 auto" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 35 }}><Logo /><Link href="/" className="muted" style={{ fontSize: ".78rem" }}><ArrowRight size={14} style={{ display: "inline" }} /> بازگشت</Link></div><div style={{ textAlign: "center", marginBottom: 24 }}><span className="eyebrow">همیشه رایگان شروع کنید</span><h1 style={{ fontSize: "2.4rem", margin: "7px 0" }}>کافه‌ات را به شهر معرفی کن</h1><p className="muted">ثبت اولیه کمتر از سه دقیقه زمان می‌برد.</p></div><OnboardingForm /></div></main>; }
