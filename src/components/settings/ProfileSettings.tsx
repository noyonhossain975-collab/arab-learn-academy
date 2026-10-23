import { useRef, useState } from "react";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Monitor, Moon, Sun, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { profileOptions, themePreference, validateAvatar, type ThemePreference } from "@/lib/student-settings";

export function ProfileSettings({ userId, email }: { userId: string; email: string }) {
  const { data } = useSuspenseQuery(profileOptions(userId));
  const qc = useQueryClient();
  const [name, setName] = useState(data.full_name ?? "");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["profile", userId] }), qc.invalidateQueries({ queryKey: ["dashboard", userId] })]);
  async function save(values: { full_name?: string; avatar_url?: string; theme_pref?: ThemePreference }) {
    const { error } = await supabase.from("profiles").update(values).eq("id", userId).select("id").single();
    if (error) throw error;
    await refresh();
  }
  async function upload(file: File) {
    const invalid = validateAvatar(file);
    if (invalid) { toast.error(invalid); return; }
    setBusy(true);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    let uploaded = false;
    try {
      const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: file.type });
      if (error) throw error;
      uploaded = true;
      const { data: link, error: linkError } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (linkError || !link) throw linkError ?? new Error("ছবি সংরক্ষণ হয়নি");
      await save({ avatar_url: link.signedUrl });
      toast.success("ছবি সংরক্ষণ হয়েছে");
    } catch { if (uploaded) await supabase.storage.from("avatars").remove([path]); toast.error("ছবি সংরক্ষণ হয়নি। আবার চেষ্টা করুন।"); }
    finally { setBusy(false); }
  }
  return <section className="space-y-5 border-b border-border pb-6">
    <div className="flex items-center gap-4"><div className="relative shrink-0">
      {data.avatar_url ? <img src={data.avatar_url} alt="প্রোফাইল ছবি" className="h-20 w-20 rounded-full border-2 border-border object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground"><UserRound className="h-9 w-9" /></div>}
      <Button title="ছবি পরিবর্তন" aria-label="ছবি পরিবর্তন" size="icon" disabled={busy} className="absolute -bottom-1 -right-1 rounded-full" onClick={() => input.current?.click()}><Camera /></Button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); e.target.value = ""; }} />
    </div><div className="min-w-0"><h2 className="text-lg font-bold">আমার প্রোফাইল</h2><p className="break-all text-sm text-muted-foreground">{email}</p></div></div>
    <form className="space-y-3" onSubmit={async e => { e.preventDefault(); if (!name.trim()) return; setBusy(true); try { await save({ full_name: name.trim() }); toast.success("নাম সংরক্ষণ হয়েছে"); } catch { toast.error("নাম সংরক্ষণ হয়নি"); } finally { setBusy(false); } }}>
      <label className="block space-y-2"><span className="text-sm font-semibold">নাম</span><Input required maxLength={100} value={name} onChange={e => setName(e.target.value)} /></label>
      <Button type="submit" disabled={busy || !name.trim()}><Save />{busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ"}</Button>
    </form>
    <fieldset className="space-y-3"><legend className="text-sm font-semibold">থিম</legend><div className="grid grid-cols-3 gap-2">{([{ value: "light", label: "লাইট", icon: Sun }, { value: "dark", label: "ডার্ক", icon: Moon }, { value: "default", label: "ডিভাইস", icon: Monitor }] as const).map(t => <Button key={t.value} variant={themePreference(data.theme_pref) === t.value ? "secondary" : "outline"} aria-pressed={themePreference(data.theme_pref) === t.value} disabled={busy} className="h-auto flex-col py-3" onClick={async () => { setBusy(true); try { await save({ theme_pref: t.value }); } catch { toast.error("থিম সংরক্ষণ হয়নি"); } finally { setBusy(false); } }}><t.icon />{t.label}</Button>)}</div></fieldset>
  </section>;
}