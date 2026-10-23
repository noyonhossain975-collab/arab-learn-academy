import { describe, expect, it } from "vitest";
import { parseImportText } from "@/components/admin/BulkImport";
import { textToHtml } from "@/lib/content";

const cols = [{ key: "arabic", required: true }, { key: "pronunciation_bn" }, { key: "meaning_bn", required: true }];

describe("bulk import parsing", () => {
  it("auto-detects tab-separated text pasted from Sheets", () => {
    const { rows, missing } = parseImportText("arabic\tpronunciation_bn\tmeaning_bn\nشُكْرًا\tশুকরান\tধন্যবাদ", cols);
    expect(missing).toEqual([]);
    expect(rows[0]!.row["meaning_bn"]).toBe("ধন্যবাদ");
    expect(rows[0]!.error).toBeNull();
  });

  it("strips a BOM and keeps quoted multi-line cells", () => {
    const { rows } = parseImportText('\uFEFFarabic,meaning_bn\n"كِتَابٌ","বই\nগ্রন্থ"', cols);
    expect(rows[0]!.row["arabic"]).toBe("كِتَابٌ");
    expect(rows[0]!.row["meaning_bn"]).toBe("বই\nগ্রন্থ");
  });

  it("flags rows with a missing required field and reports the sheet line number", () => {
    const { rows } = parseImportText("arabic,meaning_bn\nشُكْرًا,\nقَلَمٌ,কলম", cols);
    expect(rows[0]!.error).not.toBeNull();
    expect(rows[0]!.line).toBe(2);
    expect(rows[1]!.error).toBeNull();
  });

  it("reports a missing required header", () => {
    expect(parseImportText("arabic\nشُكْرًا", cols).missing).toEqual(["meaning_bn"]);
  });
});

describe("lesson content", () => {
  it("splits plain text into paragraphs on blank lines", () => {
    expect(textToHtml("এক\n\nদুই")).toBe('<p dir="auto">এক</p><p dir="auto">দুই</p>');
  });
});
