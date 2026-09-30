import { renderPresentation } from "@photoshop";
import type { PanelStore } from "../state/panel-state";

export async function convertPresentation(store: PanelStore): Promise<void> {
  const { presentation, fileBaseName } = store.get();
  if (!presentation) return;

  store.update({ status: { kind: "info", text: "변환 중..." } });
  await renderPresentation(presentation, { baseName: fileBaseName });
  store.update({ status: { kind: "info", text: `${presentation.slides.length}개 슬라이드 변환 완료` } });
}
