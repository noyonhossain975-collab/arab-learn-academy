import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
export function ReportForm({ userId, questionId }: { userId: string; questionId?: string }) {
  const [open,setOpen] = useState(false), [message,setMessage] = useState(""), [busy,setBusy] = useState(false);
  const qc = useQueryClient();
  return <Dialog open={open} onOpenChange={v => { if (!busy) setOpen(v); }}><DialogTrigger asChild><Button variant="outline"><Flag className="h-4 w-4" />{questionId ? "ভুল রিপোর্ট করো" : "আমাদের জানাও"}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>{questionId ? "প্রশ্নে কী সমস্যা?" : "আমাদের জানাও"}</DialogTitle></DialogHeader><form className="space-y-4" onSubmit={async e => {
    e.preventDefault(); if (!message.trim() || busy) return; setBusy(true);
    try { const { error } = await supabase.from("reports").insert({ user_id:userId, question_id:questionId ?? null, kind:questionId ? "question_error" : "general", message:message.trim() }); if (error) throw error; await qc.invalidateQueries({queryKey:["reports"]}); toast.success("আপনার বার্তা পাঠানো হয়েছে"); setMessage(""); setOpen(false); } catch { toast.error("বার্তা পাঠানো হয়নি। আবার চেষ্টা করুন।"); } finally { setBusy(false); }
  }}><Textarea required maxLength={5000} rows={6} aria-label="আপনার বার্তা" placeholder="আপনার বার্তা" value={message} onChange={e => setMessage(e.target.value)} /><Button type="submit" disabled={busy || !message.trim()}><Send className="h-4 w-4" />{busy ? "পাঠানো হচ্ছে…" : "পাঠাও"}</Button></form></DialogContent></Dialog>;
}