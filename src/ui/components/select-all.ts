import { hasText } from "@core";
import { setDisabled } from "../dom";
import type { PanelState, PanelStore } from "../state/panel-state";
import { countSelection, EMPTY_SELECTION, presentationCheckState, selectAll } from "../state/selection";

export interface SelectAllElements {
  selectAll: HTMLElement & { checked: boolean; indeterminate: boolean };
  selectionCount: HTMLElement;
}

/** "Select all" checkbox: checks every text box of every slide, or clears the selection. */
export function mountSelectAll(els: SelectAllElements, store: PanelStore): void {
  els.selectAll.addEventListener("change", () => {
    const selection = els.selectAll.checked ? selectAll(store.get().presentation) : EMPTY_SELECTION;
    store.update({ selection });
  });
}

export function renderSelectAll(els: SelectAllElements, state: PanelState): void {
  const { presentation, selection } = state;
  const checkState = presentationCheckState(selection, presentation);
  const selectable = presentation?.slides.some(hasText) ?? false;

  els.selectAll.checked = checkState === "all";
  els.selectAll.indeterminate = checkState === "some";
  setDisabled(els.selectAll, state.busy || !selectable);

  const { slides, textBoxes } = countSelection(selection);
  els.selectionCount.textContent = presentation
    ? `슬라이드 ${slides} / ${presentation.slides.length} · 텍스트 ${textBoxes}개`
    : "";
}
