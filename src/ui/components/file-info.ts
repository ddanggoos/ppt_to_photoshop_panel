import { ptToPx } from "@core";
import { DEFAULT_PPI } from "@photoshop";
import type { PanelState } from "../state/panel-state";

export interface FileInfoElements {
  fileName: HTMLElement;
  slideInfo: HTMLElement;
}

/** Shows the opened file name, slide count and size, and how many text boxes were found. */
export function renderFileInfo(els: FileInfoElements, state: PanelState): void {
  const { presentation } = state;
  if (!presentation) {
    els.fileName.textContent = "선택된 파일 없음";
    els.slideInfo.textContent = "";
    return;
  }

  const { width, height } = presentation.slideSize;
  const sizePx = `${ptToPx(width, DEFAULT_PPI)}×${ptToPx(height, DEFAULT_PPI)} px`;
  const textCount = presentation.slides.reduce((sum, slide) => sum + slide.elements.length, 0);
  els.fileName.textContent = `${state.fileBaseName}.pptx`;
  els.slideInfo.textContent = `슬라이드 ${presentation.slides.length}장 · ${sizePx} · 텍스트 ${textCount}개`;
}
