"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MenuCategory } from "@/lib/types";
import { cn, formatToman, normalizePersian } from "@/lib/utils";

export function MenuBrowser({ categories: initialCategories, cafeId }: { categories: MenuCategory[]; cafeId?: string }) {
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState(initialCategories);
  useEffect(() => {
    if (!cafeId) return;
    const stored = localStorage.getItem(`cafez:menu:${cafeId}`);
    if (!stored) return;
    try { setCategories(JSON.parse(stored) as MenuCategory[]); }
    catch { localStorage.removeItem(`cafez:menu:${cafeId}`); }
  }, [cafeId]);
  const visible = useMemo(() => categories.map((category) => ({ ...category, items: category.items.filter((item) => normalizePersian(`${item.name} ${item.description} ${(item.ingredients ?? []).join(" ")}`).includes(normalizePersian(query))) })).filter((category) => category.items.length), [categories, query]);
  return <><div className="content-card"><div className="search-wrap"><Search size={19} /><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجو در منو…" /></div><nav className="menu-nav">{categories.map((category) => <a key={category.id} className="chip" href={`#${category.id}`}>{category.name}</a>)}</nav></div>{visible.map((category) => <section className="menu-section" id={category.id} key={category.id}><h2>{category.name}</h2><div className="menu-items">{category.items.map((item) => <article className={cn("menu-item", !item.available && "unavailable")} key={item.id}><div><h3>{item.name}</h3><p>{item.description}</p><div className="mini-badges">{item.featured && <span>محبوب</span>}{item.badges?.map((badge) => <span key={badge}>{badge}</span>)}{!item.available && <span>فعلاً ناموجود</span>}</div></div><span className="menu-item-price">{formatToman(item.price)}</span></article>)}</div></section>)}{!visible.length && <div className="empty-state">آیتمی با این نام پیدا نشد.</div>}</>;
}
