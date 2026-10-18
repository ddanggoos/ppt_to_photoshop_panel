import { generateTextLayers } from "./actions/generate-text-layers";
import { openPresentation } from "./actions/open-presentation";
import { runAction } from "./actions/run-action";
import { renderActionButtons } from "./components/action-buttons";
import { renderFileInfo } from "./components/file-info";
import { mountSelectAll, renderSelectAll, type SelectAllElements } from "./components/select-all";
import { createSlideList } from "./components/slide-list";
import { renderStatusLine } from "./components/status-line";
import { mountTextStyleControls, renderTextStyleControls } from "./components/text-style-controls";
import { getElement, getTypedElement } from "./dom";
import { createPanelStore, type PanelState } from "./state/panel-state";

/** Wires the panel markup (src/index.html) to state, actions and components. */
export function mountPanel(root: Document = document): void {
  const els = {
    openButton: getElement(root, "btn-open"),
    generateButton: getElement(root, "btn-generate"),
    fileName: getElement(root, "file-name"),
    slideInfo: getElement(root, "slide-info"),
    selectAll: getElement(root, "select-all") as SelectAllElements["selectAll"],
    selectionCount: getElement(root, "selection-count"),
    slideList: getElement(root, "slide-list"),
    fontSelect: getTypedElement(root, "font-select", "select"),
    sizeInput: getTypedElement(root, "font-size", "input"),
    status: getElement(root, "status"),
  };
  const store = createPanelStore();
  const slideList = createSlideList(els.slideList, store);

  // Wire the buttons first so a failure further down cannot leave them dead.
  els.openButton.addEventListener("click", () => runAction(store, () => openPresentation(store)));
  els.generateButton.addEventListener("click", () => runAction(store, () => generateTextLayers(store)));

  const parts: Array<(state: PanelState) => void> = [
    (state) => renderFileInfo(els, state),
    (state) => renderSelectAll(els, state),
    (state) => slideList.render(state),
    (state) => renderTextStyleControls(els, state),
    (state) => renderActionButtons(els, state),
    (state) => renderStatusLine(els.status, state.status),
  ];
  // One failing component is logged instead of breaking the rest of the panel.
  const render = (state: PanelState) => {
    for (const part of parts) {
      try {
        part(state);
      } catch (error) {
        console.error(error);
      }
    }
  };
  store.subscribe(render);
  mountSelectAll(els, store);
  mountTextStyleControls(els, store);
  render(store.get());
}
