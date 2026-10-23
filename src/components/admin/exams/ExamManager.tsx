import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Folder, ChevronRight, Pencil, Plus, ArrowDown, ArrowUp, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDelete } from "@/components/admin/AdminControls";
import { BulkImport } from "@/components/admin/BulkImport";
import { QuestionEditor } from "./QuestionEditor";
import { allowsCreative, descendantIds, folderTrail, mcqColumns, creativeColumns, validateMcq, importQuestion } from "@/lib/exam-admin";

export function ExamManager({ folderId, questionId, go }: { folderId?: string; questionId?: string; go: (folder?: string, question?: string) => void }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(""), [editing, setEditing] = useState<string | null>(null), [rename, setRename] = useState(""), [filter, setFilter] = useState("");
  const [recursive, setRecursive] = useState<Record<string, boolean>>({}), [busy, setBusy] = useState(false);
  const folders = useQuery({ queryKey: ["admin", "exam-folders"], queryFn: async () => {
    const { data, error } = await supabase.from("exam_folders").select("*").order("sort_order").order("created_at");
    if (error) throw error; return data;
  }});
  const questions = useQuery({ queryKey: ["admin", "exam-questions"], queryFn: async () => {
    const { data, error } = await supabase.from("questions").select("id,folder_id,type,question_text,sort_order").order("sort_order").order("created_at");
    if (error) throw error; return data;
  }});
  const all = folders.data ?? [], allQuestions = questions.data ?? [];
  const trail = folderTrail(all, folderId), current = trail.at(-1);
  const children = all.filter(f => f.parent_id === (folderId ?? null));
  const list = allQuestions.filter(q => q.folder_id === folderId), visible = list.filter(q => q.question_text.toLowerCase().includes(filter.toLowerCase()));
  const creative = allowsCreative(trail[0]?.root_key), order = Math.max(0, ...list.map(q => q.sort_order)) + 1;
  const refresh = async () => { await Promise.all([qc.invalidateQueries({ queryKey: ["admin", "exam-folders"] }), qc.invalidateQueries({ queryKey: ["admin", "exam-questions"] })]); };
  async function run(task: () => PromiseLike<{ error: { message: string } | null }>) {
    if (busy) return; setBusy(true);
    try { const { error } = await task(); if (error) throw error; await refresh(); toast.success("পরিবর্তন সংরক্ষণ হয়েছে"); }
    catch { toast.error("পরিবর্তন সংরক্ষণ হয়নি। আবার চেষ্টা করুন।"); } finally { setBusy(false); }
  }
  async function reorder(table: "questions" | "exam_folders", ids: string[], index: number, dir: -1 | 1) {
    const next = [...ids], a = next[index], b = next[index + dir]; if (!a || !b) return;
    next[index] = b; next[index + dir] = a;
    await run(async () => { const results = await Promise.all(next.map((id,i) => supabase.from(table).update({ sort_order: i + 1 }).eq("id",id))); return { error: results.find(r => r.error)?.error ?? null }; });
  }
  if (folders.isPending || questions.isPending) return <p className="py-10 text-muted-foreground">লোড হচ্ছে…</p>;
  if (folders.error || questions.error) return <div className="space-y-3"><p role="alert" className="text-destructive">তথ্য লোড হয়নি।</p><Button onClick={refresh}>আবার চেষ্টা করো</Button></div>;
  if (folderId && !current) return <div><p>ফোল্ডারটি পাওয়া যায়নি।</p><Button onClick={() => go()}>মূল ফোল্ডার</Button></div>;
  return <div className="space-y-7">
    <nav aria-label="ফোল্ডারের পথ" className="flex flex-wrap items-center gap-1 text-sm"><Button variant="ghost" size="sm" onClick={() => go()}>মূল ফোল্ডার</Button>{trail.map(f => <span key={f.id} className="flex items-center"><ChevronRight className="h-4 w-4 text-muted-foreground" /><Button variant="ghost" size="sm" onClick={() => go(f.id)}>{f.title}</Button></span>)}</nav>
    {questionId && folderId ? <QuestionEditor folderId={folderId} questionId={questionId} creative={creative} order={order} onBack={() => go(folderId)} /> : <>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{current?.title ?? "পরীক্ষার বিভাগ"}</h2>
          {folderId && <form className="flex min-w-0 gap-2" onSubmit={e => { e.preventDefault(); if (!title.trim()) return; run(async () => { const result = await supabase.from("exam_folders").insert({ parent_id: folderId, title: title.trim(), sort_order: Math.max(0,...children.map(f => f.sort_order)) + 1, is_published: false, is_free: false }); if (!result.error) setTitle(""); return result; }); }}><Input aria-label="নতুন ফোল্ডারের নাম" placeholder="নতুন ফোল্ডারের নাম" value={title} onChange={e => setTitle(e.target.value)} required /><Button type="submit" disabled={busy}><Plus className="h-4 w-4" /> যোগ করো</Button></form>}
        </div>
        <div className="overflow-x-auto rounded-lg border border-border bg-background"><table className="w-full text-sm"><thead className="bg-muted text-left text-muted-foreground"><tr><th className="p-3">ক্রম</th><th className="p-3">ফোল্ডার</th><th className="p-3">ভেতরে</th><th className="p-3">ফ্রি</th><th className="p-3">প্রকাশিত</th><th className="p-3">সম্পাদনা</th></tr></thead><tbody>
          {children.map((f,i) => { const sub = descendantIds(all,f.id); const count = allQuestions.filter(q => sub.includes(q.folder_id)).length; return <tr key={f.id} className="border-t border-border align-top">
            <td className="p-3"><Move index={i} count={children.length} busy={busy} move={d => reorder("exam_folders",children.map(f => f.id),i,d)} /></td>
            <td className="p-3">{editing === f.id ? <form className="flex gap-2" onSubmit={e => { e.preventDefault(); if (!rename.trim()) return; run(async () => { const r = await supabase.from("exam_folders").update({ title: rename.trim() }).eq("id",f.id); if (!r.error) setEditing(null); return r; }); }}><Input value={rename} onChange={e => setRename(e.target.value)} required autoFocus /><Button size="sm" disabled={busy}>সংরক্ষণ</Button><Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>বাতিল</Button></form> : <Button variant="ghost" className="h-auto whitespace-normal px-0 text-left" onClick={() => go(f.id)}><Folder className="h-4 w-4 shrink-0 text-primary" />{f.title}<ChevronRight className="h-4 w-4 shrink-0" /></Button>}</td>
            <td className="whitespace-nowrap p-3 text-muted-foreground">{(sub.length-1).toLocaleString("bn-BD")} ফোল্ডার · {count.toLocaleString("bn-BD")} প্রশ্ন</td>
            <td className="p-3"><Switch aria-label={`${f.title} ফ্রি`} checked={f.is_free} disabled={busy} onCheckedChange={v => run(() => supabase.rpc("admin_set_folder_free", { p_folder_id: f.id, p_is_free: v, p_recursive: recursive[f.id] ?? false }))} /><label className="mt-2 flex items-center gap-2 whitespace-nowrap text-xs text-muted-foreground"><Checkbox checked={recursive[f.id] ?? false} onCheckedChange={v => setRecursive({ ...recursive,[f.id]: v === true })} />সব সাবফোল্ডারেও</label></td>
            <td className="p-3"><Switch aria-label={`${f.title} প্রকাশিত`} checked={f.is_published} disabled={busy} onCheckedChange={v => run(() => supabase.from("exam_folders").update({ is_published:v }).eq("id",f.id))} /></td>
            <td className="whitespace-nowrap p-3"><Button variant="ghost" size="icon" title="নাম বদলাও" onClick={() => { setEditing(f.id); setRename(f.title); }}><Pencil className="h-4 w-4" /></Button>{!f.is_system && <ConfirmDelete name={f.title} inside={`${(sub.length-1).toLocaleString("bn-BD")}টি সাবফোল্ডার ও ${count.toLocaleString("bn-BD")}টি প্রশ্ন`} onConfirm={() => run(() => supabase.from("exam_folders").delete().eq("id",f.id))} />}</td>
          </tr>; })}
          {!children.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">কোনো সাবফোল্ডার নেই</td></tr>}
        </tbody></table></div>
      </section>
      {folderId && <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">প্রশ্ন ({list.length.toLocaleString("bn-BD")})</h2><div className="flex flex-wrap gap-2"><QuestionImport folderId={folderId} type="mcq" order={order} onDone={refresh} />{creative && <QuestionImport folderId={folderId} type="creative" order={order} onDone={refresh} />}<Button onClick={() => go(folderId,"new")}><Plus className="h-4 w-4" /> প্রশ্ন যোগ করো</Button></div></div>
        <div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="প্রশ্ন খুঁজুন" placeholder="প্রশ্ন খুঁজুন" className="pl-9" value={filter} onChange={e => setFilter(e.target.value)} /></div>
        <div className="divide-y divide-border border-y border-border">{visible.map(q => <div key={q.id} className="flex items-center gap-3 py-4"><Move index={list.findIndex(x => x.id === q.id)} count={list.length} busy={busy || !!filter} move={d => reorder("questions",list.map(q => q.id),list.findIndex(x => x.id === q.id),d)} /><div className="min-w-0 flex-1"><p className="mb-1 text-xs text-muted-foreground">{q.type === "creative" ? "সৃজনশীল" : "বহুনির্বাচনি"}</p><p dir="auto" className="line-clamp-2 whitespace-pre-wrap">{q.question_text}</p></div><Button variant="ghost" size="icon" title="প্রশ্ন সম্পাদনা" onClick={() => go(folderId,q.id)}><Pencil className="h-4 w-4" /></Button><ConfirmDelete name={q.question_text.slice(0,70)} inside="অপশন / অংশ, সংরক্ষিত ভুল ও উত্তরের ইতিহাস" onConfirm={() => run(() => supabase.from("questions").delete().eq("id",q.id))} /></div>)}{!visible.length && <p className="py-8 text-center text-muted-foreground">{filter ? "কোনো প্রশ্ন মেলেনি" : "এখনো কোনো প্রশ্ন নেই"}</p>}</div>
      </section>}
    </>}
  </div>;
}
function Move({ index,count,busy,move }: { index:number; count:number; busy:boolean; move:(dir:-1|1)=>void }) {
  return <div className="flex"><Button variant="ghost" size="icon" title="উপরে" disabled={busy || index===0} onClick={() => move(-1)}><ArrowUp className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="নিচে" disabled={busy || index===count-1} onClick={() => move(1)}><ArrowDown className="h-4 w-4" /></Button></div>;
}
function QuestionImport({ folderId,type,order,onDone }: { folderId:string; type:"mcq"|"creative"; order:number; onDone:()=>void }) {
  const example = type === "mcq" ? { question_text:"كِتَابٌ শব্দের অর্থ কী?",option_1:"বই",option_2:"কলম",option_3:"ঘর",option_4:"দরজা",correct_option:"1",explanation:"كِتَابٌ অর্থ বই।" } : { stimulus:"একজন ছাত্র প্রতিদিন আরবি শেখে।",ka_question:"ইসম কী?",ka_answer:"নামবাচক শব্দ।",kha_question:"ফিল কী?",kha_answer:"ক্রিয়াবাচক শব্দ।",ga_question:"একটি উদাহরণ দাও।",ga_answer:"كَتَبَ",gha_question:"বাক্যে ব্যবহার করো।",gha_answer:"كَتَبَ الطَّالِبُ" };
  return <BulkImport key={`${folderId}-${type}`} columns={type === "mcq" ? mcqColumns : creativeColumns} validate={type === "mcq" ? validateMcq : undefined} example={[example]} templateName={`arab-learn-${type}`} label={type === "mcq" ? "বহুনির্বাচনি আমদানি" : "সৃজনশীল আমদানি"} onDone={onDone} insertBatch={async (rows,start) => { const { error } = await supabase.rpc("admin_save_questions", { p_folder_id:folderId,p_questions:rows.map((r,i) => importQuestion(r,type,order+start+i,crypto.randomUUID())) }); if (error) throw error; }} />;
}