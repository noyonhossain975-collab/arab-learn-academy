import { describe, expect, it } from "vitest";
import { examTotal, isLocked, orderParts, answerKey } from "@/lib/exams";

const part = (part_key: string, marks: number) => ({ id: part_key, part_key, question_text: "", model_answer: "", marks });

describe("exam rules", () => {
  it("MCQ counts 1 mark, creative counts the sum of its parts", () => {
    expect(examTotal([{ type: "mcq", creative_parts: [] }, { type: "creative", creative_parts: [part("ka", 1), part("kha", 2), part("ga", 3), part("gha", 4)] }])).toBe(11);
  });
  it("premium folder is locked for free users only", () => {
    expect(isLocked({ is_free: false }, false)).toBe(true);
    expect(isLocked({ is_free: false }, true)).toBe(false);
    expect(isLocked({ is_free: true }, false)).toBe(false);
  });
  it("creative parts are shown ক খ গ ঘ order", () => {
    expect(orderParts([part("gha", 4), part("ka", 1), part("ga", 3), part("kha", 2)]).map(p => p.part_key)).toEqual(["ka", "kha", "ga", "gha"]);
  });
  it("each creative part is answered separately", () => {
    expect(answerKey("q", "p")).not.toBe(answerKey("q"));
  });
});
