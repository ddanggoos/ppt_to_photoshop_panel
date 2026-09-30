import type { SlideElement } from "./element";

export interface Slide {
  /** 1-based position in the presentation. */
  number: number;
  /** Elements in stacking order, back to front. */
  elements: SlideElement[];
}
