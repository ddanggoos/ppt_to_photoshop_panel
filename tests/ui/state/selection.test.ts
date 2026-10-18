import { describe, expect, it } from "vitest";
import type { Presentation, Slide, TextElement } from "@core";
import {
  countSelection,
  EMPTY_SELECTION,
  isTextBoxSelected,
  presentationCheckState,
  selectAll,
  setSlideSelected,
  setTextBoxSelected,
  slideCheckState,
} from "../../../src/ui/state/selection";

const box: TextElement = { kind: "text", name: "T", frame: { x: 0, y: 0, width: 1, height: 1 }, paragraphs: [{ lines: ["a"] }] };

const slide1: Slide = { number: 1, elements: [box, box, box] };
const slide2: Slide = { number: 2, elements: [] };
const slide3: Slide = { number: 3, elements: [box] };
const presentation: Presentation = { slideSize: { width: 960, height: 540 }, slides: [slide1, slide2, slide3] };

describe("selectAll", () => {
  it("checks every text box of slides that have text", () => {
    expect([...selectAll(presentation)]).toEqual([
      [1, [0, 1, 2]],
      [3, [0]],
    ]);
    expect(selectAll(null).size).toBe(0);
  });
});

describe("setSlideSelected", () => {
  it("checks all of a slide's text boxes, or removes the slide", () => {
    const checked = setSlideSelected(EMPTY_SELECTION, slide1, true);
    expect(checked.get(1)).toEqual([0, 1, 2]);
    expect(setSlideSelected(checked, slide1, false).has(1)).toBe(false);
  });

  it("does not change the given selection", () => {
    setSlideSelected(EMPTY_SELECTION, slide1, true);
    expect(EMPTY_SELECTION.size).toBe(0);
  });
});

describe("setTextBoxSelected", () => {
  it("adds and removes one index, keeping ascending order without duplicates", () => {
    let selection = setTextBoxSelected(EMPTY_SELECTION, 1, 2, true);
    selection = setTextBoxSelected(selection, 1, 0, true);
    selection = setTextBoxSelected(selection, 1, 0, true);
    expect(selection.get(1)).toEqual([0, 2]);
    expect(isTextBoxSelected(selection, 1, 2)).toBe(true);
    expect(isTextBoxSelected(selection, 1, 1)).toBe(false);
  });

  it("drops the slide when its last text box is cleared", () => {
    const selection = setTextBoxSelected(EMPTY_SELECTION, 3, 0, true);
    expect(setTextBoxSelected(selection, 3, 0, false).has(3)).toBe(false);
  });
});

describe("check states", () => {
  it("reports a slide as all, some or none", () => {
    expect(slideCheckState(EMPTY_SELECTION, slide1)).toBe("none");
    expect(slideCheckState(setTextBoxSelected(EMPTY_SELECTION, 1, 1, true), slide1)).toBe("some");
    expect(slideCheckState(setSlideSelected(EMPTY_SELECTION, slide1, true), slide1)).toBe("all");
  });

  it("reports the presentation as all only when every slide with text is fully checked", () => {
    const all = selectAll(presentation);
    expect(presentationCheckState(all, presentation)).toBe("all");
    expect(presentationCheckState(setTextBoxSelected(all, 1, 0, false), presentation)).toBe("some");
    expect(presentationCheckState(EMPTY_SELECTION, presentation)).toBe("none");
    expect(presentationCheckState(EMPTY_SELECTION, null)).toBe("none");
  });
});

describe("countSelection", () => {
  it("counts slides and checked text boxes", () => {
    expect(countSelection(selectAll(presentation))).toEqual({ slides: 2, textBoxes: 4 });
    expect(countSelection(EMPTY_SELECTION)).toEqual({ slides: 0, textBoxes: 0 });
  });
});
