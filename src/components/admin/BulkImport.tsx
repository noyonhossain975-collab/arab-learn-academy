import Papa from "papaparse";
import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export type ImportRow = Record<string, string>;

export type BulkImportProps = {
  /** Exact English header names. */
  columns: { key: string; required?: boolean }[];
  /** 1-2 example rows for the template download. */
  example: ImportRow[];
  templateName: string;
  /** Return an error message for an invalid row, or null. */
  validate?: (row: ImportRow) => string | null;
  /** Insert one batch of valid rows. `startIndex` is the position of the first row in the whole import. */
  insertBatch: (rows: ImportRow[], startIndex: number) => Promise<void>;
  onDone?: () => void;
  label?: string;
};

type Parsed = { row: ImportRow; line: number; error: string | null };

const BATCH = 50;

/** Parse CSV or pasted text (tab/comma auto-detected, BOM stripped, quoted multi-line cells supported). */
export function parseImportText(text: string, columns: BulkImportProps["columns"], validate?: BulkImportProps["validate"]) {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  const res = Papa.parse<ImportRow>(clean, {
    header: true,
    delimiter,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.replace(/^\uFEFF/, "").trim(),
  });
  const headers = res.meta.fields ?? [];
  const missing = columns.filter((c) => c.required && !headers.includes(c.key)).map((c) => c.key);
  const rows: Parsed[] = res.data.map((raw, i) => {
    const row: ImportRow = {};
    for (const c of columns) row[c.key] = (raw[c.key] ?? "").trim();
    const req = columns.filter((c) => c.required && !row[c.key]).map((c) => c.key);
    const error = req.length ? `ফাঁকা ঘর: ${req.join(", ")}` : validate?.(row) ?? null;
    return { row, line: i + 2, error };
  });
  return { rows, missing };
}

export function BulkImport(props: BulkImportProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<Parsed[] | null>(null);
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => { setText(""); setParsed(null); setProgress(0); };

  function parse(src: string) {
    if (!src.trim()) { toast.error("কোনো ডেটা নেই"); return; }
    const { rows, missing } = parseImportText(src, props.columns, props.validate);
    if (missing.length) {
      toast.error(`প্রথম লাইনে এই কলামগুলো নেই: ${missing.join(", ")}`);
      return;
    }
    if (!rows.length) { toast.error("কোনো সারি পাওয়া যায়নি"); return; }
    setParsed(rows);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    const t = await file.text();
    setText(t);
    parse(t);
    if (fileRef.current) fileRef.current.value = "";
  }

  function downloadTemplate() {
    const csv = Papa.unparse({ fields: props.columns.map((c) => c.key), data: props.example.map((r) => props.columns.map((c) => r[c.key] ?? "")) });
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${props.templateName}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const invalid = parsed?.filter((p) => p.error) ?? [];
  const valid = parsed?.filter((p) => !p.error) ?? [];

  async function confirm() {
    if (invalid.length && !skipInvalid) { toast.error("ভুল সারিগুলো ঠিক করুন অথবা 'ভুল সারি বাদ দাও' টিক দিন"); return; }
    setBusy(true);
    let added = 0;
    try {
      for (let i = 0; i < valid.length; i += BATCH) {
        await props.insertBatch(valid.slice(i, i + BATCH).map((p) => p.row), i);
        added += Math.min(BATCH, valid.length - i);
        setProgress(added);
      }
      toast.success(`${added.toLocaleString("bn-BD")}টি যোগ হয়েছে, ${invalid.length.toLocaleString("bn-BD")}টি বাদ গেছে`);
      props.onDone?.();
      setOpen(false);
      reset();
    } catch (e) {
      toast.error(`${added.toLocaleString("bn-BD")}টি যোগ হওয়ার পর সমস্যা: ${e instanceof Error ? e.message : String(e)}`);
      props.onDone?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline"><Upload className="mr-1 h-4 w-4" /> {props.label ?? "একসাথে যোগ করো (CSV)"}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{props.label ?? "একসাথে যোগ করো"}</DialogTitle></DialogHeader>

        {!parsed ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              কলাম: {props.columns.map((c) => <code key={c.key} className="mx-0.5 rounded bg-muted px-1">{c.key}{c.required ? "*" : ""}</code>)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={downloadTemplate}><Download className="mr-1 h-4 w-4" /> টেমপ্লেট ডাউনলোড</Button>
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" /> CSV ফাইল বেছে নিন</Button>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            </div>
            <p className="text-sm">অথবা Google Sheets / Excel থেকে কপি করে এখানে পেস্ট করুন (প্রথম লাইনে কলামের নাম):</p>
            <Textarea rows={10} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-xs" />
            <Button onClick={() => parse(text)}>প্রিভিউ দেখো</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm">
              মোট <b>{parsed.length.toLocaleString("bn-BD")}</b> সারি — ঠিক <b className="text-primary">{valid.length.toLocaleString("bn-BD")}</b>, ভুল <b className="text-destructive">{invalid.length.toLocaleString("bn-BD")}</b>
            </p>
            {invalid.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {invalid.map((p) => <div key={p.line}>সারি {p.line.toLocaleString("bn-BD")}: {p.error}</div>)}
              </div>
            )}
            <div className="max-h-80 overflow-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr><th className="p-2 text-left">#</th>{props.columns.map((c) => <th key={c.key} className="p-2 text-left">{c.key}</th>)}</tr>
                </thead>
                <tbody>
                  {parsed.slice(0, 20).map((p) => (
                    <tr key={p.line} className={`border-t border-border align-top ${p.error ? "bg-destructive/10" : ""}`}>
                      <td className="p-2">{p.line}</td>
                      {props.columns.map((c) => <td key={c.key} dir="auto" className="max-w-56 truncate p-2">{p.row[c.key]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 20 && <p className="text-xs text-muted-foreground">প্রথম ২০টি সারি দেখানো হচ্ছে।</p>}
            {invalid.length > 0 && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={skipInvalid} onCheckedChange={(v) => setSkipInvalid(v === true)} /> ভুল সারি বাদ দাও
              </label>
            )}
            <div className="flex gap-2">
              <Button variant="outline" disabled={busy} onClick={() => setParsed(null)}>পেছনে যাও</Button>
              <Button disabled={busy || valid.length === 0} onClick={confirm}>
                {busy ? `যোগ হচ্ছে… ${progress}/${valid.length}` : `নিশ্চিত করো (${valid.length.toLocaleString("bn-BD")}টি)`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
