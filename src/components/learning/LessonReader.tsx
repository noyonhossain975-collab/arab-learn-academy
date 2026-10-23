import { useQueryClient,useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect,useMemo,useState } from "react";
import { ArrowLeft,ArrowRight,Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { lessonOptions,adjacentLessons } from "@/lib/learning";
import { sanitizeHtml,withAutoDir } from "@/lib/content";
import { BackToLearn,LockedContent } from "./LearningUI";
export function LessonReader({lessonId,userId}:{lessonId:string;userId:string}){
 const {data}=useSuspenseQuery(lessonOptions(lessonId,userId));const qc=useQueryClient();const [busy,setBusy]=useState(false);
 const html=useMemo(()=>data?withAutoDir(sanitizeHtml(data.lesson.content)):"",[data]);
 useEffect(()=>{if(data){try{localStorage.setItem(`arab-learn:last-lesson:${userId}`,JSON.stringify({id:data.lesson.id,groupId:data.lesson.group_id,title:data.lesson.title}));}catch{/* Reading stays available without browser storage. */}}},[data,userId]);
 if(!data)return <div className="p-5"><BackToLearn/><LockedContent/></div>;
 const completed=data.lessons.find(l=>l.id===lessonId)?.is_completed??false,{previous,next}=adjacentLessons(data.lessons,lessonId);
 return <article className="min-w-0 px-5 py-5"><Button variant="ghost" size="sm" asChild><Link to="/lesson-groups/$groupId" params={{groupId:data.lesson.group_id}}><ArrowLeft className="h-4 w-4"/>পাঠের তালিকা</Link></Button><h1 dir="auto" className="mb-8 mt-6 break-words text-2xl font-bold">{data.lesson.title}</h1><div className="lesson-content lesson-reader break-words" dangerouslySetInnerHTML={{__html:html}}/>
 <div className="my-8 border-y border-border py-6"><Button className="w-full" disabled={busy||completed} onClick={async()=>{setBusy(true);try{const {error}=await supabase.rpc("complete_lesson",{p_lesson_id:lessonId});if(error)throw error;await Promise.all([qc.invalidateQueries({queryKey:["learning"]}),qc.invalidateQueries({queryKey:["daily-activity",userId]}),qc.invalidateQueries({queryKey:["dashboard",userId]})]);toast.success("পাঠ সম্পন্ন হয়েছে!");}catch{toast.error("সম্পন্ন হিসেবে রাখা যায়নি। আবার চেষ্টা করুন।");}finally{setBusy(false);}}}><Check className="h-5 w-5"/>{completed?"পাঠ সম্পন্ন":busy?"সংরক্ষণ হচ্ছে…":"পাঠ সম্পন্ন করেছি"}</Button></div>
 <div className="grid grid-cols-2 gap-3">{previous?<Button variant="outline" asChild className="h-auto min-h-12 whitespace-normal"><Link to="/lessons/$lessonId" params={{lessonId:previous.id}}><ArrowLeft className="h-4 w-4 shrink-0"/>আগের পাঠ</Link></Button>:<span/>}{next?<Button variant="outline" asChild className="h-auto min-h-12 whitespace-normal"><Link to="/lessons/$lessonId" params={{lessonId:next.id}}>পরের পাঠ<ArrowRight className="h-4 w-4 shrink-0"/></Link></Button>:<span/>}</div>
 </article>;
}