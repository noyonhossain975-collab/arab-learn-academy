import { useState } from "react";
import { Check, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { answerKey, partLabel, type ExamQuestion } from "@/lib/exams";
import { cn } from "@/lib/utils";

export type AnswerResult = { ok: boolean; optionId?: string | undefined };
export type SubmitAnswer = (a: { optionId?: string | undefined; partId?: string | undefined; selfCorrect?: boolean | undefined }) => Promise<boolean>;

/** One MCQ or creative question. MCQ shows instant feedback; creative parts reveal the model answer then self-mark. */
export function QuestionView({ q, results, onSubmit, review = false, singlePart = false }: { q: ExamQuestion; results: Record<string, AnswerResult>; onSubmit?: SubmitAnswer; review?: boolean; singlePart?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  async function run(a: Parameters<SubmitAnswer>[0]) { if (!onSubmit || busy) return; setBusy(true); try { await onSubmit(a); } finally { setBusy(false); } }
  const mcq = results[answerKey(q.id)];
  return (
    <div className="min-w-0 space-y-4 break-words">
      <p dir="auto" className="whitespace-pre-wrap text-lg font-semibold leading-relaxed">{q.question_text}</p>
      {q.image_url && <img src={q.image_url} alt="" loading="lazy" className="max-h-72 rounded-lg" />}
      {q.type === "mcq" ? (
        <div className="space-y-2">
          {q.question_options.map(o => {
            const chosen = mcq?.optionId === o.id, show = !!mcq || review;
            return <Button variant="outline" key={o.id} type="button" disabled={!!mcq || busy || review} onClick={() => run({ optionId: o.id })} dir="auto"
              className={cn("h-auto w-full items-center gap-3 whitespace-normal rounded-lg border-2 p-4 text-left disabled:opacity-100", !show && "hover:border-primary",
                show && o.is_correct && "border-primary bg-primary/10", show && chosen && !o.is_correct && "border-destructive bg-destructive/10")}>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{o.option_text}</span>
              {show && o.is_correct && <Check className="h-5 w-5 text-primary" />}{show && chosen && !o.is_correct && <X className="h-5 w-5 text-destructive" />}
            </Button>;
          })}
          {mcq && <p className={cn("font-bold", mcq.ok ? "text-primary" : "text-destructive")}>{mcq.ok ? "সঠিক! চমৎকার 🎉" : "ভুল হয়েছে — ভুলের তালিকায় রাখা হলো"}</p>}
          {(mcq || review) && q.explanation && <div className="rounded-lg bg-muted p-4"><p className="mb-1 text-sm font-bold">ব্যাখ্যা</p><p dir="auto" className="whitespace-pre-wrap">{q.explanation}</p></div>}
        </div>
      ) : (
        <div className="space-y-3">
          {(singlePart ? q.creative_parts.slice(0, 1).map(p => ({ ...p, question_text: q.creative_parts.map(x => `(${partLabel(x.part_key)}) ${x.question_text}`).join("\n"), model_answer: q.creative_parts.map(x => `(${partLabel(x.part_key)}) ${x.model_answer ?? ""}`).join("\n\n") })) : q.creative_parts).map(p => {
            const r = results[answerKey(q.id, p.id)], open = revealed[p.id] || !!r || review;
            return <div key={p.id} className="rounded-lg border p-4">
              <p dir="auto" className="whitespace-pre-wrap font-semibold">{singlePart ? "" : `(${partLabel(p.part_key)}) `}{p.question_text} {!singlePart && <span className="text-sm text-muted-foreground">[{p.marks.toLocaleString("bn-BD")} নম্বর]</span>}</p>
              {!open && <Button variant="outline" size="sm" className="mt-3" onClick={() => setRevealed({ ...revealed, [p.id]: true })}><Eye className="h-4 w-4" />উত্তর দেখুন</Button>}
              {open && <div className="mt-3 rounded-lg bg-muted p-3"><p className="mb-1 text-sm font-bold">মডেল উত্তর</p><p dir="auto" className="whitespace-pre-wrap">{p.model_answer}</p></div>}
              {open && !r && !review && <div className="mt-3 flex flex-wrap gap-2"><span className="self-center text-sm">আপনার উত্তর কি সঠিক?</span><Button size="sm" disabled={busy} onClick={() => run({ partId: p.id, selfCorrect: true })}><Check className="h-4 w-4" />সঠিক</Button><Button size="sm" variant="destructive" disabled={busy} onClick={() => run({ partId: p.id, selfCorrect: false })}><X className="h-4 w-4" />ভুল</Button></div>}
              {r && <p className={cn("mt-2 text-sm font-bold", r.ok ? "text-primary" : "text-destructive")}>{r.ok ? "সঠিক চিহ্নিত" : "ভুল চিহ্নিত"}</p>}
            </div>;
          })}
        </div>
      )}
    </div>
  );
}

export function isQuestionDone(q: ExamQuestion, results: Record<string, AnswerResult>) {
  return q.type === "mcq" ? !!results[answerKey(q.id)] : q.creative_parts.every(p => results[answerKey(q.id, p.id)]);
}
