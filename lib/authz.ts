import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireCafeMember(cafeId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { demo: true, userId: "demo-manager" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role === "admin") return { demo: false, userId: user.id };
  const { data: membership } = await supabase.from("cafe_members").select("cafe_id").eq("cafe_id", cafeId).eq("user_id", user.id).maybeSingle();
  if (!membership) throw new Error("FORBIDDEN");
  return { demo: false, userId: user.id };
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { demo: true, userId: "demo-admin" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") throw new Error("FORBIDDEN");
  return { demo: false, userId: user.id };
}

export function authError(error: unknown) {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") return { status: 401, message: "برای ادامه وارد پنل شوید." };
  if (message === "FORBIDDEN") return { status: 403, message: "به این کافه دسترسی ندارید." };
  return null;
}
