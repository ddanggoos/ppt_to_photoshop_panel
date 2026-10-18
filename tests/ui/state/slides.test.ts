import { describe, expect, it } from "vitest";
import type { Presentation, TextElement } from "@core";
import { EMPTY_SELECTION, selectAll } from "../../../src/ui/state/selection";
import { removeSlide } from "../../../src/ui/state/slides";

const box: TextElement = { kind: "text", name: "T", frame: { x: 0, y: 0, width: 1, height: 1 }, paragraphs: [{ lines: ["a"] }] };
const presentation: Presentation = {
  slideSize: { width: 960, height: 540 },
  slides: [
    { number: 1, elements: [box] },
    { number: 2, elements: [box, box] },
    { number: 3, elements: [box] },
  ],
};

describe("removeSlide", () => {
  it("drops the slide and its checked text boxes, keeping other slides as they were", () => {
    const next = removeSlide({ presentation, selection: selectAll(presentation) }, 2);
    expect(next.presentation?.slides.map((slide) => slide.number)).toEqual([1, 3]);
    expect(next.presentation?.slides[0]).toBe(presentation.slides[0]);
    expect([...next.selection.keys()]).toEqual([1, 3]);
  });

  it("does not change the given state", () => {
    const selection = selectAll(presentation);
    removeSlide({ presentation, selection }, 1);
    expect(presentation.slides).toHaveLength(3);
    expect(selection.has(1)).toBe(true);
  });

  it("does nothing without a presentation", () => {
    const state = { presentation: null, selection: EMPTY_SELECTION };
    expect(removeSlide(state, 1)).toBe(state);
  });
});
