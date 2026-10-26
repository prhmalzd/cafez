"use client";

import { useState } from "react";
import { Pause, Pencil, Play, Plus, X } from "lucide-react";
import type { Offer } from "@/lib/types";
import { toPersianDigits } from "@/lib/utils";

const localDate = (value?: string) => value ? new Date(value).toISOString().slice(0, 16) : "";
const normalize = (item: Record<string, any>): Offer => item.cafe_id ? { id: item.id, cafeId: item.cafe_id, slug: item.slug, title: item.title, description: item.description, terms: item.terms, badge: item.badge, image: item.image_url || "/icons/cafez.svg", startsAt: item.starts_at, endsAt: item.ends_at, validFrom: item.valid_from, validUntil: item.valid_until, dailyCap: item.daily_cap, status: item.status } : item as Offer;

export function OfferManager({ cafeId, initialOffers }: { cafeId: string; initialOffers: Offer[] }) {
  const [items, setItems] = useState(initialOffers); const [editing, setEditing] = useState<Partial<Offer> | null>(null); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const openNew = () => setEditing({ title: "", description: "", terms: "", badge: "پیشنهاد ویژه", startsAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 86400_000).toISOString(), validFrom: "08:00", validUntil: "22:00", status: "active", image: "" });
  async function save(next = editing) {
    if (!next) return; setBusy(true); setMessage("");
    const response = await fetch("/api/dashboard/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...next, cafeId }) }); const result = await response.json(); setBusy(false);
    if (!response.ok) return setMessage(result.error); const saved = normalize(result.offer); setItems((old) => [saved, ...old.filter((item) => item.id !== saved.id)]); setEditing(null); setMessage("پیشنهاد ذخیره شد.");
  }
  const toggle = (item: Offer) => save({ ...item, status: item.status === "paused" ? "active" : "paused" });
  return <>
    <div className="dash-top"><div><h1>پیشنهادها</h1><span className="muted">پیشنهادهای زمان‌دار بسازید، ویرایش یا موقتاً متوقف کنید.</span></div><button className="button button-primary button-small" onClick={openNew}><Plus size={16} /> پیشنهاد جدید</button></div>
    {message && !editing && <p className="form-message">{message}</p>}
    {items.map((offer) => <article className="approval-card" key={offer.id}><img src={offer.image} alt="" /><div><span className="offer-label" style={{ color: "white" }}>{offer.badge}</span><h3 style={{ margin: "8px 0 5px" }}>{offer.title}</h3><span className="muted">{toPersianDigits(offer.claimedToday ?? 0)} دریافت امروز · {offer.status === "paused" ? "متوقف" : "فعال"}</span></div><div className="table-actions"><button className="button button-outline button-small" onClick={() => { setMessage(""); setEditing(offer); }}><Pencil size={15} /> ویرایش</button><button className="icon-button" aria-label={offer.status === "paused" ? "فعال‌سازی" : "توقف"} onClick={() => toggle(offer)}>{offer.status === "paused" ? <Play size={16} /> : <Pause size={16} />}</button></div></article>)}
    {editing && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(null)}><form className="modal modal-wide" onSubmit={(event) => { event.preventDefault(); save(); }}><div className="modal-head"><h2>{editing.id ? "ویرایش پیشنهاد" : "پیشنهاد جدید"}</h2><button type="button" className="icon-button" aria-label="بستن" onClick={() => setEditing(null)}><X size={19} /></button></div><label>عنوان<input required value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label><div className="form-grid"><label>برچسب<input value={editing.badge ?? ""} onChange={(e) => setEditing({ ...editing, badge: e.target.value })} /></label><label>سقف روزانه<input type="number" min="1" value={editing.dailyCap ?? ""} onChange={(e) => setEditing({ ...editing, dailyCap: Number(e.target.value) || undefined })} /></label><label>شروع<input required type="datetime-local" value={localDate(editing.startsAt)} onChange={(e) => setEditing({ ...editing, startsAt: new Date(e.target.value).toISOString() })} /></label><label>پایان<input required type="datetime-local" value={localDate(editing.endsAt)} onChange={(e) => setEditing({ ...editing, endsAt: new Date(e.target.value).toISOString() })} /></label></div><label>توضیح<textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></label><label>شرایط<textarea value={editing.terms ?? ""} onChange={(e) => setEditing({ ...editing, terms: e.target.value })} /></label><label>نشانی تصویر<input type="url" value={editing.image ?? ""} onChange={(e) => setEditing({ ...editing, image: e.target.value })} /></label>{message && <p className="form-error">{message}</p>}<div className="modal-actions"><button disabled={busy} className="button button-primary">{busy ? "در حال ذخیره…" : "ذخیره پیشنهاد"}</button></div></form></div>}
  </>;
}
