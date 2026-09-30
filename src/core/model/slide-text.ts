import type { Slide } from "./slide";
import { textLines } from "./elements/text";

/**
 * Non-empty text lines of a slide in reading order:
 * text boxes sorted top to bottom, then left to right.
 */
export function slideTextLines(slide: Slide): string[] {
  return [...slide.elements]
    .sort((a, b) => a.frame.y - b.frame.y || a.frame.x - b.frame.x)
    .flatMap(textLines)
    .filter((line) => line.trim() !== "");
}

export function hasText(slide: Slide): boolean {
  return slide.elements.length > 0;
}
