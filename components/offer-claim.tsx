"use client";

import { CheckCircle2, Clock3, Copy, Loader2, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPersianDateTime } from "@/lib/utils";

type Claim = { code: string; expiresAt?: string; expires_at?: string };

export function OfferClaim({ offerId }: { offerId: string }) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`cafez:claim:${offerId}`);
    if (saved) {
      const parsed = JSON.parse(saved) as Claim;
      const expiry = parsed.expiresAt ?? parsed.expires_at;
      if (expiry && new Date(expiry) > new Date()) setClaim(parsed); else localStorage.removeItem(`cafez:claim:${offerId}`);
    }
  }, [offerId]);

  async function createClaim() {
    setLoading(true); setError("");
    let anonymousId = localStorage.getItem("cafez:anonymous-id");
    if (!anonymousId) { anonymousId = crypto.randomUUID(); localStorage.setItem("cafez:anonymous-id", anonymousId); }
    try {
      const response = await fetch(`/api/offers/${offerId}/claim`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ anonymousId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setClaim(result.claim); localStorage.setItem(`cafez:claim:${offerId}`, JSON.stringify(result.claim));
    } catch (issue) { setError(issue instanceof Error ? issue.message : "خطایی رخ داد."); } finally { setLoading(false); }
  }

  async function copyCode() {
    if (!claim) return;
    await navigator.clipboard.writeText(claim.code); setCopied(true); setTimeout(() => setCopied(false), 1500);
  }

  if (claim) {
    const expiry = claim.expiresAt ?? claim.expires_at!;
    return <div className="claim-box"><div className="eyebrow"><CheckCircle2 size={15} style={{ display: "inline" }} /> کد شما آماده است</div><div className="claim-code">{claim.code}</div><p className="muted" style={{ fontSize: ".78rem", textAlign: "center" }}><Clock3 size={14} style={{ display: "inline" }} /> معتبر تا {formatPersianDateTime(expiry)}</p><button className="button button-dark" style={{ width: "100%" }} onClick={copyCode}><Copy size={17} /> {copied ? "کپی شد" : "کپی کد"}</button><p style={{ fontSize: ".73rem", lineHeight: 1.8, marginBottom: 0 }}>این صفحه یا کد را هنگام سفارش به کارکنان کافه نشان دهید. کد فقط یک بار قابل استفاده است.</p></div>;
  }
  return <div className="claim-box"><strong>این پیشنهاد را برای خودت نگه دار</strong><p className="muted" style={{ lineHeight: 1.8, fontSize: ".82rem" }}>بدون ثبت‌نام، یک کد دو ساعته بگیر و حضوری در کافه استفاده کن.</p><button disabled={loading} className="button button-primary" style={{ width: "100%" }} onClick={createClaim}>{loading ? <Loader2 className="animate-spin" size={18} /> : <TicketCheck size={18} />} دریافت کد رایگان</button>{error && <div className="status-message status-error">{error}</div>}</div>;
}
