"use client";

import { GripVertical, Pencil, Plus, Save } from "lucide-react";
import { useState } from "react";
import type { MenuCategory } from "@/lib/types";
import { formatToman } from "@/lib/utils";

export function MenuManager({ initialCategories }: { initialCategories: MenuCategory[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [saved, setSaved] = useState(false);
  function toggle(categoryId: string, itemId: string) { setCategories((current) => current.map((category) => category.id === categoryId ? { ...category, items: category.items.map((item) => item.id === itemId ? { ...item, available: !item.available } : item) } : category)); setSaved(false); }
  return <><div className="dash-top"><div><h1>مدیریت منو</h1><span className="muted">قیمت و موجودی آیتم‌ها را همان لحظه به‌روز کنید.</span></div><button onClick={() => setSaved(true)} className="button button-primary button-small"><Save size={16} /> ذخیره تغییرات</button></div>{saved && <div className="status-message">تغییرات نسخه نمایشی ذخیره شد. با اتصال Supabase این تغییرات دائمی می‌شوند.</div>}{categories.map((category) => <section className="panel" style={{ marginTop: 15 }} key={category.id}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h2>{category.name}</h2><button className="button button-outline button-small"><Plus size={15} /> آیتم جدید</button></div><div style={{ overflowX: "auto" }}><table className="table"><thead><tr><th>آیتم</th><th>قیمت</th><th>موجودی</th><th>عملیات</th></tr></thead><tbody>{category.items.map((item) => <tr key={item.id}><td><GripVertical size={15} style={{ display: "inline", color: "#aaa" }} /> <strong>{item.name}</strong><div className="muted" style={{ fontSize: ".67rem" }}>{item.description}</div></td><td>{formatToman(item.price)}</td><td><button onClick={() => toggle(category.id, item.id)} className={`switch ${item.available ? "on" : ""}`} aria-label={`تغییر موجودی ${item.name}`} /></td><td><button className="icon-button" style={{ width: 34, height: 34 }} aria-label={`ویرایش ${item.name}`}><Pencil size={15} /></button></td></tr>)}</tbody></table></div></section>)}</>;
}
