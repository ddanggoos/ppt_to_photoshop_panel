import type { Presentation, Slide } from "@core";
import { clearChildren } from "../dom";
import type { PanelState, PanelStore } from "../state/panel-state";
import { setSlideSelected, setTextBoxSelected } from "../state/selection";
import { removeSlide } from "../state/slides";
import { createSlideRow, type SlideRow } from "./slide-row";

/**
 * The scrollable slide list. Rows are rebuilt when a new presentation is opened.
 * When slides are only removed, their rows are dropped and the rest (with their
 * expanded state) are kept. Checked/disabled state is synced from the store.
 */
export function createSlideList(container: HTMLElement, store: PanelStore) {
  let renderedFor: Presentation | null = null;
  let rows = new Map<Slide, SlideRow>();

  function createRow(slide: Slide): SlideRow {
    return createSlideRow(slide, {
      onSlideToggle: (checked) => {
        store.update({ selection: setSlideSelected(store.get().selection, slide, checked) });
      },
      onTextBoxToggle: (index, checked) => {
        store.update({ selection: setTextBoxSelected(store.get().selection, slide.number, index, checked) });
      },
      onRemove: () => store.update(removeSlide(store.get(), slide.number)),
    });
  }

  function rebuild(presentation: Presentation | null): void {
    clearChildren(container);
    rows = new Map((presentation?.slides ?? []).map((slide) => [slide, createRow(slide)]));
    for (const row of rows.values()) container.appendChild(row.element);
  }

  /** Drops rows whose slide is gone. Returns false when some slide has no row yet (a new file). */
  function prune(presentation: Presentation): boolean {
    if (!presentation.slides.every((slide) => rows.has(slide))) return false;
    const kept = new Set(presentation.slides);
    for (const [slide, row] of rows) {
      if (kept.has(slide)) continue;
      container.removeChild(row.element);
      rows.delete(slide);
    }
    return true;
  }

  return {
    render(state: PanelState): void {
      const { presentation } = state;
      if (presentation !== renderedFor) {
        if (!presentation || !prune(presentation)) rebuild(presentation);
        renderedFor = presentation;
      }
      for (const row of rows.values()) row.render(state.selection, state.busy);
    },
  };
}
