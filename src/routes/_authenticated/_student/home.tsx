import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Flame, Star, BookmarkX, BookOpen, TrendingDown, ChevronRight } from "lucide-react";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { dashboardOptions } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/_student/home")({
  loader: ({ context }) => context.queryClient.fetchQuery(dashboardOptions(context.user.id)),
  head: () => ({
    meta: [
      { title: "হোম — Arab learn" },
      { name: "description", content: "আজকের পয়েন্ট, স্ট্রিক, দুর্বল বিষয় ও সংরক্ষিত ভুল এক নজরে।" },
      { property: "og:title", content: "হোম — Arab learn" },
      { property: "og:description", content: "আজকের পয়েন্ট, স্ট্রিক, দুর্বল বিষয় ও সংরক্ষিত ভুল এক নজরে।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: LearningPending, errorComponent: LearningError, component: Home,
});

const bn = (n: number) => n.toLocaleString("bn-BD");
type LastLesson = { id: string; title: string };

function Home() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(dashboardOptions(user.id));
  const [last, setLast] = useState<LastLesson | null>(null);
  useEffect(() => { try { const v = localStorage.getItem(`arab-learn:last-lesson:${user.id}`); if (v) setLast(JSON.parse(v) as LastLesson); } catch { /* optional shortcut */ } }, [user.id]);
  return (
    <div className="space-y-5 px-5 py-5">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-bold text-secondary-foreground" aria-label="স্ট্রিক"><Flame className="h-5 w-5 text-chart-3" /> {bn(data.streak)}</div>
      </div>
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
        <p className="text-lg">আসসালামু আলাইকুম,</p>
        <p className="text-2xl font-bold">{data.name ?? "শিক্ষার্থী"}</p>
        <p className="arabic mt-3 text-3xl" lang="ar">بِسْمِ اللّٰهِ</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 p-4"><Star className="mb-1 h-6 w-6 text-chart-3" /><p className="text-3xl font-bold">{bn(data.todayPoints)}</p><p className="text-sm text-muted-foreground">আজকের পয়েন্ট</p><p className="mt-1 text-xs text-muted-foreground">{bn(data.todayAnswered)}টি প্রশ্ন · {bn(data.todayLessons)}টি পাঠ</p></div>
        <div className="rounded-2xl border-2 p-4"><Flame className="mb-1 h-6 w-6 text-chart-3" /><p className="text-3xl font-bold">{bn(data.streak)} দিন</p><p className="text-sm text-muted-foreground">টানা পড়া</p>{data.streak === 0 && <p className="mt-1 text-xs text-muted-foreground">আজ একটি পাঠ পড়ে শুরু করুন</p>}</div>
      </div>
      {last && <Link to="/lessons/$lessonId" params={{ lessonId: last.id }} className="flex items-center gap-4 rounded-2xl border-2 border-primary p-4">
        <BookOpen className="h-8 w-8 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm text-muted-foreground">পড়া চালিয়ে যাও</span><span dir="auto" className="block truncate font-bold">{last.title}</span></span><ChevronRight className="h-5 w-5" /></Link>}
      <Link to="/mistakes" className="flex items-center gap-4 rounded-2xl border-2 p-4">
        <BookmarkX className="h-8 w-8 shrink-0 text-destructive" /><span className="flex-1"><span className="block font-bold">সংরক্ষিত ভুল</span><span className="text-sm text-muted-foreground">{data.mistakes ? `${bn(data.mistakes)}টি প্রশ্ন অনুশীলন বাকি` : "কোনো ভুল জমা নেই"}</span></span><ChevronRight className="h-5 w-5" /></Link>
      <section className="rounded-2xl border-2 p-4">
        <h2 className="mb-3 flex items-center gap-2 font-bold"><TrendingDown className="h-5 w-5 text-destructive" />দুর্বল বিষয়</h2>
        {data.weak.length ? <div className="space-y-2">{data.weak.map(w => <Link key={w.folder_id} to="/exam-folders/$folderId" params={{ folderId: w.folder_id }} className="flex items-center gap-3 rounded-xl bg-muted p-3">
          <span dir="auto" className="min-w-0 flex-1 truncate font-semibold">{w.title}</span><span className="text-sm font-bold text-destructive">{bn(Math.round(w.accuracy * 100))}%</span><span className="text-sm text-primary">অনুশীলন</span></Link>)}</div>
          : <p className="text-sm text-muted-foreground">কোনো দুর্বল বিষয় নেই। কোনো বিষয়ে কমপক্ষে ৫টি প্রশ্নের উত্তর দিলে এখানে হিসাব দেখাবে।</p>}
      </section>
    </div>
  );
}
