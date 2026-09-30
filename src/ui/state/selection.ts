import { hasText, type Presentation } from "@core";

/** Slides that can be checked: only those with text. */
export function selectableSlideNumbers(presentation: Presentation | null): number[] {
  return presentation ? presentation.slides.filter(hasText).map((slide) => slide.number) : [];
}

/** Returns a new ascending selection with `slideNumber` added or removed. */
export function setSlideSelected(selected: number[], slideNumber: number, checked: boolean): number[] {
  const next = new Set(selected);
  if (checked) next.add(slideNumber);
  else next.delete(slideNumber);
  return [...next].sort((a, b) => a - b);
}
