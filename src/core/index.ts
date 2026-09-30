export type { Rect, Size } from "./geometry";
export { POINTS_PER_INCH, ptToPx } from "./units";
export type { Presentation } from "./model/presentation";
export type { Slide } from "./model/slide";
export type { SlideElement } from "./model/element";
export { textLines, type TextElement, type TextParagraph } from "./model/elements/text";
export { hasText, slideTextLines } from "./model/slide-text";
