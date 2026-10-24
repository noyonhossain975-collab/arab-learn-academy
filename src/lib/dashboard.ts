import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Consecutive study days ending today (or yesterday, so the streak survives until the day ends). Dates are YYYY-MM-DD in Asia/Dhaka. */
export function computeStreak(studyDates: string[], today: string) {
  const set = new Set(studyDates);
  const day = new Date(`${today}T00:00:00Z`);
  const key = () => day.toISOString().slice(0, 10);
  if (!set.has(key())) day.setUTCDate(day.getUTCDate() - 1);
  let n = 0;
  while (set.has(key())) { n++; day.setUTCDate(day.getUTCDate() - 1); }
  return n;
}

/** Topics (exam folders) with at least 5 answers and accuracy below 60%, weakest first. */
export function weakTopics(answers: { folder_id: string; is_correct: boolean }[], minAnswers = 5, threshold = 0.6) {
  const by = new Map<string, { total: number; correct: number }>();
  for (const a of answers) { const s = by.get(a.folder_id) ?? { total: 0, correct: 0 }; s.total++; if (a.is_correct) s.correct++; by.set(a.folder_id, s); }
  return [...by].map(([folder_id, s]) => ({ folder_id, ...s, accuracy: s.correct / s.total }))
    .filter(t => t.total >= minAnswers && t.accuracy < threshold).sort((a, b) => a.accuracy - b.accuracy);
}

export type DayActivity = { activity_date: string; points: number; lessons_completed: number; questions_answered: number };

/** The 7 Dhaka days ending today (oldest first), filling days without activity with zeros. */
export function weekSeries(rows: DayActivity[], today: string) {
  const by = new Map(rows.map(r => [r.activity_date, r]));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(`${today}T00:00:00Z`); d.setUTCDate(d.getUTCDate() - (6 - i));
    const date = d.toISOString().slice(0, 10); const r = by.get(date);
    return { date, label: d.toLocaleDateString("bn-BD", { weekday: "short", timeZone: "UTC" }), points: r?.points ?? 0, questions: r?.questions_answered ?? 0, lessons: r?.lessons_completed ?? 0 };
  });
}

export const announcementsOptions = () => queryOptions({
  queryKey: ["announcements"], queryFn: async () => {
    const { data, error } = await supabase.from("announcements").select("*").eq("is_active", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error; return data;
  },
});

export const dashboardOptions = (userId: string) => queryOptions({
  queryKey: ["dashboard", userId], staleTime: 0, queryFn: async () => {
    const [today, activity, answers, mistakes, profile, folders] = await Promise.all([
      supabase.rpc("dhaka_today"),
      supabase.from("daily_activity").select("activity_date,points,lessons_completed,questions_answered").eq("user_id", userId).order("activity_date", { ascending: false }).limit(400),
      supabase.from("attempt_answers").select("is_correct,question:questions(folder_id),attempt:exam_attempts!inner(user_id)").eq("attempt.user_id", userId).order("created_at", { ascending: false }).limit(1000),
      supabase.from("saved_mistakes").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("is_resolved", false),
      supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
      supabase.from("exam_folders").select("id,title").eq("is_published", true),
    ]);
    for (const r of [today, activity, answers, mistakes, profile, folders]) if (r.error) throw r.error;
    const t = String(today.data);
    const rows = activity.data ?? [];
    const todayRow = rows.find(r => r.activity_date === t);
    const studied = rows.filter(r => r.lessons_completed > 0 || r.questions_answered > 0).map(r => r.activity_date);
    type A = { is_correct: boolean; question: { folder_id: string } | null };
    const flat = ((answers.data ?? []) as unknown as A[]).flatMap(a => a.question ? [{ folder_id: a.question.folder_id, is_correct: a.is_correct }] : []);
    const titles = new Map((folders.data ?? []).map(f => [f.id, f.title]));
    const week = weekSeries(rows, t);
    const correct = flat.filter(a => a.is_correct).length;
    return {
      name: profile.data?.full_name ?? null,
      todayPoints: todayRow?.points ?? 0, todayAnswered: todayRow?.questions_answered ?? 0, todayLessons: todayRow?.lessons_completed ?? 0,
      streak: computeStreak(studied, t), mistakes: mistakes.count ?? 0,
      week, weekPoints: week.reduce((s, d) => s + d.points, 0), weekQuestions: week.reduce((s, d) => s + d.questions, 0),
      weekLessons: week.reduce((s, d) => s + d.lessons, 0), activeDays: week.filter(d => d.questions > 0 || d.lessons > 0).length,
      totalPoints: rows.reduce((s, r) => s + r.points, 0), accuracy: flat.length ? correct / flat.length : null,
      weak: weakTopics(flat).flatMap(w => { const title = titles.get(w.folder_id); return title ? [{ ...w, title }] : []; }).slice(0, 5),
    };
  },
});
