import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Save, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ConfirmDelete } from "@/components/admin/AdminControls";
import type { Tables } from "@/integrations/supabase/types";

type A = Tables<"announcements">;
const kinds = [["feature", "নতুন ফিচার"], ["update", "আপডেট"], ["offer", "অফার"], ["important", "জরুরি"]] as const;
const empty = { title: "", body: "", kind: "update", link_url: "", link_label: "", is_active: true, sort_order: 0 };

export function AnnouncementsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<A | "new" | null>(null);
  const q = useQuery({ queryKey: ["admin", "announcements"], queryFn: async () => { const { data, error } = await supabase.from("announcements").select("*").order("sort_order").order("created_at", { ascending: false }); if (error) throw error; return data; } });
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["admin", "announcements"] }), qc.invalidateQueries({ queryKey: ["announcements"] })]);
  if (q.isPending) return <p>লোড হচ্ছে…</p>;
  if (q.error) return <p className="text-destructive">ঘোষণা লোড হয়নি <Button variant="link" onClick={() => q.refetch()}>আবার চেষ্টা করো</Button></p>;
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">ঘোষণা বোর্ড</h2><p className="text-sm text-muted-foreground">শিক্ষার্থীদের হোম পাতার উপরে দেখাবে</p></div><Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" />নতুন ঘোষণা</Button></div>
      {editing && <Editor key={editing === "new" ? "new" : editing.id} item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={async () => { await refresh(); setEditing(null); }} />}
      <div className="divide-y divide-border border-y border-border">
        {q.data.map((a) => (
          <div key={a.id} className="flex items-center gap-3 py-4">
            <div className="min-w-0 flex-1"><h3 dir="auto" className="break-words font-semibold">{a.title}</h3><p className="text-xs text-muted-foreground">{kinds.find(k => k[0] === a.kind)?.[1]} · ক্রম {a.sort_order}</p></div>
            <Switch checked={a.is_active} aria-label={`${a.title} চালু`} onCheckedChange={async (v) => { const { error } = await supabase.from("announcements").update({ is_active: v }).eq("id", a.id); if (error) toast.error("সংরক্ষণ হয়নি"); else { await refresh(); toast.success(v ? "ঘোষণা চালু হয়েছে" : "ঘোষণা বন্ধ হয়েছে"); } }} />
            <Button variant="ghost" size="icon" title="সম্পাদনা" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></Button>
            <ConfirmDelete name={a.title} onConfirm={async () => { const { error } = await supabase.from("announcements").delete().eq("id", a.id); if (error) toast.error("মুছে ফেলা যায়নি"); else { await refresh(); toast.success("ঘোষণা মুছে ফেলা হয়েছে"); } }} />
          </div>
        ))}
        {!q.data.length && <p className="py-8 text-center text-muted-foreground">কোনো ঘোষণা নেই</p>}
      </div>
    </section>
  );
}

function Editor({ item, onClose, onSaved }: { item: A | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const [f, setF] = useState({ ...empty, ...(item ? { ...item, link_url: item.link_url ?? "", link_label: item.link_label ?? "" } : {}) });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f, v: unknown) => setF((p) => ({ ...p, [k]: v }));
  return (
    <form className="max-w-2xl space-y-3 rounded-xl border-2 p-4" onSubmit={async (e) => {
      e.preventDefault();
      const link = f.link_url.trim();
      if (!f.title.trim()) { toast.error("শিরোনাম দিন"); return; }
      if (link && !/^(https?:\/\/|\/(?!\/))/.test(link)) { toast.error("লিংক https:// অথবা / দিয়ে শুরু হতে হবে"); return; }
      setBusy(true);
      try {
        const values = { title: f.title.trim(), body: f.body.trim(), kind: f.kind, link_url: link || null, link_label: f.link_label.trim() || null, is_active: f.is_active, sort_order: Number(f.sort_order) || 0 };
        const { error } = item ? await supabase.from("announcements").update(values).eq("id", item.id) : await supabase.from("announcements").insert(values);
        if (error) throw error; toast.success("ঘোষণা সংরক্ষণ হয়েছে"); await onSaved();
      } catch { toast.error("সংরক্ষণ হয়নি"); } finally { setBusy(false); }
    }}>
      <label className="block space-y-1"><span>শিরোনাম</span><Input maxLength={150} value={f.title} onChange={(e) => set("title", e.target.value)} /></label>
      <label className="block space-y-1"><span>বিস্তারিত (ঐচ্ছিক)</span><Textarea maxLength={600} value={f.body} onChange={(e) => set("body", e.target.value)} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1"><span>ধরন</span><select className="h-10 w-full rounded-md border border-input bg-background px-3" value={f.kind} onChange={(e) => set("kind", e.target.value)}>{kinds.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="block space-y-1"><span>ক্রম (ছোট সংখ্যা আগে)</span><Input type="number" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value)} /></label>
        <label className="block space-y-1"><span>লিংক (ঐচ্ছিক)</span><Input placeholder="/learn অথবা https://…" value={f.link_url} onChange={(e) => set("link_url", e.target.value)} /></label>
        <label className="block space-y-1"><span>বাটনের লেখা</span><Input placeholder="বিস্তারিত" value={f.link_label} onChange={(e) => set("link_label", e.target.value)} /></label>
      </div>
      <label className="flex items-center gap-2"><Switch checked={f.is_active} onCheckedChange={(v) => set("is_active", v)} />চালু</label>
      <div className="flex gap-2"><Button type="submit" disabled={busy}><Save className="h-4 w-4" />{busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করো"}</Button><Button type="button" variant="outline" onClick={onClose}><X className="h-4 w-4" />বাতিল</Button></div>
    </form>
  );
}
