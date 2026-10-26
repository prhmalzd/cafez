"use client";

import { Bell, Check, Clock3, Coffee, PackageCheck, RefreshCw, Volume2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { subscribeToPush } from "@/lib/push-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { tehranDateParts } from "@/lib/tehran-time";
import { formatPickupTime } from "@/lib/tehran-time";
import type { PickupOrder, PickupOrderStatus } from "@/lib/types";
import { formatToman } from "@/lib/utils";

const labels: Record<PickupOrderStatus, string> = { pending: "جدید", accepted: "در حال آماده‌سازی", ready: "آماده تحویل", collected: "تحویل‌شده", rejected: "ردشده", cancelled: "لغوشده", expired: "منقضی", no_show: "عدم مراجعه" };

function toTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Tehran", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
}

export function OrderQueue({ cafeId }: { cafeId: string }) {
  const [orders, setOrders] = useState<PickupOrder[]>([]);
  const [filter, setFilter] = useState<"active" | "history">("active");
  const [times, setTimes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const previousPending = useRef(0);

  const load = useCallback(async () => {
    const response = await fetch(`/api/dashboard/orders?cafeId=${encodeURIComponent(cafeId)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "سفارش‌ها دریافت نشد.");
    const next = result.orders as PickupOrder[];
    const pending = next.filter((order) => order.status === "pending").length;
    if (pending > previousPending.current && previousPending.current !== 0) {
      try { const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.connect(gain); gain.connect(context.destination); oscillator.frequency.value = 880; gain.gain.value = 0.08; oscillator.start(); oscillator.stop(context.currentTime + 0.25); } catch {}
    }
    previousPending.current = pending;
    setOrders(next); setTimes((current) => ({ ...Object.fromEntries(next.map((order) => [order.id, current[order.id] ?? toTime(order.requestedFor)])) })); setLoading(false);
  }, [cafeId]);

  useEffect(() => {
    load().catch((error) => { setNotice(error.message); setLoading(false); });
    const timer = window.setInterval(() => load().catch(() => undefined), 5000);
    const supabase = createSupabaseBrowserClient();
    const channel = supabase?.channel(`cafe_orders:${cafeId}`, { config: { private: true } }).on("broadcast", { event: "*" }, () => load()).subscribe();
    return () => { window.clearInterval(timer); if (channel) void supabase?.removeChannel(channel); };
  }, [cafeId, load]);

  async function transition(order: PickupOrder, status: PickupOrderStatus, rejectionReason?: string) {
    setNotice("");
    const promisedFor = status === "accepted" ? new Date(`${tehranDateParts().date}T${times[order.id]}:00+03:30`).toISOString() : undefined;
    const response = await fetch(`/api/dashboard/orders/${order.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ cafeId, status, promisedFor, rejectionReason }) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "تغییر وضعیت انجام نشد."); return; }
    setNotice("وضعیت سفارش به‌روز شد."); await load();
  }

  const active = orders.filter((order) => ["pending", "accepted", "ready"].includes(order.status));
  const shown = filter === "active" ? active : orders.filter((order) => !["pending", "accepted", "ready"].includes(order.status));
  return <>
    <div className="dash-top"><div><h1>صف سفارش‌ها</h1><span className="muted">درخواست‌ها را تأیید کنید، آماده‌سازی را به‌روز نگه دارید و هنگام تحویل ببندید.</span></div><div className="table-actions"><button className="button button-outline button-small" onClick={() => load()}><RefreshCw size={15} /> تازه‌سازی</button><button className="button button-dark button-small" onClick={async () => { try { await subscribeToPush({ purpose: "staff", cafeId }); setNotice("اعلان سفارش روی این دستگاه فعال شد."); } catch (error) { setNotice(error instanceof Error ? error.message : "اعلان فعال نشد."); } }}><Bell size={15} /> فعال‌کردن اعلان</button></div></div>
    <div className="order-queue-summary"><div><strong>{active.filter((order) => order.status === "pending").length.toLocaleString("fa-IR")}</strong><span>درخواست جدید</span></div><div><strong>{active.filter((order) => order.status === "accepted").length.toLocaleString("fa-IR")}</strong><span>در حال آماده‌سازی</span></div><div><strong>{active.filter((order) => order.status === "ready").length.toLocaleString("fa-IR")}</strong><span>آماده تحویل</span></div></div>
    <div className="queue-toolbar"><div className="segmented"><button className={filter === "active" ? "active" : ""} onClick={() => setFilter("active")}>صف فعال</button><button className={filter === "history" ? "active" : ""} onClick={() => setFilter("history")}>تاریخچه</button></div><span className="live-indicator"><i /> بروزرسانی زنده هر ۵ ثانیه</span></div>
    {notice && <div className="status-message" role="status">{notice}</div>}
    {loading ? <div className="order-loading"><RefreshCw className="spin" /> در حال دریافت سفارش‌ها…</div> : shown.length ? <div className="order-board">{shown.map((order) => <article className={`queue-card queue-${order.status}`} key={order.id}><div className="queue-card-head"><div><span className="order-code">#{order.code}</span><span className={`status-pill status-${order.status}`}>{labels[order.status]}</span></div><strong>{formatPickupTime(order.promisedFor ?? order.requestedFor)}</strong></div><div className="queue-items">{order.items.map((item) => <div key={`${item.menuItemId}-${item.name}`}><span><b>{item.quantity.toLocaleString("fa-IR")}×</b> {item.name}</span><span>{formatToman(item.unitPrice * item.quantity)}</span></div>)}</div>{order.note && <div className="barista-note">یادداشت: {order.note}</div>}<div className="queue-total"><span>پرداخت در کافه</span><strong>{formatToman(order.totalPrice)}</strong></div>
      {order.status === "pending" && <div className="queue-actions"><label><Clock3 size={14} /> زمان وعده داده‌شده<input type="time" value={times[order.id] ?? ""} onChange={(event) => setTimes({ ...times, [order.id]: event.target.value })} /></label><button className="button button-primary button-small" onClick={() => transition(order, "accepted")}><Check size={15} /> تأیید</button><button className="button button-outline button-small danger-button" onClick={() => transition(order, "rejected", "امکان آماده‌سازی در زمان انتخابی وجود ندارد.")}><X size={15} /> رد</button></div>}
      {order.status === "accepted" && <button className="button button-primary button-small queue-main-action" onClick={() => transition(order, "ready")}><PackageCheck size={16} /> آماده تحویل شد</button>}
      {order.status === "ready" && <button className="button button-dark button-small queue-main-action" onClick={() => transition(order, "collected")}><Coffee size={16} /> تحویل مشتری شد</button>}
    </article>)}</div> : <div className="empty-state"><Volume2 size={34} /><h3>{filter === "active" ? "صف سفارش خالی است" : "هنوز سفارشی بسته نشده"}</h3><p>درخواست جدید همراه با صدا و اعلان در این صفحه ظاهر می‌شود.</p></div>}
  </>;
}
