import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/ReportForm";
import { REPORT_STATUS, unreadReply, contactHref, type ReportStatus } from "@/lib/site-settings";
import { fmtDate } from "@/components/admin/AdminUI";
export function StudentReports({ userId }: { userId:string }) {
  const qc=useQueryClient();
  const reports=useQuery({queryKey:["reports","own",userId],queryFn:async()=>{const {data,error}=await supabase.from("reports").select("*").eq("user_id",userId).order("created_at",{ascending:false});if(error)throw error;return data;}});
  const contacts=useQuery({queryKey:["community-contacts"],queryFn:async()=>{const {data,error}=await supabase.from("community_links").select("*").eq("is_active",true).in("platform",["email","whatsapp"]).order("sort_order");if(error)throw error;return data;}});
  return <section className="space-y-4 border-t border-border pt-5"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 font-bold">আমার রিপোর্ট{reports.data?.some(unreadReply) && <span className="h-2 w-2 rounded-full bg-destructive" aria-label="নতুন উত্তর" />}</h2><ReportForm userId={userId}/></div>
    <div className="flex flex-wrap gap-4 text-sm">{contacts.data?.map(c=>{const href=contactHref(c.platform,c.url);return href?<a key={c.id} href={href} target={c.platform === "email" ? undefined : "_blank"} rel="noopener noreferrer" className="text-primary underline">{c.title}</a>:null;})}</div>
    {reports.isPending && <p className="text-muted-foreground">লোড হচ্ছে…</p>}{reports.error && <p role="alert" className="text-destructive">রিপোর্ট লোড হয়নি। <Button variant="link" onClick={()=>reports.refetch()}>আবার চেষ্টা করো</Button></p>}
    {reports.data?.length===0 && <p className="text-sm text-muted-foreground">এখনো কোনো রিপোর্ট নেই</p>}
    {reports.data?.map(r=><article key={r.id} className="space-y-3 rounded-lg border border-border bg-card p-4"><div className="flex justify-between gap-3 text-xs text-muted-foreground"><span>{REPORT_STATUS[r.status as ReportStatus] ?? r.status}</span><span>{fmtDate(r.created_at)}</span></div><p dir="auto" className="whitespace-pre-wrap break-words">{r.message}</p>{r.admin_reply && <div className="border-l-2 border-primary pl-3"><p className="mb-1 text-sm font-semibold">আমাদের উত্তর</p><p dir="auto" className="whitespace-pre-wrap break-words">{r.admin_reply}</p>{unreadReply(r) && <Button size="sm" variant="outline" className="mt-3" onClick={async()=>{const {error}=await supabase.from("reports").update({reply_seen_by_student:true}).eq("id",r.id).eq("user_id",userId);if(error)toast.error("পড়া হয়েছে হিসেবে রাখা যায়নি");else qc.invalidateQueries({queryKey:["reports","own",userId]});}}>পড়া হয়েছে</Button>}</div>}</article>)}
  </section>;
}