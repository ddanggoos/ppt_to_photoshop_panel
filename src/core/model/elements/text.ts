import type { Rect } from "../../geometry";

/** A paragraph (ended by Enter). Lines are split by explicit line breaks (Shift+Enter). */
export interface TextParagraph {
  lines: string[];
}

export interface TextElement {
  kind: "text";
  /** Name of the source text box, used as the layer name. */
  name: string;
  /** Area the text occupies (text box minus its inner margins), in points. */
  frame: Rect;
  paragraphs: TextParagraph[];
}

/** All lines of a text element in order, paragraph by paragraph. */
export function textLines(element: TextElement): string[] {
  return element.paragraphs.flatMap((paragraph) => paragraph.lines);
}
