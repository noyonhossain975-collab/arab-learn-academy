import { useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionView, type AnswerResult, type SubmitAnswer } from "@/components/exams/QuestionView";
import { answerKey, examTreeOptions, mistakesOptions, type ExamQuestion } from "@/lib/exams";
import { folderTrail } from "@/lib/exam-admin";

function Practice({ q, userId, onDone }: { q: ExamQuestion; userId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const submit: SubmitAnswer = async ({ optionId, partId, selfCorrect }) => {
    const { data, error } = await supabase.rpc("practice_mistake", { p_question_id: q.id, ...(optionId && { p_option_id: optionId }), ...(partId && { p_part_id: partId }), ...(selfCorrect !== undefined && { p_self_correct: selfCorrect }) });
    if (error) { toast.error(error.message); return false; }
    setResults({ [answerKey(q.id, partId)]: { ok: !!data, optionId } });
    toast[data ? "success" : "error"](data ? "সঠিক! ভুলটি সমাধান হলো" : "আবার ভুল হয়েছে, পরে আবার চেষ্টা করুন");
    qc.invalidateQueries({ queryKey: ["mistakes", userId] });
    return !!data;
  };
  return <div className="space-y-3"><QuestionView q={q} results={results} onSubmit={submit} singlePart /><Button variant="ghost" size="sm" onClick={onDone}>বন্ধ করো</Button></div>;
}

export function MistakesList({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(mistakesOptions(userId));
  const { data: tree } = useSuspenseQuery(examTreeOptions(userId));
  const [tab, setTab] = useState("open"), [subject, setSubject] = useState("all"), [practice, setPractice] = useState<string>();
  const subjectOf = (folderId: string) => { const t = folderTrail(tree.folders, folderId); return t[1]?.title ?? t[0]?.title ?? "অন্যান্য"; };
  const subjects = [...new Set(data.map(m => subjectOf(m.question.folder_id)))];
  const rows = data.filter(m => (tab === "open" ? !m.is_resolved : m.is_resolved) && (subject === "all" || subjectOf(m.question.folder_id) === subject));
  return <><PageHeader title="সংরক্ষিত ভুল" /><div className="space-y-4 p-5">
    <Tabs value={tab} onValueChange={setTab}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="open">অনুশীলন বাকি ({data.filter(m => !m.is_resolved).length.toLocaleString("bn-BD")})</TabsTrigger><TabsTrigger value="done">সমাধান হয়েছে</TabsTrigger></TabsList></Tabs>
    {subjects.length > 1 && <div className="flex flex-wrap gap-2">{["all", ...subjects].map(s => <Button key={s} size="sm" variant={subject === s ? "default" : "outline"} onClick={() => setSubject(s)}>{s === "all" ? "সব বিষয়" : s}</Button>)}</div>}
    {rows.map(m => <div key={m.id} className="rounded-lg border p-4">
      <p className="mb-2 text-xs text-muted-foreground">{subjectOf(m.question.folder_id)} · {m.times_wrong.toLocaleString("bn-BD")} বার ভুল</p>
      {practice === m.id ? <Practice q={m.question} userId={userId} onDone={() => setPractice(undefined)} /> : <>
        <p dir="auto" className="line-clamp-3 whitespace-pre-wrap font-semibold">{m.question.question_text}</p>
        <Button size="sm" className="mt-3" variant={m.is_resolved ? "outline" : "default"} onClick={() => setPractice(m.id)}><RotateCcw className="h-4 w-4" />আবার অনুশীলন</Button>
      </>}
    </div>)}
    {!rows.length && <p className="py-12 text-center text-muted-foreground">{tab === "open" ? "কোনো ভুল জমা নেই — দারুণ! 🎉" : "এখনো কোনো ভুল সমাধান হয়নি"}</p>}
  </div></>;
}
