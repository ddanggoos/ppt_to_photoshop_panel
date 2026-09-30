import { hasText, type Presentation } from "@core";
import { setDisabled } from "../dom";
import type { PanelState, PanelStore } from "../state/panel-state";
import { setSlideSelected } from "../state/selection";
import { createSlideRow, type SlideRow } from "./slide-row";

/**
 * The scrollable slide list. Rows are rebuilt only when a new presentation is opened;
 * otherwise their checked/disabled state is synced from the store.
 */
export function createSlideList(container: HTMLElement, store: PanelStore) {
  let renderedFor: Presentation | null = null;
  let rows = new Map<number, SlideRow>();

  function rebuild(presentation: Presentation | null): void {
    container.replaceChildren();
    rows = new Map();
    renderedFor = presentation;
    if (!presentation) return;

    for (const slide of presentation.slides) {
      const row = createSlideRow(slide, (checked) => {
        const selected = setSlideSelected(store.get().selectedSlideNumbers, slide.number, checked);
        store.update({ selectedSlideNumbers: selected });
      });
      rows.set(slide.number, row);
      container.appendChild(row.element);
    }
  }

  return {
    render(state: PanelState): void {
      if (state.presentation !== renderedFor) rebuild(state.presentation);
      for (const [number, row] of rows) {
        row.checkbox.checked = state.selectedSlideNumbers.includes(number);
        const slide = state.presentation?.slides.find((s) => s.number === number);
        setDisabled(row.checkbox, state.busy || !slide || !hasText(slide));
      }
    },
  };
}
