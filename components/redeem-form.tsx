"use client";

import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import { FormEvent, useState } from "react";

export function RedeemForm({ cafeId }: { cafeId: string }) {
  const [code, setCode] = useState(""); const [loading, setLoading] = useState(false); const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setResult(null); try { const response = await fetch("/api/offers/redeem", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: code.toUpperCase(), cafeId }) }); const body = await response.json(); if (!response.ok) throw new Error(body.error); setResult({ ok: true, message: "کد معتبر است و با موفقیت استفاده شد." }); setCode(""); } catch (error) { setResult({ ok: false, message: error instanceof Error ? error.message : "خطایی رخ داد." }); } finally { setLoading(false); } }
  return <form className="panel redeem-form" onSubmit={submit}><div style={{ textAlign: "center", paddingBottom: 16 }}><span className="benefit-icon" style={{ margin: "0 auto 12px" }}><ScanLine size={24} /></span><h2>کد مشتری را وارد کنید</h2><p className="muted" style={{ fontSize: ".8rem" }}>کد فقط یک بار و فقط در کافه صادرکننده قابل استفاده است.</p></div><input autoComplete="off" maxLength={6} minLength={6} pattern="[A-Za-z2-9]{6}" required className="input code-input" placeholder="------" value={code} onChange={(event) => setCode(event.target.value.replace(/[^a-zA-Z2-9]/g, "").slice(0, 6))} /><button disabled={loading || code.length !== 6} className="button button-primary" style={{ width: "100%", marginTop: 12 }}>{loading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} اعتبارسنجی و استفاده</button>{result && <div className={`status-message ${result.ok ? "" : "status-error"}`}>{result.message}</div>}</form>;
}
