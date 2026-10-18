import type { SlideElement } from "./element";
import type { Slide } from "./slide";
import { textLines } from "./elements/text";

export interface IndexedElement {
  element: SlideElement;
  /** Position in `slide.elements` (stacking order). */
  index: number;
}

/** Elements in reading order (top to bottom, then left to right), keeping their stacking index. */
export function elementsInReadingOrder(slide: Slide): IndexedElement[] {
  return slide.elements
    .map((element, index) => ({ element, index }))
    .sort((a, b) => a.element.frame.y - b.element.frame.y || a.element.frame.x - b.element.frame.x);
}

/** Non-empty lines of one element, in order. */
export function visibleTextLines(element: SlideElement): string[] {
  return textLines(element).filter((line) => line.trim() !== "");
}

/** Non-empty text lines of a slide in reading order. */
export function slideTextLines(slide: Slide): string[] {
  return elementsInReadingOrder(slide).flatMap(({ element }) => visibleTextLines(element));
}

export function hasText(slide: Slide): boolean {
  return slide.elements.length > 0;
}
