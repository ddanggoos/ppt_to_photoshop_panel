import { setDisabled } from "../dom";
import type { PanelState } from "../state/panel-state";

export interface ActionButtonElements {
  openButton: HTMLElement;
  convertButton: HTMLElement;
}

export function renderActionButtons(els: ActionButtonElements, state: PanelState): void {
  const hasSlides = (state.presentation?.slides.length ?? 0) > 0;
  setDisabled(els.openButton, state.busy);
  setDisabled(els.convertButton, state.busy || !hasSlides);
}
