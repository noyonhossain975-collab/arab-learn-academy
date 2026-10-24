import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PARTS } from "@/lib/exam-admin";

export type ExamOption = { id: string; option_text: string; is_correct: boolean; order_index: number };
export type ExamPart = { id: string; part_key: string; question_text: string; model_answer: string | null; marks: number };
export type ExamQuestion = { id: string; folder_id: string; type: string; question_text: string; image_url: string | null; explanation: string | null; sort_order: number; question_options: ExamOption[]; creative_parts: ExamPart[] };
export type ExamFolder = { id: string; parent_id: string | null; root_key: string | null; title: string; sort_order: number; is_free: boolean };

const QUESTION_FIELDS = "id,folder_id,type,question_text,image_url,explanation,sort_order,question_options(id,option_text,is_correct,order_index),creative_parts(id,part_key,question_text,model_answer,marks)";

/** Marks for one exam: MCQ = 1 each, creative = sum of its parts. Mirrors start_exam in the database. */
export function examTotal(qs: Pick<ExamQuestion, "type" | "creative_parts">[]) {
  return qs.reduce((t, q) => t + (q.type === "mcq" ? 1 : q.creative_parts.reduce((s, p) => s + p.marks, 0)), 0);
}
export function answerKey(questionId: string, partId?: string) { return partId ? `${questionId}:${partId}` : questionId; }
export function orderParts(parts: ExamPart[]) { return [...parts].sort((a, b) => PARTS.findIndex(p => p.key === a.part_key) - PARTS.findIndex(p => p.key === b.part_key)); }
export function partLabel(key: string) { return PARTS.find(p => p.key === key)?.label ?? key; }
export function normalize(q: ExamQuestion): ExamQuestion {
  return { ...q, question_options: [...q.question_options].sort((a, b) => a.order_index - b.order_index), creative_parts: orderParts(q.creative_parts) };
}
export function isLocked(folder: Pick<ExamFolder, "is_free">, premium: boolean) { return !folder.is_free && !premium; }

export function mcqCountChoices(available: number) {
  return [10, 15].filter(count => count < available).concat(available > 0 ? [available] : []);
}
export function validMcqCount(count: number, available: number) {
  return Number.isInteger(count) && count >= 1 && count <= available;
}
/** Keep the author's order and include every creative question in mixed folders. */
export function selectExamQuestions(questions: ExamQuestion[], count: number) {
  const available = questions.filter(q => q.type === "mcq").length;
  if (!validMcqCount(count, available)) throw new Error("প্রশ্নের সংখ্যা সঠিক নয়");
  let included = 0;
  return questions.filter(q => q.type !== "mcq" || included++ < count);
}

export const examTreeOptions = (userId: string) => queryOptions({
  queryKey: ["exams", "tree", userId], queryFn: async () => {
    const [folders, premium] = await Promise.all([
      supabase.from("exam_folders").select("id,parent_id,root_key,title,sort_order,is_free").eq("is_published", true).order("sort_order").order("title"),
      supabase.rpc("has_active_subscription", { _user_id: userId }),
    ]);
    if (folders.error) throw folders.error; if (premium.error) throw premium.error;
    return { folders: folders.data as ExamFolder[], premium: !!premium.data };
  },
});

export const folderQuestionsOptions = (folderId: string, userId: string) => queryOptions({
  queryKey: ["exams", "questions", folderId, userId], staleTime: 0, gcTime: 0, refetchOnWindowFocus: false, queryFn: async () => {
    // RLS returns nothing for locked folders; content never leaves the database for free users.
    const { data, error } = await supabase.from("questions").select(QUESTION_FIELDS).eq("folder_id", folderId).order("sort_order").order("id");
    if (error) throw error;
    return (data as unknown as ExamQuestion[]).map(normalize);
  },
});

export const mistakesOptions = (userId: string) => queryOptions({
  queryKey: ["mistakes", userId], staleTime: 0, queryFn: async () => {
    const { data, error } = await supabase.from("saved_mistakes").select(`id,times_wrong,is_resolved,last_wrong_at,resolved_at,question:questions(${QUESTION_FIELDS})`).eq("user_id", userId).order("last_wrong_at", { ascending: false });
    if (error) throw error;
    type Row = { id: string; times_wrong: number; is_resolved: boolean; last_wrong_at: string; resolved_at: string | null; question: ExamQuestion | null };
    return (data as unknown as Row[]).filter(r => r.question).map(r => ({ ...r, question: normalize(r.question as ExamQuestion) }));
  },
});

export function examHead(title: string, description: string) {
  return { meta: [{ title: `${title} — Arab learn` }, { name: "description", content: description }, { property: "og:title", content: `${title} — Arab learn` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] };
}
