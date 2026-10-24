import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Flame, Star, BookmarkX, BookOpen, TrendingDown, ChevronRight, ChevronLeft, FileText, Newspaper, Crown, Megaphone, Sparkles, Gift, AlertTriangle, Target, CalendarCheck, CheckCircle2 } from "lucide-react";
import { LearningPending, LearningError } from "@/components/learning/LearningUI";
import { announcementsOptions, dashboardOptions } from "@/lib/dashboard";

export const Route = createFileRoute("/_authenticated/_student/home")({
  loader: ({ context }) => context.queryClient.fetchQuery(dashboardOptions(context.user.id)),
  head: () => ({
    meta: [
      { title: "হোম — Arab learn" },
      { name: "description", content: "আজকের পয়েন্ট, সাপ্তাহিক অগ্রগতি, ঘোষণা ও দুর্বল বিষয় এক নজরে।" },
      { property: "og:title", content: "হোম — Arab learn" },
      { property: "og:description", content: "আজকের পয়েন্ট, সাপ্তাহিক অগ্রগতি, ঘোষণা ও দুর্বল বিষয় এক নজরে।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  pendingComponent: LearningPending, errorComponent: LearningError, component: Home,
});

const bn = (n: number) => n.toLocaleString("bn-BD");
type LastLesson = { id: string; title: string };

const features = [
  { to: "/learn", title: "পাঠ ও শব্দভান্ডার", text: "নাহু, সরফ, কায়দা ও ফ্ল্যাশকার্ড", icon: BookOpen, tone: "bg-primary text-primary-foreground" },
  { to: "/exams", title: "পরীক্ষা ও প্রশ্নব্যাংক", text: "বোর্ড প্রশ্ন, তাহকিক ও প্রশ্নব্যাংক", icon: FileText, tone: "bg-chart-2 text-primary-foreground" },
  { to: "/mistakes", title: "সংরক্ষিত ভুল", text: "ভুল প্রশ্ন আবার অনুশীলন করুন", icon: BookmarkX, tone: "bg-destructive text-destructive-foreground" },
  { to: "/blog", title: "ব্লগ", text: "শেখার টিপস ও আর্টিকেল", icon: Newspaper, tone: "bg-chart-4 text-primary-foreground" },
  { to: "/settings", title: "প্রিমিয়াম", text: "সব পাঠ ও প্রশ্ন খুলে নিন", icon: Crown, tone: "bg-chart-3 text-foreground" },
] as const;

const kinds = {
  feature: { label: "নতুন ফিচার", icon: Sparkles },
  update: { label: "আপডেট", icon: Megaphone },
  offer: { label: "অফার", icon: Gift },
  important: { label: "জরুরি", icon: AlertTriangle },
} as const;

function Announcements() {
  const { data } = useQuery(announcementsOptions());
  const [i, setI] = useState(0);
  const list = data ?? [];
  useEffect(() => { if (list.length < 2) return; const t = setInterval(() => setI((v) => (v + 1) % list.length), 7000); return () => clearInterval(t); }, [list.length]);
  if (!list.length) return null;
  const a = list[i % list.length];
  if (!a) return null;
  const k = kinds[a.kind as keyof typeof kinds] ?? kinds.update;
  const safe = a.link_url && /^(https?:\/\/|\/(?!\/))/.test(a.link_url) ? a.link_url : null;
  return (
    <section aria-label="ঘোষণা" className={`relative overflow-hidden rounded-3xl border-2 p-5 md:p-6 ${a.kind === "important" ? "border-destructive bg-destructive/10" : "border-primary/30 bg-secondary"}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${a.kind === "important" ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}><k.icon className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-wide text-primary">{k.label}</span>
          <h2 dir="auto" className="break-words text-lg font-bold md:text-xl">{a.title}</h2>
          {a.body && <p dir="auto" className="mt-1 break-words text-sm text-muted-foreground md:text-base">{a.body}</p>}
          {safe && <a href={safe} target={safe.startsWith("/") ? undefined : "_blank"} rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">{a.link_label || "বিস্তারিত"}<ChevronRight className="h-4 w-4" /></a>}
        </div>
      </div>
      {list.length > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" aria-label="আগের ঘোষণা" onClick={() => setI((i - 1 + list.length) % list.length)} className="rounded-full p-1 hover:bg-background"><ChevronLeft className="h-5 w-5" /></button>
          {list.map((x, n) => <button key={x.id} type="button" aria-label={`ঘোষণা ${bn(n + 1)}`} onClick={() => setI(n)} className={`h-2 rounded-full transition-all ${n === i % list.length ? "w-6 bg-primary" : "w-2 bg-primary/30"}`} />)}
          <button type="button" aria-label="পরের ঘোষণা" onClick={() => setI((i + 1) % list.length)} className="rounded-full p-1 hover:bg-background"><ChevronRight className="h-5 w-5" /></button>
        </div>
      )}
    </section>
  );
}

function Stat({ icon: Icon, value, label, tone }: { icon: typeof Star; value: string; label: string; tone: string }) {
  return (
    <div className="rounded-2xl border-2 bg-card p-4 md:p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
      <p className="text-2xl font-bold md:text-3xl">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function Home() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(dashboardOptions(user.id));
  const [last, setLast] = useState<LastLesson | null>(null);
  const [metric, setMetric] = useState<"points" | "questions" | "lessons">("points");
  useEffect(() => { try { const v = localStorage.getItem(`arab-learn:last-lesson:${user.id}`); if (v) setLast(JSON.parse(v) as LastLesson); } catch { /* optional shortcut */ } }, [user.id]);
  const goal = 7;
  const metrics = { points: "পয়েন্ট", questions: "প্রশ্ন", lessons: "পাঠ" } as const;
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-8 md:px-8 md:py-8">
      <div className="max-md:order-3"><Announcements /></div>

      <div className="grid gap-4 max-md:order-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="hidden flex-col justify-between md:flex gap-4 rounded-3xl bg-primary p-6 text-primary-foreground md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg">আসসালামু আলাইকুম,</p>
              <p className="break-words text-2xl font-bold md:text-4xl">{data.name ?? "শিক্ষার্থী"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-background/20 px-3 py-1 font-bold" aria-label="স্ট্রিক"><Flame className="h-5 w-5" /> {bn(data.streak)}</div>
          </div>
          <p className="arabic text-3xl md:text-4xl" lang="ar">بِسْمِ اللّٰهِ</p>
          {last ? <Link to="/lessons/$lessonId" params={{ lessonId: last.id }} className="flex items-center gap-3 rounded-2xl bg-background p-4 text-foreground">
            <BookOpen className="h-7 w-7 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="block text-sm text-muted-foreground">পড়া চালিয়ে যাও</span><span dir="auto" className="block truncate font-bold">{last.title}</span></span><ChevronRight className="h-5 w-5" /></Link>
            : <Link to="/learn" className="flex items-center gap-3 rounded-2xl bg-background p-4 font-bold text-foreground"><BookOpen className="h-7 w-7 text-primary" /><span className="flex-1">প্রথম পাঠ শুরু করুন</span><ChevronRight className="h-5 w-5" /></Link>}
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Stat icon={Star} value={bn(data.todayPoints)} label="আজকের পয়েন্ট" tone="bg-chart-3/20 text-chart-3" />
          <Stat icon={Flame} value={`${bn(data.streak)} দিন`} label="টানা পড়া" tone="bg-destructive/15 text-destructive" />
          <Stat icon={CheckCircle2} value={bn(data.todayAnswered)} label="আজ প্রশ্নের উত্তর" tone="bg-primary/15 text-primary" />
          <Stat icon={Target} value={data.accuracy === null ? "—" : `${bn(Math.round(data.accuracy * 100))}%`} label="সঠিক উত্তরের হার" tone="bg-chart-2/20 text-chart-2" />
        </div>
      </div>

      <section className="max-md:order-5">
        <h2 className="mb-3 text-xl font-bold md:text-2xl">কী শিখবেন আজ?</h2>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
          {features.map((f) => (
            <Link key={f.to} to={f.to} className="group flex items-center gap-3 rounded-2xl border-2 bg-card px-3 py-2.5 transition-all hover:border-primary md:block md:p-5 md:hover:-translate-y-0.5">
              <div className={`flex h-10 w-10 shrink-0 md:mb-3 md:h-12 md:w-12 items-center justify-center rounded-2xl ${f.tone}`}><f.icon className="h-6 w-6" /></div>
              <div className="min-w-0 flex-1"><p className="font-bold">{f.title}</p>
              <p className="truncate text-xs text-muted-foreground md:mt-1 md:whitespace-normal md:text-sm">{f.text}</p></div>
              {f.to === "/mistakes" && data.mistakes > 0 && <p className="shrink-0 text-xs font-bold text-destructive md:mt-2">{bn(data.mistakes)}টি বাকি</p>}
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground md:hidden" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 max-md:contents lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-3xl border-2 bg-card p-4 max-md:order-1 md:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-xl font-bold">সাপ্তাহিক অগ্রগতি</h2><p className="text-sm text-muted-foreground">গত ৭ দিনের পড়াশোনা</p></div>
            <div className="flex rounded-xl bg-muted p-1" role="tablist">
              {(Object.keys(metrics) as (keyof typeof metrics)[]).map((m) => <button key={m} type="button" role="tab" aria-selected={metric === m} onClick={() => setMetric(m)} className={`rounded-lg px-3 py-1 text-sm font-semibold ${metric === m ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>{metrics[m]}</button>)}
            </div>
          </div>
          <div className="h-52 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.week} margin={{ left: -20, right: 4, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "var(--muted)" }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" }} formatter={(v: number) => [bn(v), metrics[metric]]} />
                <Bar dataKey={metric} fill="var(--primary)" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-muted p-3"><p className="text-xl font-bold">{bn(data.weekPoints)}</p><p className="text-xs text-muted-foreground">সপ্তাহের পয়েন্ট</p></div>
            <div className="rounded-xl bg-muted p-3"><p className="text-xl font-bold">{bn(data.weekQuestions)}</p><p className="text-xs text-muted-foreground">প্রশ্ন সমাধান</p></div>
            <div className="rounded-xl bg-muted p-3"><p className="text-xl font-bold">{bn(data.weekLessons)}</p><p className="text-xs text-muted-foreground">পাঠ শেষ</p></div>
          </div>
        </section>

        <div className="space-y-4 max-md:contents">
          <section className="rounded-3xl border-2 bg-card p-4 max-md:order-2 md:p-6">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold"><CalendarCheck className="h-5 w-5 text-primary" />এই সপ্তাহের লক্ষ্য</h2>
            <p className="text-sm text-muted-foreground">{bn(goal)} দিনের মধ্যে {bn(data.activeDays)} দিন পড়েছেন</p>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(data.activeDays / goal) * 100}%` }} /></div>
            <div className="mt-3 flex justify-between">{data.week.map((d) => <div key={d.date} className="flex flex-col items-center gap-1"><span className={`h-7 w-7 rounded-full ${d.questions || d.lessons ? "bg-primary" : "bg-muted"}`} /><span className="text-[10px] text-muted-foreground">{d.label}</span></div>)}</div>
            <p className="mt-4 text-sm">মোট পয়েন্ট: <span className="font-bold text-primary">{bn(data.totalPoints)}</span></p>
          </section>
          <section className="rounded-3xl border-2 bg-card p-4 max-md:order-6 md:p-6">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><TrendingDown className="h-5 w-5 text-destructive" />দুর্বল বিষয়</h2>
            {data.weak.length ? <div className="space-y-2">{data.weak.map(w => <Link key={w.folder_id} to="/exam-folders/$folderId" params={{ folderId: w.folder_id }} className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <span dir="auto" className="min-w-0 flex-1 truncate font-semibold">{w.title}</span><span className="text-sm font-bold text-destructive">{bn(Math.round(w.accuracy * 100))}%</span><span className="text-sm text-primary">অনুশীলন</span></Link>)}</div>
              : <p className="text-sm text-muted-foreground">কোনো দুর্বল বিষয় নেই। কোনো বিষয়ে কমপক্ষে ৫টি প্রশ্নের উত্তর দিলে এখানে হিসাব দেখাবে।</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
