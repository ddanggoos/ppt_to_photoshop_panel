import { storage } from "uxp";
import { openPptx, PptxError } from "../pptx/reader";
import type { PptxPackage } from "../pptx/types";
import { emuToPx } from "../pptx/units";
import { convertPresentation } from "../photoshop/converter";

interface PanelElements {
  openButton: HTMLElement;
  convertButton: HTMLElement;
  fileName: HTMLElement;
  slideInfo: HTMLElement;
  status: HTMLElement;
}

interface PanelState {
  pkg: PptxPackage | null;
  baseName: string;
  busy: boolean;
}

export function initPanel(root: Document = document): void {
  const els: PanelElements = {
    openButton: byId(root, "btn-open"),
    convertButton: byId(root, "btn-convert"),
    fileName: byId(root, "file-name"),
    slideInfo: byId(root, "slide-info"),
    status: byId(root, "status"),
  };
  const state: PanelState = { pkg: null, baseName: "", busy: false };

  els.openButton.addEventListener("click", () => run(els, state, () => pickPptx(els, state)));
  els.convertButton.addEventListener("click", () => run(els, state, () => convert(els, state)));
  render(els, state);
}

async function pickPptx(els: PanelElements, state: PanelState): Promise<void> {
  const file = await storage.localFileSystem.getFileForOpening({ types: ["pptx"] });
  if (!file) return;

  setStatus(els, "PPTX 읽는 중...");
  const data = (await file.read({ format: storage.formats.binary })) as ArrayBuffer;
  state.pkg = await openPptx(data);
  state.baseName = file.name.replace(/\.pptx$/i, "");
  setStatus(els, "");
}

async function convert(els: PanelElements, state: PanelState): Promise<void> {
  if (!state.pkg) return;
  setStatus(els, "변환 중...");
  await convertPresentation(state.pkg, { baseName: state.baseName });
  setStatus(els, `${state.pkg.info.slides.length}개 슬라이드 변환 완료`);
}

/** Runs an action with busy-state handling and error reporting. */
async function run(els: PanelElements, state: PanelState, action: () => Promise<void>): Promise<void> {
  if (state.busy) return;
  state.busy = true;
  render(els, state);
  try {
    await action();
  } catch (err) {
    console.error(err);
    const message = err instanceof PptxError ? err.message : String((err as Error)?.message ?? err);
    setStatus(els, `오류: ${message}`, true);
  } finally {
    state.busy = false;
    render(els, state);
  }
}

function render(els: PanelElements, state: PanelState): void {
  const { pkg } = state;
  els.fileName.textContent = pkg ? `${state.baseName}.pptx` : "선택된 파일 없음";
  els.slideInfo.textContent = pkg
    ? `슬라이드 ${pkg.info.slides.length}장 · ${emuToPx(pkg.info.slideWidthEmu)}×${emuToPx(pkg.info.slideHeightEmu)} px`
    : "";
  toggleDisabled(els.openButton, state.busy);
  toggleDisabled(els.convertButton, state.busy || !pkg || pkg.info.slides.length === 0);
}

function setStatus(els: PanelElements, text: string, isError = false): void {
  els.status.textContent = text;
  els.status.classList.toggle("error", isError);
}

function toggleDisabled(el: HTMLElement, disabled: boolean): void {
  if (disabled) el.setAttribute("disabled", "");
  else el.removeAttribute("disabled");
}

function byId(root: Document, id: string): HTMLElement {
  const el = root.getElementById(id);
  if (!el) throw new Error(`Panel element #${id} not found`);
  return el;
}
