"use client";

import { Check, Download, Palette, Save, ShoppingBag } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { defaultCafeTheme, sanitizeTheme, themeStyle } from "@/lib/themes";
import type { Cafe, CafeTheme, OrderSettings } from "@/lib/types";

const presets: { id: CafeTheme["preset"]; name: string; description: string }[] = [
  { id: "classic", name: "کلاسیک", description: "آرام، خوانا و مناسب بیشتر کافه‌ها" },
  { id: "warm", name: "گرم", description: "کارت‌های نرم و حال‌وهوای صمیمی" },
  { id: "minimal", name: "مینیمال", description: "خطوط ساده و تمرکز روی خود منو" },
];

const defaults: OrderSettings = { enabled: true, minimumPrepMinutes: 15, slotIntervalMinutes: 15, capacityPerSlot: 5, acceptanceTimeoutMinutes: 5, opensAt: "08:00", closesAt: "22:30" };

export function CafeSettings({ cafe }: { cafe: Cafe }) {
  const [profile, setProfile] = useState({ name: cafe.name, shortDescription: cafe.shortDescription, address: cafe.address, phone: cafe.phone, neighborhood: cafe.neighborhood });
  const [theme, setTheme] = useState<CafeTheme>(sanitizeTheme(cafe.theme ?? defaultCafeTheme));
  const [orderSettings, setOrderSettings] = useState<OrderSettings>(cafe.orderSettings ?? defaults);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(`cafez:theme:${cafe.id}`);
    const savedOrders = localStorage.getItem(`cafez:order-settings:${cafe.id}`);
    if (savedTheme) { try { setTheme(sanitizeTheme(JSON.parse(savedTheme))); } catch {} }
    if (savedOrders) { try { setOrderSettings({ ...defaults, ...JSON.parse(savedOrders) }); } catch {} }
  }, [cafe.id]);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice("");
    try {
      const response = await fetch(`/api/dashboard/cafes/${cafe.id}/settings`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ profile, theme, orderSettings }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "ذخیره انجام نشد.");
      localStorage.setItem(`cafez:theme:${cafe.id}`, JSON.stringify(result.theme));
      localStorage.setItem(`cafez:order-settings:${cafe.id}`, JSON.stringify(result.orderSettings));
      setTheme(result.theme); setOrderSettings(result.orderSettings); setNotice("تنظیمات ذخیره شد و روی صفحه کافه اعمال می‌شود.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "ذخیره انجام نشد."); }
    finally { setSaving(false); }
  }

  return <form onSubmit={save}>
    <div className="dash-top"><div><h1>تنظیمات کافه</h1><span className="muted">اطلاعات، ظاهر صفحه و پیش‌سفارش بیرون‌بر را مدیریت کنید.</span></div><button disabled={saving} className="button button-primary button-small"><Save size={16} /> {saving ? "در حال ذخیره…" : "ذخیره همه تغییرات"}</button></div>
    {notice && <div className="status-message" role="status">{notice}</div>}
    <div className="dash-grid"><section className="panel"><h2>مشخصات عمومی</h2><div className="field"><label htmlFor="cafe-name">نام کافه</label><input id="cafe-name" className="input" required value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></div><div className="field"><label htmlFor="cafe-description">توضیح کوتاه</label><textarea id="cafe-description" className="textarea" rows={3} value={profile.shortDescription} onChange={(event) => setProfile({ ...profile, shortDescription: event.target.value })} /></div><div className="field"><label htmlFor="cafe-address">نشانی</label><textarea id="cafe-address" className="textarea" rows={3} value={profile.address} onChange={(event) => setProfile({ ...profile, address: event.target.value })} /></div><div className="grid-2"><div className="field"><label htmlFor="cafe-phone">تلفن</label><input id="cafe-phone" className="input" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></div><div className="field"><label htmlFor="cafe-neighborhood">محله</label><input id="cafe-neighborhood" className="input" value={profile.neighborhood} onChange={(event) => setProfile({ ...profile, neighborhood: event.target.value })} /></div></div></section><aside className="panel"><h2>QR کافه</h2><div className="qr-placeholder">▦</div><a className="button button-dark" href={`/api/cafes/${cafe.slug}/qr`} style={{ width: "100%", marginTop: 15 }}><Download size={17} /> دانلود QR</a><p className="muted helper-copy">برای میز، ورودی، بسته‌بندی و استوری قابل استفاده است.</p></aside></div>

    <section className="panel settings-section"><div className="panel-head"><div><span className="eyebrow"><Palette size={14} /> ظاهر کافه</span><h2>قالب صفحه و منو</h2></div><span className="demo-pill">رایگان در پایلوت</span></div><div className="theme-settings-grid"><div><div className="theme-presets">{presets.map((preset) => <button type="button" key={preset.id} className={`theme-choice ${theme.preset === preset.id ? "selected" : ""}`} onClick={() => setTheme({ ...theme, preset: preset.id })}><span className={`theme-thumbnail theme-thumbnail-${preset.id}`}><i /><i /><i /></span><strong>{preset.name}</strong><small>{preset.description}</small>{theme.preset === preset.id && <Check size={17} />}</button>)}</div><div className="color-fields"><label>رنگ اصلی<input type="color" value={theme.primaryColor} onChange={(event) => setTheme({ ...theme, primaryColor: event.target.value })} /><span>{theme.primaryColor}</span></label><label>رنگ تأکیدی<input type="color" value={theme.accentColor} onChange={(event) => setTheme({ ...theme, accentColor: event.target.value })} /><span>{theme.accentColor}</span></label></div></div><div className={`theme-preview cafe-theme theme-${theme.preset}`} style={themeStyle(theme)}><span className="eyebrow">پیش‌نمایش زنده</span><div className="theme-preview-cover" /><h3>{profile.name}</h3><p>{profile.shortDescription}</p><button type="button" className="button button-primary button-small">دیدن منو</button></div></div></section>

    <section className="panel settings-section"><div className="panel-head"><div><span className="eyebrow"><ShoppingBag size={14} /> سفارش بیرون‌بر</span><h2>ظرفیت و زمان آماده‌سازی</h2></div><label className="toggle-label"><input type="checkbox" checked={orderSettings.enabled} onChange={(event) => setOrderSettings({ ...orderSettings, enabled: event.target.checked })} /><span>{orderSettings.enabled ? "فعال" : "متوقف"}</span></label></div><p className="muted">هر سفارش ابتدا باید توسط باریستا تأیید شود. پرداخت فقط هنگام تحویل انجام می‌شود.</p><div className="form-grid three"><div className="field"><label htmlFor="prep-minutes">حداقل آماده‌سازی</label><div className="input-suffix"><input id="prep-minutes" className="input" type="number" min={15} max={180} value={orderSettings.minimumPrepMinutes} onChange={(event) => setOrderSettings({ ...orderSettings, minimumPrepMinutes: Number(event.target.value) })} /><span>دقیقه</span></div></div><div className="field"><label htmlFor="slot-interval">فاصله بازه‌ها</label><select id="slot-interval" className="select" value={orderSettings.slotIntervalMinutes} onChange={(event) => setOrderSettings({ ...orderSettings, slotIntervalMinutes: Number(event.target.value) })}><option value={15}>۱۵ دقیقه</option><option value={30}>۳۰ دقیقه</option><option value={60}>۶۰ دقیقه</option></select></div><div className="field"><label htmlFor="slot-capacity">ظرفیت هر بازه</label><div className="input-suffix"><input id="slot-capacity" className="input" type="number" min={1} max={100} value={orderSettings.capacityPerSlot} onChange={(event) => setOrderSettings({ ...orderSettings, capacityPerSlot: Number(event.target.value) })} /><span>سفارش</span></div></div><div className="field"><label htmlFor="order-opens">شروع سفارش‌گیری</label><input id="order-opens" className="input" type="time" value={orderSettings.opensAt} onChange={(event) => setOrderSettings({ ...orderSettings, opensAt: event.target.value })} /></div><div className="field"><label htmlFor="order-closes">پایان سفارش‌گیری</label><input id="order-closes" className="input" type="time" value={orderSettings.closesAt} onChange={(event) => setOrderSettings({ ...orderSettings, closesAt: event.target.value })} /></div></div></section>
  </form>;
}
