import { hasText, type Presentation, type Slide } from "@core";

/**
 * Checked text boxes: slide number → indices into `slide.elements`, ascending.
 * Slides with nothing checked are absent. Never mutated; every change returns a new map.
 */
export type TextSelection = ReadonlyMap<number, readonly number[]>;

/** State of a parent checkbox: every child, some children, or none. */
export type CheckState = "all" | "some" | "none";

export const EMPTY_SELECTION: TextSelection = new Map();

function allIndices(slide: Slide): number[] {
  return slide.elements.map((_, index) => index);
}

function withSlide(selection: TextSelection, slideNumber: number, indices: number[]): TextSelection {
  const next = new Map(selection);
  if (indices.length > 0) next.set(slideNumber, [...new Set(indices)].sort((a, b) => a - b));
  else next.delete(slideNumber);
  return next;
}

/** Every text box of every slide. */
export function selectAll(presentation: Presentation | null): TextSelection {
  const slides = presentation?.slides.filter(hasText) ?? [];
  return new Map(slides.map((slide) => [slide.number, allIndices(slide)]));
}

/** Checks or clears every text box of `slide`. */
export function setSlideSelected(selection: TextSelection, slide: Slide, checked: boolean): TextSelection {
  return withSlide(selection, slide.number, checked ? allIndices(slide) : []);
}

/** Checks or clears one text box. */
export function setTextBoxSelected(
  selection: TextSelection,
  slideNumber: number,
  index: number,
  checked: boolean,
): TextSelection {
  const current = selection.get(slideNumber) ?? [];
  return withSlide(selection, slideNumber, checked ? [...current, index] : current.filter((i) => i !== index));
}

export function isTextBoxSelected(selection: TextSelection, slideNumber: number, index: number): boolean {
  return selection.get(slideNumber)?.includes(index) ?? false;
}

export function slideCheckState(selection: TextSelection, slide: Slide): CheckState {
  const count = selection.get(slide.number)?.length ?? 0;
  if (count === 0) return "none";
  return count >= slide.elements.length ? "all" : "some";
}

export function presentationCheckState(selection: TextSelection, presentation: Presentation | null): CheckState {
  const slides = presentation?.slides.filter(hasText) ?? [];
  if (selection.size === 0 || slides.length === 0) return "none";
  return slides.every((slide) => slideCheckState(selection, slide) === "all") ? "all" : "some";
}

/** Number of slides with at least one checked text box, and of checked text boxes. */
export function countSelection(selection: TextSelection): { slides: number; textBoxes: number } {
  let textBoxes = 0;
  for (const indices of selection.values()) textBoxes += indices.length;
  return { slides: selection.size, textBoxes };
}
