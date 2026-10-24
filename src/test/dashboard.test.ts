import { describe, expect, it } from "vitest";
import { computeStreak, weakTopics } from "@/lib/dashboard";

describe("dashboard rules", () => {
  it("counts consecutive study days ending today", () => {
    expect(computeStreak(["2026-10-23", "2026-10-22", "2026-10-21", "2026-10-19"], "2026-10-23")).toBe(3);
  });
  it("keeps yesterday's streak until today ends", () => {
    expect(computeStreak(["2026-10-22", "2026-10-21"], "2026-10-23")).toBe(2);
  });
  it("breaks the streak after a missed day", () => {
    expect(computeStreak(["2026-10-21"], "2026-10-23")).toBe(0);
  });
  it("weak topic needs at least 5 answers and accuracy below 60%", () => {
    const a = (folder_id: string, ok: number, wrong: number) => [...Array(ok).fill({ folder_id, is_correct: true }), ...Array(wrong).fill({ folder_id, is_correct: false })];
    const r = weakTopics([...a("weak", 2, 3), ...a("few", 0, 4), ...a("okay", 3, 2)]);
    expect(r.map(t => t.folder_id)).toEqual(["weak"]);
  });
});

import { weekSeries } from "@/lib/dashboard";
describe("weekly series", () => {
  it("returns 7 days ending today with zeros for missing days", () => {
    const w = weekSeries([{ activity_date: "2026-10-23", points: 12, lessons_completed: 1, questions_answered: 4 }, { activity_date: "2026-10-10", points: 99, lessons_completed: 0, questions_answered: 9 }], "2026-10-23");
    expect(w).toHaveLength(7);
    expect(w[0].date).toBe("2026-10-17");
    expect(w[6]).toMatchObject({ date: "2026-10-23", points: 12, questions: 4, lessons: 1 });
    expect(w.reduce((s, d) => s + d.points, 0)).toBe(12);
  });
});
