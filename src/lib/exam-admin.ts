export type FolderNode = { id: string; parent_id: string | null; root_key: string | null };
export const PARTS = [
  { key: "ka", label: "ক", marks: 1 }, { key: "kha", label: "খ", marks: 2 },
  { key: "ga", label: "গ", marks: 3 }, { key: "gha", label: "ঘ", marks: 4 },
] as const;
export function folderTrail<T extends FolderNode>(folders: T[], id?: string): T[] {
  const path: T[] = [], seen = new Set<string>();
  let current = folders.find(f => f.id === id);
  while (current && !seen.has(current.id)) {
    seen.add(current.id); path.unshift(current);
    current = folders.find(f => f.id === current?.parent_id);
  }
  return path;
}
export function descendantIds(folders: FolderNode[], id: string): string[] {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const f of folders) if (f.parent_id && ids.has(f.parent_id) && !ids.has(f.id)) { ids.add(f.id); changed = true; }
  }
  return [...ids];
}
export function allowsCreative(root?: string | null) { return root === "board_past"; }
export const mcqColumns = ["question_text", "option_1", "option_2", "option_3", "option_4", "correct_option", "explanation"].map(key => ({ key, required: key !== "explanation" }));
export const creativeColumns = ["stimulus", ...PARTS.flatMap(p => [`${p.key}_question`, `${p.key}_answer`])].map(key => ({ key, required: true }));
export function validateMcq(row: Record<string, string>) {
  return /^[1-4]$/.test(row["correct_option"] ?? "") ? null : "correct_option অবশ্যই 1, 2, 3 অথবা 4 হবে";
}
export function importQuestion(row: Record<string, string>, type: "mcq" | "creative", sort_order: number, id: string) {
  return type === "mcq" ? {
    id, type, sort_order, question_text: row["question_text"] ?? "", explanation: row["explanation"] ?? "",
    options: [1, 2, 3, 4].map(i => ({ option_text: row[`option_${i}`] ?? "", is_correct: String(i) === row["correct_option"] })),
  } : {
    id, type, sort_order, question_text: row["stimulus"] ?? "",
    parts: PARTS.map(p => ({ part_key: p.key, question_text: row[`${p.key}_question`] ?? "", model_answer: row[`${p.key}_answer`] ?? "", marks: p.marks })),
  };
}