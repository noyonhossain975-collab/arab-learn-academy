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

export function GroupsList({ onOpen }: { onOpen: (id: string) => void }) {
  const qc = useQueryClient();
  const { move } = useReorder();
  const [newTitle, setNewTitle] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const groups = useQuery({
    queryKey: ["admin", "lesson-groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_groups").select("*, lessons(count)").order("sort_order").order("created_at");
      if (error) throw error;
      return data.map((g) => ({ ...g, count: (g.lessons as unknown as { count: number }[])[0]?.count ?? 0 }));
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin", "lesson-groups"] });
  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok?: string) => {
    const { error } = await p;
    if (error) toast.error(error.message);
    else if (ok) toast.success(ok);
    refresh();
  };

  async function add() {
    const title = newTitle.trim();
    if (!title) return;
    const slug = `group-${Date.now().toString(36)}`;
    const max = Math.max(0, ...(groups.data ?? []).map((g) => g.sort_order));
    await run(supabase.from("lesson_groups").insert({ title, slug, section: "arabic_education", sort_order: max + 1, is_published: false }), "গ্রুপ যোগ হয়েছে");
    setNewTitle("");
  }

  const list = groups.data ?? [];

  return (
    <AdminCard>
      <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mb-4 flex gap-2">
        <Input placeholder="নতুন গ্রুপের নাম (যেমন: নাহু)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        <Button type="submit"><Plus className="mr-1 h-4 w-4" /> যোগ করো</Button>
      </form>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">ক্রম</th><th>গ্রুপ</th><th>লেসন</th><th>ফ্রি লেসন সংখ্যা</th><th>প্রকাশিত</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((g, i) => (
              <tr key={g.id} className="border-t border-border">
                <td className="py-2">
                  <ReorderButtons index={i} count={list.length} onMove={async (d) => { await move("lesson_groups", "sort_order", list.map((x) => x.id), i, d).catch((e) => toast.error(e.message)); refresh(); }} />
                </td>
                <td>
                  {editing === g.id ? (
                    <form className="flex gap-1" onSubmit={async (e) => { e.preventDefault(); if (!editTitle.trim()) return; await run(supabase.from("lesson_groups").update({ title: editTitle.trim() }).eq("id", g.id)); setEditing(null); }}>
                      <Input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-8" />
                      <Button size="sm" type="submit">ঠিক আছে</Button>
                    </form>
                  ) : (
                    <button onClick={() => onOpen(g.id)} className="flex items-center gap-1 font-semibold hover:text-primary">
                      {g.title} <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </td>
                <td>{g.count.toLocaleString("bn-BD")}</td>
                <td>
                  <Input
                    type="number" min={0} defaultValue={g.free_lesson_limit} className="h-8 w-20"
                    onBlur={(e) => {
                      const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                      if (v !== g.free_lesson_limit) run(supabase.from("lesson_groups").update({ free_lesson_limit: v }).eq("id", g.id), "ফ্রি লেসন সংখ্যা সংরক্ষণ হয়েছে");
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                  />
                </td>
                <td><Switch checked={g.is_published} onCheckedChange={(v) => run(supabase.from("lesson_groups").update({ is_published: v }).eq("id", g.id))} /></td>
                <td className="whitespace-nowrap text-right">
                  <button title="নাম বদলাও" onClick={() => { setEditing(g.id); setEditTitle(g.title); }} className="rounded p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <ConfirmDelete name={g.title} inside={g.count ? `${g.count.toLocaleString("bn-BD")}টি লেসন` : null}
                    onConfirm={() => run(supabase.from("lesson_groups").delete().eq("id", g.id), "গ্রুপ মুছে ফেলা হয়েছে")} />
                </td>
              </tr>
            ))}
            {groups.isLoading && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">লোড হচ্ছে…</td></tr>}
            {!groups.isLoading && list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">এখনো কোনো গ্রুপ নেই</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">"ফ্রি লেসন সংখ্যা" — ফ্রি ছাত্ররা প্রতিটি গ্রুপের প্রথম এতগুলো লেসন পড়তে পারবে। সংখ্যা বদলে বাইরে ক্লিক করলেই সংরক্ষণ হয়।</p>
    </AdminCard>
  );
}
