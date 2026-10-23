import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { validateWhatsApp } from "@/lib/site-settings";

export type ThemePreference = "light" | "dark" | "default";
export function themePreference(value: string): ThemePreference {
  return value === "light" || value === "dark" ? value : "default";
}
export function usesDarkTheme(value: ThemePreference, deviceDark: boolean) {
  return value === "dark" || (value === "default" && deviceDark);
}
export function purchaseHref(number: string, template: string, details: { plan: string; price: number; name: string; email: string }) {
  if (validateWhatsApp(number, template)) return null;
  const message = template.replace(/\{(plan|price|name|email)\}/g, (_, key: keyof typeof details) => String(details[key]));
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
export function validateAvatar(file: Pick<File, "type" | "size">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "JPG, PNG বা WebP ছবি দিন";
  return file.size > 2 * 1024 * 1024 ? "ছবির সাইজ ২ MB-এর বেশি হবে না" : null;
}
export const profileOptions = (userId: string) => queryOptions({
  queryKey: ["profile", userId], queryFn: async () => {
    const { data, error } = await supabase.from("profiles").select("full_name,avatar_url,theme_pref").eq("id", userId).single();
    if (error) throw error;
    return data;
  },
});
export const premiumOptions = (userId: string) => queryOptions({
  queryKey: ["premium", userId], staleTime: 0, queryFn: async () => {
    const [plans, subscriptions, settings, active] = await Promise.all([
      supabase.from("plans").select("id,name,price,duration_days,features").eq("is_active", true).order("sort_order"),
      supabase.from("subscriptions").select("status,expires_at,plan:plans(name)").eq("user_id", userId).order("expires_at", { ascending: false }).limit(1),
      supabase.from("site_settings").select("key,value").in("key", ["whatsapp_number", "whatsapp_message_template"]),
      supabase.rpc("has_active_subscription", { _user_id: userId }),
    ]);
    for (const r of [plans, subscriptions, settings, active]) if (r.error) throw r.error;
    const value = (key: string) => { const v = settings.data?.find(s => s.key === key)?.value; return typeof v === "string" ? v : ""; };
    return { plans: plans.data ?? [], subscription: subscriptions.data?.[0], active: active.data === true, number: value("whatsapp_number"), template: value("whatsapp_message_template") };
  },
});
export const communityOptions = queryOptions({ queryKey: ["student-community"], queryFn: async () => {
  const { data, error } = await supabase.from("community_links").select("id,title,url,platform").eq("is_active", true).order("sort_order");
  if (error) throw error;
  return data;
} });
export const blogOptions = queryOptions({ queryKey: ["student-blog"], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.from("blog_posts").select("id,title,slug,cover_image_url,published_at").eq("is_published", true).order("published_at", { ascending: false });
  if (error) throw error;
  return data;
} });
export const articleOptions = (slug: string) => queryOptions({ queryKey: ["student-blog", slug], staleTime: 0, queryFn: async () => {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw error;
  return data;
} });