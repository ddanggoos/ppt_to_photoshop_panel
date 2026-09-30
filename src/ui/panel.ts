import { convertPresentation } from "./actions/convert-presentation";
import { openPresentation } from "./actions/open-presentation";
import { runAction } from "./actions/run-action";
import { renderActionButtons } from "./components/action-buttons";
import { renderFileInfo } from "./components/file-info";
import { renderStatusLine } from "./components/status-line";
import { mountTextStyleControls, renderTextStyleControls } from "./components/text-style-controls";
import { getElement, getTypedElement } from "./dom";
import { createPanelStore, type PanelState } from "./state/panel-state";

/** Wires the panel markup (src/index.html) to state, actions and components. */
export function mountPanel(root: Document = document): void {
  const els = {
    openButton: getElement(root, "btn-open"),
    convertButton: getElement(root, "btn-convert"),
    fileName: getElement(root, "file-name"),
    slideInfo: getElement(root, "slide-info"),
    status: getElement(root, "status"),
    fontSelect: getTypedElement(root, "font-select", "select"),
    sizeInput: getTypedElement(root, "font-size", "input"),
  };
  const store = createPanelStore();

  const render = (state: PanelState) => {
    renderFileInfo(els, state);
    renderActionButtons(els, state);
    renderStatusLine(els.status, state.status);
    renderTextStyleControls(els, state);
  };
  store.subscribe(render);
  mountTextStyleControls(els, store);
  render(store.get());

  els.openButton.addEventListener("click", () => runAction(store, () => openPresentation(store)));
  els.convertButton.addEventListener("click", () => runAction(store, () => convertPresentation(store)));
}
