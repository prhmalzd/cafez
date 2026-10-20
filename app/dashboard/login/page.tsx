import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";

export default function LoginPage() { return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#eee8dc" }}><div style={{ width: "min(430px, 100%)" }}><div style={{ textAlign: "center", marginBottom: 22 }}><Logo /><h1 style={{ margin: "22px 0 8px" }}>ورود مدیر کافه</h1><p className="muted">منو، پیشنهادها و نتیجه حضور در کافه‌ز را مدیریت کنید.</p></div><div className="content-card"><LoginForm /></div><Link href="/" className="muted" style={{ display: "block", textAlign: "center", fontSize: ".78rem" }}><ArrowRight size={14} style={{ display: "inline" }} /> بازگشت به کافه‌ز</Link></div></main>; }
