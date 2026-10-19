import { renderSlides } from "@photoshop";
import type { PanelStore } from "../state/panel-state";
import { countSelection } from "../state/selection";

/** Adds text layers for the checked text boxes to the active Photoshop document. */
export async function generateTextLayers(store: PanelStore): Promise<void> {
  const { presentation, fileBaseName, selection, textStyle } = store.get();
  if (!presentation || selection.size === 0) return;

  const { slides, textBoxes } = countSelection(selection);
  store.update({ status: { kind: "info", text: "텍스트 레이어 생성 중..." } });
  await renderSlides(presentation, { selection, textStyle, documentName: fileBaseName });
  store.update({ status: { kind: "info", text: `슬라이드 ${slides}개, 텍스트 ${textBoxes}개 생성 완료` } });
}
