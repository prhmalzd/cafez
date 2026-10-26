"use client";

import { Check, Pause, X } from "lucide-react";
import { useState } from "react";
import type { Promotion } from "@/lib/types";

export function PromotionAdmin({ initial }: { initial: Promotion[] }) {
  const [items, setItems] = useState(initial);
  const [notice, setNotice] = useState("");
  async function update(item: Promotion, status: Promotion["status"]) {
    const response = await fetch(`/api/admin/promotions/${item.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const result = await response.json();
    if (!response.ok) { setNotice(result.error ?? "تغییر انجام نشد."); return; }
    setItems((current) => current.map((value) => value.id === item.id ? { ...value, status } : value)); setNotice("وضعیت تبلیغ به‌روز شد.");
  }
  return <section className="panel" id="promotions" style={{ marginTop: 18 }}><div className="panel-head"><div><h2>جایگاه‌های تبلیغاتی</h2><span className="muted">حداکثر سه کافه در هر جایگاه و هفته</span></div></div>{notice && <div className="status-message">{notice}</div>}<div className="table-scroll"><table className="table"><thead><tr><th>کافه</th><th>عنوان</th><th>وضعیت</th><th>نمایش / کلیک</th><th>عملیات</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.cafeName}</td><td>{item.title}</td><td>{item.status}</td><td>{(item.impressions ?? 0).toLocaleString("fa-IR")} / {(item.clicks ?? 0).toLocaleString("fa-IR")}</td><td><div className="table-actions"><button className="icon-button" aria-label="تأیید تبلیغ" onClick={() => update(item, "active")}><Check size={16} /></button><button className="icon-button" aria-label="توقف تبلیغ" onClick={() => update(item, "paused")}><Pause size={16} /></button><button className="icon-button danger-button" aria-label="رد تبلیغ" onClick={() => update(item, "rejected")}><X size={16} /></button></div></td></tr>)}</tbody></table></div></section>;
}
