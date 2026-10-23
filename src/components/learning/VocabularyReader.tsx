import { useSuspenseQuery } from "@tanstack/react-query";
import { useState,useRef } from "react";
import { ArrowLeft,ArrowRight,RotateCcw,Rotate3D } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { BackToLearn,LockedContent } from "./LearningUI";
import { vocabularyOptions,nextCard } from "@/lib/learning";
export function VocabularyReader({topicId,userId}:{topicId:string;userId:string}){
 const {data}=useSuspenseQuery(vocabularyOptions(topicId,userId));
 if(!data.topic)return <div className="p-5"><BackToLearn/><p className="py-10">শব্দভান্ডারটি পাওয়া যায়নি।</p></div>;
 return <><PageHeader title={data.topic.title}/><div className="p-5"><BackToLearn/>{data.locked?<LockedContent/>:!data.words.length?<p className="py-12 text-center text-muted-foreground">এখনো কোনো শব্দ নেই</p>:<Flashcards key={topicId} words={data.words}/>}</div></>;
}
export function Flashcards({words}:{words:{id:string;arabic:string;meaning_bn:string;pronunciation_bn:string|null}[]}){
 const [index,setIndex]=useState(0),[flipped,setFlipped]=useState(false);const start=useRef<{x:number;y:number}|null>(null),swiped=useRef(false);
 const word=words[index];if(!word)return null;
 const move=(dir:-1|1)=>{setIndex(i=>nextCard(i,dir,words.length));setFlipped(false);};
 return <div className="mt-6 space-y-5"><div className="flex items-center justify-between text-sm text-muted-foreground"><span>{(index+1).toLocaleString("bn-BD")} / {words.length.toLocaleString("bn-BD")}</span><Button variant="ghost" size="icon" title="আবার শুরু" onClick={()=>{setIndex(0);setFlipped(false);}}><RotateCcw className="h-4 w-4"/></Button></div>
 <Button variant="outline" className="flashcard h-auto w-full flex-col justify-center gap-5 whitespace-normal rounded-lg border-2 bg-card p-6 text-center" aria-label={flipped?"আরবি শব্দ দেখো":"বাংলা অর্থ দেখো"} onClick={()=>{if(swiped.current){swiped.current=false;return;}setFlipped(v=>!v);}} onPointerDown={e=>{start.current={x:e.clientX,y:e.clientY};swiped.current=false;}} onPointerUp={e=>{const origin=start.current;start.current=null;if(!origin)return;const dx=e.clientX-origin.x,dy=e.clientY-origin.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){swiped.current=true;move(dx<0?1:-1);}} onPointerCancel={()=>{start.current=null;}}>
 {flipped?<span dir="auto" className="flashcard-main block w-full break-words text-3xl font-bold">{word.meaning_bn}</span>:<span lang="ar" dir="rtl" className="flashcard-main arabic block w-full break-words text-4xl font-normal">{word.arabic}</span>}{word.pronunciation_bn&&<span className="block text-base font-normal text-muted-foreground">{word.pronunciation_bn}</span>}<Rotate3D className="h-5 w-5 text-muted-foreground"/>
 </Button><div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3"><Button variant="outline" disabled={index===0} onClick={()=>move(-1)} aria-label="আগের শব্দ"><ArrowLeft className="h-5 w-5"/></Button><Button variant="ghost" onClick={()=>setFlipped(v=>!v)}>{flipped?"আরবি":"অর্থ"}</Button><Button variant="outline" disabled={index===words.length-1} onClick={()=>move(1)} aria-label="পরের শব্দ"><ArrowRight className="h-5 w-5"/></Button></div>{index===words.length-1&&<p className="text-center text-sm text-secondary-foreground">সব শব্দ দেখা হয়েছে</p>}
 </div>;
}