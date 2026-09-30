import { ptToPx } from "@core";
import { DEFAULT_PPI } from "@photoshop";
import type { PanelState } from "../state/panel-state";

export interface FileInfoElements {
  fileName: HTMLElement;
  slideInfo: HTMLElement;
}

/** Shows the opened file name and its slide count and size. */
export function renderFileInfo(els: FileInfoElements, state: PanelState): void {
  const { presentation } = state;
  if (!presentation) {
    els.fileName.textContent = "선택된 파일 없음";
    els.slideInfo.textContent = "";
    return;
  }

  const { width, height } = presentation.slideSize;
  const sizePx = `${ptToPx(width, DEFAULT_PPI)}×${ptToPx(height, DEFAULT_PPI)} px`;
  els.fileName.textContent = `${state.fileBaseName}.pptx`;
  els.slideInfo.textContent = `슬라이드 ${presentation.slides.length}장 · ${sizePx}`;
}
