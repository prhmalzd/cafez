import { cafes, getCafeBySlug } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sanitizeTheme } from "@/lib/themes";
import type { BusinessHours, Cafe, CafeTheme, MenuCategory } from "@/lib/types";

const dayLabels = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه", "شنبه"];

export async function getLiveCafeBySlug(slug: string): Promise<Cafe | undefined> {
  const fallback = getCafeBySlug(slug);
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallback;
  const { data, error } = await supabase.from("cafes").select("*, business_hours(*), menu_categories(*, menu_items(*)), cafe_themes(*), order_settings(*), media_assets(*)").eq("slug", slug).eq("status", "approved").maybeSingle();
  if (error || !data) return fallback;
  const related = <T,>(value: T | T[] | null | undefined): T | undefined => Array.isArray(value) ? value[0] : value ?? undefined;
  const theme = related<Record<string, unknown>>(data.cafe_themes);
  const settings = related<Record<string, unknown>>(data.order_settings);
  const media = Array.isArray(data.media_assets) ? data.media_assets : [];
  const categories: MenuCategory[] = (data.menu_categories ?? []).sort((a: Record<string, number>, b: Record<string, number>) => a.sort_order - b.sort_order).filter((category: Record<string, boolean>) => category.is_active).map((category: Record<string, unknown>) => ({
    id: String(category.id), name: String(category.name), items: ((category.menu_items as Record<string, unknown>[]) ?? []).sort((a, b) => Number(a.sort_order) - Number(b.sort_order)).map((item) => ({
      id: String(item.id), name: String(item.name), description: String(item.description ?? ""), price: Number(item.price_toman), image: item.image_url ? String(item.image_url) : undefined,
      available: Boolean(item.is_available), featured: Boolean(item.is_featured), orderable: item.is_orderable !== false,
      ingredients: (item.ingredients as string[]) ?? [], badges: (item.badges as string[]) ?? [],
    })),
  }));
  const hours: BusinessHours[] = (data.business_hours ?? []).map((entry: Record<string, unknown>) => ({ day: Number(entry.weekday), label: dayLabels[Number(entry.weekday)], opensAt: entry.opens_at ? String(entry.opens_at).slice(0, 5) : null, closesAt: entry.closes_at ? String(entry.closes_at).slice(0, 5) : null, closed: Boolean(entry.is_closed) }));
  const gallery = media.filter((asset: Record<string, unknown>) => asset.kind === "gallery").sort((a: Record<string, number>, b: Record<string, number>) => a.sort_order - b.sort_order).map((asset: Record<string, unknown>) => String(asset.storage_path));
  return {
    id: data.id, slug: data.slug, name: data.name, shortDescription: data.short_description, description: data.description, neighborhood: data.neighborhood,
    address: data.address, type: data.cafe_type, priceRange: data.price_range, cover: data.cover_url || fallback?.cover || "/images/cafe-hero.png",
    logo: data.logo_url || fallback?.logo || "/images/cafe-hero.png", gallery: gallery.length ? gallery : fallback?.gallery ?? [], phone: data.phone,
    instagram: data.instagram_url ?? undefined, website: data.website_url ?? undefined, mapUrl: data.map_url ?? "#", amenities: data.amenities ?? [],
    hours: hours.length ? hours : fallback?.hours ?? [], menu: categories, offerIds: [], featured: data.featured, status: data.status, createdAt: data.created_at,
    theme: sanitizeTheme(theme ? { preset: theme.preset as CafeTheme["preset"], primaryColor: String(theme.primary_color), accentColor: String(theme.accent_color), mode: theme.mode as CafeTheme["mode"], font: theme.font as CafeTheme["font"], tier: theme.tier as CafeTheme["tier"] } : fallback?.theme),
    orderSettings: settings ? { enabled: Boolean(settings.enabled), minimumPrepMinutes: Number(settings.minimum_prep_minutes), slotIntervalMinutes: Number(settings.slot_interval_minutes), capacityPerSlot: Number(settings.capacity_per_slot), acceptanceTimeoutMinutes: Number(settings.acceptance_timeout_minutes), opensAt: String(settings.order_opens_at ?? "08:00").slice(0, 5), closesAt: String(settings.order_closes_at ?? "22:30").slice(0, 5) } : fallback?.orderSettings,
  };
}

export async function getManagedCafe(): Promise<Cafe> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return cafes[0];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return cafes[0];
  const { data: membership } = await supabase.from("cafe_members").select("cafes(slug)").eq("user_id", user.id).limit(1).maybeSingle();
  const relation = membership?.cafes as unknown as { slug?: string } | { slug?: string }[] | null;
  const slug = Array.isArray(relation) ? relation[0]?.slug : relation?.slug;
  return (slug ? await getLiveCafeBySlug(slug) : undefined) ?? cafes[0];
}
