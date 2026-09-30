import { renderSlides } from "@photoshop";
import type { PanelStore } from "../state/panel-state";

/** Adds text layers for the checked slides to the active Photoshop document. */
export async function generateTextLayers(store: PanelStore): Promise<void> {
  const { presentation, fileBaseName, selectedSlideNumbers, textStyle } = store.get();
  if (!presentation || selectedSlideNumbers.length === 0) return;

  store.update({ status: { kind: "info", text: "텍스트 레이어 생성 중..." } });
  await renderSlides(presentation, {
    slideNumbers: selectedSlideNumbers,
    textStyle,
    documentName: fileBaseName,
  });
  store.update({ status: { kind: "info", text: `슬라이드 ${selectedSlideNumbers.length}개의 텍스트 레이어 생성 완료` } });
}
