"use client";

import { FolderPlus, GripVertical, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/lib/types";
import { formatToman } from "@/lib/utils";

type ItemDraft = {
  name: string;
  description: string;
  price: string;
  ingredients: string;
  badges: string;
  available: boolean;
  featured: boolean;
};

type EditorState = { categoryId: string; itemId?: string } | null;

const emptyDraft: ItemDraft = {
  name: "", description: "", price: "", ingredients: "", badges: "", available: true, featured: false,
};

const storageKey = (cafeId: string) => `cafez:menu:${cafeId}`;

export function MenuManager({ initialCategories, cafeId }: { initialCategories: MenuCategory[]; cafeId: string }) {
  const [categories, setCategories] = useState(initialCategories);
  const [editor, setEditor] = useState<EditorState>(null);
  const [draft, setDraft] = useState<ItemDraft>(emptyDraft);
  const [categoryName, setCategoryName] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey(cafeId));
    if (stored) {
      try { setCategories(JSON.parse(stored) as MenuCategory[]); }
      catch { localStorage.removeItem(storageKey(cafeId)); }
    }
  }, [cafeId]);

  const itemCount = useMemo(() => categories.reduce((total, category) => total + category.items.length, 0), [categories]);

  function update(next: MenuCategory[]) {
    setCategories(next);
    setDirty(true);
    setNotice("");
  }

  function save() {
    localStorage.setItem(storageKey(cafeId), JSON.stringify(categories));
    setDirty(false);
    setNotice("منو ذخیره شد و در صفحه عمومی کافه هم نمایش داده می‌شود.");
  }

  function toggle(categoryId: string, itemId: string) {
    update(categories.map((category) => category.id === categoryId ? { ...category, items: category.items.map((item) => item.id === itemId ? { ...item, available: !item.available } : item) } : category));
  }

  function openNewItem(categoryId: string) {
    setDraft(emptyDraft);
    setEditor({ categoryId });
  }

  function openEditItem(categoryId: string, item: MenuItem) {
    setDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      ingredients: (item.ingredients ?? []).join("، "),
      badges: (item.badges ?? []).join("، "),
      available: item.available,
      featured: Boolean(item.featured),
    });
    setEditor({ categoryId, itemId: item.id });
  }

  function submitItem(event: FormEvent) {
    event.preventDefault();
    if (!editor) return;
    const price = Number(draft.price);
    if (!draft.name.trim() || !Number.isFinite(price) || price < 0) return;
    const item: MenuItem = {
      id: editor.itemId ?? crypto.randomUUID(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      price,
      available: draft.available,
      featured: draft.featured,
      ingredients: draft.ingredients.split(/[،,]/).map((value) => value.trim()).filter(Boolean),
      badges: draft.badges.split(/[،,]/).map((value) => value.trim()).filter(Boolean),
    };
    update(categories.map((category) => category.id === editor.categoryId ? {
      ...category,
      items: editor.itemId ? category.items.map((current) => current.id === editor.itemId ? item : current) : [...category.items, item],
    } : category));
    setEditor(null);
  }

  function deleteItem(categoryId: string, itemId: string) {
    if (!window.confirm("این آیتم از منو حذف شود؟")) return;
    update(categories.map((category) => category.id === categoryId ? { ...category, items: category.items.filter((item) => item.id !== itemId) } : category));
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name) return;
    update([...categories, { id: crypto.randomUUID(), name, items: [] }]);
    setCategoryName("");
    setShowCategoryForm(false);
  }

  function deleteCategory(category: MenuCategory) {
    const message = category.items.length ? `دسته «${category.name}» و ${category.items.length} آیتم داخل آن حذف شوند؟` : `دسته «${category.name}» حذف شود؟`;
    if (!window.confirm(message)) return;
    update(categories.filter((current) => current.id !== category.id));
  }

  return <>
    <div className="dash-top">
      <div><h1>مدیریت منو</h1><span className="muted">{categories.length.toLocaleString("fa-IR")} دسته و {itemCount.toLocaleString("fa-IR")} آیتم؛ قیمت و موجودی را همین‌جا به‌روز کنید.</span></div>
      <div className="table-actions">
        <button onClick={() => setShowCategoryForm(true)} className="button button-outline button-small"><FolderPlus size={16} /> دسته جدید</button>
        <button onClick={save} disabled={!dirty} className="button button-primary button-small"><Save size={16} /> ذخیره تغییرات</button>
      </div>
    </div>

    {notice && <div className="status-message" role="status">{notice}</div>}
    {dirty && <div className="unsaved-note">تغییر ذخیره‌نشده دارید.</div>}

    {categories.map((category) => <section className="panel menu-admin-section" key={category.id}>
      <div className="panel-head">
        <div><h2>{category.name}</h2><span className="muted">{category.items.length.toLocaleString("fa-IR")} آیتم</span></div>
        <div className="table-actions"><button onClick={() => openNewItem(category.id)} className="button button-outline button-small"><Plus size={15} /> آیتم جدید</button><button onClick={() => deleteCategory(category)} className="icon-button danger-button" aria-label={`حذف دسته ${category.name}`}><Trash2 size={16} /></button></div>
      </div>
      {category.items.length ? <div className="table-scroll"><table className="table"><thead><tr><th>آیتم</th><th>قیمت</th><th>موجودی</th><th>عملیات</th></tr></thead><tbody>{category.items.map((item) => <tr key={item.id}><td><GripVertical size={15} className="drag-icon" /> <strong>{item.name}</strong>{item.featured && <span className="mini-status">محبوب</span>}<div className="muted item-description">{item.description || "بدون توضیح"}</div></td><td>{formatToman(item.price)}</td><td><button type="button" onClick={() => toggle(category.id, item.id)} className={`switch ${item.available ? "on" : ""}`} aria-label={`تغییر موجودی ${item.name}`} aria-pressed={item.available} /><span className={item.available ? "availability-on" : "availability-off"}>{item.available ? "موجود" : "ناموجود"}</span></td><td><div className="table-actions"><button type="button" onClick={() => openEditItem(category.id, item)} className="icon-button compact-icon" aria-label={`ویرایش ${item.name}`}><Pencil size={15} /></button><button type="button" onClick={() => deleteItem(category.id, item.id)} className="icon-button compact-icon danger-button" aria-label={`حذف ${item.name}`}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div> : <div className="empty-mini"><p>هنوز آیتمی در این دسته نیست.</p><button onClick={() => openNewItem(category.id)} className="button button-soft button-small"><Plus size={15} /> اولین آیتم را اضافه کنید</button></div>}
    </section>)}

    {!categories.length && <div className="empty-state"><h3>منوی شما هنوز دسته‌بندی ندارد</h3><p>ابتدا یک دسته مثل «قهوه» یا «صبحانه» بسازید.</p><button onClick={() => setShowCategoryForm(true)} className="button button-primary"><FolderPlus size={17} /> ساخت اولین دسته</button></div>}

    {showCategoryForm && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCategoryForm(false); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="category-title"><div className="modal-head"><div><span className="eyebrow">ساختار منو</span><h2 id="category-title">دسته‌بندی جدید</h2></div><button onClick={() => setShowCategoryForm(false)} className="icon-button" aria-label="بستن"><X size={18} /></button></div><form onSubmit={addCategory}><div className="field"><label htmlFor="category-name">نام دسته</label><input id="category-name" autoFocus required className="input" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="مثلاً نوشیدنی سرد" /></div><div className="modal-actions"><button type="button" onClick={() => setShowCategoryForm(false)} className="button button-outline">انصراف</button><button className="button button-primary">افزودن دسته</button></div></form></div></div>}

    {editor && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null); }}><div className="modal modal-wide" role="dialog" aria-modal="true" aria-labelledby="item-editor-title"><div className="modal-head"><div><span className="eyebrow">آیتم منو</span><h2 id="item-editor-title">{editor.itemId ? "ویرایش آیتم" : "افزودن آیتم جدید"}</h2></div><button onClick={() => setEditor(null)} className="icon-button" aria-label="بستن"><X size={18} /></button></div><form onSubmit={submitItem}>
      <div className="form-grid"><div className="field"><label htmlFor="item-name">نام آیتم</label><input id="item-name" autoFocus required className="input" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="مثلاً لاته زعفران" /></div><div className="field"><label htmlFor="item-price">قیمت به تومان</label><input id="item-price" required min="0" step="1000" inputMode="numeric" type="number" className="input" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="۱۴۸۰۰۰" /></div></div>
      <div className="field"><label htmlFor="item-description">توضیح کوتاه</label><textarea id="item-description" className="textarea" rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="مواد اصلی و طعم آیتم را کوتاه توضیح دهید." /></div>
      <div className="form-grid"><div className="field"><label htmlFor="item-ingredients">مواد اولیه</label><input id="item-ingredients" className="input" value={draft.ingredients} onChange={(event) => setDraft({ ...draft, ingredients: event.target.value })} placeholder="اسپرسو، شیر، زعفران" /><small className="muted">با ویرگول جدا کنید.</small></div><div className="field"><label htmlFor="item-badges">برچسب‌ها</label><input id="item-badges" className="input" value={draft.badges} onChange={(event) => setDraft({ ...draft, badges: event.target.value })} placeholder="وگان، بدون شکر" /><small className="muted">با ویرگول جدا کنید.</small></div></div>
      <div className="form-checks"><label className="checkbox"><input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} /> در منو موجود است</label><label className="checkbox"><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> نمایش به‌عنوان آیتم محبوب</label></div>
      <div className="modal-actions"><button type="button" onClick={() => setEditor(null)} className="button button-outline">انصراف</button><button className="button button-primary">{editor.itemId ? "ذخیره ویرایش" : "افزودن به منو"}</button></div>
    </form></div></div>}
  </>;
}
