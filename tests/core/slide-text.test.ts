import { describe, expect, it } from "vitest";
import { hasText, slideTextLines, type Slide, type TextElement } from "@core";

function text(name: string, x: number, y: number, lines: string[][]): TextElement {
  return { kind: "text", name, frame: { x, y, width: 100, height: 20 }, paragraphs: lines.map((l) => ({ lines: l })) };
}

describe("slideTextLines", () => {
  it("returns lines in reading order: top to bottom, then left to right", () => {
    const slide: Slide = {
      number: 1,
      elements: [text("본문", 0, 100, [["본문"]]), text("오른쪽", 200, 0, [["오른쪽"]]), text("제목", 0, 0, [["제목"]])],
    };
    expect(slideTextLines(slide)).toEqual(["제목", "오른쪽", "본문"]);
  });

  it("flattens paragraphs and line breaks, skipping blank lines", () => {
    const slide: Slide = { number: 1, elements: [text("A", 0, 0, [["첫 줄", "둘째 줄"], [""], ["  "], ["셋째"]])] };
    expect(slideTextLines(slide)).toEqual(["첫 줄", "둘째 줄", "셋째"]);
  });
});

describe("hasText", () => {
  it("is true when the slide has text elements", () => {
    expect(hasText({ number: 1, elements: [] })).toBe(false);
    expect(hasText({ number: 1, elements: [text("A", 0, 0, [["a"]])] })).toBe(true);
  });
});
