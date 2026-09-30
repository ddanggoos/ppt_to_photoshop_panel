import { defaultFontName, listFonts } from "@photoshop";
import { setDisabled } from "../dom";
import type { PanelState, PanelStore } from "../state/panel-state";

export interface TextStyleElements {
  fontSelect: HTMLSelectElement;
  sizeInput: HTMLInputElement;
}

/** Fills the font list with installed fonts, selects the default, and syncs changes to the store. */
export function mountTextStyleControls(els: TextStyleElements, store: PanelStore): void {
  const fonts = listFonts();
  for (const font of fonts) {
    const option = document.createElement("option");
    option.value = font.postScriptName;
    option.textContent = font.name;
    els.fontSelect.appendChild(option);
  }

  const { textStyle } = store.get();
  els.fontSelect.value = defaultFontName(fonts);
  els.sizeInput.value = String(textStyle.sizePt);
  store.update({ textStyle: { ...textStyle, fontName: els.fontSelect.value } });

  els.fontSelect.addEventListener("change", () => {
    store.update({ textStyle: { ...store.get().textStyle, fontName: els.fontSelect.value } });
  });
  els.sizeInput.addEventListener("change", () => {
    const sizePt = Number(els.sizeInput.value);
    if (Number.isFinite(sizePt) && sizePt > 0) {
      store.update({ textStyle: { ...store.get().textStyle, sizePt } });
    } else {
      els.sizeInput.value = String(store.get().textStyle.sizePt);
    }
  });
}

export function renderTextStyleControls(els: TextStyleElements, state: PanelState): void {
  setDisabled(els.fontSelect, state.busy);
  setDisabled(els.sizeInput, state.busy);
}
