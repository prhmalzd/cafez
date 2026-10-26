"use client";

import { Check, Clock3, Minus, Plus, Search, ShoppingBag, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { cn, formatToman, normalizePersian } from "@/lib/utils";

type CartLine = { item: MenuItem; quantity: number };

function timeSlots(prepMinutes: number, interval: number, opensAt: string, closesAt: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const [openHour, openMinute] = opensAt.split(":").map(Number);
  const [closeHour, closeMinute] = closesAt.split(":").map(Number);
  const start = Math.max(openHour * 60 + openMinute, Math.ceil((hour * 60 + minute + prepMinutes) / interval) * interval);
  const end = closeHour * 60 + closeMinute;
  return Array.from({ length: Math.max(0, Math.floor((end - start) / interval) + 1) }, (_, index) => {
    const value = start + index * interval;
    return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  });
}

export function MenuBrowser({ categories: initialCategories, cafeId, orderingEnabled = false, minimumPrepMinutes = 15, slotIntervalMinutes = 15, orderOpensAt = "08:00", orderClosesAt = "22:30" }: {
  categories: MenuCategory[]; cafeId?: string; orderingEnabled?: boolean; minimumPrepMinutes?: number; slotIntervalMinutes?: number; orderOpensAt?: string; orderClosesAt?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [checkout, setCheckout] = useState(false);
  const [pickupTime, setPickupTime] = useState("asap");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ordering, setOrdering] = useState({ enabled: orderingEnabled, prep: minimumPrepMinutes, interval: slotIntervalMinutes, opensAt: orderOpensAt, closesAt: orderClosesAt });

  useEffect(() => {
    if (!cafeId) return;
    const stored = localStorage.getItem(`cafez:menu:${cafeId}`);
    if (!stored) return;
    try { setCategories(JSON.parse(stored) as MenuCategory[]); }
    catch { localStorage.removeItem(`cafez:menu:${cafeId}`); }
  }, [cafeId]);

  useEffect(() => {
    if (!cafeId) return;
    const stored = localStorage.getItem(`cafez:order-settings:${cafeId}`);
    if (stored) { try { const value = JSON.parse(stored); setOrdering({ enabled: Boolean(value.enabled), prep: Number(value.minimumPrepMinutes ?? 15), interval: Number(value.slotIntervalMinutes ?? 15), opensAt: String(value.opensAt ?? "08:00"), closesAt: String(value.closesAt ?? "22:30") }); } catch {} }
  }, [cafeId]);

  const visible = useMemo(() => categories.map((category) => ({ ...category, items: category.items.filter((item) => normalizePersian(`${item.name} ${item.description} ${(item.ingredients ?? []).join(" ")}`).includes(normalizePersian(query))) })).filter((category) => category.items.length), [categories, query]);
  const lines = Object.values(cart);
  const unitCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  const slots = useMemo(() => timeSlots(ordering.prep, ordering.interval, ordering.opensAt, ordering.closesAt), [ordering]);
  const orderingOpen = ordering.enabled && slots.length > 0;

  function change(item: MenuItem, delta: number) {
    setCart((current) => {
      const existing = current[item.id]?.quantity ?? 0;
      const quantity = existing + delta;
      const currentTotal = Object.values(current).reduce((sum, line) => sum + line.quantity, 0);
      if (delta > 0 && currentTotal >= 10) return current;
      const next = { ...current };
      if (quantity <= 0) delete next[item.id];
      else next[item.id] = { item, quantity };
      return next;
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!cafeId || !lines.length) return;
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cafeId, pickupTime, note, items: lines.map((line) => ({ menuItemId: line.item.id, quantity: line.quantity })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "ثبت سفارش انجام نشد.");
      router.push(result.statusUrl);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "ثبت سفارش انجام نشد."); }
    finally { setSubmitting(false); }
  }

  return <>
    {ordering.enabled && <div className="ordering-note"><ShoppingBag size={19} /><div><strong>{orderingOpen ? "پیش‌سفارش بیرون‌بر فعال است" : "سفارش‌گیری امروز پایان یافته"}</strong><span>{orderingOpen ? "انتخاب کنید، کافه تأیید می‌کند و هنگام تحویل پرداخت می‌کنید." : `ساعت سفارش‌گیری ${ordering.opensAt} تا ${ordering.closesAt} است.`}</span></div></div>}
    <div className="content-card"><div className="search-wrap"><Search size={19} /><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در منو…" /></div><nav className="menu-nav">{categories.map((category) => <a key={category.id} className="chip" href={`#${category.id}`}>{category.name}</a>)}</nav></div>
    {visible.map((category) => <section className="menu-section" id={category.id} key={category.id}><h2>{category.name}</h2><div className="menu-items">{category.items.map((item) => {
      const quantity = cart[item.id]?.quantity ?? 0;
      return <article className={cn("menu-item", !item.available && "unavailable")} key={item.id}><div className="menu-item-copy"><h3>{item.name}</h3><p>{item.description}</p><div className="mini-badges">{item.featured && <span>محبوب</span>}{item.badges?.map((badge) => <span key={badge}>{badge}</span>)}{!item.available && <span>فعلاً ناموجود</span>}{item.orderable === false && <span>فقط سفارش حضوری</span>}</div></div><div className="menu-item-side"><span className="menu-item-price">{formatToman(item.price)}</span>{orderingOpen && item.available && item.orderable !== false && (quantity ? <div className="quantity-control"><button aria-label={`کم‌کردن ${item.name}`} onClick={() => change(item, -1)}><Minus size={14} /></button><strong>{quantity.toLocaleString("fa-IR")}</strong><button aria-label={`افزودن ${item.name}`} onClick={() => change(item, 1)}><Plus size={14} /></button></div> : <button className="add-order-button" onClick={() => change(item, 1)}><Plus size={15} /> افزودن</button>)}</div></article>;
    })}</div></section>)}
    {!visible.length && <div className="empty-state">آیتمی با این نام پیدا نشد.</div>}
    {ordering.enabled && unitCount > 0 && <button className="cart-bar" onClick={() => setCheckout(true)}><span><ShoppingBag size={19} /> مشاهده سفارش · {unitCount.toLocaleString("fa-IR")} آیتم</span><strong>{formatToman(total)}</strong></button>}
    {checkout && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCheckout(false); }}><div className="modal order-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title"><div className="modal-head"><div><span className="eyebrow">پرداخت هنگام تحویل</span><h2 id="checkout-title">مرور پیش‌سفارش</h2></div><button onClick={() => setCheckout(false)} className="icon-button" aria-label="بستن"><X size={18} /></button></div>
      <div className="cart-lines">{lines.map(({ item, quantity }) => <div className="cart-line" key={item.id}><div><strong>{item.name}</strong><span>{formatToman(item.price)} × {quantity.toLocaleString("fa-IR")}</span></div><div className="quantity-control"><button type="button" aria-label={`کم‌کردن ${item.name}`} onClick={() => change(item, -1)}><Minus size={14} /></button><strong>{quantity.toLocaleString("fa-IR")}</strong><button type="button" aria-label={`افزودن ${item.name}`} onClick={() => change(item, 1)}><Plus size={14} /></button></div></div>)}</div>
      <form onSubmit={submit}><div className="field"><label htmlFor="pickup-time"><Clock3 size={15} /> زمان تحویل</label><select id="pickup-time" className="select" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)}><option value="asap">هرچه زودتر (حداقل {ordering.prep.toLocaleString("fa-IR")} دقیقه)</option>{slots.map((slot) => <option key={slot} value={slot}>ساعت {slot.replace(":", "٫")}</option>)}</select></div><div className="field"><label htmlFor="order-note">یادداشت برای باریستا</label><textarea id="order-note" className="textarea" maxLength={200} rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="مثلاً بدون شکر — اختیاری" /><small className="muted">{note.length.toLocaleString("fa-IR")} از ۲۰۰ نویسه</small></div>
        <div className="order-rules"><Check size={17} /><span>این یک درخواست است؛ زمان آماده‌شدن پس از تأیید کافه قطعی می‌شود.</span></div>{error && <div className="status-message status-error" role="alert">{error}</div>}<div className="cart-total"><span>جمع قابل پرداخت در کافه</span><strong>{formatToman(total)}</strong></div><button disabled={submitting || !lines.length} className="button button-primary order-submit">{submitting ? "در حال ارسال…" : "ارسال درخواست سفارش"}</button>
      </form></div></div>}
  </>;
}
