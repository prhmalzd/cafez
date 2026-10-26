"use client";

import { Bell, CheckCircle2, Clock3, Coffee, PackageCheck, RefreshCw, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { subscribeToPush } from "@/lib/push-client";
import { formatPickupTime } from "@/lib/tehran-time";
import type { PickupOrder } from "@/lib/types";
import { formatToman } from "@/lib/utils";

const states = {
  pending: { title: "در انتظار تأیید کافه", text: "درخواست ارسال شده؛ اگر تا پایان شمارش تأیید نشود خودکار منقضی می‌شود.", icon: Clock3 },
  accepted: { title: "سفارش تأیید شد", text: "باریستا مشغول آماده‌کردن سفارش شماست.", icon: Coffee },
  ready: { title: "سفارش آماده تحویل است", text: "با کد سفارش به پیشخوان کافه مراجعه کنید و همان‌جا پرداخت کنید.", icon: PackageCheck },
  collected: { title: "تحویل شد؛ نوش جان!", text: "از انتخاب Caféz ممنونیم.", icon: CheckCircle2 },
  rejected: { title: "کافه نتوانست سفارش را بپذیرد", text: "هیچ پرداختی انجام نشده است.", icon: XCircle },
  cancelled: { title: "سفارش لغو شد", text: "هیچ پرداختی انجام نشده است.", icon: XCircle },
  expired: { title: "زمان تأیید سفارش تمام شد", text: "می‌توانید دوباره از منوی کافه سفارش ثبت کنید.", icon: XCircle },
  no_show: { title: "زمان تحویل گذشته است", text: "برای هماهنگی با کافه تماس بگیرید.", icon: XCircle },
} as const;

export function OrderStatus({ code, token }: { code: string; token: string }) {
  const [order, setOrder] = useState<PickupOrder | null>(null);
  const [error, setError] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const load = useCallback(async () => {
    const response = await fetch(`/api/orders/${code}?token=${encodeURIComponent(token)}`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "سفارش پیدا نشد.");
    setOrder(result.order);
  }, [code, token]);

  useEffect(() => {
    load().catch((caught) => setError(caught instanceof Error ? caught.message : "خطا در دریافت سفارش."));
    const timer = window.setInterval(() => load().catch(() => undefined), 5000);
    return () => window.clearInterval(timer);
  }, [load]);

  if (error) return <div className="empty-state"><XCircle size={35} /><h2>سفارش در دسترس نیست</h2><p>{error}</p></div>;
  if (!order) return <div className="order-loading"><RefreshCw className="spin" /> در حال دریافت وضعیت سفارش…</div>;
  const state = states[order.status];
  const Icon = state.icon;
  return <div className="order-status-card">
    <div className={`order-state-icon state-${order.status}`}><Icon size={32} /></div><span className="eyebrow">کد سفارش {order.code}</span><h1>{state.title}</h1><p>{state.text}</p>
    {order.rejectionReason && <div className="status-message status-error">دلیل: {order.rejectionReason}</div>}
    <div className="order-meta"><div><span>کافه</span><strong>{order.cafeName}</strong></div><div><span>زمان تحویل</span><strong>{formatPickupTime(order.promisedFor ?? order.requestedFor)}</strong></div><div><span>پرداخت در کافه</span><strong>{formatToman(order.totalPrice)}</strong></div></div>
    <div className="order-summary">{order.items.map((item) => <div key={`${item.menuItemId}-${item.name}`}><span>{item.name} × {item.quantity.toLocaleString("fa-IR")}</span><strong>{formatToman(item.unitPrice * item.quantity)}</strong></div>)}</div>
    {order.note && <p className="order-note">یادداشت: {order.note}</p>}
    {!(["collected", "rejected", "cancelled", "expired", "no_show"] as string[]).includes(order.status) && <button className="button button-outline" onClick={async () => { try { await subscribeToPush({ purpose: "customer", orderId: order.id, accessToken: token }); setPushMessage("اعلان تغییر وضعیت فعال شد."); } catch (caught) { setPushMessage(caught instanceof Error ? caught.message : "اعلان فعال نشد."); } }}><Bell size={17} /> دریافت اعلان وضعیت</button>}
    {pushMessage && <div className="status-message" role="status">{pushMessage}</div>}
    <small className="muted">این صفحه هر پنج ثانیه به‌روز می‌شود. لینک آن خصوصی است.</small>
  </div>;
}
