import type { Presentation } from "@core";
import type { PanelState, PanelStore } from "../state/panel-state";
import { setSlideSelected, setTextBoxSelected } from "../state/selection";
import { createSlideRow, type SlideRow } from "./slide-row";

/**
 * The scrollable slide list. Rows are rebuilt only when a new presentation is opened;
 * otherwise their checked/disabled state is synced from the store.
 */
export function createSlideList(container: HTMLElement, store: PanelStore) {
  let renderedFor: Presentation | null = null;
  let rows: SlideRow[] = [];

  function rebuild(presentation: Presentation | null): void {
    container.replaceChildren();
    renderedFor = presentation;
    rows = (presentation?.slides ?? []).map((slide) =>
      createSlideRow(slide, {
        onSlideToggle: (checked) => {
          store.update({ selection: setSlideSelected(store.get().selection, slide, checked) });
        },
        onTextBoxToggle: (index, checked) => {
          store.update({ selection: setTextBoxSelected(store.get().selection, slide.number, index, checked) });
        },
      }),
    );
    for (const row of rows) container.appendChild(row.element);
  }

  return {
    render(state: PanelState): void {
      if (state.presentation !== renderedFor) rebuild(state.presentation);
      for (const row of rows) row.render(state.selection, state.busy);
    },
  };
}
