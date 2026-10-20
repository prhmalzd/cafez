"use client";

import { Loader2, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const router = useRouter();
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setLoading(true); setError(""); const form = new FormData(event.currentTarget); const client = createSupabaseBrowserClient(); if (!client) { router.push("/dashboard"); return; } const { error: authError } = await client.auth.signInWithPassword({ email: String(form.get("email")), password: String(form.get("password")) }); if (authError) { setError("ایمیل یا رمز عبور درست نیست."); setLoading(false); return; } router.push("/dashboard"); router.refresh(); }
  return <form onSubmit={submit}><div className="field"><label htmlFor="email">ایمیل</label><input className="input" id="email" name="email" type="email" required placeholder="manager@cafe.ir" /></div><div className="field"><label htmlFor="password">رمز عبور</label><input className="input" id="password" name="password" type="password" required minLength={6} /></div><button className="button button-primary" style={{ width: "100%" }} disabled={loading}>{loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />} ورود به پنل</button>{error && <div className="status-message status-error">{error}</div>}<p className="muted" style={{ fontSize: ".72rem", textAlign: "center" }}>در حالت نمایشی، هر ایمیل و رمز ۶ کاراکتری وارد پنل می‌شود.</p></form>;
}
