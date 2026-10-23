import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard } from "@/components/admin/AdminUI";
import { ConfirmDelete, ReorderButtons, useReorder } from "@/components/admin/AdminControls";
import { BulkImport } from "@/components/admin/BulkImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { textToHtml } from "@/lib/content";

export function GroupLessons({ groupId, onBack, onEdit }: { groupId: string; onBack: () => void; onEdit: (id: string) => void }) {
  const qc = useQueryClient();
  const { move } = useReorder();
  const [q, setQ] = useState("");

  const group = useQuery({
    queryKey: ["admin", "lesson-group", groupId],
    queryFn: async () => (await supabase.from("lesson_groups").select("*").eq("id", groupId).single()).data,
  });
  const lessons = useQuery({
    queryKey: ["admin", "lessons", groupId],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("id, title, order_index, is_published, updated_at").eq("group_id", groupId).order("order_index").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const run = async (p: PromiseLike<{ error: { message: string } | null }>, ok?: string) => {
    const { error } = await p;
    if (error) toast.error(error.message);
    else if (ok) toast.success(ok);
    refresh();
  };

  const all = lessons.data ?? [];
  const list = q ? all.filter((l) => l.title.toLowerCase().includes(q.toLowerCase())) : all;
  const maxOrder = Math.max(0, ...all.map((l) => l.order_index));
  const free = group.data?.free_lesson_limit ?? 0;

  return (
    <AdminCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> সব গ্রুপ</Button>
        <h2 className="mr-auto text-lg font-bold">{group.data?.title}</h2>
        <BulkImport
          templateName="lessons-template"
          columns={[{ key: "title", required: true }, { key: "content", required: true }, { key: "order" }]}
          example={[
            { title: "ইসম কাকে বলে", content: "ইসম এমন শব্দ যা নিজের অর্থ নিজে প্রকাশ করে।\n\nউদাহরণ: كِتَابٌ (বই)", order: "1" },
            { title: "ফেল কাকে বলে", content: "<p>ফেল হলো কাজবাচক শব্দ।</p><p dir=\"rtl\">ذَهَبَ</p>", order: "2" },
          ]}
          validate={(r) => (r["order"] && !/^\d+$/.test(r["order"]) ? "order শুধু সংখ্যা হবে" : null)}
          insertBatch={async (rows, start) => {
            const { error } = await supabase.from("lessons").insert(
              rows.map((r, i) => ({
                group_id: groupId,
                title: r["title"]!,
                content: textToHtml(r["content"]!),
                order_index: r["order"] ? parseInt(r["order"], 10) : maxOrder + start + i + 1,
                is_published: false,
              })),
            );
            if (error) throw error;
          }}
          onDone={refresh}
        />
        <Button onClick={() => onEdit("new")}><Plus className="mr-1 h-4 w-4" /> নতুন লেসন</Button>
      </div>
      <Input placeholder="লেসন খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 max-w-xs" />
      <table className="w-full text-sm">
        <thead className="text-left text-muted-foreground">
          <tr><th className="py-2">ক্রম</th><th>#</th><th>শিরোনাম</th><th>প্রকাশিত</th><th></th></tr>
        </thead>
        <tbody>
          {list.map((l) => {
            const i = all.indexOf(l);
            return (
              <tr key={l.id} className="border-t border-border">
                <td className="py-2">
                  {!q && <ReorderButtons index={i} count={all.length} onMove={async (d) => { await move("lessons", "order_index", all.map((x) => x.id), i, d).catch((e) => toast.error(e.message)); refresh(); }} />}
                </td>
                <td className="text-muted-foreground">{(i + 1).toLocaleString("bn-BD")}</td>
                <td>
                  <button onClick={() => onEdit(l.id)} className="text-left font-semibold hover:text-primary">{l.title}</button>
                  {i < free && <span className="ml-2 rounded bg-secondary px-1.5 text-xs text-secondary-foreground">ফ্রি</span>}
                </td>
                <td><Switch checked={l.is_published} onCheckedChange={(v) => run(supabase.from("lessons").update({ is_published: v }).eq("id", l.id))} /></td>
                <td className="whitespace-nowrap text-right">
                  <button title="সম্পাদনা" onClick={() => onEdit(l.id)} className="rounded p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                  <ConfirmDelete name={l.title} onConfirm={() => run(supabase.from("lessons").delete().eq("id", l.id), "লেসন মুছে ফেলা হয়েছে")} />
                </td>
              </tr>
            );
          })}
          {lessons.isLoading && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">লোড হচ্ছে…</td></tr>}
          {!lessons.isLoading && list.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">কোনো লেসন নেই</td></tr>}
        </tbody>
      </table>
      <p className="mt-4 text-xs text-muted-foreground">"ফ্রি" চিহ্ন: প্রকাশিত লেসনের মধ্যে প্রথম {free.toLocaleString("bn-BD")}টি ফ্রি ছাত্ররা পড়তে পারবে। CSV দিয়ে আনা লেসন শুরুতে অপ্রকাশিত থাকে।</p>
    </AdminCard>
  );
}
