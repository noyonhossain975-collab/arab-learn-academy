import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/** Delete button with a confirm dialog. `inside` describes what will also be deleted, e.g. "৫টি লেসন". */
export function ConfirmDelete({ name, inside, onConfirm, trigger }: { name: string; inside?: string | null; onConfirm: () => void; trigger?: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <button type="button" title="মুছুন" className="rounded p-1.5 text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>"{name}" মুছে ফেলবেন?</AlertDialogTitle>
          <AlertDialogDescription>
            {inside ? <>এর ভেতরের <b>{inside}</b> ও মুছে যাবে। </> : null}এটি আর ফেরত আনা যাবে না।
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>বাতিল</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">মুছে ফেলো</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ReorderButtons({ index, count, onMove }: { index: number; count: number; onMove: (dir: -1 | 1) => void }) {
  return (
    <div className="flex">
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} className="rounded p-1 hover:bg-muted disabled:opacity-30" title="উপরে">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} className="rounded p-1 hover:bg-muted disabled:opacity-30" title="নিচে">
        <ArrowDown className="h-4 w-4" />
      </button>
    </div>
  );
}

type OrderTable = "lesson_groups" | "lessons" | "vocab_topics" | "vocab_words" | "exam_folders" | "questions";

/** Move item at `index` by `dir` and rewrite the order column as 1..n for the whole list. */
export function useReorder() {
  const [busy, setBusy] = useState(false);
  async function move(table: OrderTable, column: "sort_order" | "order_index", ids: string[], index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= ids.length || busy) return;
    const next = [...ids];
    [next[index], next[j]] = [next[j]!, next[index]!];
    setBusy(true);
    try {
      const results = await Promise.all(
        next.map((id, i) => supabase.from(table).update({ [column]: i + 1 } as never).eq("id", id)),
      );
      const err = results.find((r) => r.error)?.error;
      if (err) throw err;
    } finally {
      setBusy(false);
    }
  }
  return { move, busy };
}
