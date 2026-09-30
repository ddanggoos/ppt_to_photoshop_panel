import type { PanelState } from "../state/panel-state";

export interface FileInfoElements {
  fileName: HTMLElement;
  slideInfo: HTMLElement;
}

/** Shows the opened file name and slide count. */
export function renderFileInfo(els: FileInfoElements, state: PanelState): void {
  const { presentation } = state;
  els.fileName.textContent = presentation ? `${state.fileBaseName}.pptx` : "선택된 파일 없음";
  els.slideInfo.textContent = presentation ? `슬라이드 ${presentation.slides.length}장` : "";
}
