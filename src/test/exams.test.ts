import { describe, expect, it } from "vitest";
import { examTotal, isLocked, orderParts, answerKey, mcqCountChoices, validMcqCount, selectExamQuestions, type ExamQuestion } from "@/lib/exams";

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
  const questions: ExamQuestion[] = Array.from({ length: 20 }, (_, i) => ({ id: String(i), folder_id: "folder", type: "mcq", question_text: "", image_url: null, explanation: null, sort_order: i, question_options: [], creative_parts: [] }));
  it("offers 10, 15 and all 20 available MCQs", () => {
    expect(mcqCountChoices(20)).toEqual([10, 15, 20]);
    expect(mcqCountChoices(7)).toEqual([7]);
    expect(mcqCountChoices(15)).toEqual([10, 15]);
  });
  it("selecting 10 MCQs gives exactly 10 questions and 10 marks", () => {
    const selected = selectExamQuestions(questions, 10);
    expect(selected).toHaveLength(10);
    expect(examTotal(selected)).toBe(10);
    expect(selected.map(q => q.id)).toEqual(questions.slice(0, 10).map(q => q.id));
  });
  it("selecting 15 MCQs gives exactly 15 questions", () => {
    expect(selectExamQuestions(questions, 15)).toHaveLength(15);
  });
  it("all selects every available MCQ", () => {
    expect(selectExamQuestions(questions, 20)).toEqual(questions);
  });
  it("custom count must be a whole number from 1 to available total", () => {
    expect(selectExamQuestions(questions, 3)).toHaveLength(3);
    for (const count of [0, -1, 21, 1.5, NaN]) {
      expect(validMcqCount(count, 20)).toBe(false);
      expect(() => selectExamQuestions(questions, count)).toThrow();
    }
  });
  it("MCQ selection does not remove creative questions in mixed exams", () => {
    const creative = { ...questions[0], id: "creative", type: "creative", creative_parts: [part("ka", 1), part("kha", 2), part("ga", 3), part("gha", 4)] } as ExamQuestion;
    const selected = selectExamQuestions([creative, ...questions], 10);
    expect(selected).toHaveLength(11);
    expect(examTotal(selected)).toBe(20);
    expect(selected[0]).toBe(creative);
  });
});
