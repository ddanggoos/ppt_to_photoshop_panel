import type { Size } from "../geometry";
import type { Slide } from "./slide";

export interface Presentation {
  /** Slide size in points. Every slide in a presentation shares it. */
  slideSize: Size;
  slides: Slide[];
}
