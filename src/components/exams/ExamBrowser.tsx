import { useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { FolderOpen, ChevronRight, LockKeyhole, PlayCircle, BookmarkX, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockedContent } from "@/components/learning/LearningUI";
import { examTreeOptions, folderQuestionsOptions, isLocked, type ExamFolder } from "@/lib/exams";
import { folderTrail } from "@/lib/exam-admin";

function FolderList({ folders, premium }: { folders: ExamFolder[]; premium: boolean }) {
  return <div className="space-y-3">{folders.map(f => <Button key={f.id} asChild variant="outline" className="h-auto w-full justify-start gap-4 whitespace-normal rounded-lg p-5 text-left">
    <Link to="/exam-folders/$folderId" params={{ folderId: f.id }}><FolderOpen className="h-7 w-7 shrink-0 text-secondary-foreground" /><span dir="auto" className="min-w-0 flex-1 text-base font-bold">{f.title}</span>
      {isLocked(f, premium) ? <LockKeyhole className="h-5 w-5 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />}</Link>
  </Button>)}</div>;
}

export function ExamHome({ userId }: { userId: string }) {
  const { data } = useSuspenseQuery(examTreeOptions(userId));
  const roots = data.folders.filter(f => !f.parent_id);
  return <><PageHeader title="পরীক্ষা" /><div className="space-y-5 p-5">
    <Button asChild variant="secondary" className="w-full justify-start gap-3"><Link to="/mistakes"><BookmarkX className="h-5 w-5" />সংরক্ষিত ভুল</Link></Button>
    <FolderList folders={roots} premium={data.premium} />
    {!roots.length && <p className="py-12 text-center text-muted-foreground">এখনো কোনো পরীক্ষা প্রকাশিত হয়নি</p>}
  </div></>;
}

export function FolderView({ folderId, userId }: { folderId: string; userId: string }) {
  const { data } = useSuspenseQuery(examTreeOptions(userId));
  const [filter, setFilter] = useState("");
  const folder = data.folders.find(f => f.id === folderId);
  const locked = folder ? isLocked(folder, data.premium) : true;
  const questions = useQuery({ ...folderQuestionsOptions(folderId, userId), enabled: !!folder && !locked });
  if (!folder) return <div className="p-8 text-center"><p className="mb-4 text-muted-foreground">এই অংশটি পাওয়া যায়নি</p><Button asChild variant="outline"><Link to="/exams">পরীক্ষায় ফিরে যাও</Link></Button></div>;
  const trail = folderTrail(data.folders, folderId);
  const children = data.folders.filter(f => f.parent_id === folderId && f.title.toLowerCase().includes(filter.trim().toLowerCase()));
  const parent = trail[trail.length - 2];
  return <><PageHeader title={folder.title} /><div className="space-y-5 p-5">
    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      <Button variant="ghost" size="sm" asChild>{parent ? <Link to="/exam-folders/$folderId" params={{ folderId: parent.id }}><ArrowLeft className="h-4 w-4" />ফিরে যাও</Link> : <Link to="/exams"><ArrowLeft className="h-4 w-4" />পরীক্ষা</Link>}</Button>
      <span dir="auto">{trail.map(t => t.title).join(" › ")}</span>
    </div>
    {locked ? <LockedContent title="এই পরীক্ষাটি প্রিমিয়াম" text="সব পরীক্ষা ও প্রশ্নব্যাংক দেখতে প্রিমিয়াম নিন।" /> : <>
      {!!questions.data?.length && <div className="rounded-lg border-2 border-primary/30 bg-secondary p-5">
        <p className="mb-3 font-bold">{questions.data.length.toLocaleString("bn-BD")}টি প্রশ্ন</p>
        <Button asChild size="lg" className="w-full"><Link to="/exam/$folderId" params={{ folderId }}><PlayCircle className="h-5 w-5" />পরীক্ষা শুরু করো</Link></Button>
      </div>}
      {questions.isLoading && <div className="h-24 animate-pulse rounded-lg bg-muted" />}
      {data.folders.some(f => f.parent_id === folderId) && <>
        {data.folders.filter(f => f.parent_id === folderId).length > 5 && <Input placeholder="বিষয়, বছর বা শ্রেণি খুঁজুন…" value={filter} onChange={e => setFilter(e.target.value)} />}
        <FolderList folders={children} premium={data.premium} />
        {!children.length && <p className="py-6 text-center text-muted-foreground">কিছু পাওয়া যায়নি</p>}
      </>}
      {!questions.isLoading && !questions.data?.length && !data.folders.some(f => f.parent_id === folderId) && <p className="py-12 text-center text-muted-foreground">এখানে এখনো কোনো প্রশ্ন নেই</p>}
    </>}
  </div></>;
}
