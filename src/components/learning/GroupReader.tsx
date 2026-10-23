import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Check,LockKeyhole,ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { BackToLearn,LockedContent } from "./LearningUI";
import { groupOptions } from "@/lib/learning";
import { useState } from "react";
export function GroupReader({groupId,userId}:{groupId:string;userId:string}){
 const {data}=useSuspenseQuery(groupOptions(groupId,userId));const [locked,setLocked]=useState(false);
 if(!data.group)return <div className="p-5"><BackToLearn/><p className="py-10">পাঠের গ্রুপটি পাওয়া যায়নি।</p></div>;
 const completed=data.lessons.filter(l=>l.is_completed).length;
 return <><PageHeader title={data.group.title}/><div className="p-5"><BackToLearn/><div className="my-5"><p className="mb-3 text-sm text-muted-foreground">{completed.toLocaleString("bn-BD")} / {data.lessons.length.toLocaleString("bn-BD")} পাঠ সম্পন্ন</p><progress className="learning-progress h-3 w-full" max={Math.max(1,data.lessons.length)} value={completed} aria-label="পাঠের অগ্রগতি"/></div>{locked&&<div className="mb-5"><LockedContent/><Button variant="ghost" onClick={()=>setLocked(false)}>পাঠের তালিকা</Button></div>}<div className="divide-y divide-border border-y border-border">{data.lessons.map(l=>{const inside=<><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${l.is_completed?"bg-secondary text-secondary-foreground":"bg-muted text-muted-foreground"}`}>{l.is_completed?<Check className="h-5 w-5"/>:l.is_locked?<LockKeyhole className="h-4 w-4"/>:l.lesson_position.toLocaleString("bn-BD")}</span><span className="min-w-0 flex-1 break-words">{l.title}</span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground"/></>;
 return l.is_locked?<Button key={l.id} variant="ghost" className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none py-5 text-left" onClick={()=>setLocked(true)}>{inside}</Button>:<Button key={l.id} variant="ghost" asChild className="h-auto w-full justify-start gap-4 whitespace-normal rounded-none py-5 text-left"><Link to="/lessons/$lessonId" params={{lessonId:l.id}}>{inside}</Link></Button>;})}</div>{!data.lessons.length&&<p className="py-10 text-center text-muted-foreground">এখনো কোনো পাঠ নেই</p>}</div></>;
}