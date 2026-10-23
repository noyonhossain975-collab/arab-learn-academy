import { useEffect, useRef, useState } from "react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LockedContent } from "@/components/learning/LearningUI";
import { ReportForm } from "@/components/ReportForm";
import { QuestionView, isQuestionDone, type AnswerResult, type SubmitAnswer } from "@/components/exams/QuestionView";
import { answerKey, examTotal, folderQuestionsOptions } from "@/lib/exams";

export function ExamRunner({ folderId, userId }: { folderId: string; userId: string }) {
  const { data: questions } = useSuspenseQuery(folderQuestionsOptions(folderId, userId));
  const qc = useQueryClient();
  const [attemptId, setAttemptId] = useState<string>();
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, AnswerResult>>({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !questions.length) return; started.current = true;
    supabase.rpc("start_exam", { p_folder_id: folderId }).then(({ data, error }) => error ? toast.error(error.message) : setAttemptId(data as string));
  }, [folderId, questions.length]);
  if (!questions.length) return <LockedContent title="প্রশ্ন পাওয়া যায়নি" text="এই পরীক্ষাটি প্রিমিয়াম হতে পারে, অথবা এখনো প্রশ্ন যোগ হয়নি।" />;
  const total = examTotal(questions), q = questions[index]!;
  const submit: SubmitAnswer = async ({ optionId, partId, selfCorrect }) => {
    if (!attemptId) { toast.error("পরীক্ষা শুরু হচ্ছে, একটু অপেক্ষা করুন"); return false; }
    const { data, error } = await supabase.rpc("answer_question", { p_attempt_id: attemptId, p_question_id: q.id, p_option_id: optionId, p_part_id: partId, p_self_correct: selfCorrect });
    if (error) { toast.error(error.message); return false; }
    const ok = !!data, marks = partId ? q.creative_parts.find(p => p.id === partId)?.marks ?? 0 : 1;
    setResults(r => ({ ...r, [answerKey(q.id, partId)]: { ok, optionId } }));
    if (ok) setScore(s => s + marks);
    return ok;
  };
  async function finish() {
    if (attemptId) { const { error } = await supabase.rpc("finish_exam", { p_attempt_id: attemptId }); if (error) { toast.error(error.message); return; } }
    qc.invalidateQueries({ queryKey: ["mistakes", userId] }); setFinished(true); window.scrollTo(0, 0);
  }
  if (finished) return <div className="space-y-6 p-5">
    <div className="rounded-lg bg-secondary p-6 text-center"><Trophy className="mx-auto mb-2 h-12 w-12 text-primary" /><p className="text-sm">আপনার স্কোর</p>
      <p className="text-4xl font-bold">{score.toLocaleString("bn-BD")} / {total.toLocaleString("bn-BD")}</p>
      <div className="mt-4 flex justify-center gap-2"><Button asChild variant="outline"><Link to="/exam-folders/$folderId" params={{ folderId }}>ফিরে যাও</Link></Button><Button asChild><Link to="/mistakes">ভুলগুলো দেখো</Link></Button></div></div>
    <h2 className="text-xl font-bold">সব প্রশ্নের রিভিউ</h2>
    {questions.map((x, i) => <div key={x.id} className="rounded-lg border p-4"><p className="mb-2 text-sm text-muted-foreground">প্রশ্ন {(i + 1).toLocaleString("bn-BD")}</p><QuestionView q={x} results={results} review /></div>)}
  </div>;
  const done = isQuestionDone(q, results), last = index === questions.length - 1;
  return <div className="space-y-5 p-5">
    <div className="flex items-center justify-between text-sm"><Button variant="ghost" size="sm" asChild><Link to="/exam-folders/$folderId" params={{ folderId }}><ArrowLeft className="h-4 w-4" />বের হও</Link></Button>
      <span>প্রশ্ন {(index + 1).toLocaleString("bn-BD")} / {questions.length.toLocaleString("bn-BD")}</span><span className="font-bold text-primary">{score.toLocaleString("bn-BD")} পয়েন্ট</span></div>
    <Progress value={((index + (done ? 1 : 0)) / questions.length) * 100} />
    <QuestionView key={q.id} q={q} results={results} onSubmit={submit} />
    <div className="flex items-center justify-between gap-2 pt-2"><ReportForm userId={userId} questionId={q.id} />
      {last ? <Button size="lg" onClick={finish}>পরীক্ষা শেষ করো</Button> : <Button size="lg" onClick={() => { setIndex(index + 1); window.scrollTo(0, 0); }}>{done ? "পরবর্তী" : "এড়িয়ে যাও"}<ArrowRight className="h-4 w-4" /></Button>}</div>
  </div>;
}
