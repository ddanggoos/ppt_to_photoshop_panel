import type { Presentation } from "@core";
import type { TextSelection } from "./selection";

export interface SlideListState {
  presentation: Presentation | null;
  selection: TextSelection;
}

/**
 * Drops a slide from the panel's list (the .pptx file is untouched), together with its
 * checked text boxes. Other slides keep their numbers and object identity.
 */
export function removeSlide(state: SlideListState, slideNumber: number): SlideListState {
  const { presentation } = state;
  if (!presentation) return state;

  const selection = new Map(state.selection);
  selection.delete(slideNumber);
  return {
    presentation: { ...presentation, slides: presentation.slides.filter((slide) => slide.number !== slideNumber) },
    selection,
  };
}
