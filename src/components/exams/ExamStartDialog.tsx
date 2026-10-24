import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { mcqCountChoices, validMcqCount } from "@/lib/exams";

export function ExamStartDialog({ available, creativeCount, busy, onStart, onCancel }: {
  available: number; creativeCount: number; busy: boolean;
  onStart: (count: number) => void; onCancel: () => void;
}) {
  const [choice, setChoice] = useState(String(Math.min(10, available)));
  const [custom, setCustom] = useState("");
  const count = choice === "custom" ? Number(custom) : Number(choice);
  const valid = validMcqCount(count, available);
  return <Dialog open onOpenChange={open => { if (!open && !busy) onCancel(); }}>
    <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg" onInteractOutside={event => event.preventDefault()}>
      <DialogHeader className="space-y-2 text-left">
        <DialogTitle className="pr-6 text-xl leading-relaxed tracking-normal">কতটি MCQ দিতে চাও?</DialogTitle>
        <DialogDescription>এই বিষয়ে {available.toLocaleString("bn-BD")}টি MCQ আছে।</DialogDescription>
      </DialogHeader>
      <form className="space-y-5" onSubmit={event => { event.preventDefault(); if (valid && !busy) onStart(count); }}>
        <RadioGroup value={choice} onValueChange={setChoice} disabled={busy} aria-label="MCQ প্রশ্নের সংখ্যা" className="gap-3">
          {mcqCountChoices(available).map(value => <Label key={value} htmlFor={`count-${value}`} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-base has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary">
            <RadioGroupItem id={`count-${value}`} value={String(value)} />
            {value === available ? `সবগুলো (${available.toLocaleString("bn-BD")}টি)` : `${value.toLocaleString("bn-BD")}টি প্রশ্ন`}
          </Label>)}
          <Label htmlFor="count-custom" className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-base has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary">
            <RadioGroupItem id="count-custom" value="custom" />নিজের পছন্দের সংখ্যা
          </Label>
        </RadioGroup>
        {choice === "custom" && <div className="space-y-2">
          <Label htmlFor="custom-count">প্রশ্নের সংখ্যা (১–{available.toLocaleString("bn-BD")})</Label>
          <Input id="custom-count" type="number" inputMode="numeric" min={1} max={available} step={1} value={custom} onChange={event => setCustom(event.target.value)} disabled={busy} className="h-11 text-base md:text-base" aria-invalid={custom !== "" && !valid} />
          {custom !== "" && !valid && <p role="alert" className="text-sm text-destructive">১ থেকে {available.toLocaleString("bn-BD")} পর্যন্ত পূর্ণ সংখ্যা দিন।</p>}
        </div>}
        {creativeCount > 0 && <p className="text-sm text-muted-foreground">সঙ্গে {creativeCount.toLocaleString("bn-BD")}টি সৃজনশীল প্রশ্ন থাকবে।</p>}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>ফিরে যাও</Button>
          <Button type="submit" className="flex-1" disabled={!valid || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{busy ? "শুরু হচ্ছে…" : "পরীক্ষা শুরু করো"}</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>;
}