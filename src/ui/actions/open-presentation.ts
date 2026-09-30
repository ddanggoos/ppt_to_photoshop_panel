import { pickFile } from "@platform";
import { parsePptx } from "@pptx";
import type { PanelStore } from "../state/panel-state";

export async function openPresentation(store: PanelStore): Promise<void> {
  const file = await pickFile(["pptx"]);
  if (!file) return;

  store.update({ status: { kind: "info", text: "PPTX 읽는 중..." } });
  const presentation = await parsePptx(file.data);
  store.update({
    presentation,
    fileBaseName: file.name.replace(/\.pptx$/i, ""),
    status: { kind: "idle" },
  });
}
