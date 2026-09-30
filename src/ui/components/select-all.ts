import { setDisabled } from "../dom";
import type { PanelState, PanelStore } from "../state/panel-state";
import { selectableSlideNumbers } from "../state/selection";

export interface SelectAllElements {
  selectAll: HTMLElement & { checked: boolean; indeterminate: boolean };
  selectionCount: HTMLElement;
}

/** "Select all" checkbox: checks every slide with text, or clears the selection. */
export function mountSelectAll(els: SelectAllElements, store: PanelStore): void {
  els.selectAll.addEventListener("change", () => {
    const selected = els.selectAll.checked ? selectableSlideNumbers(store.get().presentation) : [];
    store.update({ selectedSlideNumbers: selected });
  });
}

export function renderSelectAll(els: SelectAllElements, state: PanelState): void {
  const selectable = selectableSlideNumbers(state.presentation);
  const count = state.selectedSlideNumbers.length;

  els.selectAll.checked = selectable.length > 0 && count === selectable.length;
  els.selectAll.indeterminate = count > 0 && count < selectable.length;
  setDisabled(els.selectAll, state.busy || selectable.length === 0);
  els.selectionCount.textContent = state.presentation ? `${count} / ${state.presentation.slides.length} 선택` : "";
}
