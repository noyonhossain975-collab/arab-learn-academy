import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard } from "@/components/admin/AdminUI";
import { ConfirmDelete, ReorderButtons, useReorder } from "@/components/admin/AdminControls";
import { BulkImport } from "@/components/admin/BulkImport";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Draft = { arabic: string; pronunciation_bn: string; meaning_bn: string };
const empty: Draft = { arabic: "", pronunciation_bn: "", meaning_bn: "" };

export function TopicWords({ topicId, onBack }: { topicId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const { move } = useReorder();
  const [draft, setDraft] = useState<Draft>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState<Draft>(empty);
  const [q, setQ] = useState("");

  const topic = useQuery({
    queryKey: ["admin", "vocab-topic", topicId],
    queryFn: async () => (await supabase.from("vocab_topics").select("title").eq("id", topicId).single()).data,
  });
  const words = useQuery({
    queryKey: ["admin", "vocab-words", topicId],
    queryFn: async () => {
      const { data, error } = await supabase.from("vocab_words").select("*").eq("vocab_topic_id", topicId).order("order_index").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });
  const all = words.data ?? [];
  const maxOrder = Math.max(0, ...all.map((w) => w.order_index));
  const list = q ? all.filter((w) => [w.arabic, w.meaning_bn, w.pronunciation_bn ?? ""].some((s) => s.includes(q))) : all;

  async function add() {
    if (!draft.arabic.trim() || !draft.meaning_bn.trim()) return toast.error("আরবি শব্দ ও অর্থ লিখুন");
    const { error } = await supabase.from("vocab_words").insert({
      vocab_topic_id: topicId, arabic: draft.arabic.trim(), pronunciation_bn: draft.pronunciation_bn.trim() || null,
      meaning_bn: draft.meaning_bn.trim(), order_index: maxOrder + 1,
    });
    if (error) return toast.error(error.message);
    setDraft(empty);
    refresh();
  }

  async function saveEdit(id: string) {
    if (!edit.arabic.trim() || !edit.meaning_bn.trim()) return toast.error("আরবি শব্দ ও অর্থ লিখুন");
    const { error } = await supabase.from("vocab_words").update({
      arabic: edit.arabic.trim(), pronunciation_bn: edit.pronunciation_bn.trim() || null, meaning_bn: edit.meaning_bn.trim(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    setEditing(null);
    refresh();
  }

  return (
    <AdminCard>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> সব টপিক</Button>
        <h2 className="mr-auto text-lg font-bold">{topic.data?.title}</h2>
        <BulkImport
          templateName="vocab-template"
          columns={[{ key: "arabic", required: true }, { key: "pronunciation_bn" }, { key: "meaning_bn", required: true }]}
          example={[
            { arabic: "اَلسَّلَامُ عَلَيْكُمْ", pronunciation_bn: "আসসালামু আলাইকুম", meaning_bn: "আপনার উপর শান্তি বর্ষিত হোক" },
            { arabic: "شُكْرًا", pronunciation_bn: "শুকরান", meaning_bn: "ধন্যবাদ" },
          ]}
          insertBatch={async (rows, start) => {
            const { error } = await supabase.from("vocab_words").insert(rows.map((r, i) => ({
              vocab_topic_id: topicId, arabic: r["arabic"]!, pronunciation_bn: r["pronunciation_bn"] || null,
              meaning_bn: r["meaning_bn"]!, order_index: maxOrder + start + i + 1,
            })));
            if (error) throw error;
          }}
          onDone={refresh}
        />
      </div>
      <Input placeholder="শব্দ খুঁজুন" value={q} onChange={(e) => setQ(e.target.value)} className="mb-3 max-w-xs" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr><th className="py-2">ক্রম</th><th>আরবি</th><th>উচ্চারণ</th><th>অর্থ</th><th></th></tr>
          </thead>
          <tbody>
            <tr className="border-t border-border bg-muted/50">
              <td className="py-2"><Plus className="mx-auto h-4 w-4 text-muted-foreground" /></td>
              <td><Input dir="rtl" lang="ar" className="arabic h-9" placeholder="আরবি" value={draft.arabic} onChange={(e) => setDraft({ ...draft, arabic: e.target.value })} /></td>
              <td><Input className="h-9" placeholder="উচ্চারণ" value={draft.pronunciation_bn} onChange={(e) => setDraft({ ...draft, pronunciation_bn: e.target.value })} /></td>
              <td><Input className="h-9" placeholder="অর্থ" value={draft.meaning_bn} onChange={(e) => setDraft({ ...draft, meaning_bn: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") add(); }} /></td>
              <td className="text-right"><Button size="sm" onClick={add}>যোগ</Button></td>
            </tr>
            {list.map((w) => {
              const i = all.indexOf(w);
              return editing === w.id ? (
                <tr key={w.id} className="border-t border-border">
                  <td />
                  <td><Input dir="rtl" lang="ar" className="arabic h-9" value={edit.arabic} onChange={(e) => setEdit({ ...edit, arabic: e.target.value })} /></td>
                  <td><Input className="h-9" value={edit.pronunciation_bn} onChange={(e) => setEdit({ ...edit, pronunciation_bn: e.target.value })} /></td>
                  <td><Input className="h-9" value={edit.meaning_bn} onChange={(e) => setEdit({ ...edit, meaning_bn: e.target.value })} /></td>
                  <td className="whitespace-nowrap text-right">
                    <button onClick={() => saveEdit(w.id)} className="rounded p-1.5 text-primary hover:bg-muted"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditing(null)} className="rounded p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                  </td>
                </tr>
              ) : (
                <tr key={w.id} className="border-t border-border">
                  <td className="py-2">{!q && <ReorderButtons index={i} count={all.length} onMove={async (d) => { await move("vocab_words", "order_index", all.map((x) => x.id), i, d).catch((e) => toast.error(e.message)); refresh(); }} />}</td>
                  <td className="arabic text-lg" lang="ar">{w.arabic}</td>
                  <td>{w.pronunciation_bn}</td>
                  <td>{w.meaning_bn}</td>
                  <td className="whitespace-nowrap text-right">
                    <button title="সম্পাদনা" onClick={() => { setEditing(w.id); setEdit({ arabic: w.arabic, pronunciation_bn: w.pronunciation_bn ?? "", meaning_bn: w.meaning_bn }); }} className="rounded p-1.5 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
                    <ConfirmDelete name={w.arabic} onConfirm={async () => { const { error } = await supabase.from("vocab_words").delete().eq("id", w.id); if (error) toast.error(error.message); refresh(); }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!words.isLoading && all.length === 0 && <p className="py-6 text-center text-muted-foreground">এখনো কোনো শব্দ নেই</p>}
    </AdminCard>
  );
}
