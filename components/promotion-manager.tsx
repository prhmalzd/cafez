"use client";

import { BarChart3, CalendarDays, ImagePlus, Megaphone, Plus, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Promotion, PromotionPlacement } from "@/lib/types";

const labels: Record<PromotionPlacement, string> = { home_hero: "بنر صفحه اصلی", home_card: "کارت صفحه اصلی", cafes_card: "کارت نتایج کافه‌ها", offers_banner: "بنر پیشنهادها" };
const statusLabels: Record<Promotion["status"], string> = { requested: "در انتظار بررسی", scheduled: "زمان‌بندی‌شده", active: "فعال", paused: "متوقف", completed: "تمام‌شده", rejected: "ردشده" };

export function PromotionManager({ cafeId, cafeSlug }: { cafeId: string; cafeSlug: string }) {
  const [items, setItems] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [draft, setDraft] = useState({ title: "", placement: "home_card" as PromotionPlacement, targetUrl: `/cafes/${cafeSlug}`, image: "/images/cafe-hero.png", weekStart: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" }) });
  const load = useCallback(async () => { const response = await fetch(`/api/dashboard/promotions?cafeId=${cafeId}`); const result = await response.json(); if (!response.ok) throw new Error(result.error); setItems(result.promotions); setLoading(false); }, [cafeId]);
  useEffect(() => { load().catch((error) => { setNotice(error.message); setLoading(false); }); }, [load]);

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setNotice("");
    try { const form = new FormData(); form.set("file", file); const response = await fetch(`/api/dashboard/cafes/${cafeId}/media`, { method: "POST", body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.error); setDraft({ ...draft, image: result.url }); }
    catch (error) { setNotice(error instanceof Error ? error.message : "بارگذاری تصویر انجام نشد."); }
    finally { setUploading(false); }
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setNotice("");
    const response = await fetch("/api/dashboard/promotions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cafeId, ...draft }) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "ثبت درخواست انجام نشد."); return; }
    setShowForm(false); setDraft({ ...draft, title: "" }); setNotice("درخواست برای بررسی مدیر Caféz ارسال شد."); await load();
  }

  return <>
    <div className="dash-top"><div><h1>تبلیغات کافه</h1><span className="muted">برای یک هفته جایگاه درخواست کنید؛ فعال‌سازی در پایلوت به‌صورت دستی است.</span></div><button className="button button-primary button-small" onClick={() => setShowForm(true)}><Plus size={16} /> درخواست جایگاه</button></div>
    <div className="pilot-price-strip"><div><strong>کارت تبلیغاتی</strong><span>فرضیه آزمایشی از ۱۹۹٬۰۰۰ تومان / هفته</span></div><div><strong>بنر صفحه اصلی</strong><span>فرضیه آزمایشی از ۳۴۹٬۰۰۰ تومان / هفته</span></div><small>در پایلوت رایگان؛ پرداخت آنلاین فعال نیست.</small></div>
    {notice && <div className="status-message" role="status">{notice}</div>}
    {loading ? <div className="order-loading">در حال دریافت درخواست‌ها…</div> : items.length ? <div className="promotion-list">{items.map((item) => <article className="promotion-row" key={item.id}><img src={item.image} alt="" /><div><span className={`status-pill status-${item.status}`}>{statusLabels[item.status]}</span><h3>{item.title}</h3><p><CalendarDays size={14} /> {new Date(item.startsAt).toLocaleDateString("fa-IR")} تا {new Date(item.endsAt).toLocaleDateString("fa-IR")} · {labels[item.placement]}</p></div><div className="promotion-stats"><BarChart3 size={18} /><strong>{(item.impressions ?? 0).toLocaleString("fa-IR")}</strong><span>نمایش</span><strong>{(item.clicks ?? 0).toLocaleString("fa-IR")}</strong><span>کلیک</span></div></article>)}</div> : <div className="empty-state"><Megaphone size={36} /><h3>هنوز جایگاهی درخواست نکرده‌اید</h3><p>بنر شما پس از بررسی و با برچسب شفاف «تبلیغ» نمایش داده می‌شود.</p></div>}
    {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false); }}><div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="promotion-title"><div className="modal-head"><div><span className="eyebrow">ظرفیت محدود هر جایگاه</span><h2 id="promotion-title">درخواست تبلیغ هفتگی</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="بستن"><X size={18} /></button></div><form onSubmit={submit}><div className="field"><label htmlFor="promotion-copy">عنوان بنر</label><input id="promotion-copy" className="input" required maxLength={120} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="مثلاً عصرها با قهوه تازه در رُستری هفت" /></div><div className="form-grid"><div className="field"><label htmlFor="promotion-placement">جایگاه</label><select id="promotion-placement" className="select" value={draft.placement} onChange={(event) => setDraft({ ...draft, placement: event.target.value as PromotionPlacement })}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div className="field"><label htmlFor="promotion-week">شروع هفته</label><input id="promotion-week" className="input" type="date" required value={draft.weekStart} onChange={(event) => setDraft({ ...draft, weekStart: event.target.value })} /></div></div><div className="field"><label htmlFor="promotion-target">مقصد داخل Caféz</label><input id="promotion-target" className="input" required pattern="/(cafes|offers)/.*" value={draft.targetUrl} onChange={(event) => setDraft({ ...draft, targetUrl: event.target.value })} /></div><div className="field"><label className="upload-box"><ImagePlus size={22} /><strong>{uploading ? "در حال بارگذاری…" : "انتخاب تصویر بنر"}</strong><span>JPG، PNG یا WebP تا ۲ مگابایت</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} /></label>{draft.image && <img className="promotion-preview" src={draft.image} alt="پیش‌نمایش بنر" />}</div><div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setShowForm(false)}>انصراف</button><button disabled={uploading} className="button button-primary">ارسال برای بررسی</button></div></form></div></div>}
  </>;
}
