import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard } from "@/components/admin/AdminUI";
import { RichEditor } from "@/components/admin/RichEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { sanitizeHtml } from "@/lib/content";

export function LessonEditor({ groupId, lessonId, onBack }: { groupId: string; lessonId: string; onBack: () => void }) {
  const qc = useQueryClient();
  const isNew = lessonId === "new";
  const lesson = useQuery({
    queryKey: ["admin", "lesson", lessonId],
    enabled: !isNew,
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").eq("id", lessonId).single();
      if (error) throw error;
      return data;
    },
  });
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lesson.data) {
      setTitle(lesson.data.title);
      setContent(lesson.data.content);
      setPublished(lesson.data.is_published);
    }
  }, [lesson.data]);

  async function save() {
    if (!title.trim()) return toast.error("শিরোনাম লিখুন");
    setSaving(true);
    const clean = sanitizeHtml(content);
    let error;
    if (isNew) {
      const { data: last } = await supabase.from("lessons").select("order_index").eq("group_id", groupId).order("order_index", { ascending: false }).limit(1);
      ({ error } = await supabase.from("lessons").insert({
        group_id: groupId, title: title.trim(), content: clean, is_published: published, order_index: (last?.[0]?.order_index ?? 0) + 1,
      }));
    } else {
      ({ error } = await supabase.from("lessons").update({ title: title.trim(), content: clean, is_published: published }).eq("id", lessonId));
    }
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("লেসন সংরক্ষণ হয়েছে");
    qc.invalidateQueries({ queryKey: ["admin"] });
    onBack();
  }

  if (!isNew && lesson.isLoading) return <AdminCard className="h-96 animate-pulse" />;

  return (
    <AdminCard className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-1 h-4 w-4" /> লেসন তালিকা</Button>
        <h2 className="mr-auto text-lg font-bold">{isNew ? "নতুন লেসন" : "লেসন সম্পাদনা"}</h2>
        <label className="flex items-center gap-2 text-sm"><Switch checked={published} onCheckedChange={setPublished} /> প্রকাশিত</label>
        <Button disabled={saving} onClick={save}>{saving ? "সংরক্ষণ হচ্ছে…" : "সংরক্ষণ করো"}</Button>
      </div>
      <Input placeholder="লেসনের শিরোনাম" value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg" />
      {(isNew || lesson.data) && <RichEditor value={content} onChange={setContent} folder={`lessons/${groupId}`} />}
      <p className="text-xs text-muted-foreground">আরবি অনুচ্ছেদের জন্য লেখাটিতে ক্লিক করে "ع RTL" বোতাম চাপুন।</p>
    </AdminCard>
  );
}
