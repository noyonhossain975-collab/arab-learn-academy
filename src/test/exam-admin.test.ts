import { describe, expect, it } from "vitest";
import { allowsCreative, descendantIds, folderTrail, importQuestion, mcqColumns, creativeColumns, validateMcq } from "@/lib/exam-admin";
import { parseImportText } from "@/components/admin/BulkImport";
describe("exam administration rules", () => {
  it("allows creative questions only in the board tree", () => {
    expect(allowsCreative("board_past")).toBe(true);
    expect(allowsCreative("tahqiq")).toBe(false);
    expect(allowsCreative("question_bank")).toBe(false);
  });
  it("accepts correct_option 1 through 4 only", () => {
    for (const correct_option of ["1","2","3","4"]) expect(validateMcq({correct_option})).toBeNull();
    for (const correct_option of ["0","5","1.5","","abc"]) expect(validateMcq({correct_option})).not.toBeNull();
  });
  it("imports exactly four options with one correct answer", () => {
    const {rows} = parseImportText("question_text,option_1,option_2,option_3,option_4,correct_option,explanation\nঅর্থ কী?,বই,কলম,ঘর,দরজা,2,ব্যাখ্যা",mcqColumns,validateMcq);
    const q = importQuestion(rows[0]?.row ?? {},"mcq",1,"test");
    expect(q.options).toHaveLength(4);
    expect(q.options?.filter(o => o.is_correct)).toEqual([{option_text:"কলম",is_correct:true}]);
  });
  it("imports ka through gha with marks 1,2,3,4", () => {
    const row = Object.fromEntries(creativeColumns.map(c => [c.key,"উত্তর"]));
    const q = importQuestion(row,"creative",7,"test");
    expect(q.parts?.map(p => [p.part_key,p.marks])).toEqual([["ka",1],["kha",2],["ga",3],["gha",4]]);
  });
  it("applies recursive changes to all descendants but not siblings", () => {
    const folders = [{id:"root",parent_id:null,root_key:"board_past"},{id:"child",parent_id:"root",root_key:null},{id:"deep",parent_id:"child",root_key:null},{id:"other",parent_id:null,root_key:"tahqiq"}];
    expect(descendantIds(folders,"root")).toEqual(["root","child","deep"]);
    expect(folderTrail(folders,"deep").map(f => f.id)).toEqual(["root","child","deep"]);
  });
});