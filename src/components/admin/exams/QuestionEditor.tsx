import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ImagePlus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PARTS } from "@/lib/exam-admin";
import { uploadContentImage } from "@/lib/upload";

type Draft = {
  id: string; type: "mcq" | "creative"; question_text: string; explanation: string; image_url: string; sort_order: number;
  options: { option_text: string; is_correct: boolean }[];
  parts: { part_key: string; question_text: string; model_answer: string; marks: number }[];
};
export function QuestionEditor({ folderId, questionId, creative, order, onBack }: { folderId: string; questionId: string; creative: boolean; order: number; onBack: () => void }) {
  const query = useQuery({ queryKey: ["admin", "question-editor", questionId], queryFn: async (): Promise<Draft> => {
    if (questionId === "new") return { id: crypto.randomUUID(), type: "mcq", question_text: "", explanation: "", image_url: "", sort_order: order,
      options: [1,2,3,4].map(() => ({ option_text: "", is_correct: false })), parts: PARTS.map(p => ({ part_key: p.key, question_text: "", model_answer: "", marks: p.marks })) };
    const { data, error } = await supabase.from("questions").select("*, question_options(*), creative_parts(*)").eq("id", questionId).eq("folder_id", folderId).single();
    if (error) throw error;
    return { ...data, type: data.type === "creative" ? "creative" : "mcq", image_url: data.image_url ?? "", explanation: data.explanation ?? "",
      options: [1,2,3,4].map(i => { const o = data.question_options.find(o => o.order_index === i); return { option_text: o?.option_text ?? "", is_correct: o?.is_correct ?? false }; }),
      parts: PARTS.map(p => { const part = data.creative_parts.find(x => x.part_key === p.key); return { part_key: p.key, question_text: part?.question_text ?? "", model_answer: part?.model_answer ?? "", marks: part?.marks ?? p.marks }; }) };
  }});
  if (query.isPending) return <p className="py-10 text-muted-foreground">লোড হচ্ছে…</p>;
  if (query.error || !query.data) return <div><Button variant="outline" onClick={onBack}>পেছনে যাও</Button><p role="alert" className="mt-4 text-destructive">প্রশ্নটি পাওয়া যায়নি। আবার চেষ্টা করুন।</p></div>;
  return <EditorForm key={questionId} initial={query.data} folderId={folderId} isNew={questionId === "new"} creative={creative} onBack={onBack} />;
}
function EditorForm({ initial, folderId, isNew, creative, onBack }: { initial: Draft; folderId: string; isNew: boolean; creative: boolean; onBack: () => void }) {
  const [draft, setDraft] = useState(initial), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false);
  const qc = useQueryClient();
  async function save() {
    if (!draft.question_text.trim()) { toast.error("প্রশ্ন লিখুন"); return; }
    if (draft.type === "mcq" && (draft.options.some(o => !o.option_text.trim()) || draft.options.filter(o => o.is_correct).length !== 1)) { toast.error("চারটি অপশন লিখুন এবং একটি সঠিক উত্তর বেছে নিন"); return; }
    if (draft.type === "creative" && draft.parts.some(p => !p.question_text.trim() || !p.model_answer.trim() || !Number.isInteger(p.marks) || p.marks < 1)) { toast.error("প্রতি অংশে প্রশ্ন, উত্তর ও ধনাত্মক পূর্ণ নম্বর দিন"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.rpc("admin_save_questions", { p_folder_id: folderId, p_questions: [draft] });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["admin", "exam-questions"] });
      await qc.invalidateQueries({ queryKey: ["admin", "question-editor"] });
      toast.success("প্রশ্ন সংরক্ষণ হয়েছে"); onBack();
    } catch { toast.error("প্রশ্ন সংরক্ষণ হয়নি। আবার চেষ্টা করুন।"); } finally { setBusy(false); }
  }
  return <form onSubmit={e => { e.preventDefault(); save(); }} className="max-w-4xl space-y-5">
    <Button type="button" variant="outline" disabled={busy || uploading} onClick={onBack}><ArrowLeft className="h-4 w-4" /> প্রশ্নের তালিকা</Button>
    {isNew && creative && <RadioGroup className="flex gap-5" value={draft.type} onValueChange={v => setDraft({ ...draft, type: v === "creative" ? "creative" : "mcq" })}>
      <label className="flex gap-2"><RadioGroupItem value="mcq" /> বহুনির্বাচনি</label><label className="flex gap-2"><RadioGroupItem value="creative" /> সৃজনশীল</label>
    </RadioGroup>}
    <label className="block space-y-2"><span className="font-semibold">{draft.type === "mcq" ? "প্রশ্ন" : "উদ্দীপক"}</span><Textarea required dir="auto" rows={5} value={draft.question_text} onChange={e => setDraft({ ...draft, question_text: e.target.value })} /></label>
    {draft.type === "mcq" ? <>
      <RadioGroup value={String(draft.options.findIndex(o => o.is_correct))} onValueChange={v => setDraft({ ...draft, options: draft.options.map((o,i) => ({ ...o, is_correct: i === Number(v) })) })} className="space-y-3">
        {draft.options.map((o,i) => <div key={i} className="flex items-center gap-3"><RadioGroupItem value={String(i)} aria-label={`সঠিক উত্তর ${i + 1}`} /><Input required aria-label={`অপশন ${i + 1}`} dir="auto" placeholder={`অপশন ${(i + 1).toLocaleString("bn-BD")}`} value={o.option_text} onChange={e => setDraft({ ...draft, options: draft.options.map((x,j) => j === i ? { ...x, option_text: e.target.value } : x) })} /></div>)}
      </RadioGroup>
      <label className="block space-y-2"><span>ব্যাখ্যা</span><Textarea dir="auto" rows={4} value={draft.explanation} onChange={e => setDraft({ ...draft, explanation: e.target.value })} /></label>
    </> : <>
      <div className="space-y-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary"><ImagePlus className="h-4 w-4" />{uploading ? "ছবি যোগ হচ্ছে…" : "ছবি যোগ করো (ঐচ্ছিক)"}<input type="file" accept="image/*" disabled={uploading || busy} className="sr-only" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; setUploading(true); try { const image_url = await uploadContentImage(file, "exams"); setDraft(d => ({ ...d, image_url })); } catch (err) { toast.error(err instanceof Error ? err.message : "ছবি যোগ হয়নি"); } finally { setUploading(false); } }} /></label>
        {draft.image_url && <div className="flex items-start gap-2"><img src={draft.image_url} alt="উদ্দীপকের ছবি" className="max-h-64 max-w-full rounded-lg object-contain" /><Button type="button" variant="ghost" size="icon" title="ছবি সরাও" onClick={() => setDraft({ ...draft, image_url: "" })}><X className="h-4 w-4" /></Button></div>}
      </div>
      {draft.parts.map((p,i) => <fieldset key={p.part_key} className="space-y-3 border-t border-border pt-4"><legend className="font-semibold">{PARTS[i]?.label}</legend>
        <Textarea required dir="auto" rows={2} aria-label={`${PARTS[i]?.label} প্রশ্ন`} placeholder="প্রশ্ন" value={p.question_text} onChange={e => setDraft({ ...draft, parts: draft.parts.map((x,j) => j === i ? { ...x, question_text: e.target.value } : x) })} />
        <Textarea required dir="auto" rows={4} aria-label={`${PARTS[i]?.label} মডেল উত্তর`} placeholder="মডেল উত্তর" value={p.model_answer} onChange={e => setDraft({ ...draft, parts: draft.parts.map((x,j) => j === i ? { ...x, model_answer: e.target.value } : x) })} />
        <label className="flex items-center gap-3">নম্বর<Input type="number" required min={1} step={1} className="w-24" value={p.marks} onChange={e => setDraft({ ...draft, parts: draft.parts.map((x,j) => j === i ? { ...x, marks: Number(e.target.value) } : x) })} /></label>
      </fieldset>)}
    </>}
    <Button type="submit" disabled={busy || uploading}><Save className="h-4 w-4" />{busy ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করো"}</Button>
  </form>;
}