import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard } from "@/components/admin/AdminUI";
import { ConfirmDelete, ReorderButtons, useReorder } from "@/components/admin/AdminControls";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function VocabTopics({ onOpen }: { onOpen: (id: string) => void }) {
  const qc = useQueryClient();
  const { move } = useReorder();
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const topics = useQuery({
    queryKey: ["admin", "vocab-topics"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vocab_topics").select("*, vocab_words(count)").order("sort_order").order("created_at");
      if (error) throw error;
      return data.map((t) => ({ ...t, count: (t.vocab_words as unknown as { count: number }[])[0]?.count ?? 0 }));
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "vocab-topics"] });
  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok?: string) => {
    const { error } = await p;
    if (error) toast.error(error.message);
    else if (ok) toast.success(ok);
    refresh();
  };
  const list = topics.data ?? [];

  async function add() {
    const title = newTitle.trim();
    if (!title) return;
    const max = Math.max(0, ...list.map((t) => t.sort_order));
    await run(supabase.from("vocab_topics").insert({ title, sort_order: max + 1, is_published: false, is_free: false }), "টপিক যোগ হয়েছে");
    setNewTitle("");
  }

  return (
    <AdminCard>
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mb-4 flex gap-2">
        <Input placeholder="নতুন টপিক (যেমন: সালাম আদান প্রদান)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Button type="submit"><Plus className="mr-1 h-4 w-4" /> যোগ করো</Button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">ক্রম</th><th>টপিক</th><th>শব্দ</th><th>ফ্রি</th><th>প্রকাশিত</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((t, i) => (
              <tr key={t.id} className="border-t border-border align-top">
                <td className="py-2"><ReorderButtons index={i} count={list.length} onMove={async (d) => { await move("vocab_topics", "sort_order", list.map((x) => x.id), i, d).catch((e) => toast.error(e.message)); refresh(); }} /></td>
                <td className="py-2">
                  {editing === t.id ? (
                    <form className="space-y-1" onSubmit={async (e) => { e.preventDefault(); if (!editTitle.trim()) return; await run(supabase.from("vocab_topics").update({ title: editTitle.trim(), description: editDesc.trim() || null }).eq("id", t.id)); setEditing(null); }}>
                      <Input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8" />
                      <Input placeholder="ছোট বিবরণ (ঐচ্ছিক)" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="h-8" />
                      <Button size="sm" type="submit">ঠিক আছে</Button>
                    </form>
                  ) : (
                    <button onClick={() => onOpen(t.id)} className="text-left">
                      <span className="flex items-center gap-1 font-semibold hover:text-primary">{t.title} <ChevronRight className="h-4 w-4" /></span>
                      {t.description && <span className="text-xs text-muted-foreground">{t.description}</span>}
                    </button>
                  )}
                </td>
                <td className="py-2">{t.count.toLocaleString("bn-BD")}</td>
                <td className="py-2"><Switch checked={t.is_free} onCheckedChange={(v) => run(supabase.from("vocab_topics").update({ is_free: v }).eq("id", t.id))} /></td>
                <td className="py-2"><Switch checked={t.is_published} onCheckedChange={(v) => run(supabase.from("vocab_topics").update({ is_published: v }).eq("id", t.id))} /></td>
                <td className="whitespace-nowrap py-2 text-right">
                  <button title="সম্পাদনা" onClick={() => { setEditing(t.id); setEditTitle(t.title); setEditDesc(t.description ?? ""); }} className="rounded p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <ConfirmDelete name={t.title} inside={t.count ? `${t.count.toLocaleString("bn-BD")}টি শব্দ` : null} onConfirm={() => run(supabase.from("vocab_topics").delete().eq("id", t.id), "টপিক মুছে ফেলা হয়েছে")} />
                </td>
              </tr>
            ))}
            {topics.isLoading && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">লোড হচ্ছে…</td></tr>}
            {!topics.isLoading && list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">এখনো কোনো টপিক নেই</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">"ফ্রি" চালু থাকলে সব ছাত্র টপিকটি দেখতে পারবে, বন্ধ থাকলে শুধু প্রিমিয়াম ছাত্ররা।</p>
    </AdminCard>
  );
}
