import { setDisabled } from "../dom";
import type { PanelState } from "../state/panel-state";

export interface ActionButtonElements {
  openButton: HTMLElement;
  generateButton: HTMLElement;
}

export function renderActionButtons(els: ActionButtonElements, state: PanelState): void {
  setDisabled(els.openButton, state.busy);
  setDisabled(els.generateButton, state.busy || state.selectedSlideNumbers.length === 0);
}
