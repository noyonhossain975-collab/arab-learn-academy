import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export type LessonSummary={id:string;title:string;is_locked:boolean;is_completed:boolean};
export function adjacentLessons<T extends LessonSummary>(lessons:T[],id:string){const index=lessons.findIndex(l=>l.id===id);return {previous:index>0?lessons[index-1]:undefined,next:index>=0?lessons[index+1]:undefined};}
export function nextCard(index:number,direction:-1|1,count:number){return Math.max(0,Math.min(Math.max(0,count-1),index+direction));}
export function learningHead(title:string,description:string){return {meta:[{title:`${title} — Arab learn`},{name:"description",content:description},{property:"og:title",content:`${title} — Arab learn`},{property:"og:description",content:description},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]};}
export const catalogOptions=(userId:string)=>queryOptions({queryKey:["learning","catalog",userId],queryFn:async()=>{
 const [groups,topics,premium]=await Promise.all([supabase.from("lesson_groups").select("*").eq("is_published",true).order("sort_order"),supabase.from("vocab_topics").select("*").eq("is_published",true).order("sort_order"),supabase.rpc("has_active_subscription",{_user_id:userId})]);
 if(groups.error)throw groups.error;if(topics.error)throw topics.error;if(premium.error)throw premium.error;
 return {groups:groups.data,topics:topics.data,premium:premium.data};
}});
export const groupOptions=(groupId:string,userId:string)=>queryOptions({queryKey:["learning","group",groupId,userId],queryFn:async()=>{
 const [group,lessons]=await Promise.all([supabase.from("lesson_groups").select("*").eq("id",groupId).eq("is_published",true).maybeSingle(),supabase.rpc("get_group_lessons",{p_group_id:groupId})]);
 if(group.error)throw group.error;if(lessons.error)throw lessons.error;return {group:group.data,lessons:lessons.data};
}});
export const lessonOptions=(lessonId:string,userId:string)=>queryOptions({queryKey:["learning","lesson",lessonId,userId],staleTime:0,gcTime:0,refetchOnWindowFocus:"always",queryFn:async()=>{
 // Direct content reads remain RLS protected, even after a previously unlocked page expires.
 const {data,error}=await supabase.from("lessons").select("*").eq("id",lessonId).eq("is_published",true).maybeSingle();
 if(error)throw error;if(!data)return null;
 const summary=await supabase.rpc("get_group_lessons",{p_group_id:data.group_id});if(summary.error)throw summary.error;
 return {lesson:data,lessons:summary.data};
}});
export const vocabularyOptions=(topicId:string,userId:string)=>queryOptions({queryKey:["learning","vocabulary",topicId,userId],staleTime:0,gcTime:0,refetchOnWindowFocus:"always",queryFn:async()=>{
 const [topic,access]=await Promise.all([supabase.from("vocab_topics").select("*").eq("id",topicId).eq("is_published",true).maybeSingle(),supabase.rpc("can_access_vocab_topic",{_user_id:userId,_topic_id:topicId})]);
 if(topic.error)throw topic.error;if(access.error)throw access.error;
 if(!topic.data||!access.data)return {topic:topic.data,locked:!!topic.data,words:[]};
 const {data,error}=await supabase.from("vocab_words").select("*").eq("vocab_topic_id",topicId).order("order_index").order("id");if(error)throw error;return {topic:topic.data,locked:false,words:data};
}});