import { describe, expect, it } from "vitest";
import type { Presentation, TextElement } from "@core";
import { selectableSlideNumbers, setSlideSelected } from "../../../src/ui/state/selection";

const withText: TextElement = { kind: "text", name: "T", frame: { x: 0, y: 0, width: 1, height: 1 }, paragraphs: [{ lines: ["a"] }] };

describe("selectableSlideNumbers", () => {
  it("lists only slides that have text", () => {
    const presentation: Presentation = {
      slideSize: { width: 960, height: 540 },
      slides: [
        { number: 1, elements: [withText] },
        { number: 2, elements: [] },
        { number: 3, elements: [withText] },
      ],
    };
    expect(selectableSlideNumbers(presentation)).toEqual([1, 3]);
    expect(selectableSlideNumbers(null)).toEqual([]);
  });
});

describe("setSlideSelected", () => {
  it("adds and removes slides, keeping ascending order without duplicates", () => {
    expect(setSlideSelected([1, 5], 3, true)).toEqual([1, 3, 5]);
    expect(setSlideSelected([1, 3], 3, true)).toEqual([1, 3]);
    expect(setSlideSelected([1, 3, 5], 3, false)).toEqual([1, 5]);
  });
});
